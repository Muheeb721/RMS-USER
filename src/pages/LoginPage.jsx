import { useEffect, useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { FiArrowRight, FiDollarSign, FiHome, FiLock, FiMail, FiShield, FiUsers } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { login, addNotification } from '../redux/store';
import { createLoginNotification, saveSessionUser } from '../services/notificationService.jsx';
import authService from '../services/authService';
import { sanitizeFullName } from '../utils/nameValidation.jsx';
import './LoginPage.css';

const REMEMBERED_EMAIL_KEY = 'rms_remembered_email';

const resolveDashboardRoute = (role, fallback = '/') => {
  const normalizedRole = String(role || '').toLowerCase();
  return ['admin', 'owner', 'manager'].includes(normalizedRole) ? '/admin' : fallback;
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
    return target && target.startsWith('/') ? target : '/';
  })();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedEmail = window.__RMS_REMEMBERED_EMAIL || '';
    if (savedEmail) form.setFieldsValue({ email: savedEmail });
  }, [form]);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const normalizedEmail = values.email.trim();
      const normalizedPassword = typeof values.password === 'string' ? values.password : '';

      if (rememberMe && typeof window !== 'undefined') {
        window.__RMS_REMEMBERED_EMAIL = normalizedEmail;
      } else if (typeof window !== 'undefined') {
        delete window.__RMS_REMEMBERED_EMAIL;
      }

      const result = await authService.login(normalizedEmail, normalizedPassword);
      if (!result || !result.success) {
        toast.error(result?.message || 'Login failed');
        setLoading(false);
        return;
      }

      const token = result.data?.token;
      const userData = result.data?.user || {};
      if (typeof window !== 'undefined' && token) {
        window.__RMS_AUTH_TOKEN = token;
        window.__rms_inmemory_token = token;
      }

      const now = new Date();
      const sessionUser = saveSessionUser({
        name: userData.name || sanitizeFullName(normalizedEmail.split('@')[0].replace(/[._-]/g, ' ')) || 'RMS User',
        email: userData.email || normalizedEmail,
        role: userData.role || ( /admin|owner|manager/i.test(normalizedEmail) ? 'admin' : 'resident' ),
        isLoggedIn: true,
        loginDate: now.toLocaleDateString('en-PK'),
        loginTime: now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
        rememberMe,
      });

      dispatch(login(sessionUser));
      dispatch(addNotification(createLoginNotification(sessionUser)));
      form.resetFields();
      toast.success(`Welcome back, ${sessionUser.name}!`);
      const nextRoute = resolveDashboardRoute(sessionUser.role, redirectPath);
      navigate(nextRoute, { replace: true });
    } catch (error) {
      console.error('Login error', error);
      toast.error('Login failed — please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-panel auth-panel--hero">
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
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<FiMail className="auth-input-icon" />}
                placeholder="Enter your email"
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
              <Link to="/signup" className="auth-link">
                Need an account? sing up
              </Link>
            </div>

            <Button type="primary" htmlType="submit" className="auth-submit" loading={loading} size="large">
              Login <FiArrowRight />
            </Button>

            <div className="auth-divider">or continue with</div>

            <div className="auth-socials">
              <button type="button" className="auth-social-btn">
                Continue with Google
              </button>
              <button type="button" className="auth-social-btn">
                Continue with Facebook
              </button>
              {/* TODO: Integrate Google/Facebook OAuth in a future iteration. */}
            </div>
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
