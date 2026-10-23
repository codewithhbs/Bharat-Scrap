import { NativeModules, PermissionsAndroid, Platform, Linking } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessToken } from '../lib/api';

const { LocationService } = NativeModules; // Android native module (plugins/withLocationService)

const LOCATION_API_URL = `https://www.api.bharatscrapfacilities.com/api/auth/update_location`;

// iOS background task (expo-location + task-manager)
export const IOS_LOCATION_TASK = 'BSF_IOS_LOCATION_TASK';
export const LOC_TOKEN_KEY = '@bsf_loc_token';

// ─── iOS: background task — top-level define zaroori (index.js me import hota hai) ───
if (Platform.OS === 'ios') {
  TaskManager.defineTask(IOS_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
      console.log('❌ iOS location task error:', error.message);
      return;
    }
    const loc = data?.locations?.[data.locations.length - 1];
    if (!loc) return;
    try {
      // AsyncStorage: locked phone pe bhi readable (SecureStore keychain nahi hota)
      const token = (await AsyncStorage.getItem(LOC_TOKEN_KEY)) || '';
      await fetch(LOCATION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          timestamp: new Date(loc.timestamp || Date.now()).toISOString(),
          accuracy: loc.coords.accuracy,
          speed: loc.coords.speed,
          bearing: loc.coords.heading,
        }),
      });
    } catch (e) {
      console.log('❌ iOS location POST failed:', e.message);
    }
  });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

const requestAndroidLocationPermission = async () => {
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
const requestAndroidNotificationPermission = async () => {
  if (Platform.Version < 33) return true;
  try {
    const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return res === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

const requestIosLocationPermission = async () => {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return false;
  // "Always" — na mile to bhi app open/background (blue bar) me tracking chalegi
  try { await Location.requestBackgroundPermissionsAsync(); } catch {}
  return true;
};

// ─── Battery Optimization (Android) ──────────────────────────────────────────

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

// ─── iOS start/stop ───────────────────────────────────────────────────────────

const startIos = async () => {
  const ok = await requestIosLocationPermission();
  if (!ok) {
    console.log('⚠️ Location permission nahi mili');
    return false;
  }
  const token = (await getAccessToken()) || '';
  await AsyncStorage.setItem(LOC_TOKEN_KEY, token);

  const started = await Location.hasStartedLocationUpdatesAsync(IOS_LOCATION_TASK).catch(() => false);
  if (started) return true;

  await Location.startLocationUpdatesAsync(IOS_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 10000,
    distanceInterval: 15,
    activityType: Location.ActivityType.AutomotiveNavigation,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
  });
  console.log('📍 iOS location tracking started');
  return true;
};

const stopIos = async () => {
  const started = await Location.hasStartedLocationUpdatesAsync(IOS_LOCATION_TASK).catch(() => false);
  if (started) await Location.stopLocationUpdatesAsync(IOS_LOCATION_TASK);
  console.log('🛑 iOS location tracking stopped');
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const startLocationTracking = async () => {
  try {
    if (Platform.OS === 'ios') return await startIos();
    if (Platform.OS !== 'android') return false;

    if (!LocationService) {
      console.log('⚠️ LocationService native module nahi mila (Expo Go? dev build / EAS build use karo)');
      return false;
    }

    const hasPermission = await requestAndroidLocationPermission();
    if (!hasPermission) {
      console.log('⚠️ Location permission nahi mili');
      return false;
    }

    await requestAndroidNotificationPermission();

    const token = (await getAccessToken()) || '';
    LocationService.startTracking(LOCATION_API_URL, token);
    console.log('📍 Location tracking started');
    return true;
  } catch (err) {
    console.log('❌ Location tracking start error:', err);
    return false;
  }
};

export const stopLocationTracking = async () => {
  try {
    if (Platform.OS === 'ios') return await stopIos();
    LocationService?.stopTracking();
    console.log('🛑 Location tracking stopped');
  } catch (err) {
    console.log('❌ Location tracking stop error:', err);
  }
};

// Token refresh hone pe background service ko naya token
export const syncLocationToken = async (token) => {
  try {
    if (Platform.OS === 'ios') await AsyncStorage.setItem(LOC_TOKEN_KEY, token || '');
    else LocationService?.updateToken(token || '');
  } catch {}
};

export const isLocationTracking = async () => {
  try {
    if (Platform.OS === 'ios') return await Location.hasStartedLocationUpdatesAsync(IOS_LOCATION_TASK);
    return (await LocationService?.isTracking()) || false;
  } catch {
    return false;
  }
};
