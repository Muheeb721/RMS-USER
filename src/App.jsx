import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/reset.css';
import { store } from './redux/store';
import AppRoutes from './routes/AppRoutes';
import { useEffect } from 'react';
import { saveSessionUser } from './services/notificationService.jsx';
import { login } from './redux/store';
import favoriteService from './services/favoriteService';
import { setFavorites } from './redux/store';
import { PropertyProvider } from './contexts/PropertyContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const AppInner = () => {
    const dispatch = useDispatch();

    useEffect(() => {
      // hydrate in-memory session from localStorage if present (useful for dev/e2e)
      try {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem('rms_auth_session') : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            saveSessionUser(parsed);
            // also update redux store so pages relying on state.auth.user react immediately
            // dispatch login with sanitized payload
            // eslint-disable-next-line no-unused-expressions
            parsed && parsed.email && dispatch(login(parsed));
          }
        }
      } catch (e) {}

      const token = typeof window !== 'undefined' ? window.__RMS_AUTH_TOKEN || null : null;
      if (!token) return;

      (async () => {
        try {
          const favRes = await favoriteService.listFavorites();
          if (favRes && favRes.success && Array.isArray(favRes.data)) {
            const keys = favRes.data.map((f) => `property:${f.propertyId}`);
            dispatch(setFavorites(keys));
          }
        } catch (e) {
          console.warn('Favorites fetch failed on app init', e);
        }
      })();
    }, [dispatch]);

    return (
      <AuthProvider>
        <PropertyProvider>
          <BrowserRouter>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#28b463',
                  colorInfo: '#123a70',
                  borderRadius: 16,
                  fontFamily: 'Inter, Segoe UI, sans-serif',
                },
              }}
            >
              <AntApp>
                <AppRoutes />
                <ToastContainer position="top-right" />
              </AntApp>
            </ConfigProvider>
          </BrowserRouter>
        </PropertyProvider>
      </AuthProvider>
    );
  };

  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}

export default App;
