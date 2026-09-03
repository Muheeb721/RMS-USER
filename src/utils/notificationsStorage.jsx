import * as notificationService from '../services/notificationService.jsx';

const normalizeNotification = (it) => ({
  id: it._id || it.id || Date.now(),
  title: it.title || it.actionType || 'Notification',
  message: it.message || it.body || '',
  unread: it.isRead === true ? false : !(it.isRead === true),
  type: (it.entityType || it.actionType || 'system').toLowerCase(),
  category: it.entityType || it.actionType || 'General',
  createdAt: it.createdAt || new Date().toISOString(),
  time: it.createdAt || it.time || new Date().toISOString(),
  raw: it,
});

// Async API-backed methods
export const fetchNotifications = async () => {
  try {
    const res = await notificationService.fetchNotificationsFromServer();
    if (res && res.success) return res.data.map((d) => normalizeNotification(d.raw || d));
    return [];
  } catch (e) {
    console.error('fetchNotifications failed', e);
    return [];
  }
};

export const markAsRead = async (id) => {
  try {
    const res = await notificationService.markNotificationAsReadOnServer(id);
    return res && res.success ? res.data : null;
  } catch (e) {
    console.error('markAsRead failed', e);
    return null;
  }
};

export const markAllAsRead = async () => {
  try {
    const res = await notificationService.markAllNotificationsOnServer();
    return res && res.success;
  } catch (e) {
    console.error('markAllAsRead failed', e);
    return false;
  }
};

export const deleteNotification = async (id) => {
  try {
    const res = await notificationService.deleteNotificationOnServer(id);
    return res && res.success;
  } catch (e) {
    console.error('deleteNotification failed', e);
    return false;
  }
};

// Deprecated localStorage helpers (kept for compatibility but not source of truth)
// Deprecated localStorage helpers removed. Use API-backed notification methods in ../services/notificationService.jsx
export const readStoredNotifications = () => {
  console.warn('readStoredNotifications() removed: use fetchNotifications() from services/notificationService.jsx');
  return [];
};

export const saveStoredNotifications = () => {
  console.warn('saveStoredNotifications() removed: persist notifications via backend APIs');
};

export const addStoredNotification = async (note) => {
  try {
    const res = await notificationService.createNotificationOnServer(note);
    if (res && res.success && res.data) return res.data;
    // fallback to local in-memory creation
    const local = notificationService.createNotification(note);
    return local;
  } catch (e) {
    console.error('addStoredNotification failed', e);
    try {
      return notificationService.createNotification(note);
    } catch (err) {
      return null;
    }
  }
};
