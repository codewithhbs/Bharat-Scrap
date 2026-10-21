import { NativeModules } from 'react-native';

const { LocationService } = NativeModules;

export const startLocationTracking = (apiUrl, token = '') => {
  LocationService?.startTracking(apiUrl, token);
};

export const stopLocationTracking = () => {
  LocationService?.stopTracking();
};

export const updateLocationConfig = (apiUrl, token = '') => {
  LocationService?.updateConfig(apiUrl, token);
};
