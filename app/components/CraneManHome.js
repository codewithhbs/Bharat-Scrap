import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, RefreshControl, Modal, Image,
    TextInput, KeyboardAvoidingView, Platform, Linking,
    Dimensions, Pressable, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import api from '../lib/api';
import Toast from './Toast';
import { useNavigation } from '@react-navigation/native';
import { startLocationTracking, stopLocationTracking } from '../services/locationService';
// import Geolocation from '@react-native-community/geolocation';
import * as ExpoLocation from 'expo-location';

// Geolocation.setRNConfiguration({
//     skipPermissionRequests: false,
//     authorizationLevel: 'whenInUse',
//     locationProvider: 'auto',
// });

const { width: SW } = Dimensions.get('window');

const GOOGLE_MAPS_API_KEY = 'AIzaSyD022IF_7EVi9DEqKBizpz6vXM_nuFeE1g';

// ─── Color Palette ─────────────────────────────────────────────────────────────
const C = {
    bg: '#F4F6FB',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#E4E8F0',
    orange: '#F05A28',
    orangeLight: '#FF7A4D',
    orangeDim: 'rgba(240,90,40,0.08)',
    orangeBorder: 'rgba(240,90,40,0.2)',
    green: '#16A34A',
    greenDim: 'rgba(22,163,74,0.08)',
    greenBorder: 'rgba(22,163,74,0.2)',
    yellow: '#D97706',
    yellowDim: 'rgba(217,119,6,0.08)',
    red: '#DC2626',
    redDim: 'rgba(220,38,38,0.08)',
    blue: '#2563EB',
    blueDim: 'rgba(37,99,235,0.08)',
    purple: '#7C3AED',
    purpleDim: 'rgba(124,58,237,0.08)',
    purpleBorder: 'rgba(124,58,237,0.2)',
    text: '#111827',
    textSub: '#6B7280',
    textMuted: '#9CA3AF',
    white: '#FFFFFF',
    divider: '#E9ECF3',
    overlay: 'rgba(0,0,0,0.55)',
};

const STATUS = {
    processing: { color: C.orange, dim: C.orangeDim, border: C.orangeBorder, label: 'Assigned', icon: 'clock' },
    en_route: { color: C.blue, dim: C.blueDim, border: 'rgba(37,99,235,0.25)', label: 'En Route', icon: 'map' },
    inspecting: { color: C.yellow, dim: C.yellowDim, border: 'rgba(217,119,6,0.25)', label: 'Inspecting', icon: 'eye' },
    picked_up: { color: C.green, dim: C.greenDim, border: C.greenBorder, label: 'Picked Up', icon: 'check' },
    en_route_to_garage: { color: C.blue, dim: C.blueDim, border: 'rgba(37,99,235,0.25)', label: 'To Garage', icon: 'truck' },
    at_garage: { color: C.purple, dim: C.purpleDim, border: C.purpleBorder, label: 'At Garage', icon: 'pin' },
    sold: { color: C.green, dim: C.greenDim, border: C.greenBorder, label: 'Sold', icon: 'check' },
    cancelled: { color: C.red, dim: C.redDim, border: 'rgba(220,38,38,0.25)', label: 'Cancelled', icon: 'x' },
};

