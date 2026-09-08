const SESSION_STORAGE_KEY = '__rms_inmemory_session';
const AUTH_DATA_STORAGE_KEY = '__rms_inmemory_auth';

const formatDate = (value = new Date()) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (value = new Date()) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const sanitizeUser = (user = {}) => {
  const email = typeof user.email === 'string' ? user.email.trim() : '';
  const rawName = typeof user.name === 'string' ? user.name.trim() : '';
  const fallbackName = email ? email.split('@')[0] : 'RMS User';
  const now = new Date();

  return {
    name: rawName || fallbackName,
    email,
    role: user.role || 'user',
    isLoggedIn: Boolean(user.isLoggedIn),
    loginDate: user.loginDate || formatDate(now),
    loginTime: user.loginTime || formatTime(now),
  };
};

export const saveSessionUser = (user) => {
  const nextUser = sanitizeUser(user);
  if (typeof window !== 'undefined') {
    // store in-memory only to avoid persisting sensitive data in localStorage
    window[SESSION_STORAGE_KEY] = nextUser;
    window[AUTH_DATA_STORAGE_KEY] = nextUser;
  }
  return nextUser;
};

export const readSessionUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window[SESSION_STORAGE_KEY] || null;
    if (stored) return sanitizeUser(stored);
    // fallback to localStorage persisted session
    try {
      const raw = window.localStorage.getItem('rms_auth_session');
      if (raw) return sanitizeUser(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
    return null;
  } catch (error) {
    console.error('Unable to read session user from memory:', error);
    return null;
  }
};

export const clearSessionUser = () => {
  if (typeof window !== 'undefined') {
    delete window[SESSION_STORAGE_KEY];
    delete window[AUTH_DATA_STORAGE_KEY];
  }
};

export const createNotification = ({ type, title, message, userName, email, createdAt = new Date().toISOString() }) => {
  const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const typeMeta = {
    login: {
      label: 'User Login',
      icon: '🔐',
      accent: 'success',
      category: 'Security',
    },
    signup: {
      label: 'Account Signup',
      icon: '✨',
      accent: 'info',
      category: 'Account',
    },
    contact: {
      label: 'Contact Form',
      icon: '📩',
      accent: 'info',
      category: 'Property',
    },
    forgot_password: {
      label: 'Password Reset Request',
      icon: '🔑',
      accent: 'warning',
      category: 'Security',
    },
  };

  const meta = typeMeta[type] || typeMeta.login;
  const formattedTime = createdDate.toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    message,
    unread: true,
    type,
    typeLabel: meta.label,
    icon: meta.icon,
    accent: meta.accent,
    category: meta.category,
    userName: userName || 'RMS Admin',
    email: email || null,
    createdAt: createdDate.toISOString(),
    time: formattedTime,
  };
};

import apiClient from './apiClient';

export const fetchNotificationsFromServer = async () => {
  try {
    const response = await apiClient.get('/notifications');
    const json = response.data || { data: [] };
    const items = Array.isArray(json.data) ? json.data : [];
    const mapped = items.map((it) => {
      const createdAt = it.createdAt || new Date().toISOString();
      const date = new Date(createdAt);
      const time = date.toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const typeKey = (it.entityType || it.actionType || 'system').toLowerCase();
      const accentMap = { rent: 'warning', payment: 'warning', booking: 'info', property: 'success', maintenance: 'maintenance', announcement: 'announcement', contact: 'info', user: 'info' };
      const iconMap = { warning: '💳', danger: '⚠️', success: '🏠', info: '🏡', maintenance: '🛠️', announcement: '📢' };
      const accent = accentMap[typeKey] || 'info';

      return {
        id: it._id || it.id,
        title: it.title || it.actionType || 'Notification',
        message: it.message || it.body || '',
        unread: it.isRead === true ? false : true,
        type: typeKey,
        category: (it.entityType || it.actionType || 'General'),
        createdAt,
        time,
        accent,
        icon: iconMap[accent] || '🔔',
        actorType: it.actorType,
        actorName: it.actorName,
        status: it.status,
        raw: it,
      };
    });

    return { success: true, data: mapped };
  } catch (error) {
    console.warn('Unable to fetch notifications from server:', error);
    return { success: false, data: [] };
  }
};

export const markNotificationAsReadOnServer = async (id) => {
  try {
    const res = await apiClient.post(`/notifications/${id}/read`);
    const it = res?.data?.data || null;
    const mapped = it ? {
      id: it._id || it.id,
      title: it.title,
      message: it.message,
      unread: it.isRead === true ? false : true,
      type: (it.entityType || it.actionType || 'system').toLowerCase(),
      createdAt: it.createdAt,
      raw: it,
    } : null;
    return { success: true, data: mapped };
  } catch (error) {
    console.warn('Mark notification read failed:', error);
    return { success: false };
  }
};

export const getUnreadCountFromServer = async () => {
  try {
    const res = await apiClient.get('/notifications/count');
    return { success: true, data: res.data.data || { count: 0 } };
  } catch (error) {
    console.warn('Get unread count failed:', error);
    return { success: false, data: { count: 0 } };
  }
};

export const markAllNotificationsOnServer = async () => {
  try {
    await apiClient.post('/notifications/mark-all-read');
    return { success: true };
  } catch (error) {
    console.warn('Mark all notifications read failed:', error);
    return { success: false };
  }
};

export const deleteNotificationOnServer = async (id) => {
  try {
    await apiClient.delete(`/notifications/${id}`);
    return { success: true };
  } catch (error) {
    console.warn('Delete notification failed:', error);
    return { success: false };
  }
};

export const createNotificationOnServer = async (payload = {}) => {
  try {
    const sessionUser = readSessionUser();
    const normalized = { ...payload };
    const userId = normalized.userId || sessionUser?.id || sessionUser?.email || null;
    if (userId) normalized.userId = userId;
    if (!normalized.userId) {
      console.warn('Notification create skipped: userId unavailable for server-backed notification.');
      return { success: false, message: 'userId required' };
    }

    const res = await apiClient.post('/notifications/create', normalized);
    const it = res?.data?.data || null;
    return { success: true, data: it };
  } catch (error) {
    console.warn('Create notification on server failed:', error);
    return { success: false, message: error?.response?.data?.message || 'Unable to create notification.' };
  }
};

export const createLoginNotification = (user) =>
  createNotification({
    type: 'login',
    title: 'User Login',
    message: `${user.name} has logged into RMS successfully.`,
    userName: user.name,
    email: user.email,
  });

export const createSignupNotification = (user) =>
  createNotification({
    type: 'signup',
    title: 'New Account Created',
    message: `${user.name} created a new RMS account successfully.`,
    userName: user.name,
    email: user.email,
  });

export const createContactNotification = ({ fullName, inquiryType, property, message, email }) =>
  createNotification({
    type: 'contact',
    title: 'Contact Form Submitted',
    message: `${fullName || 'A user'} submitted a ${inquiryType || 'property'} inquiry${property ? ` for ${property}` : ''}. ${message || 'Our team will follow up shortly.'}`,
    userName: fullName || 'RMS Visitor',
    email: email || null,
  });

export const createForgotPasswordNotification = (user) =>
  createNotification({
    type: 'forgot_password',
    title: 'Password Reset Request',
    message: `${user.name} requested a password reset.`,
    userName: user.name,
    email: user.email,
  });
