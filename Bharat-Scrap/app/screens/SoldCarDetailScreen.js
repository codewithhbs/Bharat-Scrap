import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Image,
    FlatList,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle } from 'react-native-svg';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../constants/colors';
import api from '../lib/api';
import polyline from '@mapbox/polyline';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POLL_INTERVAL = 10000;
const GOOGLE_MAPS_API_KEY = "AIzaSyD022IF_7EVi9DEqKBizpz6vXM_nuFeE1g";

// ─── Icons ───────────────────────────────────────────────────────────────────

function BackIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.neutral900 || '#111'} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function CarIcon({ color = '#666' }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M5 17H3a2 2 0 01-2-2v-4l2.5-6h13L19 11v4a2 2 0 01-2 2h-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={7.5} cy={17.5} r={2.5} stroke={color} strokeWidth={1.8} />
            <Circle cx={16.5} cy={17.5} r={2.5} stroke={color} strokeWidth={1.8} />
        </Svg>
    );
}
function UserIcon({ color = '#666' }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.8} />
        </Svg>
    );
}
function LocationIcon({ color = '#666' }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={1.8} />
        </Svg>
    );
}
function PhoneIcon({ color = '#666' }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.82 19.79 19.79 0 01.09 2.18 2 2 0 012.09 0H5a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function CheckIcon({ color = '#22c55e' }) {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function CrossIcon({ color = '#ef4444' }) {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function PaymentIcon({ color = '#666' }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M2 8h20M2 12h20M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function TruckIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M5 17H3a2 2 0 01-2-2v-4l2.5-6h13L19 11v4a2 2 0 01-2 2h-2" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={7.5} cy={17.5} r={2.5} stroke="#fff" strokeWidth={1.8} />
            <Circle cx={16.5} cy={17.5} r={2.5} stroke="#fff" strokeWidth={1.8} />
        </Svg>
    );
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    pending: { label: 'Pending', bg: '#FEF3C7', text: '#92400E' },
    processing: { label: 'Processing', bg: '#DBEAFE', text: '#1E40AF' },
    en_route: { label: 'En Route', bg: '#EDE9FE', text: '#5B21B6' },
    inspecting: { label: 'Inspecting', bg: '#FEF9C3', text: '#713F12' },
    en_route_to_garage: { label: 'En Route to Garage', bg: '#EDE9FE', text: '#5B21B6' },
    at_garage: { label: 'At Garage', bg: '#DCFCE7', text: '#14532D' },
    picked_up: { label: 'Picked Up', bg: '#D1FAE5', text: '#065F46' },
    completed: { label: 'Completed', bg: '#D1FAE5', text: '#065F46' },
    sold: { label: 'Sold', bg: '#FEE2E2', text: '#991B1B' },
};

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

function formatDistance(km) {
    if (km == null) return '—';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
}

function formatETA(km) {
    if (km == null) return '—';
    // avg speed 30 km/h assume karo city traffic
    const minutes = Math.round((km / 30) * 60);
    if (minutes < 1) return 'Almost here';
    if (minutes < 60) return `~${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `~${hrs}h ${mins}m`;
}

// ─── Reusable Components ──────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || { label: status || 'Unknown', bg: '#F3F4F6', text: '#374151' };
    return (
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
    );
}

function Section({ title, icon, children }) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                {icon}
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {children}
        </View>
    );
}

function InfoRow({ label, value }) {
    if (value === undefined || value === null || value === '') return null;
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{String(value)}</Text>
        </View>
    );
}

function BoolRow({ label, value }) {
    if (value === undefined || value === null) return null;
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <View style={styles.boolBadge}>
                {value ? <CheckIcon /> : <CrossIcon />}
                <Text style={[styles.boolText, { color: value ? '#16a34a' : '#dc2626' }]}>
                    {value ? 'Yes' : 'No'}
                </Text>
            </View>
        </View>
    );
}

function ThumbImage({ label, uri }) {
    if (!uri) return null;
    return (
        <View style={styles.thumbContainer}>
            <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
            <Text style={styles.thumbLabel}>{label}</Text>
        </View>
    );
}

async function fetchRouteCoordinates(origin, destination) {
    try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== 'OK' || !data.routes?.length) {
            console.log('Directions API error:', data.status);
            return null;
        }

        // Encoded polyline ko decode karo
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([latitude, longitude]) => ({ latitude, longitude }));

        const leg = data.routes[0].legs[0];
        return {
            coords,
            distanceMeters: leg.distance.value,
            durationSeconds: leg.duration.value,
        };
    } catch (err) {
        console.log('Route fetch error:', err.message);
        return null;
    }
}

function CarImageCarousel({ images }) {
    if (!images || images.length === 0) return null;
    return (
        <FlatList
            horizontal
            data={images}
            keyExtractor={(item, i) => item.public_id || String(i)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            renderItem={({ item }) => (
                <Image source={{ uri: item.image }} style={styles.carouselImage} resizeMode="cover" />
            )}
        />
    );
}

function PageHeader({ title, onBack }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
                <BackIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
        </View>
    );
}

// ─── Live Pulse Ring Component ────────────────────────────────────────────────

function PulseRing() {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        Animated.loop(
            Animated.parallel([
                Animated.timing(scale, { toValue: 2.5, duration: 1500, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />
    );
}

// ─── Live Tracking Map ────────────────────────────────────────────────────────

function LiveTrackingMap({ carId, craneManLocation, pickupLocation, onMapTouchStart, onMapTouchEnd }) {
    const mapRef = useRef(null);
    const [craneLocation, setCraneLocation] = useState(craneManLocation);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [distance, setDistance] = useState(null);
    const [mapReady, setMapReady] = useState(false);

    const [routeCoords, setRouteCoords] = useState([]);
    const [routeDuration, setRouteDuration] = useState(null);  // minutes
    const [routeDistance, setRouteDistance] = useState(null);  // km

    const lastRouteOriginRef = useRef(null);

    useEffect(() => {
        const fetchCraneLocation = async () => {
            try {
                const res = await api.get(`/api/car/get-car-detail-by-id/${carId}`);
                if (res.data?.success) {
                    const loc = res.data.data?.craneMan?.location;
                    if (loc?.latitude && loc?.longitude) {
                        const newLoc = {
                            latitude: parseFloat(loc.latitude),
                            longitude: parseFloat(loc.longitude),
                        };
                        setCraneLocation(newLoc);
                        setLastUpdated(new Date(loc.timestamp || Date.now()));

                        if (pickupLocation?.latitude) {
                            const dist = getDistanceKm(
                                newLoc.latitude, newLoc.longitude,
                                pickupLocation.latitude, pickupLocation.longitude
                            );
                            setDistance(dist);
                        }
                        // Map fitting ab route polyline ke through hoga, yahan se hata diya
                    }
                }
            } catch (err) {
                console.log('Location fetch error:', err.message);
            }
        };

        fetchCraneLocation();
        const interval = setInterval(fetchCraneLocation, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [carId, pickupLocation, mapReady]);

    useEffect(() => {
        if (!craneLocation?.latitude || !pickupLocation?.latitude) return;

        // ── OPTIMIZATION: agar crane 100m se kam hila to refetch skip karo ──
        const lastOrigin = lastRouteOriginRef.current;
        if (lastOrigin) {
            const moved = getDistanceKm(
                lastOrigin.latitude, lastOrigin.longitude,
                craneLocation.latitude, craneLocation.longitude
            );
            if (moved < 0.1) {
                // 100m se kam hila — purana route hi use karo, API call mat karo
                return;
            }
        }

        let cancelled = false;

        const updateRoute = async () => {
            const result = await fetchRouteCoordinates(craneLocation, pickupLocation);
            if (cancelled || !result) return;

            // Successful fetch ke baad ref update karo
            lastRouteOriginRef.current = {
                latitude: craneLocation.latitude,
                longitude: craneLocation.longitude,
            };

            setRouteCoords(result.coords);
            setRouteDistance(result.distanceMeters / 1000);
            setRouteDuration(Math.round(result.durationSeconds / 60));

            if (mapRef.current && result.coords.length > 0) {
                mapRef.current.fitToCoordinates(result.coords, {
                    edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
                    animated: true,
                });
            }
        };

        updateRoute();
        return () => { cancelled = true; };
    }, [craneLocation?.latitude, craneLocation?.longitude, pickupLocation?.latitude, pickupLocation?.longitude]);

    if (!craneLocation?.latitude) {
        return (
            <View style={styles.mapPlaceholder}>
                <ActivityIndicator color="#2563EB" size="large" />
                <Text style={styles.mapPlaceholderText}>Locating crane man…</Text>
            </View>
        );
    }

    const initialRegion = {
        latitude: craneLocation.latitude,
        longitude: craneLocation.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
    };

    const eta = routeDuration ? `~${routeDuration} min` : formatETA(distance);

    return (
        <View style={styles.trackingCard}>
            {/* ── Top Stats Row ── */}
            <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.trackingStatsRow}>
                {/* Distance */}
                <View style={styles.trackingStat}>
                    <Text style={styles.trackingStatValue}>
                        {formatDistance(routeDistance ?? distance)}
                    </Text>
                    <Text style={styles.trackingStatLabel}>Distance</Text>
                </View>

                {/* Live Badge Center */}
                <View style={styles.liveBadgeWrap}>
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDotGreen} />
                        <Text style={styles.liveBadgeText}>LIVE</Text>
                    </View>
                    <Text style={styles.trackingSubLabel}>Crane Man Location</Text>
                </View>

                {/* ETA */}
                <View style={[styles.trackingStat, { alignItems: 'flex-end' }]}>
                    <Text style={styles.trackingStatValue}>{eta}</Text>
                    <Text style={styles.trackingStatLabel}>ETA</Text>
                </View>
            </LinearGradient>

            {/* ── Map ── */}
            <View
                onTouchStart={onMapTouchStart}
                onTouchEnd={onMapTouchEnd}
                onTouchCancel={onMapTouchEnd}
                style={{ height: 280 }}
            >
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={initialRegion}
                    showsMyLocationButton={false}
                    showsTraffic={false}
                    showsCompass={false}
                    showsScale={false}
                    onMapReady={() => setMapReady(true)}
                >
                    {/* ── CraneMan Marker ── */}
                    <Marker
                        coordinate={craneLocation}
                        title="Crane Man"
                        description="En route to pickup"
                        tracksViewChanges={false}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.craneMarkerWrap}>
                            <PulseRing />
                            <LinearGradient
                                colors={['#2563EB', '#1E3A8A']}
                                style={styles.craneMarkerInner}
                            >
                                <TruckIcon />
                            </LinearGradient>
                        </View>
                    </Marker>

                    {/* ── Polyline: craneMan → user ── */}
                    {/* ── Pickup Location Marker ── */}
                    {pickupLocation?.latitude && (
                        <Marker
                            coordinate={pickupLocation}
                            title="Pickup Location"
                            description="Your location"
                            anchor={{ x: 0.5, y: 1 }}
                            tracksViewChanges={false}
                        >
                            <View style={styles.pickupMarkerWrap}>
                                <View style={styles.pickupMarkerPin}>
                                    <View style={styles.pickupMarkerDot} />
                                </View>
                                <View style={styles.pickupMarkerTail} />
                            </View>
                        </Marker>
                    )}

                    {/* ── Polyline: craneMan → pickup (road route) ── */}
                    {routeCoords.length > 0 && (
                        <Polyline
                            coordinates={routeCoords}
                            strokeColor="#2563EB"
                            strokeWidth={4}
                            lineCap="round"
                            lineJoin="round"
                        />
                    )}
                </MapView>
            </View>

            {/* ── Bottom Info Bar ── */}
            <View style={styles.trackingBottomBar}>
                <View style={styles.trackingBottomItem}>
                    <View style={[styles.bottomDot, { backgroundColor: '#2563EB' }]} />
                    <View>
                        <Text style={styles.bottomItemLabel}>Crane Man</Text>
                        <Text style={styles.bottomItemSub}>Moving towards you</Text>
                    </View>
                </View>
                <View style={styles.trackingBottomDivider} />
                <View style={styles.trackingBottomItem}>
                    <View style={[styles.bottomDot, { backgroundColor: '#22c55e' }]} />
                    <View>
                        <Text style={styles.bottomItemLabel}>Pickup Point</Text>
                        <Text style={styles.bottomItemSub}>
                            {lastUpdated
                                ? `Updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                                : 'Awaiting crane'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SoldCarDetailScreen({ route, navigation }) {
    const { carId } = route.params || {};
    const [carDetail, setCarDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUser, setIsUser] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [acceptingPrice, setAcceptingPrice] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fetchCarDetail = async () => {
        try {
            const response = await api.get(`/api/car/get-car-detail-by-id/${carId}`);
            if (response.data.success) {
                console.log("response.data.data", response.data.data)
                setCarDetail(response.data.data);
                setIsUser(response.data.isUser);
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
            }
        } catch (error) {
            console.log('Internal server error', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCarDetail(); }, []);

    const handleAcceptPrice = async () => {
        Alert.alert(
            'Accept Price?',
            `Are you sure you want to accept ₹ ${carDetail?.price?.toLocaleString('en-IN')} as the final price for your car?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Accept',
                    style: 'default',
                    onPress: async () => {
                        setAcceptingPrice(true);
                        try {
                            const res = await api.put(`/api/car/price-accepted-by-user/${carDetail._id}`, {
                                userAgreedForPrice: "accepted",
                            });
                            if (res.data?.success) {
                                setCarDetail(prev => ({ ...prev, userAgreedForPrice: "accepted" }));
                            } else {
                                Alert.alert('Error', res.data?.message || 'Something went wrong.');
                            }
                        } catch (err) {
                            console.log('Accept price error:', err.message);
                            Alert.alert('Error', 'Failed to accept price. Please try again.');
                        } finally {
                            setAcceptingPrice(false);
                        }
                    },
                },
            ]
        );
    };

    const handleRejectPrice = async () => {
        Alert.alert(
            'Reject Price?',
            `Are you sure you want to reject ₹ ${carDetail?.price?.toLocaleString('en-IN')}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Reject',
                    style: 'destructive',
                    onPress: async () => {
                        setAcceptingPrice(true);
                        try {
                            const res = await api.put(`/api/car/price-accepted-by-user/${carDetail._id}`, {
                                userAgreedForPrice: "rejected",
                            });
                            if (res.data?.success) {
                                setCarDetail(prev => ({ ...prev, userAgreedForPrice: "rejected" }));
                            } else {
                                Alert.alert('Error', res.data?.message || 'Something went wrong.');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Failed to reject price. Please try again.');
                        } finally {
                            setAcceptingPrice(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Loading car details…</Text>
            </SafeAreaView>
        );
    }

    if (!carDetail) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.errorText}>Could not load car details.</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchCarDetail}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const {
        rcNumber, carDetail: rc, seller, craneMan, status,
        kmDriven, pickupLocation, onlyForCheck, isRunningCondition,
        anyMissingPart, isPaid, paymentMethod, paymentDetails,
        images, frontImage, backImage, chassisImage, engineImage,
        tyreImage, odometerImage, rcFrontImage, rcBackImage,
        price, priceUserWant, userAgreedForPrice,   // ← add these two
        createdAt, updatedAt,
    } = carDetail;

    const craneManCoords = craneMan?.location?.latitude ? {
        latitude: parseFloat(craneMan.location.latitude),
        longitude: parseFloat(craneMan.location.longitude),
    } : null;

    const pickupCoords = pickupLocation?.latitude ? {
        latitude: parseFloat(pickupLocation.latitude),
        longitude: parseFloat(pickupLocation.longitude),
    } : null;

    const showMap = isUser && (status === 'en_route' || status === 'en_route_to_garage') && craneManCoords && pickupCoords;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <PageHeader title="Car Details" onBack={() => navigation.goBack()} />

            <Animated.ScrollView
                style={{ opacity: fadeAnim }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
            >
                {/* ── Hero Card ── */}
                <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.heroCard}>
                    <View style={styles.heroTop}>
                        <View style={styles.heroTitleWrap}>
                            <Text style={styles.heroMake}>{rc?.make || '—'} {rc?.model || ''}</Text>
                            <Text style={styles.heroYear}>{rc?.manufacturingYear || ''}</Text>
                        </View>
                        <StatusBadge status={status} />
                    </View>
                    <View style={styles.heroStats}>
                        <View style={styles.heroStat}>
                            <Text style={styles.heroStatVal}>{rcNumber || '—'}</Text>
                            <Text style={styles.heroStatLabel}>RC Number</Text>
                        </View>
                        {kmDriven != null && (
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatVal}>{kmDriven.toLocaleString()}</Text>
                                <Text style={styles.heroStatLabel}>KM Driven</Text>
                            </View>
                        )}
                        {rc?.fuelType && (
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatVal}>{rc.fuelType}</Text>
                                <Text style={styles.heroStatLabel}>Fuel</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>

                {/* ── Live Tracking Map ── */}
                {showMap && (
                    <View style={styles.trackingSection}>
                        <View style={styles.trackingSectionHeader}>
                            <View style={styles.trackingTitleRow}>
                                <LocationIcon color="#2563EB" />
                                <Text style={styles.trackingSectionTitle}>Live Crane Tracking</Text>
                            </View>
                            <View style={styles.liveChip}>
                                <Animated.View style={styles.liveChipDot} />
                                <Text style={styles.liveChipText}>Live</Text>
                            </View>
                        </View>
                        <LiveTrackingMap
                            carId={carId}
                            craneManLocation={craneManCoords}
                            pickupLocation={pickupCoords}
                            onMapTouchStart={() => setScrollEnabled(false)}
                            onMapTouchEnd={() => setScrollEnabled(true)}
                        />
                    </View>
                )}

                {/* ── Car Gallery ── */}
                {images && images.length > 0 && (
                    <View style={styles.gallerySection}>
                        <Text style={styles.gallerySectionTitle}>Inspection Photos</Text>
                        <CarImageCarousel images={images} />
                    </View>
                )}

                {/* ── Vehicle Info ── */}
                {rc && (
                    <Section title="Vehicle Information" icon={<CarIcon color="#2563EB" />}>
                        <InfoRow label="Make" value={rc.make} />
                        <InfoRow label="Model" value={rc.model} />
                        <InfoRow label="Manufacturing Year" value={rc.manufacturingYear} />
                        <InfoRow label="Color" value={rc.color} />
                        <InfoRow label="Body Type" value={rc.bodyType} />
                        <InfoRow label="Vehicle Class" value={rc.vehicleClass} />
                        <InfoRow label="Fuel Type" value={rc.fuelType} />
                        <InfoRow label="Seating Capacity" value={rc.seatingCapacity} />
                        <InfoRow label="Engine Number" value={rc.engineNumber} />
                        <InfoRow label="Chassis Number" value={rc.chassisNumber} />
                        <InfoRow label="Cubic Capacity" value={rc.cubicCapacity} />
                        <InfoRow label="Cylinders" value={rc.cylinderCount} />
                        <InfoRow label="Wheelbase" value={rc.wheelbase} />
                        <InfoRow label="Unladen Weight" value={rc.unladenWeight} />
                        <InfoRow label="Gross Weight" value={rc.grossWeight} />
                        <InfoRow label="Vehicle Category" value={rc.vehicleCategory} />
                        <InfoRow label="Variant / Norms" value={rc.variant} />
                    </Section>
                )}

                {/* ── Registration ── */}
                {rc && (
                    <Section title="Registration Details" icon={<LocationIcon color="#2563EB" />}>
                        <InfoRow label="RC Number" value={rcNumber} />
                        <InfoRow label="Owner Name" value={rc.ownerName} />
                        <InfoRow label="Father's Name" value={rc.fatherName} />
                        <InfoRow label="RTO Office" value={rc.rtoOffice} />
                        <InfoRow label="RTO Code" value={rc.rtoCode} />
                        <InfoRow label="Registration Date" value={rc.registrationDate} />
                        <InfoRow label="Valid Till" value={rc.registrationValidity} />
                        <InfoRow label="RC Status" value={rc.rcStatus} />
                        <InfoRow label="Status As On" value={rc.statusAsOn} />
                        <InfoRow label="Tax Valid Till" value={rc.taxValidity} />
                        <InfoRow label="Owner Count" value={rc.ownerCount} />
                        <InfoRow label="Present Address" value={rc.presentAddress} />
                        <InfoRow label="Permanent Address" value={rc.permanentAddress} />
                    </Section>
                )}

                {/* ── Insurance & PUC ── */}
                {rc && (
                    <Section title="Insurance & PUC" icon={<CheckIcon color="#2563EB" />}>
                        <InfoRow label="Insurance Company" value={rc.insuranceCompany} />
                        <InfoRow label="Policy Number" value={rc.insurancePolicyNumber} />
                        <InfoRow label="Insurance Valid Till" value={rc.insuranceValidity} />
                        <InfoRow label="PUCC Number" value={rc.puccNumber} />
                        <InfoRow label="PUC Valid Till" value={rc.puccValidity} />
                    </Section>
                )}

                {/* ── Finance & Other ── */}
                {rc && (
                    <Section title="Finance & Other" icon={<PaymentIcon color="#2563EB" />}>
                        <BoolRow label="Financed" value={rc.financed} />
                        <InfoRow label="Financer" value={rc.financer} />
                        <BoolRow label="Commercial Vehicle" value={rc.isCommercial} />
                        <InfoRow label="Blacklist Status" value={rc.blacklistStatus} />
                    </Section>
                )}

                {/* ── Condition ── */}
                <Section title="Condition" icon={<CheckIcon color="#2563EB" />}>
                    <BoolRow label="Running Condition" value={isRunningCondition} />
                    <BoolRow label="Any Missing Part" value={anyMissingPart} />
                    <BoolRow label="Only For Check" value={onlyForCheck} />
                    {kmDriven != null && <InfoRow label="KM Driven" value={`${kmDriven.toLocaleString()} km`} />}
                    {pickupLocation && (
                        <>
                            <InfoRow
                                label="Pickup Address"
                                value={pickupLocation.streetAndHouse
                                    ? `${pickupLocation.streetAndHouse}, ${pickupLocation.address}`
                                    : pickupLocation.address}
                            />
                            {pickupLocation.latitude && pickupLocation.longitude && (
                                <InfoRow
                                    label="Coordinates"
                                    value={`${parseFloat(pickupLocation.latitude).toFixed(5)}, ${parseFloat(pickupLocation.longitude).toFixed(5)}`}
                                />
                            )}
                        </>
                    )}
                </Section>

                {/* ── Seller ── */}
                {seller && (
                    <Section title="Seller Details" icon={<UserIcon color="#2563EB" />}>
                        <View style={styles.personCard}>
                            {seller.userImage?.img && (
                                <Image source={{ uri: seller.userImage.img }} style={styles.personAvatar} />
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.personName}>{seller.name || '—'}</Text>
                                {seller.phone && <View style={styles.personInfoRow}><PhoneIcon color="#6B7280" /><Text style={styles.personInfoText}>{seller.phone}</Text></View>}
                                {seller.email && <Text style={styles.personEmail}>{seller.email}</Text>}
                                {seller.address && <View style={styles.personInfoRow}><LocationIcon color="#6B7280" /><Text style={styles.personInfoText}>{seller.address}</Text></View>}
                            </View>
                        </View>
                    </Section>
                )}

                {/* ── Crane Man ── */}
                {craneMan && (
                    <Section title="Crane Man Details" icon={<UserIcon color="#2563EB" />}>
                        <View style={styles.personCard}>
                            {craneMan.userImage?.img && (
                                <Image source={{ uri: craneMan.userImage.img }} style={styles.personAvatar} />
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.personName}>{craneMan.name || '—'}</Text>
                                {craneMan.phone && <View style={styles.personInfoRow}><PhoneIcon color="#6B7280" /><Text style={styles.personInfoText}>{craneMan.phone}</Text></View>}
                                {craneMan.email && <Text style={styles.personEmail}>{craneMan.email}</Text>}
                                {craneMan.address && <View style={styles.personInfoRow}><LocationIcon color="#6B7280" /><Text style={styles.personInfoText}>{craneMan.address}</Text></View>}
                            </View>
                        </View>
                    </Section>
                )}

                {/* ── Payment ── */}
                <Section title="Payment Details" icon={<PaymentIcon color="#2563EB" />}>
                    <BoolRow label="Payment Done" value={isPaid} />
                    {paymentMethod && <InfoRow label="Payment Method" value={paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer'} />}
                    {/* User's Expected Price */}
                    {carDetail.priceUserWant && (
                        <InfoRow label="User Expected Price" value={`₹ ${carDetail.priceUserWant.toLocaleString('en-IN')}`} />
                    )}

                    {/* Final Price or Pending Notice */}
                    {carDetail.price ? (
                        <InfoRow label="Final Price" value={`₹ ${carDetail.price.toLocaleString('en-IN')}`} />
                    ) : (
                        <View style={styles.priceNoticeCard}>
                            <Text style={styles.priceNoticeIcon}>⏳</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.priceNoticeTitle}>Price Under Review</Text>
                                <Text style={styles.priceNoticeText}>
                                    Our admin is reviewing your listing and will confirm the final price shortly. You'll be notified once it's approved.
                                </Text>
                            </View>
                        </View>
                    )}
                    {carDetail.price && <InfoRow label="User Agreed For Price" value={carDetail.userAgreedForPrice} />}
                    {paymentDetails?.upiId && <InfoRow label="UPI ID" value={paymentDetails.upiId} />}
                    {paymentDetails?.accountHolderName && <InfoRow label="Account Holder" value={paymentDetails.accountHolderName} />}
                    {paymentDetails?.bankName && <InfoRow label="Bank Name" value={paymentDetails.bankName} />}
                    {paymentDetails?.accountNumber && <InfoRow label="Account Number" value={paymentDetails.accountNumber} />}
                    {paymentDetails?.ifscCode && <InfoRow label="IFSC Code" value={paymentDetails.ifscCode} />}
                </Section>

                {/* ── Car Photos ── */}
                <Section title="Car Photos" icon={<CarIcon color="#2563EB" />}>
                    <View style={styles.thumbGrid}>
                        <ThumbImage label="Front" uri={frontImage?.image} />
                        <ThumbImage label="Back" uri={backImage?.image} />
                        <ThumbImage label="Chassis" uri={chassisImage?.image} />
                        <ThumbImage label="Engine" uri={engineImage?.image} />
                        <ThumbImage label="Tyre" uri={tyreImage?.image} />
                        <ThumbImage label="Odometer" uri={odometerImage?.image} />
                    </View>
                </Section>

                {/* ── RC Docs ── */}
                <Section title="RC Documents" icon={<LocationIcon color="#2563EB" />}>
                    <View style={styles.thumbGrid}>
                        <ThumbImage label="RC Front" uri={rcFrontImage?.image} />
                        <ThumbImage label="RC Back" uri={rcBackImage?.image} />
                    </View>
                </Section>

                {/* ── Timestamps ── */}
                <Section title="Activity" icon={<CheckIcon color="#2563EB" />}>
                    {createdAt && <InfoRow label="Listed On" value={new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />}
                    {updatedAt && <InfoRow label="Last Updated" value={new Date(updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />}
                </Section>

                <View style={{ height: price && userAgreedForPrice === "pending" && isUser ? 100 : 40 }} />
                {isUser && price && userAgreedForPrice === "pending" && (
                    <View style={styles.acceptPriceBar}>
                        <View style={styles.acceptPriceLeft}>
                            <Text style={styles.acceptPriceLabel}>Admin's Offer</Text>
                            <Text style={styles.acceptPriceAmount}>₹ {price.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={[styles.rejectPriceBtn, acceptingPrice && { opacity: 0.7 }]}
                                onPress={handleRejectPrice}
                                disabled={acceptingPrice}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.rejectPriceBtnText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.acceptPriceBtn, acceptingPrice && { opacity: 0.7 }]}
                                onPress={handleAcceptPrice}
                                disabled={acceptingPrice}
                                activeOpacity={0.85}
                            >
                                {acceptingPrice ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.acceptPriceBtnText}>Accept</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', gap: 12 },
    loadingText: { fontSize: 14, color: '#6B7280' },
    errorText: { fontSize: 15, color: '#374151', marginBottom: 12 },
    retryBtn: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#2563EB', borderRadius: 8 },
    retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827', letterSpacing: -0.3 },
    scrollContent: { paddingBottom: 20 },

    // Hero
    heroCard: { margin: 16, borderRadius: 16, padding: 20, shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 18,
        gap: 8,
    },
    heroTitleWrap: {
        flex: 1,
        marginRight: 8,
    },
    heroMake: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
        flexWrap: 'wrap',
    },
    heroYear: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    heroStats: { flexDirection: 'row', gap: 20 },
    heroStat: { gap: 2 },
    heroStatVal: { fontSize: 15, fontWeight: '700', color: '#fff' },
    heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5 },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
        flexShrink: 0,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Tracking Section
    trackingSection: { marginHorizontal: 16, marginBottom: 12 },
    trackingSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    trackingTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    trackingSectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
    liveChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    liveChipDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16a34a' },
    liveChipText: { fontSize: 11, fontWeight: '700', color: '#16a34a', letterSpacing: 0.5 },

    // Tracking Card
    trackingCard: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },

    // Stats Row
    trackingStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    trackingStat: { alignItems: 'flex-start', minWidth: 70 },
    trackingStatValue: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    trackingStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
    liveBadgeWrap: { alignItems: 'center' },
    liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 4 },
    liveDotGreen: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80' },
    liveBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
    trackingSubLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.3 },

    // Map
    map: { width: '100%', height: 280 },
    mapPlaceholder: { height: 220, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F1F5F9', borderRadius: 16 },
    mapPlaceholderText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

    // Crane Marker
    craneMarkerWrap: { alignItems: 'center', justifyContent: 'center', width: 56, height: 56 },
    craneMarkerInner: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8, position: 'absolute' },
    pulseRing: { position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: '#2563EB' },
    pickupMarkerWrap: { alignItems: 'center' },
    pickupMarkerPin: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#22c55e',
        borderWidth: 3, borderColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
    },
    pickupMarkerDot: {
        width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff',
    },
    pickupMarkerTail: {
        width: 0, height: 0,
        borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        borderTopColor: '#22c55e',
        marginTop: -2,
    },

    // Bottom Bar
    trackingBottomBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    trackingBottomItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    trackingBottomDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
    bottomDot: { width: 10, height: 10, borderRadius: 5 },
    bottomItemLabel: { fontSize: 12, fontWeight: '700', color: '#111827' },
    bottomItemSub: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },

    // Gallery
    gallerySection: { marginBottom: 8 },
    gallerySectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', paddingHorizontal: 16, marginBottom: 10 },
    carouselImage: { width: SCREEN_WIDTH * 0.72, height: 190, borderRadius: 14, backgroundColor: '#E5E7EB' },

    // Section
    section: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', letterSpacing: -0.2 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
    infoLabel: { fontSize: 13, color: '#6B7280', flex: 1, fontWeight: '500' },
    infoValue: { fontSize: 13, color: '#111827', fontWeight: '600', flex: 1.2, textAlign: 'right' },
    boolBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    boolText: { fontSize: 13, fontWeight: '700' },
    personCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
    personAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#E5E7EB' },
    personName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
    personInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
    personInfoText: { fontSize: 13, color: '#6B7280' },
    personEmail: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    thumbGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    thumbContainer: { width: (SCREEN_WIDTH - 32 - 16 * 2 - 10 * 2) / 3, alignItems: 'center', gap: 5 },
    thumbImage: { width: '100%', aspectRatio: 1, borderRadius: 10, backgroundColor: '#E5E7EB' },
    thumbLabel: { fontSize: 11, color: '#6B7280', fontWeight: '500', textAlign: 'center' },
    priceNoticeCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 12,
        padding: 14,
        marginTop: 8,
    },
    priceNoticeIcon: {
        fontSize: 20,
        marginTop: 1,
    },
    priceNoticeTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#92400E',
        marginBottom: 3,
    },
    priceNoticeText: {
        fontSize: 12,
        color: '#78350F',
        lineHeight: 18,
    },
    acceptPriceBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        paddingBottom: 28,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 12,
    },
    acceptPriceLeft: {
        gap: 2,
    },
    acceptPriceLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    acceptPriceAmount: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    acceptPriceBtn: {
        backgroundColor: '#16a34a',
        paddingHorizontal: 24,
        paddingVertical: 13,
        borderRadius: 12,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        minWidth: 130,
        alignItems: 'center',
    },
    acceptPriceBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    rejectPriceBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ef4444',
    minWidth: 90,
    alignItems: 'center',
},
rejectPriceBtnText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
},
});