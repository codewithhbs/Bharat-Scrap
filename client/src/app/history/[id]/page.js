'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../utils/api';

const PRIMARY = '#0A1F0D';
const ACCENT = '#3DBA5E';
const GOOGLE_MAPS_API_KEY = 'AIzaSyD022IF_7EVi9DEqKBizpz6vXM_nuFeE1g';
const POLL_INTERVAL = 10000;

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:            { label: 'Pending',            bg: '#FEF3C7', text: '#92400E' },
  processing:         { label: 'Processing',         bg: '#DBEAFE', text: '#1E40AF' },
  en_route:           { label: 'En Route',           bg: '#EDE9FE', text: '#5B21B6' },
  inspecting:         { label: 'Inspecting',         bg: '#FEF9C3', text: '#713F12' },
  en_route_to_garage: { label: 'En Route to Garage', bg: '#EDE9FE', text: '#5B21B6' },
  at_garage:          { label: 'At Garage',          bg: '#DCFCE7', text: '#14532D' },
  picked_up:          { label: 'Picked Up',          bg: '#D1FAE5', text: '#065F46' },
  completed:          { label: 'Completed',          bg: '#D1FAE5', text: '#065F46' },
  sold:               { label: 'Sold',               bg: '#FEE2E2', text: '#991B1B' },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function BackIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CarIcon({ color = '#666' }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <path d="M5 17H3a2 2 0 01-2-2v-4l2.5-6h13L19 11v4a2 2 0 01-2 2h-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={7.5} cy={17.5} r={2.5} stroke={color} strokeWidth={1.8} />
      <circle cx={16.5} cy={17.5} r={2.5} stroke={color} strokeWidth={1.8} />
    </svg>
  );
}
function UserIcon({ color = '#666' }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.8} />
    </svg>
  );
}
function LocationIcon({ color = '#666' }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={12} cy={10} r={3} stroke={color} strokeWidth={1.8} />
    </svg>
  );
}
function PhoneIcon({ color = '#666' }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.82 19.79 19.79 0 01.09 2.18 2 2 0 012.09 0H5a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon({ color = '#22c55e' }) {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CrossIcon({ color = '#ef4444' }) {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PaymentIcon({ color = '#666' }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <rect x={2} y={5} width={20} height={14} rx={2} stroke={color} strokeWidth={1.8} />
      <path d="M2 10h20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon({ color = '#666' }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8} />
      <path d="M12 6v6l4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon({ color = '#666' }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BankIcon({ color = '#666' }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <path d="M3 22h18M4 10h3v8H4zM10.5 10h3v8h-3zM17 10h3v8h-3zM2 6l10-4 10 4v2H2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MapIcon({ color = '#666' }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 2v16M16 6v16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
  if (km == null) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// ─── Sub Components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status || 'Unknown', bg: '#F3F4F6', text: '#374151' };
  return (
    <span className="history-status-badge" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  );
}

function Section({ title, icon, children, delay = 0 }) {
  return (
    <div className="history-section" style={{ animationDelay: `${delay}ms` }}>
      <div className="history-section-header">
        <div className="history-section-icon">{icon}</div>
        <span className="history-section-title">{title}</span>
      </div>
      <div className="history-section-body">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="history-info-row">
      <span className="history-info-label">{label}</span>
      <span className="history-info-value" style={highlight ? { color: ACCENT, fontWeight: 700 } : {}}>
        {String(value)}
      </span>
    </div>
  );
}

function BoolRow({ label, value }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="history-info-row">
      <span className="history-info-label">{label}</span>
      <div className="history-bool-pill" style={{ background: value ? '#dcfce7' : '#fee2e2' }}>
        {value ? <CheckIcon color="#16a34a" /> : <CrossIcon color="#dc2626" />}
        <span style={{ color: value ? '#16a34a' : '#dc2626', fontSize: 12, fontWeight: 700 }}>
          {value ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  );
}

function PersonCard({ person }) {
  if (!person) return null;
  return (
    <div className="history-person-card">
      <div className="history-person-avatar">
        {person.userImage?.img
          ? <img src={person.userImage.img} alt={person.name} />
          : <span>{(person.name || '?')[0].toUpperCase()}</span>
        }
      </div>
      <div className="history-person-info">
        <span className="history-person-name">{person.name || '—'}</span>
        {person.phone && (
          <div className="history-person-row"><PhoneIcon color={ACCENT} /><span>{person.phone}</span></div>
        )}
        {person.email && <span className="history-person-email">{person.email}</span>}
        {person.address && (
          <div className="history-person-row"><LocationIcon color={ACCENT} /><span>{person.address}</span></div>
        )}
      </div>
    </div>
  );
}

// ─── Live Tracking Map ────────────────────────────────────────────────────────
function LiveTrackingMap({ carId, craneManLocation, pickupLocation, isUser }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const craneMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const lastRouteOriginRef = useRef(null);

  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current || !window.google?.maps) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: craneManLocation.latitude, lng: craneManLocation.longitude },
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });
    mapInstanceRef.current = map;

    craneMarkerRef.current = new window.google.maps.Marker({
      position: { lat: craneManLocation.latitude, lng: craneManLocation.longitude },
      map,
      title: 'Crane Man',
      icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#2563EB', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
    });

    if (pickupLocation) {
      new window.google.maps.Marker({
        position: { lat: pickupLocation.latitude, lng: pickupLocation.longitude },
        map,
        title: 'Pickup',
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#22c55e', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
      });
    }

    polylineRef.current = new window.google.maps.Polyline({
      map, strokeColor: '#2563EB', strokeOpacity: 1, strokeWeight: 4,
    });

    setMapReady(true);
  }, [craneManLocation, pickupLocation]);

  useEffect(() => {
    if (window.google?.maps) { initMap(); return; }
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
  }, [initMap]);

  const fetchRoute = useCallback((origin) => {
    if (!pickupLocation || !window.google?.maps) return;
    const lastOrigin = lastRouteOriginRef.current;
    if (lastOrigin && getDistanceKm(lastOrigin.lat, lastOrigin.lng, origin.lat, origin.lng) < 0.1) return;

    const ds = new window.google.maps.DirectionsService();
    ds.route({
      origin,
      destination: { lat: pickupLocation.latitude, lng: pickupLocation.longitude },
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status !== 'OK' || !result.routes[0]) return;
      lastRouteOriginRef.current = origin;
      const leg = result.routes[0].legs[0];
      polylineRef.current?.setPath(result.routes[0].overview_path);
      setDistance(leg.distance.value / 1000);
      setEta(`~${Math.round(leg.duration.value / 60)} min`);
      const bounds = new window.google.maps.LatLngBounds();
      result.routes[0].overview_path.forEach(p => bounds.extend(p));
      mapInstanceRef.current?.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    });
  }, [pickupLocation]);

  useEffect(() => {
    if (!mapReady) return;
    const poll = async () => {
      try {
        const res = await api.get(`/car/get-car-detail-by-id/${carId}`);
        if (res.data?.success) {
          const loc = res.data.data?.craneMan?.location;
          if (loc?.latitude && loc?.longitude) {
            const newLoc = { lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) };
            setLastUpdated(new Date(loc.timestamp || Date.now()));
            craneMarkerRef.current?.setPosition(newLoc);
            if (pickupLocation) setDistance(getDistanceKm(newLoc.lat, newLoc.lng, pickupLocation.latitude, pickupLocation.longitude));
            fetchRoute(newLoc);
          }
        }
      } catch (e) { console.log('Poll error:', e); }
    };
    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [mapReady, carId, pickupLocation, fetchRoute]);

  return (
    <div className="history-map-card">
      <div className="history-map-stats">
        <div>
          <div className="history-map-stat-val">{formatDistance(distance)}</div>
          <div className="history-map-stat-lbl">Distance</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="history-live-badge">
            <div className="history-live-dot" />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: 1.5 }}>LIVE</span>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Crane Location</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="history-map-stat-val">{eta || '—'}</div>
          <div className="history-map-stat-lbl">ETA</div>
        </div>
      </div>
      <div ref={mapRef} style={{ width: '100%', height: 260 }} />
      <div className="history-map-bottom">
        <div className="history-map-dot" style={{ background: '#2563EB' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>Crane Man</div>
          <div style={{ fontSize: 10, color: '#9CA3AF' }}>Moving towards you</div>
        </div>
        <div style={{ width: 1, height: 28, background: '#E5E7EB', margin: '0 8px' }} />
        <div className="history-map-dot" style={{ background: '#22c55e' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>Pickup Point</div>
          <div style={{ fontSize: 10, color: '#9CA3AF' }}>
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Your location'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Page() {
  const router = useRouter();
  const params = useParams();
  const carId = params?.id;

  const [carDetail, setCarDetail] = useState(null);
  const [isUser, setIsUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [activeTab, setActiveTab] = useState('vehicle');

  const fetchCarDetail = async () => {
    setLoading(true); setError(false);
    try {
      const res = await api.get(`/car/get-car-detail-by-id/${carId}`);
      if (res.data.success) { setCarDetail(res.data.data); setIsUser(res.data.isUser); }
      else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (carId) fetchCarDetail(); }, [carId]);

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && setLightboxImg(null);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (loading) return (
    <><style>{CSS}</style>
      <div className="history-root">
        <div className="history-loading"><div className="history-spinner" /><span>Loading vehicle history…</span></div>
      </div>
    </>
  );

  if (error || !carDetail) return (
    <><style>{CSS}</style>
      <div className="history-root">
        <div className="history-loading">
          <span className="history-error-text">Failed to load car details.</span>
          <button className="history-retry-btn" onClick={fetchCarDetail}>Try Again</button>
        </div>
      </div>
    </>
  );

  const {
    rcNumber, carDetail: rc, seller, craneMan, status,
    kmDriven, pickupLocation, onlyForCheck, isRunningCondition,
    anyMissingPart, isPaid, paymentMethod, paymentDetails,
    images, frontImage, backImage, chassisImage, engineImage,
    tyreImage, odometerImage, rcFrontImage, rcBackImage,
    price, createdAt, updatedAt,
  } = carDetail;

  const craneCoords = craneMan?.location?.latitude
    ? { latitude: parseFloat(craneMan.location.latitude), longitude: parseFloat(craneMan.location.longitude) }
    : null;
  const pickupCoords = pickupLocation?.latitude
    ? { latitude: parseFloat(pickupLocation.latitude), longitude: parseFloat(pickupLocation.longitude) }
    : null;
  const showMap = isUser && (status === 'en_route' || status === 'en_route_to_garage') && craneCoords && pickupCoords;

  const tabs = [
    { id: 'vehicle',      label: 'Vehicle' },
    { id: 'registration', label: 'Registration' },
    { id: 'insurance',    label: 'Insurance' },
    { id: 'finance',      label: 'Finance' },
    { id: 'condition',    label: 'Condition' },
    { id: 'payment',      label: 'Payment' },
  ];

  return (
    <>
      <style>{CSS}</style>

      {lightboxImg && (
        <div className="history-lightbox" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Preview" className="history-lightbox-img" />
          <button className="history-lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
        </div>
      )}

      <div className="history-root">

        {/* ── Top Bar ── */}
        <div className="history-topbar">
          <button className="history-back-btn" onClick={() => router.back()}><BackIcon /></button>
          <div className="history-topbar-center">
            <span className="history-topbar-title">Vehicle History</span>
            <span className="history-topbar-sub">{rcNumber || '—'}</span>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="history-scroll">

          {/* ── Hero ── */}
          <div className="history-hero">
            <div className="history-hero-bg" />
            <div className="history-hero-content">
              <div className="history-hero-eyebrow">
                {rc?.fuelType && <span className="history-tag">{rc.fuelType}</span>}
                {rc?.bodyType && <span className="history-tag">{rc.bodyType}</span>}
                {rc?.variant && <span className="history-tag">{rc.variant}</span>}
              </div>
              <h1 className="history-hero-title">
                {rc?.make || '—'} <span>{rc?.model || ''}</span>
              </h1>
              <p className="history-hero-year">{rc?.manufacturingYear || ''}</p>
              <div className="history-hero-stats">
                <div className="history-stat-pill">
                  <span className="history-stat-num">{rcNumber || '—'}</span>
                  <span className="history-stat-lbl">RC Number</span>
                </div>
                {kmDriven != null && (
                  <div className="history-stat-pill">
                    <span className="history-stat-num">{Number(kmDriven).toLocaleString('en-IN')}</span>
                    <span className="history-stat-lbl">KM Driven</span>
                  </div>
                )}
                {rc?.color && (
                  <div className="history-stat-pill">
                    <span className="history-stat-num">{rc.color}</span>
                    <span className="history-stat-lbl">Color</span>
                  </div>
                )}
                {rc?.ownerCount && (
                  <div className="history-stat-pill">
                    <span className="history-stat-num">{rc.ownerCount}</span>
                    <span className="history-stat-lbl">Owner Count</span>
                  </div>
                )}
              </div>
            </div>
            {/* {(frontImage?.image || images?.[0]?.image) && (
              <div className="history-hero-img-wrap">
                <img src={frontImage?.image || images[0]?.image} alt="Car" className="history-hero-img"
                  onClick={() => setLightboxImg(frontImage?.image || images[0]?.image)} />
              </div>
            )} */}
          </div>

          {/* ── Live Tracking ── */}
          {showMap && (
            <div style={{ padding: '14px 14px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: 14, fontWeight: 800, color: PRIMARY }}>
                  <MapIcon color={ACCENT} /> Live Crane Tracking
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#DCFCE7', borderRadius: 20, padding: '4px 10px' }}>
                  <div className="history-live-dot" style={{ background: '#16a34a' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>Live</span>
                </div>
              </div>
              <LiveTrackingMap carId={carId} craneManLocation={craneCoords} pickupLocation={pickupCoords} isUser={isUser} />
            </div>
          )}

          {/* ── Photo Strip ── */}
          {images && images.length > 0 && (
            <div className="history-strip-wrap">
              <div className="history-strip-header">
                <span className="history-strip-title">Inspection Photos</span>
                <span className="history-strip-count">{images.length} photos</span>
              </div>
              <div className="history-strip">
                {images.map((img, i) => (
                  <div key={img.public_id || i} className="history-strip-item" onClick={() => setLightboxImg(img.image)}>
                    <img src={img.image} alt={`Photo ${i + 1}`} />
                    <div className="history-strip-overlay">
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="history-tabs">
            {tabs.map(t => (
              <button key={t.id}
                className={`history-tab${activeTab === t.id ? ' history-tab-active' : ''}`}
                onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab Panels ── */}
          <div className="history-panels">

            {/* Vehicle */}
            {activeTab === 'vehicle' && rc && (
              <Section title="Vehicle Information" icon={<CarIcon color={ACCENT} />}>
                <InfoRow label="Make" value={rc.make} />
                <InfoRow label="Model" value={rc.model} />
                <InfoRow label="Year" value={rc.manufacturingYear} />
                <InfoRow label="Color" value={rc.color} />
                <InfoRow label="Body Type" value={rc.bodyType} />
                <InfoRow label="Vehicle Class" value={rc.vehicleClass} />
                <InfoRow label="Fuel Type" value={rc.fuelType} />
                <InfoRow label="Seating Capacity" value={rc.seatingCapacity} />
                <InfoRow label="Engine Number" value={rc.engineNumber} />
                <InfoRow label="Chassis Number" value={rc.chassisNumber} />
                <InfoRow label="Cubic Capacity" value={rc.cubicCapacity ? `${rc.cubicCapacity} cc` : null} />
                <InfoRow label="Cylinders" value={rc.cylinderCount} />
                <InfoRow label="Wheelbase" value={rc.wheelbase ? `${rc.wheelbase} mm` : null} />
                <InfoRow label="Unladen Weight" value={rc.unladenWeight ? `${rc.unladenWeight} kg` : null} />
                <InfoRow label="Gross Weight" value={rc.grossWeight ? `${rc.grossWeight} kg` : null} />
                <InfoRow label="Vehicle Category" value={rc.vehicleCategory} />
                <InfoRow label="Variant" value={rc.variant} />
              </Section>
            )}

            {/* Registration */}
            {activeTab === 'registration' && rc && (
              <Section title="Registration Details" icon={<LocationIcon color={ACCENT} />}>
                <InfoRow label="RC Number" value={rcNumber} />
                <InfoRow label="Owner Name" value={rc.ownerName} />
                <InfoRow label="Father's Name" value={rc.fatherName} />
                <InfoRow label="RTO Office" value={rc.rtoOffice} />
                <InfoRow label="RTO Code" value={rc.rtoCode} />
                <InfoRow label="Owner Count" value={rc.ownerCount} />
                <InfoRow label="Registration Date" value={rc.registrationDate} />
                <InfoRow label="Valid Till" value={rc.registrationValidity} highlight />
                <InfoRow label="RC Status" value={rc.rcStatus} highlight />
                <InfoRow label="Status As On" value={rc.statusAsOn} />
                <InfoRow label="Tax Valid Till" value={rc.taxValidity} highlight />
                <InfoRow label="Present Address" value={rc.presentAddress} />
                <InfoRow label="Permanent Address" value={rc.permanentAddress} />
              </Section>
            )}

            {/* Insurance */}
            {activeTab === 'insurance' && rc && (
              <Section title="Insurance & PUC" icon={<ShieldIcon color={ACCENT} />}>
                <InfoRow label="Insurance Company" value={rc.insuranceCompany} />
                <InfoRow label="Policy Number" value={rc.insurancePolicyNumber} />
                <InfoRow label="Insurance Valid Till" value={rc.insuranceValidity} highlight />
                <InfoRow label="PUCC Number" value={rc.puccNumber} />
                <InfoRow label="PUC Valid Till" value={rc.puccValidity} highlight />
              </Section>
            )}

            {/* Finance */}
            {activeTab === 'finance' && rc && (
              <Section title="Finance & Legal" icon={<BankIcon color={ACCENT} />}>
                <BoolRow label="Financed" value={rc.financed} />
                <InfoRow label="Financer" value={rc.financer} />
                <InfoRow label="Blacklist Status" value={rc.blacklistStatus || 'Clean'} />
                <InfoRow label="Blacklist Records"
                  value={rc.blacklistDetails?.length > 0 ? `${rc.blacklistDetails.length} record(s)` : 'None'} />
                <InfoRow label="Pending Challans"
                  value={rc.challanDetails?.length > 0 ? `${rc.challanDetails.length} challan(s)` : 'None'} />
              </Section>
            )}

            {/* Condition */}
            {activeTab === 'condition' && (
              <Section title="Condition Report" icon={<ShieldIcon color={ACCENT} />}>
                <BoolRow label="Running Condition" value={isRunningCondition} />
                <BoolRow label="Any Missing Part" value={anyMissingPart} />
                <BoolRow label="Only For Check" value={onlyForCheck} />
                {kmDriven != null && <InfoRow label="KM Driven" value={`${Number(kmDriven).toLocaleString('en-IN')} km`} />}
                {pickupLocation && (
                  <>
                    <InfoRow label="Pickup Area" value={pickupLocation.address} />
                    <InfoRow label="House / Street" value={pickupLocation.streetAndHouse} />
                    {pickupLocation.latitude && (
                      <InfoRow label="Coordinates"
                        value={`${parseFloat(pickupLocation.latitude).toFixed(5)}, ${parseFloat(pickupLocation.longitude).toFixed(5)}`} />
                    )}
                  </>
                )}
              </Section>
            )}

            {/* Payment */}
            {activeTab === 'payment' && (
              <Section title="Payment Details" icon={<PaymentIcon color={ACCENT} />}>
                <BoolRow label="Payment Done" value={isPaid} />
                {paymentMethod && <InfoRow label="Method" value={paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer'} />}
                {price && <InfoRow label="Price" value={`₹ ${Number(price).toLocaleString('en-IN')}`} highlight />}
                {paymentDetails?.upiId && <InfoRow label="UPI ID" value={paymentDetails.upiId} />}
                {paymentDetails?.accountHolderName && <InfoRow label="Account Holder" value={paymentDetails.accountHolderName} />}
                {paymentDetails?.bankName && <InfoRow label="Bank Name" value={paymentDetails.bankName} />}
                {paymentDetails?.accountNumber && <InfoRow label="Account Number" value={paymentDetails.accountNumber} />}
                {paymentDetails?.ifscCode && <InfoRow label="IFSC Code" value={paymentDetails.ifscCode} />}
              </Section>
            )}

          </div>

          {/* ── People Grid ── */}
          <div className="history-people-grid">
            {seller && (
              <div className="history-people-card">
                <div className="history-people-label"><UserIcon color={ACCENT} /><span>Seller</span></div>
                <PersonCard person={seller} />
              </div>
            )}
            {craneMan && (
              <div className="history-people-card">
                <div className="history-people-label"><UserIcon color={ACCENT} /><span>Crane Man</span></div>
                <PersonCard person={craneMan} />
              </div>
            )}
          </div>

          {/* ── Car Photos ── */}
          <div className="history-photo-section">
            <div className="history-photo-section-header">
              <CarIcon color={PRIMARY} /><span>Car Photos</span>
            </div>
            <div className="history-photo-grid">
              {[
                { label: 'Front',    uri: frontImage?.image },
                { label: 'Back',     uri: backImage?.image },
                { label: 'Chassis',  uri: chassisImage?.image },
                { label: 'Engine',   uri: engineImage?.image },
                { label: 'Tyre',     uri: tyreImage?.image },
                { label: 'Odometer', uri: odometerImage?.image },
                { label: 'RC Front', uri: rcFrontImage?.image },
                { label: 'RC Back',  uri: rcBackImage?.image },
              ].filter(p => p.uri).map(({ label, uri }) => (
                <div key={label} className="history-photo-item" onClick={() => setLightboxImg(uri)}>
                  <img src={uri} alt={label} />
                  <div className="history-photo-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Timeline ── */}
          <div className="history-timeline-wrap">
            <div className="history-timeline-header"><ClockIcon color={PRIMARY} /><span>Activity</span></div>
            <div className="history-timeline">
              {updatedAt && (
                <div className="history-timeline-item">
                  <div className="history-timeline-dot history-timeline-dot-accent" />
                  <div className="history-timeline-content">
                    <span className="history-timeline-label">Last Updated</span>
                    <span className="history-timeline-date">
                      {new Date(updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
              {createdAt && (
                <div className="history-timeline-item">
                  <div className="history-timeline-dot" />
                  <div className="history-timeline-content">
                    <span className="history-timeline-label">Listed On</span>
                    <span className="history-timeline-date">
                      {new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ height: 48 }} />
        </div>
      </div>
    </>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --h-primary: #0A1F0D;
    --h-accent: #3DBA5E;
    --h-accent-dim: rgba(61,186,94,0.12);
    --h-surface: #ffffff;
    --h-bg: #F2F5F2;
    --h-border: rgba(10,31,13,0.07);
    --h-text: #0A1F0D;
    --h-muted: #7A8E7C;
    --h-radius: 16px;
  }

  .history-root { background: var(--h-bg); font-family: 'Instrument Sans', sans-serif; color: var(--h-text); min-height: 100vh; }

  .history-topbar {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    background: var(--h-surface); border-bottom: 1px solid var(--h-border);
    padding: 10px 16px; position: sticky; top: 0; z-index: 30;
  }
  .history-back-btn {
    width: 36px; height: 36px; border-radius: 10px; background: var(--h-bg);
    border: 1px solid var(--h-border); display: flex; align-items: center;
    justify-content: center; cursor: pointer; color: var(--h-primary); flex-shrink: 0; transition: background 0.15s;
  }
  .history-back-btn:hover { background: #e8ede8; }
  .history-topbar-center { flex: 1; padding: 0 8px; }
  .history-topbar-title { display: block; font-family: 'Cabinet Grotesk', sans-serif; font-size: 15px; font-weight: 800; color: var(--h-primary); letter-spacing: -0.3px; line-height: 1.2; }
  .history-topbar-sub { display: block; font-size: 11px; color: var(--h-muted); margin-top: 1px; letter-spacing: 0.3px; }
  .history-status-badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; flex-shrink: 0; }

  .history-scroll { max-width: 700px; margin: 0 auto; }

  .history-hero {
    position: relative; background: var(--h-primary); margin: 14px 14px 0;
    border-radius: 20px; overflow: hidden; padding: 26px 22px 22px; min-height: 200px;
    animation: h-fadeup 0.4s ease both;
  }
  .history-hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 80% at 90% 50%, rgba(61,186,94,0.18) 0%, transparent 70%),
                radial-gradient(ellipse 40% 40% at 10% 80%, rgba(61,186,94,0.08) 0%, transparent 60%);
    pointer-events: none;
  }
  .history-hero-content { position: relative; z-index: 2; max-width: 100%; }
  .history-hero-eyebrow { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
  .history-tag { padding: 3px 9px; border-radius: 20px; background: rgba(61,186,94,0.18); color: #6ee89a; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(61,186,94,0.25); }
  .history-hero-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 26px; font-weight: 900; color: #fff; letter-spacing: -0.8px; line-height: 1.1; margin-bottom: 4px; }
  .history-hero-title span { color: var(--h-accent); }
  .history-hero-year { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 18px; }
  .history-hero-stats { display: flex; gap: 10px; flex-wrap: wrap; }
  .history-stat-pill { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 8px 12px; display: flex; flex-direction: column; gap: 2px; }
  .history-stat-num { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }
  .history-stat-lbl { font-size: 9px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.5px; }
  .history-hero-img-wrap { position: absolute; right: -10px; bottom: 0; top: 0; width: 45%; display: flex; align-items: flex-end; justify-content: flex-end; z-index: 1; pointer-events: none; }
  .history-hero-img { width: 100%; height: 100%; object-fit: cover; object-position: center; opacity: 0.55; cursor: zoom-in; pointer-events: all; transition: opacity 0.2s; }
  .history-hero-img:hover { opacity: 0.75; }

  /* Map */
  .history-map-card { border-radius: 16px; overflow: hidden; border: 1px solid rgba(10,31,13,0.08); box-shadow: 0 4px 16px rgba(10,31,13,0.08); }
  .history-map-stats { background: linear-gradient(135deg, #1E3A8A, #2563EB); display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; }
  .history-map-stat-val { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .history-map-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.65); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.4px; }
  .history-live-badge { display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 5px 12px; }
  .history-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; animation: h-pulse 1.5s infinite; }
  @keyframes h-pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.6; transform:scale(1.3); } }
  .history-map-bottom { display: flex; align-items: center; padding: 12px 20px; background: #fff; border-top: 1px solid #F1F5F9; gap: 12px; }
  .history-map-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  .history-strip-wrap { padding: 16px 14px 0; }
  .history-strip-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .history-strip-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; font-weight: 800; color: var(--h-primary); }
  .history-strip-count { font-size: 11px; color: var(--h-muted); background: var(--h-surface); padding: 3px 8px; border-radius: 20px; border: 1px solid var(--h-border); }
  .history-strip { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
  .history-strip::-webkit-scrollbar { display: none; }
  .history-strip-item { position: relative; width: 120px; height: 80px; border-radius: 10px; overflow: hidden; flex-shrink: 0; cursor: zoom-in; background: #dde3dd; }
  .history-strip-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
  .history-strip-item:hover img { transform: scale(1.06); }
  .history-strip-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.15s; }
  .history-strip-item:hover .history-strip-overlay { opacity: 1; }

  .history-tabs { display: flex; gap: 6px; padding: 14px 14px 0; overflow-x: auto; scrollbar-width: none; }
  .history-tabs::-webkit-scrollbar { display: none; }
  .history-tab { padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid var(--h-border); background: var(--h-surface); color: var(--h-muted); cursor: pointer; white-space: nowrap; transition: all 0.15s; font-family: 'Instrument Sans', sans-serif; }
  .history-tab:hover { color: var(--h-primary); border-color: rgba(10,31,13,0.2); }
  .history-tab-active { background: var(--h-primary); color: #fff; border-color: var(--h-primary); }

  .history-panels { padding: 12px 14px 0; }

  .history-section { background: var(--h-surface); border-radius: var(--h-radius); border: 1px solid var(--h-border); overflow: hidden; animation: h-fadeup 0.3s ease both; box-shadow: 0 2px 8px rgba(10,31,13,0.04); }
  @keyframes h-fadeup { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .history-section-header { display: flex; align-items: center; gap: 9px; padding: 14px 16px; border-bottom: 1px solid var(--h-border); background: linear-gradient(to right, rgba(61,186,94,0.04), transparent); }
  .history-section-icon { width: 28px; height: 28px; border-radius: 8px; background: var(--h-accent-dim); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .history-section-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 13px; font-weight: 800; color: var(--h-primary); letter-spacing: -0.2px; }
  .history-section-body { padding: 4px 16px 12px; }

  .history-info-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid rgba(10,31,13,0.04); gap: 12px; }
  .history-info-row:last-child { border-bottom: none; }
  .history-info-label { font-size: 12px; color: var(--h-muted); font-weight: 500; flex: 1; }
  .history-info-value { font-size: 13px; color: var(--h-primary); font-weight: 600; flex: 1.2; text-align: right; word-break: break-word; }
  .history-bool-pill { display: flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; }

  .history-people-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px 14px 0; }
  .history-people-card { background: var(--h-surface); border-radius: var(--h-radius); border: 1px solid var(--h-border); padding: 14px; box-shadow: 0 1px 4px rgba(10,31,13,0.04); }
  .history-people-label { display: flex; align-items: center; gap: 6px; font-family: 'Cabinet Grotesk', sans-serif; font-size: 11px; font-weight: 800; color: var(--h-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .history-person-card { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0 4px; }
  .history-person-avatar { width: 46px; height: 46px; border-radius: 23px; background: var(--h-accent-dim); border: 2px solid rgba(61,186,94,0.2); overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Cabinet Grotesk', sans-serif; font-size: 18px; font-weight: 800; color: var(--h-accent); }
  .history-person-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .history-person-info { flex: 1; }
  .history-person-name { display: block; font-size: 14px; font-weight: 700; color: var(--h-primary); margin-bottom: 5px; }
  .history-person-row { display: flex; align-items: center; gap: 5px; margin-top: 3px; font-size: 12px; color: var(--h-muted); }
  .history-person-email { display: block; font-size: 11px; color: #aab9ab; margin-top: 2px; }

  .history-photo-section { margin: 12px 14px 0; background: var(--h-surface); border-radius: var(--h-radius); border: 1px solid var(--h-border); overflow: hidden; box-shadow: 0 2px 8px rgba(10,31,13,0.04); }
  .history-photo-section-header { display: flex; align-items: center; gap: 9px; padding: 14px 16px; border-bottom: 1px solid var(--h-border); font-family: 'Cabinet Grotesk', sans-serif; font-size: 13px; font-weight: 800; color: var(--h-primary); background: linear-gradient(to right, rgba(61,186,94,0.04), transparent); }
  .history-photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 12px; }
  .history-photo-item { border-radius: 10px; overflow: hidden; cursor: zoom-in; background: #dde3dd; position: relative; aspect-ratio: 1; }
  .history-photo-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; display: block; }
  .history-photo-item:hover img { transform: scale(1.06); }
  .history-photo-label { position: absolute; bottom: 0; left: 0; right: 0; padding: 4px 6px; background: linear-gradient(transparent, rgba(0,0,0,0.55)); font-size: 9px; color: #fff; font-weight: 600; text-align: center; }

  .history-timeline-wrap { margin: 12px 14px 0; background: var(--h-surface); border-radius: var(--h-radius); border: 1px solid var(--h-border); overflow: hidden; box-shadow: 0 2px 8px rgba(10,31,13,0.04); }
  .history-timeline-header { display: flex; align-items: center; gap: 9px; padding: 14px 16px; border-bottom: 1px solid var(--h-border); font-family: 'Cabinet Grotesk', sans-serif; font-size: 13px; font-weight: 800; color: var(--h-primary); background: linear-gradient(to right, rgba(61,186,94,0.04), transparent); }
  .history-timeline { padding: 8px 16px 14px; display: flex; flex-direction: column; }
  .history-timeline-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; position: relative; }
  .history-timeline-item:not(:last-child)::after { content: ''; position: absolute; left: 6px; top: 26px; bottom: -10px; width: 1px; background: var(--h-border); }
  .history-timeline-dot { width: 13px; height: 13px; border-radius: 50%; background: #d4ddd4; border: 2px solid var(--h-surface); box-shadow: 0 0 0 2px #d4ddd4; flex-shrink: 0; margin-top: 3px; }
  .history-timeline-dot-accent { background: var(--h-accent); box-shadow: 0 0 0 2px rgba(61,186,94,0.25); }
  .history-timeline-content { flex: 1; }
  .history-timeline-label { display: block; font-size: 13px; font-weight: 600; color: var(--h-primary); }
  .history-timeline-date { display: block; font-size: 11px; color: var(--h-muted); margin-top: 2px; }

  .history-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 14px; }
  .history-spinner { width: 34px; height: 34px; border: 3px solid #dde3dd; border-top-color: var(--h-accent); border-radius: 50%; animation: h-spin 0.7s linear infinite; }
  @keyframes h-spin { to { transform: rotate(360deg); } }
  .history-error-text { font-size: 14px; color: #374151; }
  .history-retry-btn { padding: 10px 24px; background: var(--h-primary); color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Instrument Sans', sans-serif; transition: opacity 0.15s; }
  .history-retry-btn:hover { opacity: 0.85; }

  .history-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; cursor: zoom-out; animation: h-fadein 0.15s ease; }
  @keyframes h-fadein { from { opacity: 0; } to { opacity: 1; } }
  .history-lightbox-img { max-width: 100%; max-height: 90vh; border-radius: 14px; object-fit: contain; }
  .history-lightbox-close { position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 16px; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .history-lightbox-close:hover { background: rgba(255,255,255,0.22); }

  @media (max-width: 480px) {
    .history-hero-title { font-size: 21px; }
    .history-hero-content { max-width: 58%; }
    .history-photo-grid { grid-template-columns: repeat(3, 1fr); }
    .history-people-grid { grid-template-columns: 1fr; }
    .history-strip-item { width: 100px; height: 68px; }
  }
  @media (max-width: 360px) {
    .history-photo-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;