const ACTIVE_STATUSES = ['processing', 'en_route', 'inspecting', 'picked_up', 'en_route_to_garage', 'at_garage'];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function Icon({ name, size = 18, color = C.text, strokeWidth = 1.8 }) {
    const s = { stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const icons = {
        car: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-4h10l2 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2" {...s} /><Circle cx="7.5" cy="17.5" r="2.5" {...s} /><Circle cx="16.5" cy="17.5" r="2.5" {...s} /></Svg>,
        map: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" {...s} /><Path d="M8 2v16M16 6v16" {...s} /></Svg>,
        clock: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" {...s} /><Path d="M12 6v6l4 2" {...s} /></Svg>,
        check: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20 6L9 17l-5-5" {...s} /></Svg>,
        eye: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...s} /><Circle cx="12" cy="12" r="3" {...s} /></Svg>,
        x: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M18 6L6 18M6 6l12 12" {...s} /></Svg>,
        chevron: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M9 18l6-6-6-6" {...s} /></Svg>,
        phone: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" {...s} /></Svg>,
        navigate: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 11l19-9-9 19-2-8-8-2z" {...s} /></Svg>,
        truck: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="1" y="3" width="15" height="13" rx="1" {...s} /><Path d="M16 8h4l3 3v5h-7V8z" {...s} /><Circle cx="5.5" cy="18.5" r="2.5" {...s} /><Circle cx="18.5" cy="18.5" r="2.5" {...s} /></Svg>,
        pin: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" {...s} /><Circle cx="12" cy="10" r="3" {...s} /></Svg>,
        user: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" {...s} /><Circle cx="12" cy="7" r="4" {...s} /></Svg>,
        camera: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" {...s} /><Circle cx="12" cy="13" r="4" {...s} /></Svg>,
        bank: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" {...s} /><Path d="M9 22V12h6v10" {...s} /></Svg>,
        upi: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="2" y="5" width="20" height="14" rx="2" {...s} /><Path d="M2 10h20" {...s} /></Svg>,
        warning: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" {...s} /><Path d="M12 9v4M12 17h.01" {...s} /></Svg>,
        trash: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" {...s} /></Svg>,
        plus: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 5v14M5 12h14" {...s} /></Svg>,
        lock: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="11" width="18" height="11" rx="2" {...s} /><Path d="M7 11V7a5 5 0 0110 0v4" {...s} /></Svg>,
        garage: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" {...s} /><Path d="M9 22V12h6v10M5 14h14" {...s} /></Svg>,
        refresh: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M23 4v6h-6M1 20v-6h6" {...s} /><Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" {...s} /></Svg>,
        close: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M18 6L6 18M6 6l12 12" {...s} /></Svg>,
        expand: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" {...s} /></Svg>,
    };
    return icons[name] || null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function formatDist(km) {
    if (km === null || km === undefined) return '—';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
}
function formatETA(km) {
    if (km === null || km === undefined) return '—';
    const mins = Math.round((km / 30) * 60);
    if (mins < 1) return '<1 min';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
}

function decodePolyline(encoded) {
    let index = 0, lat = 0, lng = 0;
    const coords = [];
    while (index < encoded.length) {
        let b, shift = 0, result = 0;
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        lat += result & 1 ? ~(result >> 1) : result >> 1;
        shift = 0; result = 0;
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        lng += result & 1 ? ~(result >> 1) : result >> 1;
        coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return coords;
}

function Badge({ status }) {
    const cfg = STATUS[status] || STATUS.processing;
    return (
        <View style={[bd.wrap, { backgroundColor: cfg.dim, borderColor: cfg.border }]}>
            <View style={[bd.dot, { backgroundColor: cfg.color }]} />
            <Text style={[bd.text, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
    );
}
const bd = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
    dot: { width: 5, height: 5, borderRadius: 3 },
    text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});

function StatTile({ value, label }) {
    return (
        <View style={st.wrap}>
            <Text style={st.val}>{value}</Text>
            <Text style={st.lbl}>{label}</Text>
        </View>
    );
}
const st = StyleSheet.create({
    wrap: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    val: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
    lbl: { fontSize: 9, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: 2, letterSpacing: 0.8, textTransform: 'uppercase' },
});

const handleCall = async (phone) => {
    try {
        const url = `tel:${phone}`;

        await Linking.openURL(url);
    } catch (e) {
        console.log('Call failed:', e);
    }
};
function openGoogleMaps(lat, lng) {
    const url =
        Platform.OS === 'ios'
            ? `maps:0,0?q=${lat},${lng}`
            : `geo:0,0?q=${lat},${lng}`;
    Linking.canOpenURL(url).then((ok) => {
        Linking.openURL(
            ok ? url : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        );
    });
}

// ─── Pulse Ring for Map Marker ────────────────────────────────────────────────
function PulseRing({ color = C.blue }) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 1400, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    return (
        <Animated.View style={{
            position: 'absolute',
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: color,
            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
        }} />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NAVIGATION MAP MODAL ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function NavigationMapModal({ visible, job, onClose }) {
    const mapRef = useRef(null);
    const watchId = useRef(null);
    const hasInitialFit = useRef(false);
    const prevCraneRef = useRef(null);

    const [craneLocation, setCraneLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [routeCoords, setRouteCoords] = useState([]);
    // console.log("job",job)
    // Pickup coords — fixed (user ki location)
    const pickupCoords =
        job?.pickupLocation?.latitude && job?.pickupLocation?.longitude
            ? {
                latitude: parseFloat(job.pickupLocation.latitude),
                longitude: parseFloat(job.pickupLocation.longitude),
            }
            : null;

    const pickupLabel =
        job?.pickupLocation?.address ||
        job?.pickupLocation?.streetAndHouse ||
        'Pickup Location';

    // Android permission
    // Replace requestAndroidPermission:
    const requestPermission = async () => {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        return status === 'granted';
    };

    // Replace startWatch entirely:
    const startWatch = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) {
            setLocationError('Location permission denied');
            return;
        }

        // Fast one-time fix first
        try {
            const pos = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.Balanced,
            });
            const coords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            };
            setCraneLocation(coords);
            if (pickupCoords) {
                setDistance(getDistanceKm(
                    coords.latitude, coords.longitude,
                    pickupCoords.latitude, pickupCoords.longitude
                ));
                fetchRoute(coords, pickupCoords);
            }
        } catch (e) {
            setLocationError('Location unavailable: ' + e.message);
        }

        // Then live watch
        const sub = await ExpoLocation.watchPositionAsync(
            {
                accuracy: ExpoLocation.Accuracy.Balanced,
                distanceInterval: 10,
                timeInterval: 5000,
            },
            (pos) => {
                const updated = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                };
                setCraneLocation(updated);
                if (pickupCoords) {
                    setDistance(getDistanceKm(
                        updated.latitude, updated.longitude,
                        pickupCoords.latitude, pickupCoords.longitude
                    ));
                    const prevCoords = prevCraneRef.current;
                    const moved = prevCoords
                        ? getDistanceKm(prevCoords.latitude, prevCoords.longitude, updated.latitude, updated.longitude)
                        : 1;
                    if (moved > 0.1) {
                        fetchRoute(updated, pickupCoords);
                        prevCraneRef.current = updated;
                    }
                }
            }
        );
        watchId.current = sub;
    };

    const stopWatch = () => {
        if (watchId.current !== null) {
            watchId.current.remove(); // expo-location uses .remove() not clearWatch
            watchId.current = null;
        }
    };

    const fetchRoute = async (origin, destination) => {
        try {
            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes?.length > 0) {
                const points = decodePolyline(data.routes[0].overview_polyline.points);
                setRouteCoords(points);
            }
        } catch (e) {
            console.warn('Route fetch failed:', e);
        }
    };

    useEffect(() => {
        if (visible) {
            hasInitialFit.current = false;
            setLocationError(null);
            setCraneLocation(null);
            setDistance(null);
            setMapReady(false);
            startWatch();
        } else {
            stopWatch();
        }
        return () => stopWatch();
    }, [visible]);

    // Fit map — sirf ek baar jab dono coords ho
    useEffect(() => {
        if (!mapReady || !mapRef.current || hasInitialFit.current) return;

        if (craneLocation && pickupCoords) {
            // hasInitialFit effect mein
            mapRef.current.fitToCoordinates(
                routeCoords.length > 0 ? routeCoords : [craneLocation, pickupCoords],
                { edgePadding: { top: 120, right: 60, bottom: 300, left: 60 }, animated: true }
            );
            hasInitialFit.current = true;
        } else if (pickupCoords) {
            mapRef.current.animateToRegion({
                latitude: pickupCoords.latitude,
                longitude: pickupCoords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 600);
        }
    }, [mapReady, !!craneLocation]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={nm.root}>
                {/* ── Map ── */}
                <MapView
                    ref={mapRef}
                    style={nm.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={
                        pickupCoords
                            ? {
                                latitude: pickupCoords.latitude,
                                longitude: pickupCoords.longitude,
                                latitudeDelta: 0.06,
                                longitudeDelta: 0.06,
                            }
                            : {
                                latitude: 28.6139,
                                longitude: 77.209,
                                latitudeDelta: 0.1,
                                longitudeDelta: 0.1,
                            }
                    }
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    showsTraffic={false}
                    showsCompass={false}
                    onMapReady={() => setMapReady(true)}
                >
                    {/* Craneman marker — blue, moving */}
                    {craneLocation && (
                        <Marker
                            coordinate={craneLocation}
                            title="My Location"
                            tracksViewChanges={false}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={nm.craneMarkerWrap}>
                                <PulseRing color={C.blue} />
                                <View style={nm.craneMarker}>
                                    <Icon name="truck" size={18} color={C.white} />
                                </View>
                            </View>
                        </Marker>
                    )}

                    {/* Pickup marker — orange, fixed */}
                    {pickupCoords && (
                        <Marker
                            coordinate={pickupCoords}
                            title="Pickup Location"
                            description={pickupLabel}
                            tracksViewChanges={false}
                            anchor={{ x: 0.5, y: 1 }}
                        >
                            <View style={nm.pickupMarker}>
                                <View style={nm.pickupMarkerInner}>
                                    <Icon name="pin" size={18} color={C.white} />
                                </View>
                                <View style={nm.pickupMarkerTip} />
                            </View>
                        </Marker>
                    )}

                    {/* Dashed polyline: crane → pickup */}
                    {routeCoords.length > 0 && (
                        <Polyline
                            coordinates={routeCoords}
                            strokeColor={C.blue}
                            strokeWidth={4}
                            strokeColors={['#2563EB', '#1E40AF']}
                            lineJoin="round"
                            lineCap="round"
                        />
                    )}
                    {/* Fallback — agar route load nahi hua to straight dashed line */}
                    {/* {routeCoords.length === 0 && craneLocation && pickupCoords && (
                        <Polyline
                            coordinates={[craneLocation, pickupCoords]}
                            strokeColor={C.blue}
                            strokeWidth={2.5}
                            lineDashPattern={[8, 5]}
                            strokeOpacity={0.5}
                        />
                    )} */}
                </MapView>

                {/* ── Top Header Overlay ── */}
                <View style={nm.topBar} pointerEvents="box-none">
                    <SafeAreaView edges={['top']} style={nm.topInner}>
                        <TouchableOpacity style={nm.closeBtn} onPress={onClose}>
                            <Icon name="close" size={18} color={C.text} />
                        </TouchableOpacity>
                        <View style={nm.topTitleWrap}>
                            <Text style={nm.topTitle}>Navigation to Pickup</Text>
                            <Text style={nm.topSub} numberOfLines={1}>{pickupLabel}</Text>
                        </View>
                    </SafeAreaView>
                </View>

                {/* ── Bottom Info Card ── */}
                <View style={nm.bottomCard}>
                    {/* Location error */}
                    {locationError && (
                        <View style={nm.errorRow}>
                            <Icon name="warning" size={13} color="#FCA5A5" />
                            <Text style={nm.errorText}>{locationError}</Text>
                        </View>
                    )}

                    {/* Stats Row */}
                    <View style={nm.statsRow}>
                        <View style={nm.statBox}>
                            <Text style={nm.statVal}>{formatDist(distance)}</Text>
                            <Text style={nm.statLbl}>Distance</Text>
                        </View>
                        <View style={nm.statDivider} />
                        <View style={nm.statBox}>
                            <Text style={nm.statVal}>{formatETA(distance)}</Text>
                            <Text style={nm.statLbl}>ETA</Text>
                        </View>
                        <View style={nm.statDivider} />
                        <View style={nm.statBox}>
                            <View style={[nm.liveChip, !craneLocation && nm.liveChipWait]}>
                                <View style={[nm.liveDot, !craneLocation && nm.liveDotWait]} />
                                <Text style={[nm.liveText, !craneLocation && nm.liveTextWait]}>
                                    {craneLocation ? 'LIVE' : 'WAIT'}
                                </Text>
                            </View>
                            <Text style={nm.statLbl}>Tracking</Text>
                        </View>
                    </View>

                    {/* Address Row */}
                    <View style={nm.addressRow}>
                        <View style={[nm.addrIcon, { backgroundColor: C.orangeDim }]}>
                            <Icon name="pin" size={16} color={C.orange} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={nm.addrLabel}>Pickup Address</Text>
                            <Text style={nm.addrVal} numberOfLines={2}>
                                {job?.pickupLocation?.streetAndHouse
                                    ? `${job.pickupLocation.streetAndHouse}, ${job.pickupLocation.address}`
                                    : pickupLabel}
                            </Text>
                        </View>
                    </View>

                    {/* Open in Google Maps */}
                    {pickupCoords && (
                        <TouchableOpacity
                            style={nm.googleBtn}
                            onPress={() => openGoogleMaps(pickupCoords.latitude, pickupCoords.longitude)}
                            activeOpacity={0.85}
                        >
                            <LinearGradient colors={['#2563EB', '#1E40AF']} style={nm.googleBtnGrad}>
                                <Icon name="navigate" size={15} color={C.white} />
                                <Text style={nm.googleBtnText}>Open in Google Maps</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

// ─── NavigationMapModal Styles (nm prefix — no conflict with main screen s) ───
const nm = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000' },
    map: { flex: 1 },

    // Crane marker
    craneMarkerWrap: {
        width: 48, height: 48,
        alignItems: 'center', justifyContent: 'center',
    },
    craneMarker: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: C.blue,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 3, borderColor: C.white,
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, elevation: 6,
    },

    // Pickup marker
    pickupMarker: { alignItems: 'center' },
    pickupMarkerInner: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: C.orange,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 3, borderColor: C.white,
        shadowColor: C.orange, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
    },
    pickupMarkerTip: {
        width: 0, height: 0,
        borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 12,
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        borderTopColor: C.orange,
        marginTop: -2,
    },

    // Top bar
    topBar: {
        position: 'absolute', top: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderBottomWidth: 1, borderBottomColor: C.divider,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
    },
    topInner: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingBottom: 12, gap: 12,
    },
    closeBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
    },
    topTitleWrap: { flex: 1 },
    topTitle: { fontSize: 15, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
    topSub: { fontSize: 11, color: C.textSub, marginTop: 1 },

    // Bottom card
    bottomCard: {
        backgroundColor: C.white,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingHorizontal: 20, paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 36 : 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1, shadowRadius: 16, elevation: 10,
        gap: 14,
    },

    // Error
    errorRow: {
        flexDirection: 'row', alignItems: 'center', gap: 7,
        backgroundColor: '#3B0A0A', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 8,
    },
    errorText: { color: '#FCA5A5', fontSize: 13, flex: 1 },

    // Stats
    statsRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.bg, borderRadius: 16,
        paddingVertical: 14, paddingHorizontal: 16,
    },
    statBox: { flex: 1, alignItems: 'center', gap: 4 },
    statVal: { fontSize: 20, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
    statLbl: {
        color: C.textMuted, fontSize: 10, fontWeight: '600',
        letterSpacing: 0.5, textTransform: 'uppercase',
    },
    statDivider: { width: 1, height: 36, backgroundColor: C.divider, marginHorizontal: 8 },

    // Live chip
    liveChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: C.greenDim, paddingHorizontal: 10,
        paddingVertical: 4, borderRadius: 20,
    },
    liveChipWait: { backgroundColor: 'rgba(0,0,0,0.05)' },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
    liveDotWait: { backgroundColor: C.textMuted },
    liveText: { fontSize: 10, fontWeight: '800', color: C.green, letterSpacing: 1 },
    liveTextWait: { color: C.textMuted },

    // Address
    addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    addrIcon: {
        width: 38, height: 38, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    addrLabel: {
        fontSize: 10, color: C.textMuted, fontWeight: '600',
        letterSpacing: 0.4, marginBottom: 3, textTransform: 'uppercase',
    },
    addrVal: { fontSize: 13, color: C.text, fontWeight: '600', lineHeight: 19 },

    // Google Maps button
    googleBtn: { borderRadius: 16, overflow: 'hidden' },
    googleBtnGrad: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, paddingVertical: 15,
    },
    googleBtnText: { fontSize: 15, fontWeight: '800', color: C.white, letterSpacing: -0.2 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ─── INSPECTION IMAGE MODAL ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function InspectionModal({ visible, job, onClose, onSuccess, showToast }) {
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (visible && job?._id) {
            setExistingImages((job.images || []).map(img => img.image));
        }
    }, [visible, job?._id]);

    const pickImages = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { showToast('Gallery permission required'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 5 - images.length,
        });
        if (!result.canceled) setImages(prev => [...prev, ...result.assets.slice(0, 5 - prev.length)]);
    };

    const takePhoto = async () => {
        if (images.length >= 5) { showToast('Maximum 5 photos allowed'); return; }
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) { showToast('Camera permission required'); return; }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (!result.canceled) setImages(prev => [...prev, result.assets[0]]);
    };

    const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

    const handleUpload = async () => {
        if (images.length === 0) { showToast('Please add at least 1 photo'); return; }
        setUploading(true);
        try {
            const formData = new FormData();
            images.forEach((img, i) => {
                const ext = img.uri.split('.').pop() || 'jpg';
                formData.append('images', { uri: img.uri, name: `inspection_${i}.${ext}`, type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
            });
            const res = await api.put(`/api/craneman/job/${job._id}/inspection-details`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data?.success) {
                showToast('Photos uploaded successfully ✓');
                setImages([]);
                onSuccess();
            } else {
                showToast(res.data?.message || 'Upload failed');
            }
        } catch (e) {
            showToast('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => { setImages([]); setExistingImages([]); onClose(); };
    const hasExisting = existingImages.length > 0;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <Pressable style={im.overlay} onPress={handleClose}>
                    <Pressable style={im.sheet} onPress={() => { }}>
                        <View style={im.handle} />
                        <View style={im.header}>
                            <View>
                                <Text style={im.title}>Vehicle Inspection Photos</Text>
                                <Text style={im.sub}>{hasExisting ? 'Previously uploaded photos shown below' : 'Upload clear photos of the vehicle (max 5)'}</Text>
                            </View>
                            <TouchableOpacity onPress={handleClose} style={im.closeBtn}><Icon name="x" size={16} color={C.textSub} /></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SW * 0.85 }} keyboardShouldPersistTaps="handled">
                            {hasExisting && (
                                <View style={{ marginBottom: 20 }}>
                                    <View style={im.sectionHead}><View style={[im.sectionDot, { backgroundColor: C.green }]} /><Text style={im.sectionTitle}>Previously Uploaded ({existingImages.length})</Text></View>
                                    <View style={im.grid}>
                                        {existingImages.map((imgUrl, idx) => (
                                            <View key={idx} style={im.imgWrap}>
                                                <Image source={{ uri: imgUrl }} style={im.img} resizeMode="cover" />
                                                <View style={[im.imgNum, { backgroundColor: 'rgba(22,163,74,0.85)' }]}><Text style={im.imgNumText}>{idx + 1}</Text></View>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={im.reUploadDivider}><View style={im.dividerLine} /><Text style={im.dividerText}>Re-upload to replace</Text><View style={im.dividerLine} /></View>
                                </View>
                            )}
                            <View style={{ marginBottom: 4 }}>
                                {hasExisting && <View style={im.sectionHead}><View style={[im.sectionDot, { backgroundColor: C.orange }]} /><Text style={im.sectionTitle}>New Photos to Upload</Text></View>}
                                <View style={im.progress}>
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <View key={n} style={[im.dot, { backgroundColor: n <= images.length ? C.orange : C.divider, width: n <= images.length ? 20 : 8 }]} />
                                    ))}
                                    <Text style={im.progressText}>{images.length}/5 photos selected</Text>
                                </View>
                                <View style={im.grid}>
                                    {images.map((img, idx) => (
                                        <View key={idx} style={im.imgWrap}>
                                            <Image source={{ uri: img.uri }} style={im.img} resizeMode="cover" />
                                            <TouchableOpacity style={im.delBtn} onPress={() => removeImage(idx)}><Icon name="trash" size={11} color={C.white} /></TouchableOpacity>
                                            <View style={im.imgNum}><Text style={im.imgNumText}>{idx + 1}</Text></View>
                                        </View>
                                    ))}
                                    {images.length < 5 && (
                                        <TouchableOpacity style={im.addBtn} onPress={pickImages}>
                                            <Icon name="plus" size={22} color={C.textMuted} />
                                            <Text style={im.addText}>Add Photo</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                        <View style={[im.actions, { marginTop: 16 }]}>
                            <TouchableOpacity style={[im.cameraBtn, images.length >= 5 && { opacity: 0.4 }]} onPress={takePhoto} disabled={images.length >= 5}>
                                <Icon name="camera" size={16} color={C.blue} />
                                <Text style={im.cameraBtnText}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[im.uploadBtn, (images.length === 0 || uploading) && { opacity: 0.5 }]} onPress={handleUpload} disabled={images.length === 0 || uploading}>
                                {uploading ? <ActivityIndicator size="small" color={C.white} /> : <Icon name="check" size={16} color={C.white} />}
                                <Text style={im.uploadBtnText}>{uploading ? 'Uploading…' : hasExisting ? 'Replace Photos' : 'Submit Photos'}</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
}
const im = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: C.overlay },
    sheet: { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 36 },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.divider, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16 },
    title: { fontSize: 17, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
    sub: { fontSize: 12, color: C.textSub, marginTop: 3 },
    closeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
    sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
    sectionDot: { width: 7, height: 7, borderRadius: 4 },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: C.textSub, letterSpacing: 0.5, textTransform: 'uppercase' },
    reUploadDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: C.divider },
    dividerText: { fontSize: 10, color: C.textMuted, fontWeight: '600' },
    progress: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
    dot: { height: 4, borderRadius: 3 },
    progressText: { fontSize: 11, color: C.textSub, fontWeight: '600', marginLeft: 6 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    imgWrap: { width: (SW - 80) / 3, height: (SW - 80) / 3, borderRadius: 12, overflow: 'hidden', position: 'relative' },
    img: { width: '100%', height: '100%' },
    delBtn: { position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(220,38,38,0.9)', alignItems: 'center', justifyContent: 'center' },
    imgNum: { position: 'absolute', bottom: 5, left: 5, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    imgNumText: { fontSize: 9, color: '#fff', fontWeight: '700' },
    addBtn: { width: (SW - 80) / 3, height: (SW - 80) / 3, borderRadius: 12, borderWidth: 1.5, borderColor: C.cardBorder, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg, gap: 5 },
    addText: { fontSize: 10, color: C.textMuted, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 10 },
    cameraBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(37,99,235,0.25)', backgroundColor: C.blueDim },
    cameraBtnText: { fontSize: 13, fontWeight: '700', color: C.blue },
    uploadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: C.orange },
    uploadBtnText: { fontSize: 13, fontWeight: '800', color: C.white },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PAYMENT MODAL ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function PaymentModal({ visible, job, user, onClose, onSuccess, showToast }) {
    const [tab, setTab] = useState('upi');
    const [submitting, setSubmitting] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountHolderName, setAccountHolderName] = useState('');
    const upiRef = useRef(null);
    const holderRef = useRef(null);
    const accRef = useRef(null);
    const ifscRef = useRef(null);
    const bankRef = useRef(null);

    useEffect(() => {
        if (visible && user) {
            setUpiId(user.upiDetails?.upiId || '');
            setAccountNumber(user.bankDetails?.accountNumber || '');
            setIfscCode(user.bankDetails?.ifscCode || '');
            setBankName(user.bankDetails?.bankName || '');
            setAccountHolderName(user.bankDetails?.accountHolderName || '');
        }
    }, [visible, user]);

    const hasAutoFill = !!(user?.upiDetails?.upiId || user?.bankDetails?.accountNumber);
    const isValid = tab === 'upi' ? upiId.trim().length > 3 : accountNumber.trim() && ifscCode.trim() && bankName.trim() && accountHolderName.trim();

    const handleSubmit = async () => {
        if (!isValid) { showToast('Please fill all required fields'); return; }
        setSubmitting(true);
        try {
            const body = { paymentMethod: tab, upiId: tab === 'upi' ? upiId.trim() : '', accountNumber: tab === 'bank' ? accountNumber.trim() : '', ifscCode: tab === 'bank' ? ifscCode.trim() : '', bankName: tab === 'bank' ? bankName.trim() : '', accountHolderName: tab === 'bank' ? accountHolderName.trim() : '' };
            const res = await api.put(`/api/craneman/car-payment-update/${job._id}`, body);
            if (res.data?.success) { showToast('Payment details saved ✓'); onSuccess(); }
            else showToast(res.data?.message || 'Failed to save payment details');
        } catch { showToast('Something went wrong. Try again.'); }
        finally { setSubmitting(false); }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                <Pressable style={pm.overlay} onPress={onClose}>
                    <Pressable style={pm.sheet} onPress={() => { }}>
                        <View style={pm.handle} />
                        <View style={pm.header}>
                            <View><Text style={pm.title}>Payment Details</Text><Text style={pm.sub}>Choose how you'd like to receive payment</Text></View>
                            <TouchableOpacity onPress={onClose} style={pm.closeBtn}><Icon name="x" size={16} color={C.textSub} /></TouchableOpacity>
                        </View>
                        {hasAutoFill && (
                            <View style={pm.autoFillBanner}>
                                <Icon name="check" size={12} color={C.green} />
                                <Text style={pm.autoFillText}>Pre-filled from your saved profile — edit if needed</Text>
                            </View>
                        )}
                        <View style={pm.tabs}>
                            <TouchableOpacity style={[pm.tab, tab === 'upi' && pm.tabActive]} onPress={() => setTab('upi')}><Icon name="upi" size={14} color={tab === 'upi' ? C.orange : C.textSub} /><Text style={[pm.tabText, tab === 'upi' && pm.tabTextActive]}>UPI</Text></TouchableOpacity>
                            <TouchableOpacity style={[pm.tab, tab === 'bank' && pm.tabActive]} onPress={() => setTab('bank')}><Icon name="bank" size={14} color={tab === 'bank' ? C.orange : C.textSub} /><Text style={[pm.tabText, tab === 'bank' && pm.tabTextActive]}>Bank Transfer</Text></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }} keyboardShouldPersistTaps="always">
                            {tab === 'upi' ? (
                                <View style={pm.fieldWrap}>
                                    <Text style={pm.fieldLabel}>UPI ID *</Text>
                                    <TextInput ref={upiRef} style={pm.input} value={upiId} onChangeText={setUpiId} placeholder="yourname@upi" placeholderTextColor={C.textMuted} keyboardType="email-address" autoCapitalize="none" returnKeyType="done" onSubmitEditing={handleSubmit} />
                                </View>
                            ) : (
                                <>
                                    <View style={pm.fieldWrap}><Text style={pm.fieldLabel}>Account Holder Name *</Text><TextInput ref={holderRef} style={pm.input} value={accountHolderName} onChangeText={setAccountHolderName} placeholder="Full name as per bank" placeholderTextColor={C.textMuted} autoCapitalize="words" returnKeyType="next" onSubmitEditing={() => accRef.current?.focus()} /></View>
                                    <View style={pm.fieldWrap}><Text style={pm.fieldLabel}>Account Number *</Text><TextInput ref={accRef} style={pm.input} value={accountNumber} onChangeText={setAccountNumber} placeholder="Enter account number" placeholderTextColor={C.textMuted} keyboardType="numeric" returnKeyType="next" onSubmitEditing={() => ifscRef.current?.focus()} /></View>
                                    <View style={pm.fieldWrap}><Text style={pm.fieldLabel}>IFSC Code *</Text><TextInput ref={ifscRef} style={pm.input} value={ifscCode} onChangeText={setIfscCode} placeholder="e.g. SBIN0001234" placeholderTextColor={C.textMuted} autoCapitalize="characters" returnKeyType="next" onSubmitEditing={() => bankRef.current?.focus()} /></View>
                                    <View style={pm.fieldWrap}><Text style={pm.fieldLabel}>Bank Name *</Text><TextInput ref={bankRef} style={pm.input} value={bankName} onChangeText={setBankName} placeholder="e.g. State Bank of India" placeholderTextColor={C.textMuted} autoCapitalize="words" returnKeyType="done" onSubmitEditing={handleSubmit} /></View>
                                </>
                            )}
                        </ScrollView>
                        <TouchableOpacity style={[pm.submitBtn, (!isValid || submitting) && { opacity: 0.5 }]} onPress={handleSubmit} disabled={!isValid || submitting}>
                            {submitting ? <ActivityIndicator size="small" color={C.white} /> : <Icon name="check" size={16} color={C.white} />}
                            <Text style={pm.submitText}>{submitting ? 'Saving…' : 'Save Payment Details'}</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
}
const pm = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: C.overlay },
    sheet: { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 36 },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.divider, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16 },
    title: { fontSize: 17, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
    sub: { fontSize: 12, color: C.textSub, marginTop: 3 },
    closeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
    autoFillBanner: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.greenDim, borderWidth: 1, borderColor: C.greenBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 },
    autoFillText: { fontSize: 11, color: C.green, fontWeight: '600', flex: 1 },
    tabs: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, padding: 4, marginBottom: 18, gap: 4 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 9 },
    tabActive: { backgroundColor: C.white, elevation: 2 },
    tabText: { fontSize: 13, fontWeight: '600', color: C.textSub },
    tabTextActive: { color: C.orange, fontWeight: '800' },
    fieldWrap: { marginBottom: 14 },
    fieldLabel: { fontSize: 11, fontWeight: '700', color: C.textSub, letterSpacing: 0.3, marginBottom: 6 },
    input: { backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.cardBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.text, fontWeight: '500' },
    submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 14, backgroundColor: C.green, marginTop: 8 },
    submitText: { fontSize: 14, fontWeight: '800', color: C.white },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ACTIVE JOB CARD ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function ActiveJobCard({ job, user, onUpdateStatus, showToast }) {
    const [showInspection, setShowInspection] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [showNavMap, setShowNavMap] = useState(false);
    const [imagesUploaded, setImagesUploaded] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);

    useEffect(() => {
        if (!job) return;
        const hasImages = Array.isArray(job.images) && job.images.length > 0;
        const pd = job.paymentDetails || {};
        const hasPayment = !!pd.upiId?.trim() || !!pd.accountNumber?.trim() || !!pd.ifscCode?.trim() || !!pd.bankName?.trim() || !!pd.accountHolderName?.trim();
        setImagesUploaded(hasImages);
        setPaymentDone(hasPayment);
    }, [job]);

    if (!job) return null;

    const cfg = STATUS[job.status] || STATUS.processing;
    const carName = `${job.carDetail?.make || ''} ${job.carDetail?.model || ''}`.trim() || 'Unknown Car';
    const isInspecting = job.status === 'inspecting';
    const isPickedUp = job.status === 'picked_up';
    const isEnRouteGarage = job.status === 'en_route_to_garage';
    const canConfirmPickup = imagesUploaded && paymentDone;

    const hasPickupCoords = !!(job?.pickupLocation?.latitude && job?.pickupLocation?.longitude);

    const nextActions = {
        processing: [{ label: 'Start Journey to Pickup', status: 'en_route', icon: 'navigate', color: C.blue }],
        en_route: [{ label: 'Reached — Start Inspection', status: 'inspecting', icon: 'eye', color: C.yellow }],
        en_route_to_garage: [{ label: 'Reached Garage', status: 'at_garage', icon: 'garage', color: C.purple }],
        at_garage: [{ label: 'Mark as Sold', status: 'sold', icon: 'check', color: C.green }],
    };
    const actions = nextActions[job.status] || [];

    return (
        <>
            <View style={aj.wrap}>
                <View style={[aj.accentBar, { backgroundColor: cfg.color }]} />
                <View style={aj.inner}>

                    {/* Head */}
                    <View style={aj.head}>
                        <View style={aj.headLeft}>
                            <Text style={aj.tagText}>ACTIVE JOB</Text>
                            <Text style={aj.carName}>{carName}</Text>
                            <Text style={aj.plate}>{job.rcNumber || '—'} · {job.carDetail?.manufacturingYear || ''}</Text>
                        </View>
                        <Badge status={job.status} />
                    </View>

                    <View style={aj.divider} />

                    {/* Owner */}
                    <View style={aj.row}>
                        <View style={[aj.iconBg, { backgroundColor: C.orangeDim }]}>
                            <Icon name="user" size={14} color={C.orange} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={aj.rowLabel}>Vehicle Owner</Text>
                            <Text style={aj.rowVal}>{job?.carDetail?.ownerName || 'N/A'}</Text>
                        </View>
                        {job?.seller?.phone && (
                            <TouchableOpacity style={[aj.callBtn, { backgroundColor: C.greenDim, borderColor: C.greenBorder }]} onPress={() => handleCall(job.seller.phone)}>
                                <Icon name="phone" size={13} color={C.green} />
                                <Text style={[aj.callText, { color: C.green }]}>Call</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Address */}
                    <View style={aj.row}>
                        <View style={[aj.iconBg, { backgroundColor: C.blueDim }]}>
                            <Icon name="pin" size={14} color={C.blue} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={aj.rowLabel}>Pickup Address</Text>
                            <Text style={aj.rowVal} numberOfLines={2}>
                                {job?.pickupLocation?.streetAndHouse
                                    ? `${job.pickupLocation.streetAndHouse}, ${job.pickupLocation.address}`
                                    : job?.pickupLocation?.address || 'Address not available'}
                            </Text>
                        </View>
                    </View>

                    {/* Chips */}
                    <View style={aj.chips}>
                        <View style={aj.chip}><Text style={aj.chipText}>{job.kmDriven ? Number(job.kmDriven).toLocaleString() + ' km' : 'N/A'}</Text></View>
                        <View style={aj.chip}><Text style={aj.chipText}>{job.carDetail?.fuelType || 'Petrol'}</Text></View>
                        {job.carDetail?.transmission && <View style={aj.chip}><Text style={aj.chipText}>{job.carDetail.transmission}</Text></View>}
                    </View>

                    {/* Navigation Map Button */}
                    {(job.status === 'processing' || job.status === 'en_route' || isInspecting) && hasPickupCoords && (
                        <TouchableOpacity
                            style={aj.navMapBtn}
                            onPress={() => setShowNavMap(true)}
                            activeOpacity={0.85}
                        >
                            <LinearGradient colors={['#2563EB', '#1E40AF']} style={aj.navMapBtnGrad}>
                                <Icon name="navigate" size={15} color={C.white} />
                                <Text style={aj.navMapBtnText}>Open Navigation Map</Text>
                                <View style={aj.navMapBadge}>
                                    <Text style={aj.navMapBadgeText}>LIVE</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* INSPECTING: 2-step flow */}
                    {isInspecting && (
                        <View style={aj.stepsWrap}>
                            <Text style={aj.stepsHeading}>Complete to confirm pickup</Text>
                            <TouchableOpacity style={[aj.stepRow, imagesUploaded && aj.stepRowDone]} onPress={() => setShowInspection(true)} activeOpacity={0.82}>
                                <View style={[aj.stepNumWrap, { backgroundColor: imagesUploaded ? C.green : C.orange }]}>
                                    {imagesUploaded ? <Icon name="check" size={12} color={C.white} strokeWidth={2.5} /> : <Text style={aj.stepNum}>1</Text>}
                                </View>
                                <View style={[aj.stepIconWrap, { backgroundColor: imagesUploaded ? C.greenDim : C.orangeDim, borderColor: imagesUploaded ? C.greenBorder : C.orangeBorder }]}>
                                    <Icon name="camera" size={16} color={imagesUploaded ? C.green : C.orange} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[aj.stepLabel, imagesUploaded && { color: C.green }]}>{imagesUploaded ? 'Photos Uploaded' : 'Upload Vehicle Photos'}</Text>
                                    <Text style={aj.stepSub}>{imagesUploaded ? 'Tap to re-upload if needed' : 'Required — up to 5 photos'}</Text>
                                </View>
                                <Icon name="chevron" size={14} color={imagesUploaded ? C.green : C.textMuted} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[aj.stepRow, paymentDone && aj.stepRowDone]} onPress={() => setShowPayment(true)} activeOpacity={0.82}>
                                <View style={[aj.stepNumWrap, { backgroundColor: paymentDone ? C.green : C.blue }]}>
                                    {paymentDone ? <Icon name="check" size={12} color={C.white} strokeWidth={2.5} /> : <Text style={aj.stepNum}>2</Text>}
                                </View>
                                <View style={[aj.stepIconWrap, { backgroundColor: paymentDone ? C.greenDim : C.blueDim, borderColor: paymentDone ? C.greenBorder : 'rgba(37,99,235,0.2)' }]}>
                                    <Icon name="upi" size={16} color={paymentDone ? C.green : C.blue} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[aj.stepLabel, paymentDone && { color: C.green }]}>{paymentDone ? 'Payment Details Saved' : 'Add Payment Details'}</Text>
                                    <Text style={aj.stepSub}>{paymentDone ? 'Tap to update' : 'UPI or bank account'}</Text>
                                </View>
                                <Icon name="chevron" size={14} color={paymentDone ? C.green : C.textMuted} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[aj.confirmBtn, !canConfirmPickup && aj.confirmBtnLocked]}
                                onPress={() => canConfirmPickup && onUpdateStatus(job._id, 'picked_up')}
                                activeOpacity={canConfirmPickup ? 0.82 : 1}
                            >
                                {!canConfirmPickup ? <Icon name="lock" size={15} color={C.textMuted} /> : <Icon name="truck" size={15} color={C.white} />}
                                <Text style={[aj.confirmBtnText, !canConfirmPickup && { color: C.textMuted }]}>Confirm Pickup</Text>
                            </TouchableOpacity>
                            {!canConfirmPickup && (
                                <Text style={aj.lockHint}>
                                    {!imagesUploaded && !paymentDone ? 'Complete both steps above to unlock' : !imagesUploaded ? 'Upload vehicle photos to unlock' : 'Save payment details to unlock'}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* PICKED UP */}
                    {isPickedUp && (
                        <View style={aj.stepsWrap}>
                            <View style={aj.garageInfoBox}>
                                <Icon name="check" size={15} color={C.green} />
                                <Text style={aj.garageInfoText}>Car has been picked up successfully!</Text>
                            </View>
                            <TouchableOpacity style={[aj.confirmBtn, { backgroundColor: C.blue }]} onPress={() => onUpdateStatus(job._id, 'en_route_to_garage')} activeOpacity={0.82}>
                                <Icon name="truck" size={15} color={C.white} />
                                <Text style={aj.confirmBtnText}>Head to Garage</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* OTHER STATUSES */}
                    {!isInspecting && !isPickedUp && actions.length > 0 && (
                        <View style={aj.actions}>
                            {actions.map((a) => (
                                <TouchableOpacity
                                    key={a.status}
                                    style={[aj.actionBtn, { backgroundColor: a.color, flex: 1 }]}
                                    onPress={() => onUpdateStatus(job._id, a.status)}
                                    activeOpacity={0.82}
                                >
                                    <Icon name={a.icon} size={14} color={C.white} />
                                    <Text style={aj.actionBtnText}>{a.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {isEnRouteGarage && job.garageLocation && (
                        <TouchableOpacity style={[aj.navBtn, { marginTop: 8, alignSelf: 'flex-start' }]} onPress={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.garageLocation)}&travelmode=driving`;
                            Linking.openURL(url);
                        }}>
                            <Icon name="navigate" size={14} color={C.blue} />
                            <Text style={[aj.navText, { color: C.blue }]}>Directions to Garage</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* NavigationMapModal */}
            <NavigationMapModal
                visible={showNavMap}
                job={job}
                onClose={() => setShowNavMap(false)}
            />
            <InspectionModal visible={showInspection} job={job} onClose={() => setShowInspection(false)} onSuccess={() => { setImagesUploaded(true); setShowInspection(false); }} showToast={showToast} />
            <PaymentModal visible={showPayment} job={job} user={user} onClose={() => setShowPayment(false)} onSuccess={() => { setPaymentDone(true); setShowPayment(false); }} showToast={showToast} />
        </>
    );
}
const aj = StyleSheet.create({
    wrap: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: C.cardBorder, backgroundColor: C.card, marginBottom: 16 },
    accentBar: { height: 3, width: '100%' },
    inner: { padding: 16 },
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    headLeft: { flex: 1, marginRight: 10 },
    tagText: { fontSize: 9, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, marginBottom: 5 },
    carName: { fontSize: 18, fontWeight: '900', color: C.text, letterSpacing: -0.5, marginBottom: 2 },
    plate: { fontSize: 11, color: C.textSub },
    divider: { height: 1, backgroundColor: C.divider, marginBottom: 13 },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
    iconBg: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    rowLabel: { fontSize: 9, color: C.textMuted, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
    rowVal: { fontSize: 12, color: C.text, fontWeight: '600', lineHeight: 17 },
    callBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    callText: { fontSize: 11, fontWeight: '700' },
    chips: { flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
    chip: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.divider, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    chipText: { fontSize: 10, color: C.textSub, fontWeight: '600' },
    navMapBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
    navMapBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 13 },
    navMapBtnText: { fontSize: 13, fontWeight: '800', color: C.white, flex: 1 },
    navMapBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    navMapBadgeText: { fontSize: 9, fontWeight: '900', color: C.white, letterSpacing: 1 },
    stepsWrap: { borderTopWidth: 1, borderTopColor: C.divider, paddingTop: 14, gap: 9 },
    stepsHeading: { fontSize: 11, fontWeight: '700', color: C.textMuted, letterSpacing: 0.6, marginBottom: 4, textTransform: 'uppercase' },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.bg, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.cardBorder },
    stepRowDone: { borderColor: C.greenBorder, backgroundColor: 'rgba(22,163,74,0.04)' },
    stepNumWrap: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    stepNum: { fontSize: 11, fontWeight: '900', color: C.white },
    stepIconWrap: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
    stepLabel: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 2 },
    stepSub: { fontSize: 10, color: C.textSub },
    garageInfoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.greenDim, borderWidth: 1, borderColor: C.greenBorder, borderRadius: 12, padding: 12, marginBottom: 4 },
    garageInfoText: { fontSize: 13, fontWeight: '600', color: C.green, flex: 1 },
    confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 14, backgroundColor: C.green, marginTop: 2 },
    confirmBtnLocked: { backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.cardBorder },
    confirmBtnText: { fontSize: 14, fontWeight: '800', color: C.white },
    lockHint: { fontSize: 10, color: C.textMuted, textAlign: 'center', fontStyle: 'italic' },
    actions: { flexDirection: 'row', gap: 8 },
    navBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.3)', backgroundColor: C.blueDim },
    navText: { fontSize: 12, fontWeight: '700' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
    actionBtnText: { fontSize: 13, fontWeight: '800', color: C.white },
});

function JobItem({ job, onPress }) {
    const cfg = STATUS[job.status] || STATUS.processing;
    const carName = `${job.carDetail?.make || ''} ${job.carDetail?.model || ''}`.trim() || 'Unknown Car';
    const year = job.carDetail?.manufacturingYear || '';
    return (
        <TouchableOpacity style={ji.wrap} onPress={() => onPress(job._id)} activeOpacity={0.75}>
            <View style={[ji.accentLine, { backgroundColor: cfg.color }]} />
            <View style={[ji.iconBg, { backgroundColor: cfg.dim }]}><Icon name="car" size={16} color={cfg.color} /></View>
            <View style={ji.body}>
                <Text style={ji.name} numberOfLines={1}>{carName} {year}</Text>
                <Text style={ji.meta} numberOfLines={1}>{job.rcNumber || '—'}  ·  {job?.carDetail?.ownerName || 'N/A'}</Text>
            </View>
            <View style={ji.right}>
                <Badge status={job.status} />
                <View style={{ marginTop: 6, alignItems: 'flex-end' }}><Icon name="chevron" size={13} color={C.textMuted} /></View>
            </View>
        </TouchableOpacity>
    );
}
const ji = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: C.card, borderRadius: 16, padding: 13, paddingLeft: 16, borderWidth: 1, borderColor: C.cardBorder, position: 'relative', overflow: 'hidden' },
    accentLine: { position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: 2 },
    iconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    body: { flex: 1 },
    name: { fontSize: 13, fontWeight: '700', color: C.text, letterSpacing: -0.2, marginBottom: 3 },
    meta: { fontSize: 10, color: C.textSub },
    right: { alignItems: 'flex-end' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function CraneManHome({ onRefreshTrigger = 0 }) {
    const navigation = useNavigation();
    const [user, setUser] = useState({});
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefresh] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2800); };

    const fetchUser = useCallback(async () => {
        try {
            const res = await api.get('/api/auth/me');
            if (res.data?.success) setUser(res.data.user || {});
        } catch { }
    }, []);

    const fetchJobs = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefresh(true); else setLoading(true);
        try {
            const res = await api.get('/api/car/car-details-for-me');
            if (res.data?.success) {
                setJobs(res.data.data || []);
            } else {
                toast(res.data?.message || 'Failed to load jobs');
            }
        } catch { toast('Something went wrong. Please try again.'); }
        finally { setLoading(false); setRefresh(false); }
    }, []);

    const updateJobStatus = async (jobId, newStatus) => {
        if (newStatus === 'en_route') await startLocationTracking();
        else if (newStatus === 'inspecting') await stopLocationTracking();
        else if (newStatus === 'en_route_to_garage') await startLocationTracking();
        else if (newStatus === 'at_garage') await stopLocationTracking();
        try {
            const res = await api.patch(`/api/craneman/job/${jobId}/status`, { status: newStatus });
            if (res.data?.success) {
                setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
                toast(`Status updated to ${STATUS[newStatus]?.label || newStatus}`);
            } else toast(res.data?.message || 'Failed to update status');
        } catch { toast('Update failed. Try again.'); }
    };

    useEffect(() => { fetchUser(); fetchJobs(); }, []);


    const onRefresh = async () => {
        setRefresh(true);
        await Promise.all([fetchUser(), fetchJobs(true)]);
        setRefresh(false);
    };

    const activeJob = jobs.find(j => ACTIVE_STATUSES.includes(j.status));
    const recentJobs = jobs.filter(j => j._id !== activeJob?._id).slice(0, 5);
    const totalJobs = jobs.length;
    const doneCount = jobs.filter(j => j.status === 'sold').length;
    const activeCount = jobs.filter(j => ACTIVE_STATUSES.includes(j.status)).length;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning ☀️';
        if (h < 17) return 'Good Afternoon 👋';
        return 'Good Evening 🌙';
    };

    useEffect(() => {
        if (onRefreshTrigger > 0) fetchJobs();
    }, [onRefreshTrigger]);

    return (
        <View style={scr.root}>
            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.orange} />}>
                <LinearGradient colors={['#1356CC', '#2176FF']} style={scr.header}>
                    <View style={scr.dec1} />
                    <View style={scr.dec2} />
                    <SafeAreaView edges={['top']}>
                        <View style={scr.headerRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={scr.greet}>{greeting()}</Text>
                                <Text style={scr.name}>{user?.name || 'Crane Operator'}</Text>
                                <View style={scr.roleTag}>
                                    <Icon name="truck" size={10} color="#fff" />
                                    <Text style={scr.roleText}>Crane Specialist</Text>
                                </View>
                            </View>
                            <View style={scr.avatar}>
                                <Text style={scr.avatarText}>{(user?.name || 'C').charAt(0).toUpperCase()}</Text>
                            </View>
                        </View>
                        <View style={scr.stats}>
                            <StatTile value={totalJobs} label="Total" />
                            <View style={{ width: 8 }} />
                            <StatTile value={activeCount} label="Active" />
                            <View style={{ width: 8 }} />
                            <StatTile value={doneCount} label="Sold" />
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                <View style={scr.body}>
                    {loading ? (
                        <View style={scr.loadWrap}>
                            <ActivityIndicator size="small" color={C.orange} />
                            <Text style={scr.loadText}>Loading your assignments…</Text>
                        </View>
                    ) : activeJob ? (
                        <>
                            <View style={scr.secHead}>
                                <View style={scr.secDot} />
                                <Text style={scr.secTitle}>Active Assignment</Text>
                            </View>
                            <ActiveJobCard
                                job={activeJob}
                                user={user}
                                onUpdateStatus={updateJobStatus}
                                showToast={toast}
                            />
                        </>
                    ) : (
                        <View style={scr.idle}>
                            <View style={scr.idleIcon}><Icon name="clock" size={28} color={C.textMuted} /></View>
                            <Text style={scr.idleTitle}>No Active Assignment</Text>
                            <Text style={scr.idleSub}>You'll be notified when a new job is assigned.</Text>
                        </View>
                    )}

                    {recentJobs.length > 0 && (
                        <>
                            <View style={[scr.secHead, { marginTop: 6 }]}>
                                <View style={[scr.secDot, { backgroundColor: C.textMuted }]} />
                                <Text style={scr.secTitle}>Recent Jobs</Text>
                                {jobs.length > 6 && (
                                    <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => navigation.navigate('AllJobs')}>
                                        <Text style={scr.seeAll}>See all →</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={scr.list}>
                                {recentJobs.map(job => (
                                    <JobItem key={job._id} job={job} onPress={(id) => navigation.navigate('SoldCarDetails', { carId: id })} />
                                ))}
                            </View>
                        </>
                    )}

                    {!loading && jobs.length === 0 && (
                        <View style={scr.empty}>
                            <Icon name="warning" size={32} color={C.textMuted} />
                            <Text style={scr.emptyTitle}>No Jobs Yet</Text>
                            <Text style={scr.emptySub}>Your assigned pickups will appear here.</Text>
                        </View>
                    )}

                    <View style={{ height: 50 }} />
                </View>
            </ScrollView>
            <Toast message={toastMsg} />
        </View>
    );
}

// ─── Main Screen Styles (scr prefix — renamed from s to avoid any confusion) ──
const scr = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    header: { paddingBottom: 24, overflow: 'hidden' },
    dec1: { position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.12)' },
    dec2: { position: 'absolute', top: 20, right: 50, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)' },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
    greet: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 3 },
    name: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.6, marginBottom: 6 },
    roleTag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
    roleText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.8, textTransform: 'uppercase' },
    avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
    stats: { flexDirection: 'row', paddingHorizontal: 20 },
    body: { paddingHorizontal: 14, paddingTop: 16 },
    loadWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 40, justifyContent: 'center' },
    loadText: { fontSize: 13, color: C.textSub },
    secHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 11 },
    secDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.orange },
    secTitle: { fontSize: 13, fontWeight: '800', color: C.text, letterSpacing: 0.2 },
    seeAll: { fontSize: 11, fontWeight: '600', color: C.orange },
    idle: { alignItems: 'center', paddingVertical: 32, gap: 8, backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.cardBorder, borderStyle: 'dashed', marginBottom: 16 },
    idleIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    idleTitle: { fontSize: 15, fontWeight: '800', color: C.text },
    idleSub: { fontSize: 12, color: C.textMuted, textAlign: 'center', paddingHorizontal: 30, lineHeight: 18 },
    list: { gap: 9 },
    empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
    emptyTitle: { fontSize: 15, fontWeight: '800', color: C.text },
    emptySub: { fontSize: 12, color: C.textMuted, textAlign: 'center', lineHeight: 18 },
});