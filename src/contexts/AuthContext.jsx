import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

// in-memory keys - do NOT persist sensitive tokens in localStorage
const TOKEN_KEY = '__rms_inmemory_token';
const USER_KEY = '__rms_inmemory_user';

const normalizeRole = (value) => (typeof value === 'string' ? value.toLowerCase() : 'user');

const readStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window[USER_KEY] || null;
    return saved && typeof saved === 'object' ? saved : null;
  } catch (error) {
    console.warn('Unable to read stored user from memory', error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window[TOKEN_KEY] || '';
  });

  const [user, setUser] = useState(() => readStoredUser() || {
    id: '',
    name: '',
    email: '',
    role: 'user',
    isLoggedIn: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (token) window[TOKEN_KEY] = token; else delete window[TOKEN_KEY];
    // also expose __RMS_AUTH_TOKEN for apiClient interceptor
    if (token) window.__RMS_AUTH_TOKEN = token; else delete window.__RMS_AUTH_TOKEN;
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user && user.isLoggedIn) window[USER_KEY] = user; else delete window[USER_KEY];
  }, [user]);

  const login = async ({ user: userData, token: authToken }) => {
    const normalizedUser = {
      ...userData,
      role: normalizeRole(userData?.role || 'user'),
      isLoggedIn: true,
    };

    setUser(normalizedUser);
    setToken(authToken || token || '');
    return normalizedUser;
  };

  const logout = () => {
    setUser({
      id: '',
      name: '',
      email: '',
      role: 'user',
      isLoggedIn: false,
    });
    setToken('');
  };

  const isAuthenticated = Boolean(token || user?.isLoggedIn);
  const isAdmin = ['admin', 'owner', 'manager'].includes(normalizeRole(user?.role));

  const value = useMemo(
    () => ({
      token,
      user,
      setUser,
      setToken,
      login,
      logout,
      isAuthenticated,
      isAdmin,
    }),
    [token, user, isAuthenticated, isAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
