import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ✅ Notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function usePushNotification() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  async function registerForPushNotificationsAsync() {
    // ✅ Physical device check
    if (!Device.isDevice) {
      alert('Must use physical device for Push Notifications');
      return null;
    }

    // ✅ Permission check
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notifications!');
      return null;
    }

    // ✅ Token fetch
    // const projectId =
    //   Constants.expoConfig?.extra?.eas?.projectId ??
    //   Constants.easConfig?.projectId;

    // if (!projectId) {
    //   console.error('❌ Missing EAS project ID in app.json.');
    //   return null;
    // }

    // const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const tokenData = await Notifications.getDevicePushTokenAsync();

    // ✅ Android channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return tokenData.data; // ✅ Sirf token string return karo, pura object nahi
  }

  useEffect(() => {
    // Token register karo
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          setExpoPushToken(token);
          console.log('✅ Expo Push Token:', token);
        }
      })
      .catch(err => console.error('Token fetch error:', err));

    // Notification aane par
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('🔔 Notification received:', notification);
        setNotification(notification);
      });

    // User ne notification tap ki
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notification tapped:', response);
        // Yahan navigation logic daal sakte ho agar chahiye
      });

    // Cleanup
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return { expoPushToken, notification };
}