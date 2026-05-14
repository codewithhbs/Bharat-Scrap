import { NativeModules } from 'react-native';

const { LocationService } = NativeModules;
console.log('LocationService', LocationService);
/**
 * Start GPS tracking foreground service.
 * @param {string} apiUrl  - Full URL to POST location data to
 * @param {string} token   - Bearer token (pass '' if not needed)
 */
export const startLocationTracking = (apiUrl, token = '') => {
  LocationService.startTracking(apiUrl, token);
};

/**
 * Stop GPS tracking.
 */
export const stopLocationTracking = () => {
  LocationService.stopTracking();
};

/**
 * Update API URL / token on the fly (no restart needed).
 */
export const updateLocationConfig = (apiUrl, token = '') => {
  LocationService.updateConfig(apiUrl, token);
};