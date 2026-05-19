import { NativeModules, PermissionsAndroid, Platform, Linking } from 'react-native';
import api, { getAccessToken } from '../lib/api';

const { LocationService } = NativeModules;

const LOCATION_API_URL = `http://www.api.bharatscrapfacilities.com/api/auth/update_location`;

// ─── Permissions ──────────────────────────────────────────────────────────────

const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') return false;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message: 'This app needs access to your location',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    }
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

// ─── Battery Optimization Bypass ─────────────────────────────────────────────
// Ye ek baar user ko system setting page pe le jaata hai
// Wahan "Allow" karne se Doze mode me bhi service chalti rahegi

const requestBatteryOptimizationExemption = async () => {
  try {
    if (Platform.OS !== 'android') return;

    await Linking.sendIntent(
      'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      [{ key: 'package', value: 'com.hbsdevelopersteam.bharatscrapfacilities' }]
    );
  } catch (e) {
    // Kuch devices pe ye intent supported nahi — fallback as general battery settings
    try {
      await Linking.openSettings();
    } catch (err) {
      console.log('⚠️ Battery optimization settings open nahi hui:', err);
    }
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const startLocationTracking = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('⚠️ Location permission nahi mili');
      return false;
    }

    // Battery optimization bypass — pehli baar user se maango
    await requestBatteryOptimizationExemption();

    const token = await getAccessToken();

    LocationService.startTracking(LOCATION_API_URL, token);
    console.log('📍 Location tracking started');
    return true;
  } catch (err) {
    console.log('❌ Location tracking start error:', err);
    return false;
  }
};

export const stopLocationTracking = () => {
  try {
    LocationService.stopTracking();
    console.log('🛑 Location tracking stopped');
  } catch (err) {
    console.log('❌ Location tracking stop error:', err);
  }
};