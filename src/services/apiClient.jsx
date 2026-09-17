import axios from 'axios';
import { toast } from 'react-toastify';

export const getStoredAuthToken = () => {
  if (typeof window === 'undefined') return '';

  const candidates = [
    window.__RMS_AUTH_TOKEN,
    window.__rms_inmemory_token,
    window.localStorage.getItem('rms_token'),
    window.localStorage.getItem('rms_admin_token'),
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const apiClient = axios.create({baseURL:
   import.meta.env.VITE_API_URL || '/api', 
  timeout: 30000,
  withCredentials: true, // send cookies (use secure, HttpOnly cookies on backend when possible)
});

// Request interceptor: attach auth header from any compatible token/session key that has been used across the app
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    // Development helper: attach local session from localStorage so backend can authenticate in dev/e2e
    try {
      const rawSession = window.localStorage.getItem('rms_auth_session');
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        const sessionPayload = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
        if (sessionPayload) {
          config.headers['x-rms-session'] = sessionPayload;
        }
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: centralize error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // broadcast auth failure so UI can redirect to login
        window.dispatchEvent(new CustomEvent('rms:auth:unauthorized'));
        try { toast.warn('Session expired or unauthorized. Please log in again.'); } catch (e) {}
      } else if (status >= 500) {
        try { toast.error('Server error communicating with backend.'); } catch (e) {}
      }
    } else {
      // Network or CORS error
      try { toast.warn('Network error: unable to reach backend.'); } catch (e) {}
    }
    return Promise.reject(error);
  }
);

export default apiClient;
