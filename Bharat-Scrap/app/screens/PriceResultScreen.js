import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path } from 'react-native-svg';
import { Colors } from '../constants/colors';
import api from '../lib/api';        // ← Import kiya
import Toast from '../components/Toast';   // ← Toast ke liye

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

// const breakdown = [
//   { label: 'Base Market Price', value: '₹3,80,000', type: 'normal' },
//   { label: 'Year Depreciation (4 yrs)', value: '−₹38,000', type: 'neg' },
//   { label: 'KM Driven (45,000)', value: '−₹12,000', type: 'neg' },
//   { label: '1st Owner Bonus', value: '+₹8,000', type: 'pos' },
//   { label: 'Market Demand', value: '+₹5,000', type: 'pos' },
// ];

const highlights = [
  { label: '24 hrs', sub: 'Average selling time' },
  { label: '₹0', sub: 'Zero commission' },
  { label: '100%', sub: 'Secure payment' },
];

export default function PriceResultScreen({ route, navigation }) {
  const { rcNumber, carDetail, buttonText } = route.params || {};
  // console.log("buttonText",buttonText)
  const priceScale = useRef(new Animated.Value(0.85)).current;
  const priceOpacity = useRef(new Animated.Value(0)).current;
  const meterWidth = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(priceScale, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
      Animated.timing(priceOpacity, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
      Animated.timing(meterWidth, { toValue: 65, duration: 800, delay: 500, useNativeDriver: false }),
    ]).start();
  }, []);

  // Add this inside PriceResultScreen component
  const calculatePrice = (carDetail) => {
    if (!carDetail) return { fixedPrice: 320000, basePrice: 450000, yearDepreciation: 0, kmDepreciation: 0, ownerBonus: 0, marketDemand: 5000, notRunningPenalty: 0, missingPartPenalty: 0, age: 0, kmDriven: 45000 };

    const basePrice = 450000;
    const currentYear = new Date().getFullYear();
    const age = currentYear - (carDetail.manufacturingYear || currentYear);
    const kmDriven = carDetail.kmDriven || 45000;

    const yearDepreciation = Math.max(0, age * 12000);
    const kmDepreciation = Math.floor(kmDriven / 1000) * 800;
    const ownerBonus = carDetail.ownerType === '1st Owner' ? 15000 : 0;
    const marketDemand = 5000;
    const notRunningPenalty = carDetail.isRunningCondition === false ? 50000 : 0;
    const missingPartPenalty = carDetail.anyMissingPart === true ? 25000 : 0;

    const fixedPrice = Math.max(
      50000, // minimum floor
      basePrice - yearDepreciation - kmDepreciation + ownerBonus + marketDemand - notRunningPenalty - missingPartPenalty
    );

    return {
      fixedPrice,
      basePrice,
      yearDepreciation,
      kmDepreciation,
      ownerBonus,
      marketDemand,
      notRunningPenalty,
      missingPartPenalty,
      age,
      kmDriven,
    };
  };

  const priceData = calculatePrice({
    ...carDetail,
    isRunningCondition: carDetail?.isRunningCondition,
    anyMissingPart: carDetail?.anyMissingPart,
  });

  const formattedPrice = `₹${priceData.fixedPrice.toLocaleString('en-IN')}`;

  const breakdown = [
    { label: 'Base Market Price', value: `₹${priceData.basePrice.toLocaleString('en-IN')}`, type: 'normal' },
    { label: `Year Depreciation (${priceData.age} yrs)`, value: `−₹${priceData.yearDepreciation.toLocaleString('en-IN')}`, type: 'neg' },
    { label: `KM Driven (${priceData.kmDriven?.toLocaleString('en-IN')} km)`, value: `−₹${priceData.kmDepreciation.toLocaleString('en-IN')}`, type: 'neg' },
    { label: '1st Owner Bonus', value: priceData.ownerBonus > 0 ? `+₹${priceData.ownerBonus.toLocaleString('en-IN')}` : '₹0', type: priceData.ownerBonus > 0 ? 'pos' : 'normal' },
    { label: 'Market Demand', value: `+₹${priceData.marketDemand.toLocaleString('en-IN')}`, type: 'pos' },
    ...(priceData.notRunningPenalty > 0 ? [{ label: 'Not Running Condition', value: `−₹${priceData.notRunningPenalty.toLocaleString('en-IN')}`, type: 'neg' }] : []),
    ...(priceData.missingPartPenalty > 0 ? [{ label: 'Missing Parts Penalty', value: `−₹${priceData.missingPartPenalty.toLocaleString('en-IN')}`, type: 'neg' }] : []),
  ];
  // ====================== SALE NOW API CALL ======================
  const handleSaleNow = async () => {
    if (!rcNumber) {
      showToast("RC Number not found");
      return;
    }

    setLoading(true);

    try {
      const res = await api.put(`/api/car/approve-car-for-sale/${rcNumber}`, {
    price: priceData.fixedPrice,  // ✅ single fixed price
});

      if (res.data.success) {
        showToast("Car approved for sale successfully!");

        // Success screen pe le jao
        navigation.navigate('Success', {
          rcNumber,
          carDetail: res.data.data,
          message: "Your car is now live for sale!"
        });
      } else {
        showToast(res.data.message || "Failed to approve car");
      }
    } catch (error) {
      console.log("Approve Car Error:", error);
      const msg = error.response?.data?.message || "Something went wrong. Please try again.";
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Price Result" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Price Hero */}
        <LinearGradient
          colors={[Colors.blue900, Colors.blue700, '#1B5E20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.priceHero}
        >
          <Text style={styles.priceLabel}>Estimated Selling Price</Text>

          <Animated.Text style={[styles.priceRange, { transform: [{ scale: priceScale }], opacity: priceOpacity }]}>
            {formattedPrice}
          </Animated.Text>

          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>Based on current market data • Real-time</Text>
          </View>

          {/* Meter */}
          <View style={styles.meterTrack}>
            <Animated.View
              style={[styles.meterFill, {
                width: meterWidth.interpolate({
                  inputRange: [0, 65],
                  outputRange: ['0%', '65%']
                })
              }]}
            />
          </View>
          <View style={styles.meterLabels}>
            <Text style={styles.meterLabel}>₹2,00,000</Text>
            <Text style={styles.meterLabel}>₹5,00,000</Text>
          </View>
        </LinearGradient>

        <View style={styles.pad}>
          {/* Breakdown */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>PRICE BREAKDOWN</Text>
            {breakdown.map((b, i) => (
              <View key={i} style={[styles.breakdownRow, i === breakdown.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.breakdownLabel}>{b.label}</Text>
                <Text style={[
                  styles.breakdownVal,
                  b.type === 'pos' ? styles.breakdownPos : b.type === 'neg' ? styles.breakdownNeg : null,
                ]}>{b.value}</Text>
              </View>
            ))}
          </View>

          {/* Highlights */}
          <View style={styles.highlightsRow}>
            {highlights.map((h, i) => (
              <View key={i} style={styles.highlightBox}>
                <Text style={styles.highlightNum}>{h.label}</Text>
                <Text style={styles.highlightSub}>{h.sub}</Text>
              </View>
            ))}
          </View>

          {buttonText == "pending" ? (
            <TouchableOpacity
              style={[styles.btnSuccess, loading && { opacity: 0.7 }]}
              onPress={handleSaleNow}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnSuccessText}>
                {loading ? "Processing..." : "List Car for Sale"}
              </Text>
            </TouchableOpacity>
          ) : (
            null
          )}

          {/* <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('ConditionForm')} activeOpacity={0.8}>
            <Text style={styles.btnSecondaryText}>Update Details</Text>
          </TouchableOpacity> */}
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
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.neutral50,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.neutral900 },
  priceHero: {
    padding: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  priceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  priceRange: { fontSize: 38, fontWeight: '800', color: Colors.white, letterSpacing: -1, textAlign: 'center' },
  priceBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  priceBadgeText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  meterTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  meterFill: { height: '100%', backgroundColor: Colors.green300, borderRadius: 8 },
  meterLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  meterLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  pad: { padding: 20, gap: 14 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: Colors.neutral500,
    letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  breakdownLabel: { fontSize: 14, color: Colors.neutral600 },
  breakdownVal: { fontSize: 14, fontWeight: '600', color: Colors.neutral900 },
  breakdownPos: { color: Colors.green500 },
  breakdownNeg: { color: Colors.error },
  highlightsRow: { flexDirection: 'row', gap: 10 },
  highlightBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  highlightNum: { fontSize: 18, fontWeight: '800', color: Colors.blue700 },
  highlightSub: { fontSize: 11, color: Colors.neutral500, marginTop: 2, textAlign: 'center' },
  btnSuccess: {
    backgroundColor: Colors.green500,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.green500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 5,
  },
  btnSuccessText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  btnSecondary: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
  },
  btnSecondaryText: { color: Colors.neutral700, fontSize: 15, fontWeight: '600' },
});
