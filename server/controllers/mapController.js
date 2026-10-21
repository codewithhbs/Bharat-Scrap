// Road route (driving) between two points.
// Order: Google Routes API -> Google Directions (legacy) -> OSRM (free fallback)
const axios = require("axios");

const GOOGLE_KEY =
  process.env.GOOGLE_MAPS_SERVER_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  "AIzaSyD022IF_7EVi9DEqKBizpz6vXM_nuFeE1g";

const cache = new Map(); // key -> { at, data }
const CACHE_MS = 60 * 1000;

// ── Encoded polyline decode (Google format, precision 5) ──
function decodePolyline(str, precision = 5) {
  let index = 0, lat = 0, lng = 0;
  const factor = Math.pow(10, precision);
  const out = [];
  while (index < str.length) {
    let b, shift = 0, result = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    out.push({ latitude: lat / factor, longitude: lng / factor });
  }
  return out;
}

const fmtKm = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`);
const fmtMin = (s) => {
  const mins = Math.round(s / 60);
  if (mins < 1) return "<1 min";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
};

async function viaRoutesApi(o, d) {
  const { data } = await axios.post(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      origin: { location: { latLng: { latitude: o.lat, longitude: o.lng } } },
      destination: { location: { latLng: { latitude: d.lat, longitude: d.lng } } },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      polylineQuality: "HIGH_QUALITY",
    },
    {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_KEY,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
      },
    }
  );
  const r = data?.routes?.[0];
  if (!r?.polyline?.encodedPolyline) throw new Error("Routes API: no route");
  const secs = parseInt(String(r.duration || "0").replace("s", ""), 10) || 0;
  return {
    source: "google_routes",
    coordinates: decodePolyline(r.polyline.encodedPolyline),
    distanceMeters: r.distanceMeters || 0,
    durationSeconds: secs,
  };
}

async function viaDirectionsLegacy(o, d) {
  const { data } = await axios.get("https://maps.googleapis.com/maps/api/directions/json", {
    timeout: 10000,
    params: { origin: `${o.lat},${o.lng}`, destination: `${d.lat},${d.lng}`, mode: "driving", key: GOOGLE_KEY },
  });
  if (data.status !== "OK" || !data.routes?.length) {
    throw new Error(`Directions: ${data.status} ${data.error_message || ""}`);
  }
  const route = data.routes[0];
  // step-level polylines = road ke saath zyada accurate line
  const coords = [];
  route.legs.forEach((leg) =>
    leg.steps.forEach((s) => coords.push(...decodePolyline(s.polyline.points)))
  );
  const leg = route.legs[0];
  return {
    source: "google_directions",
    coordinates: coords.length ? coords : decodePolyline(route.overview_polyline.points),
    distanceMeters: leg.distance.value,
    durationSeconds: leg.duration.value,
  };
}

async function viaOsrm(o, d) {
  const { data } = await axios.get(
    `https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${d.lng},${d.lat}`,
    { timeout: 10000, params: { overview: "full", geometries: "polyline" } }
  );
  const r = data?.routes?.[0];
  if (!r?.geometry) throw new Error("OSRM: no route");
  return {
    source: "osrm",
    coordinates: decodePolyline(r.geometry),
    distanceMeters: r.distance,
    durationSeconds: r.duration,
  };
}

const parsePoint = (s) => {
  if (!s) return null;
  const [lat, lng] = String(s).split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
};

// GET /api/map/route?origin=lat,lng&destination=lat,lng
async function getRoute(req, res) {
  const o = parsePoint(req.query.origin);
  const d = parsePoint(req.query.destination);
  if (!o || !d) {
    return res.status(400).json({ success: false, message: "origin & destination required as lat,lng" });
  }

  // ~11m grid cache
  const key = `${o.lat.toFixed(4)},${o.lng.toFixed(4)}|${d.lat.toFixed(4)},${d.lng.toFixed(4)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return res.json({ success: true, ...hit.data, cached: true });

  const errors = [];
  for (const fn of [viaRoutesApi, viaDirectionsLegacy, viaOsrm]) {
    try {
      const r = await fn(o, d);
      const data = {
        ...r,
        distanceText: fmtKm(r.distanceMeters),
        durationText: fmtMin(r.durationSeconds),
      };
      cache.set(key, { at: Date.now(), data });
      if (cache.size > 500) cache.delete(cache.keys().next().value);
      if (errors.length) console.warn("[map/route] fallbacks used:", errors.join(" | "));
      return res.json({ success: true, ...data });
    } catch (e) {
      errors.push(`${fn.name}: ${e.response?.data?.error?.message || e.message}`);
    }
  }
  console.error("[map/route] all providers failed:", errors.join(" | "));
  return res.status(502).json({ success: false, message: "Route not available", errors });
}

module.exports = { getRoute };
