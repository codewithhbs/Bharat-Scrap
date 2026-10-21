import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import { Colors } from '../constants/colors';
import api from '../lib/api';
import UserHome from '../components/UserHome';
import CraneManHome from '../components/CraneManHome';
import NotificationToast from '../components/NotificationToast';
import BookingRequestModal from '../components/BookingRequestModal';
import usePushNotification from '../hooks/userPushNotification';
import { navigationRef } from '../lib/navigationRef';
import useNotificationPolling from '../hooks/useNotificationPolling';

export default function HomeScreen() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [bookingModal, setBookingModal] = useState({
    visible: false,
    data: {},
  });

  const [toast, setToast] = useState({
    visible: false,
    title: '',
    body: '',
    data: {},
  });

  // ✅ Already handled notification IDs track karo — modal dobara nahi khulega
  const handledNotificationIds = useRef(new Set());

  const { expoPushToken, notification } = usePushNotification();

  const showToast = (title, body, data = {}) => {
    setToast({ visible: true, title, body, data });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const handleNotificationNavigation = useCallback((data = {}, notificationId = null) => {
    if (!data) return;

    // ✅ Duplicate check — same notification dobara process nahi hogi
    if (notificationId) {
      if (handledNotificationIds.current.has(notificationId)) {
        console.log('⏭️ Already handled, skipping:', notificationId);
        return;
      }
      handledNotificationIds.current.add(notificationId);
    }

    if (data.screen === 'BookingRequest') {
      setBookingModal({ visible: true, data });
      setRefreshTrigger(prev => prev + 1);
      return;
    }

    if (!navigationRef.current?.isReady()) return;

    const screen = data.screen;
    if (screen) {
      const { screen: _, ...params } = data;
      navigationRef.current.navigate(screen, params);
    }
  }, []);

  // Save FCM token
  useEffect(() => {
    if (!expoPushToken) return;

    const saveToken = async () => {
      try {
        await api.post('/api/notification/save-token', { token: expoPushToken });
        console.log('✅ FCM token saved');
      } catch (err) {
        console.log('❌ Token save failed:', err?.response?.data?.message || err.message);
      }
    };

    saveToken();
  }, [expoPushToken]);

  // Foreground notifications
  useEffect(() => {
    if (!notification) return;

    const { title, body, data } = notification.notif.request.content;
    const notificationId = notification.notif.request.identifier;

    console.log('🔔 Foreground Notification:', data);

    showToast(title, body, data || {});
    setRefreshTrigger(prev => prev + 1);

    if (data?.screen === 'BookingRequest') {
      // ✅ Foreground modal ke liye bhi duplicate check
      if (!handledNotificationIds.current.has(notificationId)) {
        handledNotificationIds.current.add(notificationId);
        setBookingModal({ visible: true, data });
      }
    }
  }, [notification]);

  // Notification tapped (app background/foreground)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data || {};
      const notificationId = response.notification.request.identifier;

      console.log('👆 Notification Click:', data);

      handleNotificationNavigation(data, notificationId);
    });

    return () => subscription.remove();
  }, [handleNotificationNavigation]);

  // App cold start — last notification check
  useEffect(() => {
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (!response) return;

      const data = response.notification.request.content.data || {};
      const notificationId = response.notification.request.identifier;

      setTimeout(() => {
        handleNotificationNavigation(data, notificationId);
      }, 500);
    };

    checkInitialNotification();
  }, [handleNotificationNavigation]);

  const handleNewNotification = useCallback((notif) => {
    const { title, body, data } = notif;

    console.log('📬 Polled notification:', data);

    // Toast dikhao
    showToast(title, body, data || {});

    // Refresh karo
    setRefreshTrigger(prev => prev + 1);

    // BookingRequest modal
    if (data?.screen === 'BookingRequest') {
      if (!handledNotificationIds.current.has(notif._id)) {
        handledNotificationIds.current.add(notif._id);
        setBookingModal({ visible: true, data });
      }
    }
  }, []);

  useNotificationPolling({
    onNewNotification: handleNewNotification,
    interval: 5000,
  });

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/auth/me');
      if (res.data?.success) {
        setUser(res.data.user || {});
      }
    } catch (error) {
      console.log('User fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loaderText}>Loading...</Text>
      </SafeAreaView>
    );
  }
  
  const role = user?.role || 'user';

  return (
    <>
      {role === 'user' ? (
        <UserHome refreshTrigger={refreshTrigger} />
      ) : (
        <CraneManHome refreshTrigger={refreshTrigger} />
      )}

      <NotificationToast
        visible={toast.visible}
        title={toast.title}
        body={toast.body}
        onHide={hideToast}
        onPress={() => handleNotificationNavigation(toast.data)}
      />

      <BookingRequestModal
        visible={bookingModal.visible}
        data={bookingModal.data}
        onClose={() => setBookingModal({ visible: false, data: {} })}
        onSuccess={() => {
          setBookingModal({ visible: false, data: {} });
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
});