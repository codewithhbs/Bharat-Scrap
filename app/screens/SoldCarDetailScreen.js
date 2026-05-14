import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Image,
    FlatList,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';
import api from '../lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    pending:              { label: 'Pending',              bg: '#FEF3C7', text: '#92400E' },
    processing:           { label: 'Processing',           bg: '#DBEAFE', text: '#1E40AF' },
    en_route:             { label: 'En Route',             bg: '#EDE9FE', text: '#5B21B6' },
    inspecting:           { label: 'Inspecting',           bg: '#FEF9C3', text: '#713F12' },
    en_route_to_garage:   { label: 'En Route to Garage',   bg: '#EDE9FE', text: '#5B21B6' },
    at_garage:            { label: 'At Garage',            bg: '#DCFCE7', text: '#14532D' },
    picked_up:            { label: 'Picked Up',            bg: '#D1FAE5', text: '#065F46' },
    completed:            { label: 'Completed',            bg: '#D1FAE5', text: '#065F46' },
    sold:                 { label: 'Sold',                 bg: '#FEE2E2', text: '#991B1B' },
};

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

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SoldCarDetailScreen({ route, navigation }) {
    const { carId } = route.params || {};
    const [carDetail, setCarDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUser, setIsUser] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fetchCarDetail = async () => {
        try {
            const response = await api.get(`/api/car/get-car-detail-by-id/${carId}`);
            if (response.data.success) {
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
        price, createdAt, updatedAt,
    } = carDetail;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <PageHeader title="Car Details" onBack={() => navigation.goBack()} />

            <Animated.ScrollView
                style={{ opacity: fadeAnim }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Hero Card ── */}
                <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.heroCard}>
                    <View style={styles.heroTop}>
                        <View>
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
                        <InfoRow label="Year" value={rc.manufacturingYear} />
                        <InfoRow label="Color" value={rc.color} />
                        <InfoRow label="Body Type" value={rc.bodyType} />
                        <InfoRow label="Vehicle Class" value={rc.vehicleClass} />
                        <InfoRow label="Fuel Type" value={rc.fuelType} />
                        <InfoRow label="Seating Capacity" value={rc.seatingCapacity} />
                        <InfoRow label="Engine Number" value={rc.engineNumber} />
                        <InfoRow label="Chassis Number" value={rc.chassisNumber} />
                        <InfoRow label="Unladen Weight" value={rc.unladenWeight ? `${rc.unladenWeight} kg` : undefined} />
                        <InfoRow label="Gross Weight" value={rc.grossVehicleWeight ? `${rc.grossVehicleWeight} kg` : undefined} />
                    </Section>
                )}

                {/* ── Registration ── */}
                {rc && (
                    <Section title="Registration Details" icon={<LocationIcon color="#2563EB" />}>
                        <InfoRow label="RC Number" value={rcNumber} />
                        <InfoRow label="Owner Name" value={rc.ownerName} />
                        <InfoRow label="Father's Name" value={rc.fatherName} />
                        <InfoRow label="Address" value={rc.address} />
                        <InfoRow label="Registration Date" value={rc.registrationDate} />
                        <InfoRow label="Validity" value={rc.registrationValidity} />
                        <InfoRow label="Insurance Valid Till" value={rc.insuranceValidity} />
                        <InfoRow label="Pollution Valid Till" value={rc.pollutionValidity} />
                        <InfoRow label="RTO Office" value={rc.rtoOffice} />
                        <InfoRow label="Vehicle Category" value={rc.vehicleCategory} />
                        <InfoRow label="Status" value={rc.status} />
                    </Section>
                )}

                {/* ── Condition ── */}
                <Section title="Condition" icon={<CheckIcon color="#2563EB" />}>
                    <BoolRow label="Running Condition" value={isRunningCondition} />
                    <BoolRow label="Any Missing Part" value={anyMissingPart} />
                    <BoolRow label="Only For Check" value={onlyForCheck} />
                    {kmDriven != null && <InfoRow label="KM Driven" value={`${kmDriven.toLocaleString()} km`} />}
                    {pickupLocation && <InfoRow label="Pickup Location" value={pickupLocation} />}
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
                    {price && <InfoRow label="Price" value={`₹ ${price.toLocaleString()}`} />}
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

                <View style={{ height: 40 }} />
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
    heroCard: { margin: 16, borderRadius: 16, padding: 20, shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
    heroMake: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    heroYear: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    heroStats: { flexDirection: 'row', gap: 20 },
    heroStat: { gap: 2 },
    heroStatVal: { fontSize: 15, fontWeight: '700', color: '#fff' },
    heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    gallerySection: { marginBottom: 8 },
    gallerySectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', paddingHorizontal: 16, marginBottom: 10 },
    carouselImage: { width: SCREEN_WIDTH * 0.72, height: 190, borderRadius: 14, backgroundColor: '#E5E7EB' },
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
});