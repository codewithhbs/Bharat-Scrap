import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Circle, Line, Rect } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';   // ← Add this
import { Colors } from '../constants/colors';
import Toast from '../components/Toast';
import api from '../lib/api';

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

export default function RCInputScreen({ route, navigation }) {
  const { from } = route.params || {};

  const [rcNum, setRcNum] = useState('');
  const [plateDisplay, setPlateDisplay] = useState('MH 01 AB 1234');
  const [rcFrontImage, setRcFrontImage] = useState(null);
  const [rcBackImage, setRcBackImage] = useState(null);
  const [rcError, setRcError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const formatPlate = (val) => {
    const clean = val.replace(/\s/g, '').toUpperCase();
    const match = clean.match(/^([A-Z]{0,2})(\d{0,2})([A-Z]{0,2})(\d*)$/);
    if (match) {
      return [match[1], match[2], match[3], match[4]].filter(Boolean).join(' ');
    }
    return clean;
  };

  const handleRCChange = (val) => {
    const upper = val.toUpperCase();
    setRcNum(upper);
    setRcError('');
    const formatted = formatPlate(upper);
    setPlateDisplay(formatted || 'MH 01 AB 1234');
  };

  // 2 separate pickers
  const pickFrontImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setRcFrontImage(result.assets[0].uri);
      setRcError('');
    }
  };

  const pickBackImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setRcBackImage(result.assets[0].uri);
      setRcError('');
    }
  };

  // ==================== MAIN SUBMIT FUNCTION ====================
  const submitRC = async () => {
    if (rcNum.length < 5) {
      setRcError('Please enter a valid RC number');
      return;
    }

    if (!rcFrontImage || !rcBackImage) {
      setRcError('Please upload both RC front and back images');
      return;
    }

    setLoading(true);
    setRcError('');

    const onlyForCheck = from?.toLowerCase() === 'verifyrc';

    try {
      const formData = new FormData();

      formData.append('rcNumber', rcNum.trim().toUpperCase());
      formData.append('onlyForCheck', onlyForCheck.toString());

      // Append image
      // const uri = rcImage;
      // const filename = uri.split('/').pop();
      // const match = /\.(\w+)$/.exec(filename);
      // const type = match ? `image/${match[1]}` : 'image/jpeg';

      const appendImage = (formData, uri, fieldName) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append(fieldName, { uri, name: filename || `${fieldName}.jpg`, type });
      };

      appendImage(formData, rcFrontImage, 'rcFrontImage');  // ✅ matches backend
      appendImage(formData, rcBackImage, 'rcBackImage');

      const res = await api.post('/api/car/car-register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;

      if (data.success) {
        showToast('Car details fetched successfully!');

        navigation.navigate('CarDetails', {
          carData: data.data,
          rcNumber: rcNum,
          from,
        });
      } else {
        showToast(data.message || 'Failed to register car');
      }
    } catch (error) {
      console.log("RC Register Error:", error);

      const status = error.response?.status;
      const msg = error.response?.data?.message || 'Something went wrong. Please try again.';

      if (status === 400) {
        setRcError(msg); // RC already exists
      } else if (status === 422) {
        setRcError(msg); // No data from RC API — inline dikhao
      } else {
        showToast(msg);  // Network/server errors — toast mein
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Enter RC Number" onBack={() => navigation.goBack()} />
      <ProgressBar steps={3} currentStep={1} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Number Plate Preview */}
        <View style={styles.plate}>
          <Text style={styles.plateTop}>INDIA · भारत</Text>
          <Text style={styles.plateNum}>{plateDisplay}</Text>
        </View>

        {/* RC Input Field */}
        <View style={styles.field}>
          <Text style={styles.label}>RC Registration Number</Text>
          <View style={styles.inputWrap}>
            <View style={styles.inputIcon}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="3" width="18" height="18" rx="2" stroke={Colors.neutral500} strokeWidth={2} />
                <Path d="M3 9h18M3 15h18M9 3v18" stroke={Colors.neutral500} strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </View>
            <TextInput
              style={[styles.input, rcError ? styles.inputError : null]}
              placeholder="e.g. MH01AB1234"
              placeholderTextColor={Colors.neutral400}
              autoCapitalize="characters"
              value={rcNum}
              onChangeText={handleRCChange}
              maxLength={11}
            />
          </View>
        </View>

        {/* RC Front Image */}
        <View style={styles.field}>
          <Text style={styles.label}>RC Front Side Photo</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickFrontImage}>
            {rcFrontImage ? (
              <Image source={{ uri: rcFrontImage }} style={styles.uploadedImage} resizeMode="contain" />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                  <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                    stroke={Colors.neutral400} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.uploadText}>Tap to upload Front Side</Text>
                <Text style={styles.uploadSubtext}>RC card front photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* RC Back Image */}
        <View style={styles.field}>
          <Text style={styles.label}>RC Back Side Photo</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickBackImage}>
            {rcBackImage ? (
              <Image source={{ uri: rcBackImage }} style={styles.uploadedImage} resizeMode="contain" />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                  <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                    stroke={Colors.neutral400} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.uploadText}>Tap to upload Back Side</Text>
                <Text style={styles.uploadSubtext}>RC card back photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {!!rcError && (
          <View style={styles.errorBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke={Colors.error} strokeWidth={2} />
              <Line x1="12" y1="8" x2="12" y2="12" stroke={Colors.error} strokeWidth={2} strokeLinecap="round" />
              <Line x1="12" y1="16" x2="12.01" y2="16" stroke={Colors.error} strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={styles.errorText}>{rcError}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={submitRC}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx="11" cy="11" r="8" stroke={Colors.white} strokeWidth={2} />
                <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={Colors.white} strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <Text style={styles.btnPrimaryText}>Get Car Details</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Toast message={toastMsg} />
    </SafeAreaView>
  );
}

// ==================== UPDATED STYLES ====================
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

  scroll: { padding: 20, gap: 20, paddingBottom: 40 },

  plate: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.neutral900,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  plateTop: { fontSize: 10, fontWeight: '700', color: Colors.blue700, letterSpacing: 2, marginBottom: 4 },
  plateNum: { fontSize: 28, fontWeight: '900', color: Colors.neutral900, letterSpacing: 3 },

  field: { gap: 8 },

  label: { fontSize: 13, fontWeight: '500', color: Colors.neutral700 },

  inputWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  input: {
    backgroundColor: Colors.neutral50,
    borderWidth: 1.5,
    borderColor: Colors.neutral200,
    borderRadius: 14,
    paddingLeft: 46,
    paddingRight: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.neutral900,
    letterSpacing: 1,
  },
  inputError: { borderColor: Colors.error },

  // New Upload Styles
  uploadBox: {
    height: 200,
    backgroundColor: Colors.neutral50,
    borderWidth: 1.5,
    borderColor: Colors.neutral200,
    borderRadius: 14,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral700,
  },
  uploadSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.neutral500,
    textAlign: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
    borderRadius: 8,
    padding: 10,
  },
  errorText: { fontSize: 13, color: Colors.error, fontWeight: '500', flex: 1 },

  btnPrimary: {
    backgroundColor: Colors.blue500,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.blue500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});