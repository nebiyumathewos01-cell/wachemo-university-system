import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markAllNotificationsRead, markNotificationRead, deleteNotification } from '../services/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getNotifications({ limit: 20 });
      setNotifications(data.data);
      setUnread(data.unread);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetch]);

  const markRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const remove = async (id) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return { notifications, unread, loading, fetch, markRead, markAllRead, remove };
};
