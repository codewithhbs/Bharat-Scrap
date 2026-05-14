import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
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
import usePushNotification from '../hooks/userPushNotification';
import { startLocationService, stopLocationService } from '../services/locationService';

// ✅ App.js se nahi, alag file se import — circular dependency FIX
import { navigationRef } from '../lib/navigationRef';

function handleNotificationNavigation(data = {}) {
  if (!navigationRef.current?.isReady()) return;
  const screen = data?.screen;
  if (screen) {
    const { screen: _, ...params } = data;
    navigationRef.current.navigate(screen, params);
  } else {
    navigationRef.current.navigate('MainTabs');
  }
}

export default function HomeScreen({ navigation }) {
  const [user, setUser]             = useState({});
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { expoPushToken, notification } = usePushNotification();

  const [toast, setToast] = useState({
    visible: false, title: '', body: '', data: {},
  });

  const showToast = (title, body, data = {}) =>
    setToast({ visible: true, title, body, data });

  const hideToast = () =>
    setToast(prev => ({ ...prev, visible: false }));

  // ─────────────────────────────────────────
  // Notification — CASE 1: App band thi
  // ─────────────────────────────────────────
  useEffect(() => {
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        const data = response.notification.request.content.data || {};
        setTimeout(() => handleNotificationNavigation(data), 1000);
      }
    };
    checkInitialNotification();
  }, []);

  // ─────────────────────────────────────────
  // Notification — CASE 2: App background mein
  // ─────────────────────────────────────────
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      handleNotificationNavigation(data || {});
    });
    return () => subscription.remove();
  }, []);

  // ─────────────────────────────────────────
  // Notification — CASE 3: App foreground mein
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!notification) return;
    const { title, body, data } = notification.request.content;
    showToast(title, body, data || {});
  }, [notification]);

  // ─────────────────────────────────────────
  // FCM Token save
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!expoPushToken) return;
    const saveToken = async () => {
      try {
        const res = await api.post('/api/notification/save-token', {
          token: expoPushToken,
        });
        console.log('✅ FCM Token saved:', res.data.message);
      } catch (err) {
        console.log('⚠️ Token save failed:', err?.response?.data?.message || err.message);
      }
    };
    saveToken();
  }, [expoPushToken]);

  // ─────────────────────────────────────────
  // User fetch
  // ─────────────────────────────────────────
  const handleFetchUser = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/api/auth/me');
      if (res.data?.success) setUser(res.data.user || {});
    } catch (e) {
      console.log('User fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { handleFetchUser(); }, []);

  // ─────────────────────────────────────────
  // Location service — user load hone pe start
  // ─────────────────────────────────────────
  // useEffect(() => {
  //   if (!user?._id) return;

  //   startLocationService().then(success => {
  //     if (success) console.log('📍 Location service started');
  //     else console.log('⚠️ Location service start nahi hua');
  //   });

  //   return () => {
  //     stopLocationService();
  //   };
  // }, [user?._id]);

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
      {role === 'user' ? <UserHome /> : <CraneManHome />}

      <NotificationToast
        visible={toast.visible}
        title={toast.title}
        body={toast.body}
        onHide={hideToast}
        onPress={() => handleNotificationNavigation(toast.data)}
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