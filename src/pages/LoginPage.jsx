import { useEffect, useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { FiArrowRight, FiDollarSign, FiHome, FiLock, FiMail, FiShield, FiUsers } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { login, addNotification } from '../redux/store';
import { createLoginNotification, saveSessionUser } from '../services/notificationService.jsx';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeFullName } from '../utils/nameValidation.jsx';
import { resolveCatalogPageImage } from '../utils/propertyImageCatalog';
import authRedirect from '../utils/authRedirect';
import './LoginPage.css';

const REMEMBERED_EMAIL_KEY = 'rms_remembered_email';

const resolveDashboardRoute = (role, fallback = '/') => {
  const normalizedRole = String(role || '').toLowerCase();
  return ['admin', 'owner', 'manager'].includes(normalizedRole) ? '/admin' : fallback;
};

const getSafeRedirect = (value, fallback = '/') => {
  if (!value || typeof value !== 'string') return fallback;
  try {
    const decoded = decodeURIComponent(value);
    return decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : fallback;
  } catch {
    return fallback;
  }
};

const featureHighlights = [
  {
    icon: FiHome,
    title: 'Manage Properties',
    description: 'Add, edit and manage properties easily.',
  },
  {
    icon: FiUsers,
    title: 'Manage Tenants',
    description: 'View tenants, leases and tenant information.',
  },
  {
    icon: FiDollarSign,
    title: 'Track Payments',
    description: 'Track rent, payments and financial reports.',
  },
];

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const redirectPath = (() => {
    const params = new URLSearchParams(location.search);
    const target = params.get('redirect');
    if (!target) return '/';

    return getSafeRedirect(target);
  })();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedEmail =
      window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ||
      window.__RMS_REMEMBERED_EMAIL ||
      '';

    if (savedEmail) {
      form.setFieldsValue({ email: savedEmail });
      setRememberMe(true);
    }

    const currentToken = window.__RMS_AUTH_TOKEN || window.__rms_inmemory_token || '';
    const persistedSessionRaw = window.localStorage.getItem('rms_auth_session');
    const hasSession = Boolean(currentToken || persistedSessionRaw);

    // If there is a persisted session, validate it with the backend before redirecting.
    if (hasSession) {
      (async () => {
        try {
          const meRes = await authService.me();
            const ok = Boolean(meRes && (meRes.success || meRes.data));
          if (ok) {
            const userData = meRes.data || {};
            const pendingAction = authRedirect.consumePendingAction();
            const pendingRoute = pendingAction?.returnRoute || '';
            const requestedRoute = getSafeRedirect(
              pendingRoute || (redirectPath !== '/' ? redirectPath : ''),
              '',
            );
            const fallbackRoute = resolveDashboardRoute(
              window.localStorage.getItem('rms_user_role') || userData.role || 'resident',
              '/dashboard',
            );
            navigate(requestedRoute || fallbackRoute, { replace: true });
            return;
          }
        } catch (err) {
            console.warn('Session validation failed', err);
            try { toast.warn('Existing session invalid — please log in.'); } catch (e) {}
        }

        // session invalid or validation failed: clear persisted traces so login page stays
        try {
          window.localStorage.removeItem('rms_auth_session');
          window.localStorage.removeItem('rms_token');
          window.localStorage.removeItem('rms_user_role');
          delete window.__RMS_AUTH_TOKEN;
          delete window.__rms_inmemory_token;
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [form, navigate]);

  const { login: authLogin } = useAuth();
  const loginHeroImage = resolveCatalogPageImage('Login Page', 'Hero', 0, 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80');

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const normalizedEmail = values.email.trim();
      const normalizedPassword = typeof values.password === 'string' ? values.password : '';

      if (typeof window !== 'undefined') {
        if (rememberMe && normalizedEmail) {
          window.__RMS_REMEMBERED_EMAIL = normalizedEmail;
          window.localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail);
        } else {
          delete window.__RMS_REMEMBERED_EMAIL;
          window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      }


      const result = await authService.login(normalizedEmail, normalizedPassword);
      console.log('auth result', result);

      // Support multiple possible response shapes from backend, for example:
      // { success: true, data: { token, user } }
      // { data: { success: true, token, user } }
      // { data: { result: { success: true, token, user } } }
      const success = Boolean(
        result?.success ?? result?.data?.success ?? result?.data?.result?.success
      );

      const message = result?.message ?? result?.data?.message ?? 'Login failed';

      if (!result || !success) {
        const finalMessage = String(message || '').toLowerCase();
        if (finalMessage.includes('email') || finalMessage.includes('valid email')) {
          toast.error('Email is incorrect. Please check your email address.');
        } else if (finalMessage.includes('password')) {
          toast.error('Password is incorrect. Please try again.');
        } else {
          toast.error(message || 'Login failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      // Normalize where token/user may live
      const data = result?.data ?? {};
      const inner = data?.result ?? data;
      const token = inner?.token ?? data?.token ?? result?.token;
      const userData = inner?.user ?? data?.user ?? result?.user ?? {};

      if (!token) {
        toast.error('Login failed: no token returned from server.');
        setLoading(false);
        return;
      }

      // Normalize session user and register in AuthContext
      const now = new Date();
      const sessionUser = saveSessionUser({
        id: userData.id || userData._id || userData.userId || '',
        name: userData.name || sanitizeFullName(normalizedEmail.split('@')[0].replace(/[._-]/g, ' ')) || 'RMS User',
        email: userData.email || normalizedEmail,
        role: userData.role || (/admin|owner|manager/i.test(normalizedEmail) ? 'admin' : 'resident'),
        isLoggedIn: true,
        loginDate: now.toLocaleDateString('en-PK'),
        loginTime: now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
        rememberMe,
      });

      // Use AuthContext to set user and token (this will also expose window keys used by apiClient)
      await authLogin({ user: sessionUser, token });

      // Persist minimal session data so refresh keeps the user logged in (used by app init and e2e)
      if (typeof window !== 'undefined') {
        try {
          window.__RMS_AUTH_TOKEN = token;
          window.__rms_inmemory_token = token;
          const json = JSON.stringify(sessionUser || {});
          window.localStorage.setItem('rms_auth_session', json);
          // persist token for refresh continuity
          window.localStorage.setItem('rms_token', token);
          window.localStorage.setItem('rms_user_role', sessionUser.role || 'resident');
          window.localStorage.setItem('rms_admin_auth', sessionUser.role === 'admin' ? 'true' : 'false');
        } catch (e) {
          // ignore storage errors
        }
      }

      // also update redux store for UI that reads from Redux
      dispatch(login(sessionUser));
      dispatch(addNotification(createLoginNotification(sessionUser)));
      form.resetFields();
      toast.success(`Welcome back, ${sessionUser.name}!`);
      const pendingAction = authRedirect.consumePendingAction();
      const pendingRoute = getSafeRedirect(pendingAction?.returnRoute || '', '');
      const resolvedRedirect = redirectPath && redirectPath !== '/login' && redirectPath !== '/signup' && redirectPath !== '/register'
        ? getSafeRedirect(redirectPath, '/')
        : resolveDashboardRoute(sessionUser.role, '/dashboard');
      const finalRedirect = pendingRoute || resolvedRedirect;

      navigate(finalRedirect, { replace: true });
    } catch (error) {
      console.error('Login error', error);
      toast.error('Login failed — please check your credentials or try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section
        className="auth-panel auth-panel--hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(4, 18, 37, 0.92) 0%, rgba(10, 38, 69, 0.86) 100%), url(${loginHeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="auth-brand">
          <div className="auth-brand__mark">R</div>
          <span>RMS</span>
        </div>

        <div className="auth-hero__content">
          <p className="eyebrow">Welcome Back!</p>
          <h1>Glad to see you again</h1>
          <p className="hero-copy">
            Login to your account and continue managing properties, tenants, payments and more.
          </p>

          <div className="feature-list">
            {featureHighlights.map((feature) => {
              const Icon = feature.icon;
              return (
                <div className="feature-item" key={feature.title}>
                  <div className="feature-item__icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="security-card">
            <h3>Secure. Reliable. Simple.</h3>
            <p>Your data is safe with us.</p>
          </div>
        </div>
      </section>

      <section className="auth-panel auth-panel--form">
        <div className="auth-card">
          <div className="auth-card__header">
            <h2>Login to RMS</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          <Form form={form} layout="vertical" className="auth-form" onFinish={handleSubmit}>
            <Form.Item
                label="Email or Username"
              name="email"
              rules={[
                  {
                    required: true,
                    message: 'Please enter your email or username',
                  },
                  {
                    validator: (_, value) => {
                      const cleaned = String(value || '').trim();
                      if (!cleaned) {
                        return Promise.reject(new Error('Please enter your email or username'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  prefix={<FiMail className="auth-input-icon" />}
                  placeholder="Enter your email or username"
                  size="large"
                />
              </Form.Item>

            <Form.Item
              label={
                <span className="auth-label-row">
                  <span>Password</span>
                  <Link to="/forgot-password" className="auth-link auth-link--inline">
                    Forgot Password?
                  </Link>
                </span>
              }
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<FiLock className="auth-input-icon" />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            <div className="auth-options">
              <Checkbox checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)}>
                Remember Me
              </Checkbox>
              <Link
                to={redirectPath && redirectPath !== '/'
                  ? `/signup?redirect=${encodeURIComponent(redirectPath)}`
                  : '/signup'}
                className="auth-link"
              >
                Need an account? Sign up
              </Link>
            </div>

            <Button type="primary" htmlType="submit" className="auth-submit" loading={loading} size="large">
              Login <FiArrowRight />
            </Button>
          </Form>

          <div className="auth-footer">
            <FiShield size={16} />
            <span>Protected by RMS Security</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
