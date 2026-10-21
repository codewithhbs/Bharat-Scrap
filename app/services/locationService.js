import { NativeModules, PermissionsAndroid, Platform, Linking } from 'react-native';
import { getAccessToken } from '../lib/api';

const { LocationService } = NativeModules;

const LOCATION_API_URL = `https://www.api.bharatscrapfacilities.com/api/auth/update_location`;

// ─── Permissions ──────────────────────────────────────────────────────────────

const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') return false;

  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message: 'This app needs access to your location',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    }
  );

  return fine === PermissionsAndroid.RESULTS.GRANTED;
};

// Android 13+ : foreground service notification dikhane ke liye
const requestNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;
  try {
    const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return res === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

// ─── Battery Optimization Bypass ─────────────────────────────────────────────

export const requestBatteryOptimizationExemption = async () => {
  try {
    if (Platform.OS !== 'android') return;
    await Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
  } catch (e) {
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
    if (!LocationService) {
      console.log('⚠️ LocationService native module nahi mila (Expo Go? dev build / EAS build use karo)');
      return false;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('⚠️ Location permission nahi mili');
      return false;
    }

    await requestNotificationPermission();

    const token = (await getAccessToken()) || '';

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
    LocationService?.stopTracking();
    console.log('🛑 Location tracking stopped');
  } catch (err) {
    console.log('❌ Location tracking stop error:', err);
  }
};

// Token refresh hone pe native service ko naya token
export const syncLocationToken = (token) => {
  try {
    LocationService?.updateToken(token || '');
  } catch {}
};

export const isLocationTracking = async () => {
  try {
    return (await LocationService?.isTracking()) || false;
  } catch {
    return false;
  }
};
