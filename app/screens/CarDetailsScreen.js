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
import { Svg, Path, Circle, Rect, Line, Polyline, Ellipse } from 'react-native-svg';
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

export default function CarDetailsScreen({ route, navigation }) {
  const { carData, rcNumber, from } = route.params || {};

  // Agar carData nahi mila to fallback
  if (!carData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 100 }}>No car data found</Text>
      </SafeAreaView>
    );
  }

  const fullCarName = `${carData.make} ${carData.model}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Car Details" onBack={() => navigation.goBack()} />
      <ProgressBar steps={3} currentStep={2} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Car Hero Section */}
        <LinearGradient colors={[Colors.blue50, Colors.green50]} style={styles.carHero}>
          <CarSVG />
          <Text style={styles.carName}>{fullCarName}</Text>
          <Text style={styles.carSub}>
            {carData.variant || carData.bodyType} • {rcNumber || carData.rcNumber}
          </Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Data Verified from RC</Text>
          </View>
        </LinearGradient>

        <View style={styles.pad}>
          {/* Dynamic Specs Grid */}
          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <View style={styles.specIcon}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="4" width="18" height="18" rx="2" stroke={Colors.blue500} strokeWidth={1.6} />
                  <Line x1="16" y1="2" x2="16" y2="6" stroke={Colors.blue500} strokeWidth={1.6} strokeLinecap="round" />
                  <Line x1="8" y1="2" x2="8" y2="6" stroke={Colors.blue500} strokeWidth={1.6} strokeLinecap="round" />
                  <Line x1="3" y1="10" x2="21" y2="10" stroke={Colors.blue500} strokeWidth={1.6} strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={styles.specLabel}>Manufacturing Year</Text>
              <Text style={styles.specValue}>{carData.manufacturingYear}</Text>
            </View>

            <View style={styles.specItem}>
              <View style={styles.specIcon}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke={Colors.blue500} strokeWidth={1.6} />
                </Svg>
              </View>
              <Text style={styles.specLabel}>Fuel Type</Text>
              <Text style={styles.specValue}>{carData.fuelType}</Text>
            </View>

            <View style={styles.specItem}>
              <View style={styles.specIcon}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="3" width="18" height="18" rx="2" stroke={Colors.blue500} strokeWidth={1.6} />
                </Svg>
              </View>
              <Text style={styles.specLabel}>Vehicle Class</Text>
              <Text style={styles.specValue}>{carData.vehicleClass}</Text>
            </View>

            <View style={styles.specItem}>
              <View style={styles.specIcon}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2v20M2 12h20" stroke={Colors.blue500} strokeWidth={1.6} strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={styles.specLabel}>Body Type</Text>
              <Text style={styles.specValue}>{carData.bodyType}</Text>
            </View>

            <View style={styles.specItem}>
              <View style={styles.specIcon}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke={Colors.blue500} strokeWidth={1.6} />
                  <Path d="M12 8v8" stroke={Colors.blue500} strokeWidth={1.6} />
                </Svg>
              </View>
              <Text style={styles.specLabel}>Color</Text>
              <Text style={styles.specValue}>{carData.color}</Text>
            </View>

            <View style={styles.specItem}>
              <View style={styles.specIcon}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Rect x="6" y="6" width="12" height="12" rx="2" stroke={Colors.blue500} strokeWidth={1.6} />
                </Svg>
              </View>
              <Text style={styles.specLabel}>Seating Capacity</Text>
              <Text style={styles.specValue}>{carData.seatingCapacity}</Text>
            </View>
          </View>

          {/* Registration Details Card */}
          <View style={styles.rtoCard}>
            <Text style={styles.rtoTitle}>Registration Details</Text>

            <View style={styles.rtoRow}>
              <Text style={styles.rtoKey}>Owner Name</Text>
              <Text style={styles.rtoVal}>{carData.ownerName}</Text>
            </View>

            <View style={styles.rtoRow}>
              <Text style={styles.rtoKey}>Father Name</Text>
              <Text style={styles.rtoVal}>{carData.fatherName}</Text>
            </View>

            <View style={styles.rtoRow}>
              <Text style={styles.rtoKey}>RTO Office</Text>
              <Text style={styles.rtoVal}>{carData.rtoOffice}</Text>
            </View>

            <View style={styles.rtoRow}>
              <Text style={styles.rtoKey}>Registration Date</Text>
              <Text style={styles.rtoVal}>{carData.registrationDate}</Text>
            </View>

            <View style={[styles.rtoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.rtoKey}>Registration Valid Till</Text>
              <Text style={[styles.rtoVal, { color: Colors.green500 }]}>
                {carData.registrationValidity}
              </Text>
            </View>
          </View>

          {from === 'verifyRC' ? (
            null
          ) : (
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => navigation.navigate('ConditionForm', { carData, rcNumber })}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>Continue →</Text>
            </TouchableOpacity>
          )}

          {/* Continue Button */}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.neutral900 },
  progressWrap: { paddingHorizontal: 20, paddingVertical: 12 },
  progressSteps: { flexDirection: 'row', gap: 6 },
  pStep: { flex: 1, height: 4, borderRadius: 4, backgroundColor: Colors.neutral200 },
  pStepDone: { backgroundColor: Colors.blue500 },
  pStepActive: { backgroundColor: Colors.blue300 },

  carHero: {
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  carName: { fontSize: 20, fontWeight: '800', color: Colors.neutral900, textAlign: 'center' },
  carSub: { fontSize: 13, color: Colors.neutral500, textAlign: 'center' },
  verifiedBadge: {
    backgroundColor: Colors.blue100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedText: { fontSize: 11, fontWeight: '600', color: Colors.blue900 },

  pad: { padding: 20, gap: 16 },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specItem: {
    width: '48%',
    backgroundColor: Colors.neutral50,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  specIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specLabel: { fontSize: 12, color: Colors.neutral500, fontWeight: '500' },
  specValue: { fontSize: 15, fontWeight: '700', color: Colors.neutral900 },

  rtoCard: {
    backgroundColor: Colors.blue50,
    borderWidth: 1,
    borderColor: Colors.blue100,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  rtoTitle: { fontSize: 14, fontWeight: '600', color: Colors.blue900, marginBottom: 12 },
  rtoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  rtoKey: { fontSize: 13, color: Colors.neutral500 },
  rtoVal: { fontSize: 13, fontWeight: '600', color: Colors.neutral900 },

  btnPrimary: {
    backgroundColor: Colors.blue500,
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.blue500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});