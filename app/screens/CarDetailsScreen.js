import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle, Rect, Line, Ellipse } from 'react-native-svg';
import { Colors } from '../constants/colors';

function PageHeader({ title, onBack }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.neutral900} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function ProgressBar({ steps, currentStep }) {
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressSteps}>
        {Array(steps).fill(0).map((_, i) => (
          <View
            key={i}
            style={[
              styles.pStep,
              i < currentStep ? styles.pStepDone : i === currentStep ? styles.pStepActive : null,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function CarSVG() {
  return (
    <Svg width={240} height={110} viewBox="0 0 240 110" fill="none">
      <Ellipse cx="120" cy="95" rx="100" ry="8" fill="rgba(0,0,0,0.08)" />
      <Rect x="20" y="50" width="200" height="42" rx="8" fill="#1356CC" opacity="0.2" />
      <Rect x="24" y="52" width="192" height="38" rx="7" fill="#1356CC" opacity="0.35" />
      <Path d="M50 52 L74 24 H166 L190 52" fill="#1565C0" opacity="0.7" />
      <Rect x="78" y="26" width="84" height="26" rx="3" fill="#7AB3FF" opacity="0.4" />
      <Rect x="80" y="27" width="36" height="23" rx="2" fill="#B3D4FF" opacity="0.5" />
      <Rect x="124" y="27" width="36" height="23" rx="2" fill="#B3D4FF" opacity="0.5" />
      <Circle cx="65" cy="90" r="18" fill="#374151" />
      <Circle cx="65" cy="90" r="10" fill="#6B7280" />
      <Circle cx="65" cy="90" r="5" fill="#9CA3AF" />
      <Circle cx="175" cy="90" r="18" fill="#374151" />
      <Circle cx="175" cy="90" r="10" fill="#6B7280" />
      <Circle cx="175" cy="90" r="5" fill="#9CA3AF" />
      <Rect x="20" y="60" width="14" height="8" rx="2" fill="#FEF9C3" />
      <Rect x="206" y="60" width="14" height="8" rx="2" fill="#FCA5A5" />
      <Rect x="22" y="70" width="18" height="10" rx="2" fill="#D1D5DB" />
    </Svg>
  );
}

// ── Helper: empty/null/false check ──────────────────────────────────────────
function val(v) {
  if (v === null || v === undefined || v === '' || v === 'Na' || v === 'N/A') return null;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
}

// ── Reusable section card ────────────────────────────────────────────────────
function InfoCard({ title, accent = 'blue', rows = [] }) {
  const filtered = rows.filter(r => val(r.v) !== null);
  if (filtered.length === 0) return null;

  const bg = accent === 'green' ? Colors.green50 : accent === 'orange' ? '#FFF7ED' : Colors.blue50;
  const border = accent === 'green' ? Colors.green100 ?? '#BBF7D0' : accent === 'orange' ? '#FED7AA' : Colors.blue100;
  const titleColor = accent === 'green' ? Colors.green700 ?? '#15803D' : accent === 'orange' ? '#C2410C' : Colors.blue900;

  return (
    <View style={[styles.infoCard, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.infoCardTitle, { color: titleColor }]}>{title}</Text>
      {filtered.map((row, i) => (
        <View
          key={i}
          style={[styles.infoRow, i === filtered.length - 1 && { borderBottomWidth: 0 }]}
        >
          <Text style={styles.infoKey}>{row.k}</Text>
          <Text style={[styles.infoVal, row.highlight && { color: Colors.green500, fontWeight: '700' }]}>
            {val(row.v)}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Spec tile (2-column grid) ────────────────────────────────────────────────
function SpecTile({ label, value, icon }) {
  if (!val(value)) return null;
  return (
    <View style={styles.specItem}>
      <View style={styles.specIcon}>{icon}</View>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{val(value)}</Text>
    </View>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isActive = String(status).toLowerCase() === 'active';
  return (
    <View style={[styles.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2' }]}>
      <Text style={[styles.statusText, { color: isActive ? '#16A34A' : '#DC2626' }]}>
        {isActive ? '● Active' : `● ${status || 'Unknown'}`}
      </Text>
    </View>
  );
}

export default function CarDetailsScreen({ route, navigation }) {
  const { carData, rcNumber, from } = route.params || {};
  console.log("CarDetailsScreen received carData:", carData);

  if (!carData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={Colors.neutral300} strokeWidth={1.5} />
            <Path d="M12 8v4M12 16h.01" stroke={Colors.neutral300} strokeWidth={1.5} strokeLinecap="round" />
          </Svg>
          <Text style={styles.emptyTitle}>No Car Data Found</Text>
          <Text style={styles.emptySubtitle}>RC data could not be loaded. Please try again.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.goBack()}>
            <Text style={styles.btnPrimaryText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fullCarName = [carData.make, carData.model].filter(Boolean).join(' ') || 'Unknown Vehicle';
  const displayRC = rcNumber || carData.rcNumber || '—';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Vehicle Details" onBack={() => navigation.goBack()} />
      <ProgressBar steps={3} currentStep={2} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Hero ── */}
        <LinearGradient colors={[Colors.blue50, Colors.green50 ?? '#F0FDF4']} style={styles.carHero}>
          <CarSVG />
          <Text style={styles.carName}>{fullCarName}</Text>
          <Text style={styles.carSub}>
            {val(carData.variant) || val(carData.bodyType) || 'Vehicle'} • {displayRC}
          </Text>
          <View style={styles.heroRow}>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified from RC</Text>
            </View>
            {carData.rcStatus ? <StatusBadge status={carData.rcStatus} /> : null}
          </View>
        </LinearGradient>

        <View style={styles.pad}>

          {/* ── Quick Specs Grid ── */}
          <Text style={styles.sectionHeading}>Specifications</Text>
          <View style={styles.specGrid}>
            <SpecTile label="Mfg. Year" value={carData.manufacturingYear}
              icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="4" width="18" height="18" rx="2" stroke={Colors.blue500} strokeWidth={1.6} />
                <Line x1="3" y1="10" x2="21" y2="10" stroke={Colors.blue500} strokeWidth={1.6} strokeLinecap="round" />
              </Svg>} />

            <SpecTile label="Fuel Type" value={carData.fuelType}
              icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M3 22V8l7-6 7 6v14" stroke={Colors.blue500} strokeWidth={1.6} strokeLinecap="round" />
              </Svg>} />

            <SpecTile label="Body Type" value={carData.bodyType}
              icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="3" width="18" height="18" rx="2" stroke={Colors.blue500} strokeWidth={1.6} />
              </Svg>} />

            <SpecTile label="Vehicle Class" value={carData.vehicleClass}
              icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke={Colors.blue500} strokeWidth={1.6} />
              </Svg>} />

            <SpecTile label="Color" value={carData.color}
              icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke={Colors.blue500} strokeWidth={1.6} />
                <Path d="M12 8v8" stroke={Colors.blue500} strokeWidth={1.6} strokeLinecap="round" />
              </Svg>} />

            <SpecTile label="Seating" value={carData.seatingCapacity}
              icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Rect x="6" y="6" width="12" height="12" rx="2" stroke={Colors.blue500} strokeWidth={1.6} />
              </Svg>} />

            <SpecTile label="Category" value={carData.vehicleCategory}
              icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M4 6h16M4 12h16M4 18h16" stroke={Colors.blue500} strokeWidth={1.6} strokeLinecap="round" />
              </Svg>} />

            <SpecTile label="Norms" value={carData.variant}
              icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2l3 7h7l-6 4 2 7-6-4-6 4 2-7-6-4h7z" stroke={Colors.blue500} strokeWidth={1.4} strokeLinejoin="round" />
              </Svg>} />
          </View>

          {/* ── Registration Details ── */}
          <InfoCard
            title="📋 Registration Details"
            accent="blue"
            rows={[
              { k: 'RC Number', v: displayRC },
              { k: 'Owner Name', v: carData.ownerName },
              { k: "Father's Name", v: carData.fatherName },
              { k: 'RTO Office', v: carData.rtoOffice },
              { k: 'RTO Code', v: carData.rtoCode },
              { k: 'Registration Date', v: carData.registrationDate },
              { k: 'Valid Till', v: carData.registrationValidity, highlight: true },
              { k: 'RC Status', v: carData.rcStatus },
              { k: 'Status As On', v: carData.statusAsOn },
              { k: 'Owner Count', v: carData.ownerCount },
              { k: 'Tax Valid Till', v: carData.taxValidity, highlight: true },
            ]}
          />

          {/* ── Insurance Details ── */}
          <InfoCard
            title="🛡️ Insurance Details"
            accent="green"
            rows={[
              { k: 'Company', v: carData.insuranceCompany },
              { k: 'Policy Number', v: carData.insurancePolicyNumber },
              { k: 'Valid Till', v: carData.insuranceValidity, highlight: true },
            ]}
          />

          {/* ── PUCC Details ── */}
          <InfoCard
            title="🌿 PUC Certificate"
            accent="green"
            rows={[
              { k: 'PUCC Number', v: carData.puccNumber },
              { k: 'Valid Till', v: carData.puccValidity, highlight: true },
            ]}
          />

          {/* ── Technical Details ── */}
          <InfoCard
            title="⚙️ Technical Details"
            accent="blue"
            rows={[
              { k: 'Chassis Number', v: carData.chassisNumber },
              { k: 'Engine Number', v: carData.engineNumber },
              { k: 'Cubic Capacity', v: carData.cubicCapacity },
              { k: 'Cylinders', v: carData.cylinderCount },
              { k: 'Wheelbase', v: carData.wheelbase },
              { k: 'Gross Weight', v: carData.grossWeight },
              { k: 'Unladen Weight', v: carData.unladenWeight },
            ]}
          />

          {/* ── Finance Details ── */}
          <InfoCard
            title="💳 Finance Details"
            accent="orange"
            rows={[
              { k: 'Financed', v: carData.financed },
              { k: 'Financer', v: carData.financer },
              { k: 'Commercial Vehicle', v: carData.isCommercial },
            ]}
          />

          {/* ── Address ── */}
          <InfoCard
            title="📍 Address"
            accent="blue"
            rows={[
              { k: 'Present Address', v: carData.presentAddress },
              { k: 'Permanent Address', v: carData.permanentAddress },
            ]}
          />

          {/* ── Blacklist / Challan ── */}
          {(carData.blacklistStatus || (carData.blacklistDetails && carData.blacklistDetails.length > 0)) && (
            <InfoCard
              title="🚫 Blacklist Info"
              accent="orange"
              rows={[
                { k: 'Blacklist Status', v: carData.blacklistStatus || 'None' },
                { k: 'Blacklist Records', v: carData.blacklistDetails?.length > 0 ? `${carData.blacklistDetails.length} record(s)` : 'None' },
              ]}
            />
          )}

          {carData.challanDetails && carData.challanDetails.length > 0 && (
            <View style={[styles.infoCard, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
              <Text style={[styles.infoCardTitle, { color: '#C2410C' }]}>⚠️ Challan Details</Text>
              {carData.challanDetails.map((c, i) => (
                <Text key={i} style={styles.infoKey}>{JSON.stringify(c)}</Text>
              ))}
            </View>
          )}

          {/* ── CTA ── */}
          {from !== 'verifyRC' && (
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => navigation.navigate('ConditionForm', { carData, rcNumber })}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>Continue →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral100,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.neutral50, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.neutral900 },

  // Progress
  progressWrap: { paddingHorizontal: 20, paddingVertical: 12 },
  progressSteps: { flexDirection: 'row', gap: 6 },
  pStep: { flex: 1, height: 4, borderRadius: 4, backgroundColor: Colors.neutral200 },
  pStepDone: { backgroundColor: Colors.blue500 },
  pStepActive: { backgroundColor: Colors.blue300 },

  // Hero
  carHero: { padding: 28, alignItems: 'center', gap: 10 },
  carName: { fontSize: 20, fontWeight: '800', color: Colors.neutral900, textAlign: 'center' },
  carSub: { fontSize: 13, color: Colors.neutral500, textAlign: 'center' },
  heroRow: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  verifiedBadge: {
    backgroundColor: Colors.blue100, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  verifiedText: { fontSize: 11, fontWeight: '600', color: Colors.blue900 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600' },

  // Layout
  pad: { padding: 20, gap: 16 },
  sectionHeading: { fontSize: 13, fontWeight: '700', color: Colors.neutral500, letterSpacing: 0.5, textTransform: 'uppercase' },

  // Spec grid
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  specItem: {
    width: '48%', backgroundColor: Colors.neutral50,
    borderRadius: 14, padding: 14, gap: 6,
  },
  specIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.blue50, alignItems: 'center', justifyContent: 'center',
  },
  specLabel: { fontSize: 12, color: Colors.neutral500, fontWeight: '500' },
  specValue: { fontSize: 15, fontWeight: '700', color: Colors.neutral900 },

  // Info card
  infoCard: {
    borderWidth: 1, borderRadius: 16, padding: 16,
  },
  infoCardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.neutral100, gap: 8,
  },
  infoKey: { fontSize: 13, color: Colors.neutral500, flex: 1 },
  infoVal: { fontSize: 13, fontWeight: '600', color: Colors.neutral900, flex: 1, textAlign: 'right' },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral900 },
  emptySubtitle: { fontSize: 14, color: Colors.neutral500, textAlign: 'center' },

  // Button
  btnPrimary: {
    backgroundColor: Colors.blue500, borderRadius: 14, padding: 15,
    alignItems: 'center', justifyContent: 'center', marginTop: 10,
    shadowColor: Colors.blue500, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});