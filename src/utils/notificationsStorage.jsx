const STORAGE_KEY = 'rms_notifications';

const normalizeNotification = (item) => {
  const accent = item.accent || 'info';
  const iconMap = {
    warning: '💳',
    danger: '⚠️',
    success: '🏠',
    info: '🏡',
    maintenance: '🛠️',
    announcement: '📢',
  };

  return {
    ...item,
    id: item.id ?? Date.now(),
    title: item.title || 'New update',
    message: item.message || 'New notification received.',
    time: item.time || 'Just now',
    category: item.category || 'General',
    unread: item.unread ?? true,
    accent,
    featured: item.featured ?? false,
    action: item.action || 'View',
    icon: typeof item.icon === 'string' ? item.icon : iconMap[accent] || '🔔',
    details: item.details || null,
    source: item.source || null,
    recipient: item.recipient || null,
    propertyName: item.propertyName || null,
    buyer: item.buyer || null,
    amount: item.amount || null,
    dueDate: item.dueDate || null,
    saleDate: item.saleDate || null,
    notes: item.notes || null,
  };
};

export const readStoredNotifications = (fallback = []) => {
  if (typeof window === 'undefined') return fallback;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return fallback.map(normalizeNotification);

    const parsed = JSON.parse(saved);
    const stored = Array.isArray(parsed) ? parsed : [];
    const combined = [...stored, ...fallback];

    return combined
      .filter((item, index, arr) => arr.findIndex((entry) => entry.id === item.id) === index)
      .map(normalizeNotification);
  } catch (error) {
    console.error('Unable to read notifications from storage:', error);
    return fallback.map(normalizeNotification);
  }
};

export const saveStoredNotifications = (notifications) => {
  if (typeof window === 'undefined') return;

  try {
    const next = (Array.isArray(notifications) ? notifications : []).map(normalizeNotification);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('rms-notifications-updated'));
  } catch (error) {
    console.error('Unable to save notifications to storage:', error);
  }
};

export const addStoredNotification = (notification, fallback = []) => {
  const existing = readStoredNotifications(fallback);
  const next = [
    {
      id: Date.now(),
      time: 'Just now',
      unread: true,
      featured: false,
      ...notification,
    },
    ...existing,
  ];

  saveStoredNotifications(next);
  return next;
};
