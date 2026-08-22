const SESSION_STORAGE_KEY = 'rms_auth_session';
const AUTH_DATA_STORAGE_KEY = 'rms_auth_data';

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
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
    window.localStorage.setItem(AUTH_DATA_STORAGE_KEY, JSON.stringify(nextUser));
  }

  return nextUser;
};

export const readSessionUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedSession) {
      return null;
    }

    return sanitizeUser(JSON.parse(storedSession));
  } catch (error) {
    console.error('Unable to read session user from storage:', error);
    return null;
  }
};

export const clearSessionUser = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_DATA_STORAGE_KEY);
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
