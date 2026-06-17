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
import { Svg, Path, Polyline } from 'react-native-svg';
import { Colors } from '../constants/colors';

export default function SuccessScreen({ route, navigation }) {
  const { rcNumber, carDetail, message } = route.params || {};
  console.log("carDetail in SuccessScreen", carDetail);

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { 
        toValue: 1, 
        useNativeDriver: true, 
        tension: 80, 
        friction: 6 
      }),
      Animated.timing(opacityAnim, { 
        toValue: 1, 
        duration: 400, 
        useNativeDriver: true 
      }),
    ]).start();
  }, []);

  // Dynamic car name
  const carName = carDetail 
    ? `${carDetail?.carDetail?.make || ''} ${carDetail?.carDetail?.model || ''}`.trim() || 'Your Car'
    : 'Your Car';

  // Dynamic order details
  const orderDetails = [
    { 
      label: 'Car', 
      value: carName 
    },
    { 
      label: 'RC Number', 
      value: rcNumber || carDetail?.rcNumber || 'N/A' 
    },
    // { 
    //   label: 'Estimated Price', 
    //   value: '₹3,20,000 – ₹3,50,000'   // Aap isko dynamic bana sakte ho baad mein
    // },
    { 
      label: 'Your Price', 
      value: carDetail?.priceUserWant || 'N/A'   // Aap isko dynamic bana sakte ho baad mein
    },
    { 
      label: 'Status', 
      value: carDetail?.isApproved ? 'Approved for Sale' : 'Under Review' 
    },
    { 
      label: 'Request ID', 
      value: carDetail?._id
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Success Circle */}
        <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
            <Polyline 
              points="20,6 9,17 4,12" 
              stroke={Colors.green500} 
              strokeWidth={2.5} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </Svg>
        </Animated.View>

        <Text style={styles.title}>
          {carDetail?.isApproved ? "Listing Live!" : "Listing Submitted!"} 🎉
        </Text>
        
        <Text style={styles.subtitle}>
          {message || "Your listing has been successfully submitted."}
        </Text>

        {/* Dynamic Order Card */}
        <View style={styles.orderCard}>
          {orderDetails.map((d, i) => (
            <View 
              key={i} 
              style={[styles.detailRow, i === orderDetails.length - 1 && { borderBottomWidth: 0 }]}
            >
              <Text style={styles.detailKey}>{d.label}</Text>
              <Text style={styles.detailVal}>{d.value}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Notice */}
<View style={styles.noticeCard}>
  <Text style={styles.noticeIcon}>⏳</Text>
  <View style={{ flex: 1 }}>
    <Text style={styles.noticeTitle}>Pricing Pending Review</Text>
    <Text style={styles.noticeText}>
      Our team is reviewing your listing. You'll receive a final price from the admin within 24–48 hours.
    </Text>
  </View>
</View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('MainTabs')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnSecondaryText}>View My Listings</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Bharat Scrap v1.0.0 · Made with ❤️ in India</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.green50,
    borderWidth: 3,
    borderColor: Colors.green300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: Colors.neutral900, 
    textAlign: 'center', 
    marginBottom: 10 
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral500,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  orderCard: {
    width: '100%',
    backgroundColor: Colors.neutral50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  detailKey: { 
    fontSize: 13, 
    color: Colors.neutral500 
  },
  detailVal: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: Colors.neutral900, 
    textAlign: 'right', 
    flex: 1, 
    marginLeft: 16 
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: Colors.blue500,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.blue500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 12,
  },
  btnPrimaryText: { 
    color: Colors.white, 
    fontSize: 15, 
    fontWeight: '600' 
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    marginBottom: 24,
  },
  btnSecondaryText: { 
    color: Colors.neutral700, 
    fontSize: 15, 
    fontWeight: '600' 
  },
  footer: { 
    fontSize: 11, 
    color: Colors.neutral400 
  },
  noticeCard: {
  width: '100%',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
  backgroundColor: '#FFFBEB',
  borderWidth: 1,
  borderColor: '#FDE68A',
  borderRadius: 14,
  padding: 16,
  marginBottom: 24,
},
noticeIcon: {
  fontSize: 22,
  marginTop: 1,
},
noticeTitle: {
  fontSize: 13,
  fontWeight: '700',
  color: '#92400E',
  marginBottom: 4,
},
noticeText: {
  fontSize: 12,
  color: '#78350F',
  lineHeight: 18,
},
});