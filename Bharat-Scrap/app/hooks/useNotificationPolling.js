import { useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';

export default function useNotificationPolling({ onNewNotification, interval = 5000 }) {
    console.log('useNotificationPolling initialized with interval:', interval);
  const timerRef = useRef(null);
  const isPolling = useRef(false);

  const poll = useCallback(async () => {
    if (isPolling.current) return;
    isPolling.current = true;

    try {
      const res = await api.get('/api/notification/unread');
      console.log('Polling response:', res.data);

      if (res.data?.success && res.data.notifications.length > 0) {
        const notifications = res.data.notifications;

        // Saari unread ek ek karke process karo
        for (const notif of notifications) {
          onNewNotification(notif);

          // Mark read
          await api.patch(`/api/notification/mark-read/${notif._id}`);
        }
      }
    } catch (err) {
      console.log('Polling error:', err?.message);
    } finally {
      isPolling.current = false;
    }
  }, [onNewNotification]);

  useEffect(() => {
    // Turant ek baar chalao
    poll();

    // Phir interval pe
    timerRef.current = setInterval(poll, interval);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [poll, interval]);
}