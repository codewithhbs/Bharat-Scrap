import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import {
  ArrowLeft,
  Car,
  User,
  Wrench,
  MapPin,
  IndianRupee,
  CreditCard,
  RefreshCw,
  Trash2,
  Phone,
  Mail,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  X,
  Search,
  UserCheck,
  Loader2,
  BadgeCheck,
  Shield,
} from "lucide-react";
import Swal from "sweetalert2";
import { useRef } from "react";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* ─── Responsive hook ────────────────────────────────────────────── */
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

/* ─── Constants ─────────────────────────────────────────────────── */
const STATUS_COLORS = {
  pending: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  processing: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  en_route: { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
  inspecting: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  en_route_to_garage: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  at_garage: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
  picked_up: { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd" },
  completed: { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  sold: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
};
const ALL_STATUSES = [
  "pending",
  "processing",
  "en_route",
  "inspecting",
  "en_route_to_garage",
  "at_garage",
  "picked_up",
  "completed",
  "sold",
];
const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  en_route: "En Route",
  inspecting: "Inspecting",
  en_route_to_garage: "En Route to Garage",
  at_garage: "At Garage",
  picked_up: "Picked Up",
  completed: "Completed",
  sold: "Sold",
};

/* ─── Tiny helpers ───────────────────────────────────────────────── */
const Badge = ({ children, bg, text, border }) => (
  <span
    style={{
      background: bg,
      color: text,
      border: `1px solid ${border}`,
      borderRadius: 20,
      padding: "3px 12px",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "capitalize",
    }}
  >
    {children}
  </span>
);

const Section = ({ title, icon: Icon, children }) => (
  <div
    style={{
      background: "#fff",
      border: "1.5px solid #e7f3e8",
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
    }}
  >
    <div
      style={{
        padding: "14px 20px",
        borderBottom: "1.5px solid #f0fdf4",
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#f8fffe",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: "#dcfce7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={15} color="#166534" />
      </div>
      <h2
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 700,
          color: "#0f172a",
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </h2>
    </div>
    <div style={{ padding: "18px 20px" }}>{children}</div>
  </div>
);

const Field = ({ label, value, full = false }) => (
  <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
    <p
      style={{
        margin: 0,
        fontSize: 10,
        fontWeight: 700,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 4,
      }}
    >
      {label}
    </p>
    <p
      style={{
        margin: 0,
        fontSize: 14,
        color: "#111827",
        fontWeight: 500,
        wordBreak: "break-word",
      }}
    >
      {value ?? "—"}
    </p>
  </div>
);

const Grid = ({ children, cols = 3 }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(auto-fill, minmax(${cols === 2 ? 200 : 160}px, 1fr))`,
      gap: "16px 20px",
    }}
  >
    {children}
  </div>
);

const BoolField = ({ label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    {value ? (
      <CheckCircle size={15} color="#16a34a" />
    ) : (
      <XCircle size={15} color="#dc2626" />
    )}
    <span
      style={{
        fontSize: 13,
        color: value ? "#166534" : "#991b1b",
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   ASSIGN CRANE MAN MODAL
═══════════════════════════════════════════════════════════════════ */
function AssignCraneManModal({
  craneList,
  currentCraneManId,
  carId,
  onClose,
  onAssigned,
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(currentCraneManId || null);
  const [assigning, setAssigning] = useState(false);

  const filtered = craneList.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  });

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    try {
      await api.put(`/admin/assign-crane-man/${carId}`, {
        craneManId: selected,
      });
      onAssigned();
      onClose();
      Swal.fire({
        icon: "success",
        title: "Assigned!",
        text: "Crane man assigned successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.message || "Could not assign crane man."
      });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(3px)",
          zIndex: 1000,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(660px, 95vw)",
          maxHeight: "88vh",
          background: "#fff",
          borderRadius: 20,
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          overflow: "hidden",
          fontFamily: "'DM Sans','Segoe UI',sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1.5px solid #f0fdf4",
            background: "linear-gradient(135deg,#0f2412 0%,#166534 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Wrench size={17} color="#0f2412" />
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#f0fdf4",
                  }}
                >
                  Assign Crane Man
                </h2>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#86efac" }}>
                {craneList.length} available · Select one to assign
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1.5px solid #166534",
                background: "rgba(255,255,255,0.1)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ position: "relative", marginTop: 14 }}>
            <Search
              size={14}
              color="#9ca3af"
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, address…"
              style={{
                width: "100%",
                paddingLeft: 34,
                paddingRight: 14,
                paddingTop: 10,
                paddingBottom: 10,
                borderRadius: 10,
                border: "1.5px solid #166534",
                fontSize: 13,
                background: "rgba(255,255,255,0.08)",
                color: "#f0fdf4",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* List */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#9ca3af",
              }}
            >
              <Wrench size={36} color="#e5e7eb" style={{ marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 14 }}>No crane men found</p>
            </div>
          ) : (
            filtered.map((cm) => {
              const isSelected = selected === cm._id;
              const isCurrent = currentCraneManId === cm._id;
              return (
                <div
                  key={cm._id}
                  onClick={() => setSelected(cm._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    cursor: "pointer",
                    border: isSelected
                      ? "2px solid #16a34a"
                      : "1.5px solid #e5e7eb",
                    background: isSelected ? "#f0fdf4" : "#fff",
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {cm.userImage?.img ? (
                      <img
                        src={cm.userImage.img}
                        alt={cm.name}
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 12,
                          objectFit: "cover",
                          border: isSelected
                            ? "2.5px solid #16a34a"
                            : "2px solid #e5e7eb",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 12,
                          background: isSelected ? "#dcfce7" : "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          fontWeight: 700,
                          color: isSelected ? "#166534" : "#9ca3af",
                          border: isSelected
                            ? "2.5px solid #16a34a"
                            : "2px solid #e5e7eb",
                        }}
                      >
                        {(cm.name || "C").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: cm.isBlocked ? "#ef4444" : "#22c55e",
                        border: "2px solid #fff",
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 3,
                        flexWrap: "wrap",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {cm.name || "—"}
                      </p>
                      {isCurrent && (
                        <span
                          style={{
                            background: "#fef9c3",
                            color: "#854d0e",
                            border: "1px solid #fde047",
                            borderRadius: 99,
                            padding: "1px 8px",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          Current
                        </span>
                      )}
                      {cm.isPhoneVerified && (
                        <BadgeCheck size={13} color="#16a34a" />
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        <Phone size={10} color="#9ca3af" />
                        {cm.phone || "—"}
                      </span>
                      {cm.address && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            color: "#9ca3af",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <MapPin size={10} color="#9ca3af" />
                          {cm.address}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      flexShrink: 0,
                      border: isSelected ? "none" : "2px solid #d1d5db",
                      background: isSelected ? "#16a34a" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && <CheckCircle size={13} color="#fff" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1.5px solid #f0fdf4",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fffe",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#6b7280",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selected
              ? `Selected: ${craneList.find((c) => c._id === selected)?.name || "—"}`
              : "No one selected"}
          </p>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={onClose}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                color: "#374151",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selected || assigning}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "none",
                background: selected && !assigning ? "#0f2412" : "#d1d5db",
                color: selected && !assigning ? "#fff" : "#9ca3af",
                fontSize: 13,
                fontWeight: 600,
                cursor: selected ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {assigning ? (
                <Loader2
                  size={13}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
              ) : (
                <UserCheck size={13} />
              )}
              {assigning ? "Assigning…" : "Assign"}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </>
  );
}

function WebLiveTrackingMap({ carId, initialCraneLocation, pickupLocation }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const craneMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastCraneRef = useRef(null);
  const mapReadyRef = useRef(false);
  const pendingCraneRef = useRef(null);

  const [routeInfo, setRouteInfo] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentCrane, setCurrentCrane] = useState(initialCraneLocation);

  const pickup =
    pickupLocation?.latitude && pickupLocation?.longitude
      ? {
          lat: parseFloat(pickupLocation.latitude),
          lng: parseFloat(pickupLocation.longitude),
        }
      : null;

  // ── Load Google Maps Script ──
  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }
    if (document.getElementById("gmap-script")) {
      const check = setInterval(() => {
        if (window.google?.maps) {
          setMapLoaded(true);
          clearInterval(check);
        }
      }, 100);
      return () => clearInterval(check);
    }
    const script = document.createElement("script");
    script.id = "gmap-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // ── Crane Marker SVG ──
  const craneSVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="26" fill="#1d4ed8" stroke="white" stroke-width="3"/>
      <text x="28" y="34" text-anchor="middle" font-size="22">🚛</text>
    </svg>
  `)}`;

  const pickupSVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
      <ellipse cx="22" cy="52" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
      <path d="M22 2C12.6 2 5 9.6 5 19c0 12.4 17 35 17 35s17-22.6 17-35C39 9.6 31.4 2 22 2z" fill="#F05A28" stroke="white" stroke-width="2"/>
      <circle cx="22" cy="19" r="7" fill="white"/>
    </svg>
  `)}`;

  // ── Init Map ──
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapRef.current) return;

    const craneLat = initialCraneLocation?.latitude
      ? parseFloat(initialCraneLocation.latitude)
      : null;
    const craneLng = initialCraneLocation?.longitude
      ? parseFloat(initialCraneLocation.longitude)
      : null;

    const center =
      craneLat && craneLng
        ? { lat: craneLat, lng: craneLng }
        : pickup || { lat: 28.6139, lng: 77.209 };

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: "cooperative",
      // Default Google Maps style — no overrides, roads + labels sab dikhega
    });
    mapRef.current = map;

    // ── Pickup Marker ──
    if (pickup) {
      const pickupMarker = new window.google.maps.Marker({
        position: pickup,
        map,
        title: "Pickup Location",
        zIndex: 10,
        icon: {
          url: pickupSVG,
          scaledSize: new window.google.maps.Size(44, 56),
          anchor: new window.google.maps.Point(22, 56),
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family:sans-serif;padding:6px;min-width:160px">
            <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase">Pickup Location</p>
            <p style="margin:0;font-size:13px;font-weight:600;color:#111">
              ${pickupLocation.streetAndHouse?.trim() ? pickupLocation.streetAndHouse.trim() + ", " : ""}${pickupLocation.address || ""}
            </p>
          </div>
        `,
      });
      pickupMarker.addListener("click", () =>
        infoWindow.open(map, pickupMarker),
      );
    }

    // ── CraneMan Marker (initial) ──
    if (craneLat && craneLng) {
      craneMarkerRef.current = new window.google.maps.Marker({
        position: { lat: craneLat, lng: craneLng },
        map,
        title: "Crane Man",
        zIndex: 20,
        icon: {
          url: craneSVG,
          scaledSize: new window.google.maps.Size(56, 56),
          anchor: new window.google.maps.Point(28, 28),
        },
      });

      const craneInfo = new window.google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;padding:6px"><b>Crane Man</b><br/><span style="font-size:12px;color:#666">En route to pickup</span></div>`,
      });
      craneMarkerRef.current.addListener("click", () =>
        craneInfo.open(map, craneMarkerRef.current),
      );
    }

    mapReadyRef.current = true;

    // Agar poll se pehle hi koi pending update aa gaya to
    if (pendingCraneRef.current) {
      moveCraneMarker(pendingCraneRef.current);
      fetchRoute(pendingCraneRef.current);
      pendingCraneRef.current = null;
    } else if (craneLat && craneLng) {
      fetchRoute({ latitude: craneLat, longitude: craneLng });
    }
  }, [mapLoaded]);

  // ── Move Crane Marker ──
  const moveCraneMarker = (loc) => {
    if (!mapRef.current || !loc) return;
    const pos = {
      lat: parseFloat(loc.latitude),
      lng: parseFloat(loc.longitude),
    };

    if (craneMarkerRef.current) {
      craneMarkerRef.current.setPosition(pos);
    } else {
      craneMarkerRef.current = new window.google.maps.Marker({
        position: pos,
        map: mapRef.current,
        title: "Crane Man",
        zIndex: 20,
        icon: {
          url: craneSVG,
          scaledSize: new window.google.maps.Size(56, 56),
          anchor: new window.google.maps.Point(28, 28),
        },
      });
    }
  };

  // ── Fetch Route via DirectionsService ──
  const fetchRoute = (crane) => {
    if (!crane || !pickup || !window.google?.maps || !mapRef.current) return;

    const craneLat = parseFloat(crane.latitude);
    const craneLng = parseFloat(crane.longitude);

    // 100m throttle
    if (lastCraneRef.current) {
      const R = 6371000;
      const dLat = ((craneLat - lastCraneRef.current.lat) * Math.PI) / 180;
      const dLng = ((craneLng - lastCraneRef.current.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((craneLat * Math.PI) / 180) *
          Math.cos((lastCraneRef.current.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const movedM = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (movedM < 100) return;
    }

    const svc = new window.google.maps.DirectionsService();
    svc.route(
      {
        origin: { lat: craneLat, lng: craneLng },
        destination: pickup,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status !== "OK") {
          console.warn("Directions status:", status);
          // Fallback: seedhi line
          if (polylineRef.current) polylineRef.current.setMap(null);
          polylineRef.current = new window.google.maps.Polyline({
            path: [{ lat: craneLat, lng: craneLng }, pickup],
            strokeColor: "#2563EB",
            strokeWeight: 4,
            strokeOpacity: 0.7,
            map: mapRef.current,
            geodesic: true,
          });
          return;
        }

        const leg = result.routes[0].legs[0];
        setRouteInfo({
          distance: leg.distance.text,
          duration: leg.duration.text,
        });

        // Purani polyline hatao
        if (polylineRef.current) polylineRef.current.setMap(null);

        // Geometry library se decode
        const encoded = result.routes[0].overview_polyline;
        const path = window.google.maps.geometry.encoding.decodePath(encoded);

        polylineRef.current = new window.google.maps.Polyline({
          path,
          strokeColor: "#2563EB",
          strokeWeight: 5,
          strokeOpacity: 0.9,
          map: mapRef.current,
          icons: [
            {
              icon: {
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                strokeColor: "#1E40AF",
                fillColor: "#1E40AF",
                fillOpacity: 1,
              },
              offset: "50%",
              repeat: "80px",
            },
          ],
        });

        // Map fit karo
        const bounds = new window.google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        if (pickup) bounds.extend(pickup);
        mapRef.current.fitBounds(bounds, {
          top: 60,
          right: 60,
          bottom: 60,
          left: 60,
        });

        lastCraneRef.current = { lat: craneLat, lng: craneLng };
      },
    );
  };

  // ── Poll CraneMan location every 10s ──
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await api.get(`/admin/cars/${carId}`);
        if (!res.data?.success) return;
        const loc = res.data.data?.craneMan?.location;
        if (!loc?.latitude || !loc?.longitude) return;

        const newLoc = {
          latitude: parseFloat(loc.latitude),
          longitude: parseFloat(loc.longitude),
        };
        setCurrentCrane(newLoc);
        setLastUpdated(new Date(loc.timestamp || Date.now()));

        if (!mapReadyRef.current) {
          // Map abhi ready nahi — queue karo
          pendingCraneRef.current = newLoc;
          return;
        }

        moveCraneMarker(newLoc);
        fetchRoute(newLoc);
      } catch (err) {
        console.warn("Poll error:", err.message);
      }
    };

    poll(); // immediate first call
    pollIntervalRef.current = setInterval(poll, 10000);
    return () => clearInterval(pollIntervalRef.current);
  }, [carId]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      clearInterval(pollIntervalRef.current);
      if (polylineRef.current) polylineRef.current.setMap(null);
    };
  }, []);

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        border: "1.5px solid #e5e7eb",
        boxShadow: "0 8px 32px rgba(37,99,235,0.12)",
        background: "#fff",
        marginBottom: 20,
      }}
    >
      {/* Stats Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            {routeInfo?.distance || "—"}
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 10,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Distance
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "6px 14px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
                boxShadow: "0 0 0 3px rgba(74,222,128,0.3)",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "1.5px",
              }}
            >
              LIVE
            </span>
          </div>
          <p
            style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.55)" }}
          >
            Crane Man Tracking
          </p>
        </div>

        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            {routeInfo?.duration || "—"}
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 10,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            ETA
          </p>
        </div>
      </div>

      {/* Map */}
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: 400, position: "relative" }}
      >
        {!mapLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#F8FAFC",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid #dbeafe",
                borderTop: "3px solid #2563EB",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Map load ho raha hai…
            </p>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          borderTop: "1px solid #f1f5f9",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#2563EB",
              }}
            />
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                Crane Man
              </p>
              <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>
                Moving to pickup
              </p>
            </div>
          </div>
          <div style={{ width: 1, height: 24, background: "#e5e7eb" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#F05A28",
              }}
            />
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                Pickup Point
              </p>
              <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>
                {pickupLocation?.streetAndHouse?.trim()
                  ? `${pickupLocation.streetAndHouse.trim()}, ${pickupLocation.address}`
                  : pickupLocation?.address || "—"}
              </p>
            </div>
          </div>
        </div>
        {lastUpdated && (
          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
            Updated{" "}
            {lastUpdated.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN CAR DETAIL PAGE
═══════════════════════════════════════════════════════════════════ */
export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState({
    open: false,
    src: null,
    label: "",
    allImgs: [],
    idx: 0,
  });
  const [craneList, setCraneList] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const [txnInput, setTxnInput] = useState("");
  const [txnEditing, setTxnEditing] = useState(false);
  const [txnSaving, setTxnSaving] = useState(false);

  const [priceInput, setPriceInput] = useState("");
  const [priceEditing, setPriceEditing] = useState(false);
  const [priceSaving, setPriceSaving] = useState(false);

  // console.log("car",car)

  const openLightbox = (src, label, allImgs, idx) =>
    setLightbox({ open: true, src, label, allImgs, idx });
  const closeLightbox = () => setLightbox((prev) => ({ ...prev, open: false }));
  const lbPrev = () =>
    setLightbox((prev) => {
      const i = (prev.idx - 1 + prev.allImgs.length) % prev.allImgs.length;
      return {
        ...prev,
        idx: i,
        src: prev.allImgs[i].src,
        label: prev.allImgs[i].label,
      };
    });
  const lbNext = () =>
    setLightbox((prev) => {
      const i = (prev.idx + 1) % prev.allImgs.length;
      return {
        ...prev,
        idx: i,
        src: prev.allImgs[i].src,
        label: prev.allImgs[i].label,
      };
    });

  React.useEffect(() => {
    const handler = (e) => {
      if (!lightbox.open) return;
      if (e.key === "ArrowLeft") lbPrev();
      if (e.key === "ArrowRight") lbNext();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  const fetchCar = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/cars/${id}`);
      if (res.data.success) setCar(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCraneList = async () => {
    try {
      const { data } = await api.get("/admin/crane-users");
      setCraneList(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCar();
    fetchCraneList();
  }, [id]);

  const confirmStatusChange = () => {
    Swal.fire({
      title: "Change Car Status",
      html: `
        <p style="color:#6b7280;font-size:14px;margin-bottom:12px">
          Select new status for <strong>${car?.carDetail?.make} ${car?.carDetail?.model}</strong>
        </p>
        <select id="swal-status" class="swal2-input" style="width:100%;margin:0">
          ${ALL_STATUSES.map((s) => `<option value="${s}" ${car?.status === s ? "selected" : ""}>${STATUS_LABELS[s]}</option>`).join("")}
        </select>`,
      showCancelButton: true,
      confirmButtonColor: "#166534",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Update Status",
      preConfirm: () => {
        const val = document.getElementById("swal-status").value;
        if (!val) Swal.showValidationMessage("Please select a status");
        return val;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/admin/cars/${id}/status`, { status: result.value });
          Swal.fire({
            icon: "success",
            title: "Updated!",
            timer: 1800,
            showConfirmButton: false,
          });
          fetchCar();
        } catch {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Could not update status.",
          });
        }
      }
    });
  };

  const confirmDelete = () => {
    Swal.fire({
      title: "Delete this listing?",
      text: `${car?.carDetail?.make} ${car?.carDetail?.model} (${car?.rcNumber}) will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/cars/${id}`);
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            timer: 1800,
            showConfirmButton: false,
          });
          navigate(-1);
        } catch {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete.",
          });
        }
      }
    });
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          flexDirection: "column",
          gap: 14,
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: "3px solid #dcfce7",
            borderTop: "3px solid #16a34a",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading car details...</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );

  if (!car)
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <Car size={48} color="#d1d5db" style={{ marginBottom: 12 }} />
        <p style={{ color: "#6b7280", fontSize: 15 }}>Car not found.</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 12,
            padding: "8px 20px",
            background: "#0f2412",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Go Back
        </button>
      </div>
    );

  const cd = car.carDetail || {};

  const buildAllImgs = (car) => {
    if (!car) return [];
    return [
      car.frontImage?.image && { src: car.frontImage.image, label: "Front" },
      car.backImage?.image && { src: car.backImage.image, label: "Back" },
      car.rcFrontImage?.image && {
        src: car.rcFrontImage.image,
        label: "RC Front",
      },
      car.rcBackImage?.image && {
        src: car.rcBackImage.image,
        label: "RC Back",
      },
      car.chassisImage?.image && {
        src: car.chassisImage.image,
        label: "Chassis",
      },
      car.engineImage?.image && { src: car.engineImage.image, label: "Engine" },
      car.tyreImage?.image && { src: car.tyreImage.image, label: "Tyre" },
      car.odometerImage?.image && {
        src: car.odometerImage.image,
        label: "Odometer",
      },
      ...(car.images || []).map((img, i) => ({
        src: img.image,
        label: `Inspection ${i + 1}`,
      })),
    ].filter(Boolean);
  };

  const craneManObj =
    typeof car.craneMan === "object" && car.craneMan !== null
      ? car.craneMan
      : craneList.find((c) => c._id === car.craneMan);

  /* ── Layout: desktop = 2-col, mobile/tablet = 1-col ── */
  const mainLayout = isDesktop
    ? {
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: 20,
        alignItems: "start",
      }
    : { display: "flex", flexDirection: "column", gap: 0 };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: isMobile ? "12px 12px" : "0",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}
    >
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* ── Lightbox ── */}
      {lightbox.open && (
        <>
          <div
            onClick={closeLightbox}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.92)",
              backdropFilter: "blur(6px)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />

          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2001,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? "60px 12px 80px" : "20px",
              pointerEvents: "none",
            }}
          >
            <button
              onClick={closeLightbox}
              style={{
                position: "fixed",
                top: isMobile ? 12 : 20,
                right: isMobile ? 12 : 20,
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 20,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "all",
              }}
            >
              ✕
            </button>

            <div
              style={{
                position: "fixed",
                top: isMobile ? 12 : 24,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 20,
                padding: "5px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                pointerEvents: "none",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                {lightbox.label}
              </span>
              {lightbox.allImgs.length > 1 && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  {lightbox.idx + 1} / {lightbox.allImgs.length}
                </span>
              )}
            </div>

            <img
              src={lightbox.src}
              alt={lightbox.label}
              style={{
                maxWidth: isMobile ? "100%" : "min(900px, 90vw)",
                maxHeight: isMobile ? "70vh" : "80vh",
                borderRadius: 12,
                objectFit: "contain",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />

            {lightbox.allImgs.length > 1 && (
              <>
                <button
                  onClick={lbPrev}
                  style={{
                    position: "fixed",
                    left: isMobile ? 6 : 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: isMobile ? 36 : 44,
                    height: isMobile ? 36 : 44,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.12)",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "all",
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={lbNext}
                  style={{
                    position: "fixed",
                    right: isMobile ? 6 : 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: isMobile ? 36 : 44,
                    height: isMobile ? 36 : 44,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.12)",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "all",
                  }}
                >
                  ›
                </button>
              </>
            )}

            {lightbox.allImgs.length > 1 && (
              <div
                style={{
                  position: "fixed",
                  bottom: isMobile ? 10 : 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 5,
                  padding: "6px 10px",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: 10,
                  maxWidth: "90vw",
                  overflowX: "auto",
                  pointerEvents: "all",
                }}
              >
                {lightbox.allImgs.map((img, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      setLightbox((prev) => ({
                        ...prev,
                        idx: i,
                        src: img.src,
                        label: img.label,
                      }))
                    }
                    style={{
                      width: isMobile ? 38 : 46,
                      height: isMobile ? 38 : 46,
                      flexShrink: 0,
                      borderRadius: 6,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: `2px solid ${lightbox.idx === i ? "#22c55e" : "rgba(255,255,255,0.2)"}`,
                      opacity: lightbox.idx === i ? 1 : 0.55,
                    }}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <AssignCraneManModal
          craneList={craneList}
          currentCraneManId={craneManObj?._id || car.craneMan}
          carId={id}
          onClose={() => setShowAssign(false)}
          onAssigned={fetchCar}
        />
      )}

      {/* ── Top Bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: isMobile ? 16 : 28,
          flexWrap: isMobile ? "nowrap" : "wrap",
          gap: 10,
          position: "relative",
        }}
      >
        {/* Left: back + title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
            flex: 1,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} color="#374151" />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 18 : 24,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.5px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {cd.make || "—"} {cd.model || ""}
            </h1>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: "#6b7280",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {car.rcNumber} · {cd.manufacturingYear}
            </p>
          </div>
        </div>

        {/* Action Buttons — inline on desktop/tablet, dropdown on mobile */}
        {isMobile ? (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setActionMenuOpen((prev) => !prev)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#374151",
                  display: "block",
                }}
              />
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#374151",
                  display: "block",
                }}
              />
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#374151",
                  display: "block",
                }}
              />
            </button>

            {actionMenuOpen && (
              <>
                <div
                  onClick={() => setActionMenuOpen(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 500 }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 42,
                    right: 0,
                    zIndex: 600,
                    background: "#fff",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 12,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    minWidth: 200,
                    overflow: "hidden",
                    animation: "fadeIn 0.12s ease",
                  }}
                >
                  {[
                    {
                      label: craneManObj
                        ? "Reassign Crane Man"
                        : "Assign Crane Man",
                      icon: <Wrench size={13} />,
                      color: "#166534",
                      bg: "#f0fdf4",
                      action: () => {
                        setShowAssign(true);
                        setActionMenuOpen(false);
                      },
                    },
                    {
                      label: "Change Status",
                      icon: <RefreshCw size={13} />,
                      color: "#1d4ed8",
                      bg: "#eff6ff",
                      action: () => {
                        confirmStatusChange();
                        setActionMenuOpen(false);
                      },
                    },
                    {
                      label: "Delete",
                      icon: <Trash2 size={13} />,
                      color: "#be123c",
                      bg: "#fff1f2",
                      action: () => {
                        confirmDelete();
                        setActionMenuOpen(false);
                      },
                    },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        width: "100%",
                        padding: "12px 16px",
                        background: "transparent",
                        border: "none",
                        color: item.color,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "left",
                        borderBottom: i < 2 ? "1px solid #f3f4f6" : "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = item.bg)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowAssign(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 14px",
                borderRadius: 10,
                border: "1.5px solid #bbf7d0",
                background: "#f0fdf4",
                color: "#166534",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Wrench size={14} />
              {craneManObj ? "Reassign Crane Man" : "Assign Crane Man"}
            </button>

            <button
              onClick={confirmStatusChange}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 14px",
                borderRadius: 10,
                border: "1.5px solid #bfdbfe",
                background: "#eff6ff",
                color: "#1d4ed8",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} /> Change Status
            </button>

            <button
              onClick={confirmDelete}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 14px",
                borderRadius: 10,
                border: "1.5px solid #fecaca",
                background: "#fff1f2",
                color: "#be123c",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* ── Two-column layout (desktop) / stacked (mobile/tablet) ── */}
      <div style={mainLayout}>
        {/* LEFT / TOP */}
        <div>
          {/* Status bar */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e7f3e8",
              borderRadius: 16,
              padding: isMobile ? "12px 14px" : "16px 20px",
              marginBottom: 20,
              display: "flex",
              alignItems: "flex-start",
              flexDirection: isMobile ? "column" : "row",
              flexWrap: "wrap",
              gap: isMobile ? 10 : 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Status
              </span>
              <Badge
                bg={STATUS_COLORS[car.status]?.bg || "#f3f4f6"}
                text={STATUS_COLORS[car.status]?.text || "#374151"}
                border={STATUS_COLORS[car.status]?.border || "#e5e7eb"}
              >
                {STATUS_LABELS[car.status] || car.status || "—"}
              </Badge>
            </div>
            {!isMobile && (
              <div style={{ width: 1, height: 24, background: "#e5e7eb" }} />
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px" }}>
              <BoolField
                label="Running Condition"
                value={car.isRunningCondition}
              />
              <BoolField label="Missing Part" value={car.anyMissingPart} />
              {/* <BoolField label="Only for Check" value={car.onlyForCheck} /> */}
              <BoolField label="Payment Done" value={car.isPaid} />
            </div>
          </div>

          {/* Car Details */}
          <Section title="Car Details" icon={Car}>
            <Grid>
              <Field label="Make" value={cd.make} />
              <Field label="Model" value={cd.model} />
              <Field label="Year" value={cd.manufacturingYear} />
              <Field label="Color" value={cd.color} />
              <Field label="Fuel Type" value={cd.fuelType} />
              <Field label="Body Type" value={cd.bodyType} />
              <Field label="Vehicle Class" value={cd.vehicleClass} />
              <Field label="Seating Capacity" value={cd.seatingCapacity} />
              <Field label="Vehicle Category" value={cd.vehicleCategory} />
              <Field label="Variant / Norms" value={cd.variant} />
              <Field label="Cubic Capacity" value={cd.cubicCapacity} />
              <Field label="Cylinders" value={cd.cylinderCount} />
              <Field label="Wheelbase" value={cd.wheelbase} />
              <Field label="Unladen Weight" value={cd.unladenWeight} />
              <Field label="Gross Weight" value={cd.grossWeight} />
              <Field
                label="KM Driven"
                value={
                  car.kmDriven
                    ? `${Number(car.kmDriven).toLocaleString("en-IN")} km`
                    : undefined
                }
              />
            </Grid>
          </Section>

          {/* Registration */}
          <Section title="Registration & Documents" icon={FileText}>
            <Grid>
              <Field label="RC Number" value={cd.rcNumber || car.rcNumber} />
              <Field label="RC Status" value={cd.rcStatus} />
              <Field label="Status As On" value={cd.statusAsOn} />
              <Field label="Registration Date" value={cd.registrationDate} />
              <Field label="Valid Till" value={cd.registrationValidity} />
              <Field label="Tax Valid Till" value={cd.taxValidity} />
              <Field label="Owner Name" value={cd.ownerName} />
              {/* <Field label="Father's Name" value={cd.fatherName} /> */}
              <Field label="Owner Count" value={cd.ownerCount} />
              <Field label="RTO Office" value={cd.rtoOffice} />
              <Field label="RTO Code" value={cd.rtoCode} />
              <Field label="Chassis Number" value={cd.chassisNumber} />
              <Field label="Engine Number" value={cd.engineNumber} />
              <Field label="Insurance Company" value={cd.insuranceCompany} />
              <Field
                label="Insurance Policy No."
                value={cd.insurancePolicyNumber}
              />
              <Field
                label="Insurance Valid Till"
                value={cd.insuranceValidity}
              />
              <Field label="PUCC Number" value={cd.puccNumber} />
              <Field label="PUC Valid Till" value={cd.puccValidity} />
              <Field label="Financer" value={cd.financer} />
              <Field label="Present Address" full value={cd.presentAddress} />
              <Field
                label="Permanent Address"
                full
                value={cd.permanentAddress}
              />
            </Grid>
          </Section>

          {/* Payment */}
          <Section title="Payment Details" icon={CreditCard}>
            <Grid cols={2}>
              <Field
                label="User Price Expectation"
                value={
                  car.priceUserWant
                    ? `₹${Number(car.priceUserWant).toLocaleString("en-IN")}`
                    : undefined
                }
              />
              {/* Admin Price */}
              <div style={{ gridColumn: "1 / -1" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 6,
                  }}
                >
                  Admin Offer Price
                </p>

                {priceEditing ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 13,
                          color: "#6b7280",
                          fontWeight: 600,
                        }}
                      >
                        ₹
                      </span>
                      <input
                        type="number"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        placeholder="Enter offer price"
                        style={{
                          width: "100%",
                          paddingLeft: 24,
                          paddingRight: 12,
                          paddingTop: 8,
                          paddingBottom: 8,
                          borderRadius: 9,
                          border: "1.5px solid #bbf7d0",
                          fontSize: 13,
                          color: "#111827",
                          outline: "none",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <button
                      disabled={priceSaving || !priceInput}
                      onClick={async () => {
                        setPriceSaving(true);
                        try {
                          await api.put(`/admin/update-admin-price/${id}`, {
                            price: Number(priceInput),
                          });
                          Swal.fire({
                            icon: "success",
                            title: "Price Set!",
                            timer: 1800,
                            showConfirmButton: false,
                          });
                          setPriceEditing(false);
                          fetchCar();
                        } catch {
                          Swal.fire({
                            icon: "error",
                            title: "Failed",
                            text: "Could not update price.",
                          });
                        } finally {
                          setPriceSaving(false);
                        }
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 9,
                        border: "none",
                        background:
                          priceInput && !priceSaving ? "#0f2412" : "#d1d5db",
                        color: priceInput && !priceSaving ? "#fff" : "#9ca3af",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: priceInput ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexShrink: 0,
                      }}
                    >
                      {priceSaving ? (
                        <Loader2
                          size={13}
                          style={{ animation: "spin 0.8s linear infinite" }}
                        />
                      ) : (
                        <CheckCircle size={13} />
                      )}
                      {priceSaving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setPriceEditing(false);
                        setPriceInput("");
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 9,
                        border: "1.5px solid #e5e7eb",
                        background: "#fff",
                        color: "#374151",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: "#111827",
                        fontWeight: 500,
                      }}
                    >
                      {car.price
                        ? `₹${Number(car.price).toLocaleString("en-IN")}`
                        : "—"}
                    </p>
                    {/* userAgreedForPrice badge */}
                    {car.price && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 9px",
                          borderRadius: 99,
                          ...(car.userAgreedForPrice === "accepted"
                            ? {
                                background: "#dcfce7",
                                color: "#166534",
                                border: "1px solid #bbf7d0",
                              }
                            : car.userAgreedForPrice === "rejected"
                              ? {
                                  background: "#fee2e2",
                                  color: "#991b1b",
                                  border: "1px solid #fecaca",
                                }
                              : {
                                  background: "#fef9c3",
                                  color: "#854d0e",
                                  border: "1px solid #fde047",
                                }),
                        }}
                      >
                        {car.userAgreedForPrice === "accepted"
                          ? "✓ Accepted"
                          : car.userAgreedForPrice === "rejected"
                            ? "✕ Rejected"
                            : "⏳ Pending"}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setPriceInput(car.price ? String(car.price) : "");
                        setPriceEditing(true);
                      }}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 7,
                        border: "1.5px solid #bbf7d0",
                        background: "#f0fdf4",
                        color: "#166534",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <RefreshCw size={11} />
                      {car.price ? "Update" : "Set Price"}
                    </button>
                  </div>
                )}
              </div>
              <Field
                label="Payment Method"
                value={car.paymentMethod?.toUpperCase()}
              />
              {car.paymentDetails?.upiId && (
                <Field label="UPI ID" value={car.paymentDetails?.upiId} />
              )}
              {car.paymentDetails?.accountHolderName && (
                <Field
                  label="Account Holder"
                  value={car.paymentDetails?.accountHolderName}
                />
              )}
              {car.paymentDetails?.accountNumber && (
                <Field
                  label="Account Number"
                  value={car.paymentDetails?.accountNumber}
                />
              )}
              {car.paymentDetails?.bankName && (
                <Field label="Bank Name" value={car.paymentDetails?.bankName} />
              )}
              {car.paymentDetails?.ifscCode && (
                <Field label="IFSC Code" value={car.paymentDetails?.ifscCode} />
              )}

              {/* Transaction ID */}
              <div style={{ gridColumn: "1 / -1" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 6,
                  }}
                >
                  Transaction ID
                </p>

                {txnEditing ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      value={txnInput}
                      onChange={(e) => setTxnInput(e.target.value)}
                      placeholder="Enter transaction ID"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: "8px 12px",
                        borderRadius: 9,
                        border: "1.5px solid #bbf7d0",
                        fontSize: 13,
                        color: "#111827",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                    <button
                      disabled={txnSaving || !txnInput.trim()}
                      onClick={async () => {
                        setTxnSaving(true);
                        try {
                          await api.put(`/admin/update-transaction-id/${id}`, {
                            paymentTransactionId: txnInput.trim(),
                          });
                          Swal.fire({
                            icon: "success",
                            title: "Saved!",
                            timer: 1800,
                            showConfirmButton: false,
                          });
                          setTxnEditing(false);
                          fetchCar();
                        } catch {
                          Swal.fire({
                            icon: "error",
                            title: "Failed",
                            text: "Could not update transaction ID.",
                          });
                        } finally {
                          setTxnSaving(false);
                        }
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 9,
                        border: "none",
                        background:
                          txnInput.trim() && !txnSaving ? "#0f2412" : "#d1d5db",
                        color:
                          txnInput.trim() && !txnSaving ? "#fff" : "#9ca3af",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: txnInput.trim() ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexShrink: 0,
                      }}
                    >
                      {txnSaving ? (
                        <Loader2
                          size={13}
                          style={{ animation: "spin 0.8s linear infinite" }}
                        />
                      ) : (
                        <CheckCircle size={13} />
                      )}
                      {txnSaving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setTxnEditing(false);
                        setTxnInput("");
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 9,
                        border: "1.5px solid #e5e7eb",
                        background: "#fff",
                        color: "#374151",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: "#111827",
                        fontWeight: 500,
                      }}
                    >
                      {car.paymentTransactionId || "—"}
                    </p>
                    <button
                      onClick={() => {
                        setTxnInput(car.paymentTransactionId || "");
                        setTxnEditing(true);
                      }}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 7,
                        border: "1.5px solid #bbf7d0",
                        background: "#f0fdf4",
                        color: "#166534",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <RefreshCw size={11} />
                      {car.paymentTransactionId ? "Update" : "Add"}
                    </button>
                  </div>
                )}
              </div>
            </Grid>
          </Section>

          {/* ── Live Tracking Map (non-pending status) ── */}
          {car.status !== "pending" &&
            car.status !== "sold" &&
            car.craneMan?.location?.latitude &&
            car.pickupLocation?.latitude && (
              <Section title="Live Tracking" icon={MapPin}>
                <WebLiveTrackingMap
                  carId={id}
                  initialCraneLocation={{
                    latitude: parseFloat(car.craneMan.location.latitude),
                    longitude: parseFloat(car.craneMan.location.longitude),
                  }}
                  pickupLocation={car.pickupLocation}
                />
              </Section>
            )}

          {/* After Inspection */}
          {car.images && car.images.length > 0 && (
            <Section title="After Inspection" icon={Image}>
              <div
                style={{
                  display: isDesktop ? "grid" : "flex",
                  gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : undefined,
                  flexDirection: isDesktop ? undefined : "row",
                  overflowX: isDesktop ? undefined : "auto",
                  gap: 6,
                  paddingBottom: isDesktop ? 0 : 4,
                }}
              >
                {car.images.map((img, i) => {
                  const flat = buildAllImgs(car).filter((x) =>
                    x.label.startsWith("Inspection"),
                  );
                  return (
                    <div
                      key={i}
                      onClick={() =>
                        openLightbox(img.image, `Inspection ${i + 1}`, flat, i)
                      }
                      style={{
                        aspectRatio: "1",
                        width: isDesktop ? undefined : 80,
                        flexShrink: isDesktop ? undefined : 0,
                        borderRadius: 7,
                        overflow: "hidden",
                        cursor: "zoom-in",
                        border: "1.5px solid #e5e7eb",
                        transition: "all 0.15s",
                      }}
                    >
                      <img
                        src={img.image}
                        alt={`Inspection ${i + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          {/* Image Gallery */}
          <Section title="Photos" icon={Image}>
            {(() => {
              const groups = [
                {
                  label: "Front",
                  imgs: car.frontImage?.image ? [car.frontImage.image] : [],
                },
                {
                  label: "Back",
                  imgs: car.backImage?.image ? [car.backImage.image] : [],
                },
                {
                  label: "RC Front",
                  imgs: car.rcFrontImage?.image ? [car.rcFrontImage.image] : [],
                },
                {
                  label: "RC Back",
                  imgs: car.rcBackImage?.image ? [car.rcBackImage.image] : [],
                },
                {
                  label: "Chassis",
                  imgs: car.chassisImage?.image ? [car.chassisImage.image] : [],
                },
                {
                  label: "Engine",
                  imgs: car.engineImage?.image ? [car.engineImage.image] : [],
                },
                {
                  label: "Tyre",
                  imgs: car.tyreImage?.image ? [car.tyreImage.image] : [],
                },
                {
                  label: "Odometer",
                  imgs: car.odometerImage?.image
                    ? [car.odometerImage.image]
                    : [],
                },
              ].filter((g) => g.imgs.length > 0);

              const flat = buildAllImgs(car).filter(
                (x) => !x.label.startsWith("Inspection"),
              );

              if (groups.length === 0)
                return (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: 13,
                    }}
                  >
                    No images uploaded
                  </p>
                );

              return groups.map((group) => (
                <div key={group.label} style={{ marginBottom: 14 }}>
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {group.label}
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 5,
                    }}
                  >
                    {group.imgs.map((src, i) => {
                      const flatIdx = flat.findIndex((x) => x.src === src);
                      return (
                        <div
                          key={i}
                          onClick={() =>
                            openLightbox(
                              src,
                              group.label,
                              flat,
                              flatIdx >= 0 ? flatIdx : 0,
                            )
                          }
                          style={{
                            aspectRatio: "1",
                            borderRadius: 7,
                            overflow: "hidden",
                            cursor: "zoom-in",
                            border: "1.5px solid #e5e7eb",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#16a34a";
                            e.currentTarget.style.transform = "scale(1.03)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.transform = "none";
                          }}
                        >
                          <img
                            src={src}
                            alt={group.label}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </Section>

          {/* Seller Info */}
          <Section title="Seller" icon={User}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#166534",
                    flexShrink: 0,
                  }}
                >
                  {(car.seller?.name || "S").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {car.seller?.name || "—"}
                  </p>
                  <p
                    style={{
                      margin: "1px 0 0",
                      fontSize: 11,
                      color: "#9ca3af",
                    }}
                  >
                    Seller
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 13,
                  color: "#374151",
                }}
              >
                <Phone size={13} color="#9ca3af" />
                {car.seller?.phone || "—"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 13,
                  color: "#374151",
                }}
              >
                <Mail size={13} color="#9ca3af" />
                {car.seller?.email || "—"}
              </div>
            </div>
          </Section>

          {/* Crane Man */}
          <Section title="Crane Man" icon={Wrench}>
            {craneManObj ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {craneManObj.userImage?.img ? (
                    <img
                      src={craneManObj.userImage.img}
                      alt={craneManObj.name}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 11,
                        objectFit: "cover",
                        border: "2px solid #bbf7d0",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 11,
                        background: "#ede9fe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#5b21b6",
                        flexShrink: 0,
                      }}
                    >
                      {(craneManObj.name || "C").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {craneManObj.name || "—"}
                    </p>
                    <p
                      style={{
                        margin: "1px 0 0",
                        fontSize: 11,
                        color: "#9ca3af",
                      }}
                    >
                      Crane Man
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 13,
                    color: "#374151",
                  }}
                >
                  <Phone size={13} color="#9ca3af" />
                  {craneManObj.phone || "—"}
                </div>
                {craneManObj.address && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 13,
                      color: "#374151",
                    }}
                  >
                    <MapPin size={13} color="#9ca3af" />
                    {craneManObj.address}
                  </div>
                )}
                {craneManObj.upiDetails?.upiId && (
                  <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                    UPI: {craneManObj.upiDetails.upiId}
                  </p>
                )}
                {car?.craneManAssignStatus && (
                  <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                    Crane Man Assign Status: {car.craneManAssignStatus}
                  </p>
                )}
                <button
                  onClick={() => setShowAssign(true)}
                  style={{
                    marginTop: 4,
                    padding: "8px 14px",
                    borderRadius: 9,
                    border: "1.5px solid #bbf7d0",
                    background: "#f0fdf4",
                    color: "#166534",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <RefreshCw size={13} /> Reassign
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <Wrench size={30} color="#d1d5db" style={{ marginBottom: 8 }} />
                <p
                  style={{ margin: "0 0 12px", fontSize: 13, color: "#9ca3af" }}
                >
                  No crane man assigned
                </p>
                <button
                  onClick={() => setShowAssign(true)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 9,
                    border: "none",
                    background: "#0f2412",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Wrench size={14} /> Assign Now
                </button>
              </div>
            )}
          </Section>

          {/* Pickup Location */}
          <Section title="Pickup Location" icon={MapPin}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <MapPin
                size={15}
                color="#9ca3af"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.5,
                }}
              >
                {`${car.pickupLocation?.streetAndHouse || "—"}, ${car.pickupLocation?.address || "—"}`}
              </p>
            </div>
          </Section>

          {/* Timestamps */}
          <div
            style={{
              background: "#f8fffe",
              border: "1.5px solid #e7f3e8",
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: isMobile ? 24 : 0,
            }}
          >
            {[
              { label: "Created", val: car.createdAt },
              { label: "Last Updated", val: car.updatedAt },
            ].map((ts) => (
              <div
                key={ts.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "#9ca3af", fontWeight: 500 }}>
                  {ts.label}
                </span>
                <span style={{ color: "#374151", fontWeight: 600 }}>
                  {ts.val
                    ? new Date(ts.val).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
