import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Alert, Image, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Circle, Rect, Polyline } from 'react-native-svg';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';
import Toast from '../components/Toast';
import api from '../lib/api';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
const GOOGLE_PLACES_API_KEY = 'AIzaSyD022IF_7EVi9DEqKBizpz6vXM_nuFeE1g';
function PageHeader({ title, onBack }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.neutral900} strokeWidth={2.2}
            strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

// ─── Image Slot Config ───────────────────────────────────────────────────────
const IMAGE_SLOTS = [
  { key: 'frontImage', label: 'Front', icon: '🚗' },
  { key: 'backImage', label: 'Back', icon: '🔙' },
  { key: 'chassisImage', label: 'Chassis', icon: '🔩' },
  { key: 'engineImage', label: 'Engine', icon: '⚙️' },
  { key: 'tyreImage', label: 'Tyre', icon: '🛞' },
  { key: 'odometerImage', label: 'Odometer', icon: '📍' },
];

// ─── Single Image Upload Box ─────────────────────────────────────────────────
function ImageSlot({ label, icon, uri, onPress }) {
  return (
    <TouchableOpacity style={styles.imageSlot} onPress={onPress} activeOpacity={0.8}>
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.slotImage} resizeMode="cover" />
          <View style={styles.slotBadge}>
            <Text style={styles.slotBadgeText}>✓</Text>
          </View>
        </>
      ) : (
        <View style={styles.slotPlaceholder}>
          <Text style={styles.slotIcon}>{icon}</Text>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
              stroke={Colors.neutral400} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      )}
      <Text style={[styles.slotLabel, uri && styles.slotLabelDone]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ConditionFormScreen({ route, navigation }) {
  const { carData, rcNumber } = route.params || {};

  const [km, setKm] = useState(45000);
  const [scratches, setScratches] = useState(false);
  const [accidents, setAccidents] = useState(false);
  const [isRunningCondition, setRunning] = useState(true);   // ← New
  const [anyMissingPart, setMissingPart] = useState(false);  // ← New
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLatLng, setPickupLatLng] = useState({ latitude: null, longitude: null, placeId: null });
  const [streetAndHouse, setStreetAndHouse] = useState('');

  // 6 separate image states
  const [images, setImages] = useState({
    frontImage: null,
    backImage: null,
    chassisImage: null,
    engineImage: null,
    tyreImage: null,
    odometerImage: null,
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const formatKM = (val) => Number(val).toLocaleString('en-IN') + ' km';

  // Pick image for a specific slot
  const pickImage = async (slotKey) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setImages(prev => ({ ...prev, [slotKey]: result.assets[0].uri }));
      }
    } catch (err) {
      console.log('Image Picker Error:', err);
      showToast('Failed to open gallery. Please try again.');
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!rcNumber) { showToast('RC Number not found'); return; }

    // At least front image required
    if (!images.frontImage) {
      Alert.alert('Photo Required', 'Please upload at least the front photo of your car.');
      return;
    }

    if (!pickupAddress || !pickupLatLng.latitude) {
      Alert.alert('Location Required', 'Please search and select your pickup location.');
      return;
    }

    if (!streetAndHouse.trim()) {
      Alert.alert('Address Required', 'Please enter your house number and street.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Append each image with its exact field name (matches backend)
      IMAGE_SLOTS.forEach(({ key }) => {
        if (images[key]) {
          const uri = images[key];
          const filename = uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          formData.append(key, { uri, name: filename || `${key}.jpg`, type });
        }
      });

      // Other fields
      formData.append('kmDriven', km.toString());
      formData.append('isScrateched', scratches.toString());
      formData.append('isAccident', accidents.toString());
      formData.append('isRunningCondition', isRunningCondition.toString());
      formData.append('anyMissingPart', anyMissingPart.toString());
      // Validation - location zaroori hai
      if (!pickupAddress || !pickupLatLng.latitude) {
        Alert.alert('Location Required', 'Please search and select your pickup location.');
        setLoading(false);
        return;
      }
      if (!streetAndHouse.trim()) {
        Alert.alert('Address Required', 'Please enter your house number and street.');
        setLoading(false);
        return;
      }

      formData.append('pickupAddress', pickupAddress);
      formData.append('pickupStreetAndHouse', streetAndHouse);
      formData.append('pickupLatitude', pickupLatLng.latitude.toString());
      formData.append('pickupLongitude', pickupLatLng.longitude.toString());
      if (pickupLatLng.placeId) formData.append('pickupPlaceId', pickupLatLng.placeId);

      const res = await api.put(`/api/car/car-detail-update/${rcNumber}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      if (res.data?.success) {
        showToast('Car details updated successfully!');
        navigation.navigate('PriceResult', {
          carDetail: res.data.data || carData,
          rcNumber,
          buttonText: 'pending',
        });
      } else {
        showToast(res.data?.message || 'Update failed');
      }
    } catch (error) {
      console.log('Car Update Error:', error.response?.data || error.message);
      const status = error.response?.status;
      if (status === 400) showToast(error.response?.data?.message || 'Invalid request.');
      else if (status === 404) showToast('Car not found with this RC number.');
      else if (status === 500) showToast('Server error. Please try again later.');
      else showToast('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadedCount = Object.values(images).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Car Condition" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"   // ← ye add karo
        nestedScrollEnabled={true}
      >

        {/* ── KM Driven ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KM Driven</Text>
          <Text style={styles.rangeVal}>{formatKM(km)}</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0} maximumValue={200000} step={1000}
            value={km} onValueChange={setKm}
            minimumTrackTintColor={Colors.blue500}
            maximumTrackTintColor={Colors.neutral200}
            thumbTintColor={Colors.blue500}
          />
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>0 km</Text>
            <Text style={styles.rangeLabel}>2,00,000 km</Text>
          </View>
        </View>

        {/* ── Pickup Location ── */}
        <View style={[styles.section, { zIndex: 10 }]}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          <Text style={styles.photoHint}>Search and select your area / locality</Text>

          <GooglePlacesAutocomplete
            placeholder="Search location..."
            minLength={2}
            fetchDetails={true}
            onPress={(data, details = null) => {
              // data.description = full address
              // details.geometry.location = { lat, lng }
              setPickupAddress(data.description);
              if (details?.geometry?.location) {
                setPickupLatLng({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  placeId: data.place_id,
                });
              }
            }}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: 'en',
              components: 'country:in',   // sirf India ke results
            }}
            enablePoweredByContainer={false}
            debounce={300}
            styles={{
              container: { flex: 0 },
              textInput: styles.textInput,
              listView: {
                borderWidth: 1,
                borderColor: Colors.neutral200,
                borderRadius: 8,
                marginTop: 4,
                backgroundColor: Colors.white,
              },
              row: { padding: 12, backgroundColor: Colors.white },
              description: { fontSize: 13, color: Colors.neutral900 },
              separator: { height: 1, backgroundColor: Colors.neutral100 },
            }}
            textInputProps={{
              placeholderTextColor: Colors.neutral400,
            }}
          />

          {/* Selected location confirm dikhao */}
          {pickupAddress ? (
            <View style={styles.selectedLocBox}>
              <Text style={styles.selectedLocLabel}>✓ Selected Location</Text>
              <Text style={styles.selectedLocText} numberOfLines={2}>{pickupAddress}</Text>
              {pickupLatLng.latitude && (
                <Text style={styles.selectedLocCoords}>
                  {pickupLatLng.latitude.toFixed(5)}, {pickupLatLng.longitude.toFixed(5)}
                </Text>
              )}
            </View>
          ) : null}

          {/* House number + street field */}
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>House No. & Street</Text>
          <Text style={styles.photoHint}>Exact landmark for crane to reach you</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. H-42, Gali No. 3, Near Apollo Hospital"
            placeholderTextColor={Colors.neutral400}
            value={streetAndHouse}
            onChangeText={setStreetAndHouse}
            multiline
          />
        </View>

        {/* ── Toggles ── */}
        <View style={styles.section}>
          {[
            { label: 'Scratches or Dents?', sub: 'Visible damage on the car', val: scratches, set: setScratches },
            { label: 'Major Accidents?', sub: 'Any major collision history', val: accidents, set: setAccidents },
            { label: 'Running Condition?', sub: 'Is the car currently drivable', val: isRunningCondition, set: setRunning },
            { label: 'Any Missing Parts?', sub: 'Parts removed or not installed', val: anyMissingPart, set: setMissingPart },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.toggleLabel}>{item.label}</Text>
                  <Text style={styles.toggleSub}>{item.sub}</Text>
                </View>
                <Switch
                  value={item.val}
                  onValueChange={item.set}
                  trackColor={{ false: Colors.neutral300, true: Colors.green500 }}
                  thumbColor={Colors.white}
                />
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Car Photos ── */}
        <View style={styles.section}>
          <View style={styles.photoHeader}>
            <Text style={styles.sectionTitle}>Car Photos</Text>
            <Text style={styles.photoCount}>{uploadedCount}/6 uploaded</Text>
          </View>
          <Text style={styles.photoHint}>Front photo is required. Others are optional but recommended.</Text>

          <View style={styles.imageGrid}>
            {IMAGE_SLOTS.map(slot => (
              <ImageSlot
                key={slot.key}
                label={slot.label}
                icon={slot.icon}
                uri={images[slot.key]}
                onPress={() => pickImage(slot.key)}
              />
            ))}
          </View>
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.btnPrimaryText}>
            {loading ? 'Updating...' : 'Calculate Price'}
          </Text>
          {!loading && (
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M5 12h14M12 5l7 7-7 7" stroke={Colors.white}
                strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Toast message={toastMsg} />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
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
  scroll: { padding: 20, gap: 16, paddingBottom: 80 },
  section: {
    backgroundColor: Colors.white, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    padding: 18, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.neutral900 },
  rangeVal: { fontSize: 16, fontWeight: '700', color: Colors.blue700, textAlign: 'center' },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeLabel: { fontSize: 12, color: Colors.neutral500 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: Colors.neutral700 },
  toggleSub: { fontSize: 12, color: Colors.neutral500, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.neutral100 },

  // Photo grid
  photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  photoCount: { fontSize: 12, fontWeight: '600', color: Colors.blue500 },
  photoHint: { fontSize: 12, color: Colors.neutral500, marginTop: -4 },
  imageGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'space-between',
  },

  // Each slot = 3 per row
  imageSlot: {
    width: '31%', aspectRatio: 1,
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.neutral200,
    backgroundColor: Colors.neutral50,
    alignItems: 'center', justifyContent: 'center',
  },
  slotImage: { width: '100%', height: '100%' },
  slotBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.green500,
    alignItems: 'center', justifyContent: 'center',
  },
  slotBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '700' },
  slotPlaceholder: { alignItems: 'center', gap: 4 },
  slotIcon: { fontSize: 18 },
  slotLabel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    textAlign: 'center', fontSize: 10, fontWeight: '600',
    color: Colors.white, paddingVertical: 3,
  },
  slotLabelDone: { backgroundColor: 'rgba(22,163,74,0.75)' },

  btnPrimary: {
    backgroundColor: Colors.blue500, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.blue500, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.neutral200,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.neutral900,
    backgroundColor: Colors.neutral50,
  },
  selectedLocBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    gap: 4,
  },
  selectedLocLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  selectedLocText: {
    fontSize: 13,
    color: Colors.neutral900,
    fontWeight: '500',
  },
  selectedLocCoords: {
    fontSize: 11,
    color: Colors.neutral500,
    fontFamily: 'monospace',
  },
});