import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSession, saveSession, clearSession, authenticate,
  getVisitors, getNotifications, markNotificationsRead,
  getStats, addNotification, seedDemoData
} from '../services/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setVisitors(getVisitors());
    setNotifications(getNotifications());
    setStats(getStats());
  }, []);

  useEffect(() => {
    seedDemoData();
    const session = getSession();
    if (session) setCurrentUser(session);
    refresh();
    setLoading(false);
  }, [refresh]);

  // Poll for changes (simulates real-time updates across tabs)
  useEffect(() => {
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  function login(username, password) {
    const user = authenticate(username, password);
    if (user) {
      saveSession(user);
      setCurrentUser(user);
      refresh();
      return { success: true, user };
    }
    return { success: false, message: 'Invalid username or password.' };
  }

  function logout() {
    clearSession();
    setCurrentUser(null);
  }

  function dismissNotification(id) {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
  }

  function readAllNotifications() {
    markNotificationsRead();
    setNotifications(getNotifications());
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider value={{
      currentUser,
      visitors,
      notifications,
      unreadCount,
      stats,
      loading,
      login,
      logout,
      refresh,
      dismissNotification,
      readAllNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
