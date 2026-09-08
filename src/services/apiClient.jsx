import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true, // send cookies (use secure, HttpOnly cookies on backend when possible)
});

// Request interceptor: attach auth header from in-memory token if available
apiClient.interceptors.request.use(
  (config) => {
    // If you store a non-HttpOnly token in memory, attach it here.
    // Prefer HttpOnly secure cookies so the browser sends them automatically.
    const token = window.__RMS_AUTH_TOKEN || null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Development helper: attach local session from localStorage so backend can authenticate in dev/e2e
      try {
        const sess = window.localStorage.getItem('rms_auth_session');
        if (sess) config.headers['x-rms-session'] = sess;
      } catch (e) {
        // ignore
      }
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
        // Optionally broadcast auth failure so UI can redirect to login
        window.dispatchEvent(new CustomEvent('rms:auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
