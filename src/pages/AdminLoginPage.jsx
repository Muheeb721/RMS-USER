import { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const redirectPath = (() => {
    const params = new URLSearchParams(location.search);
    const target = params.get('redirect');
    return target && target.startsWith('/') ? target : '/';
  })();

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      const data = response?.data?.data || response?.data || {};
      const token = data.token || '';
      const user = {
        id: data.user?.id || data._id || 'admin-user',
        name: data.user?.name || 'Admin User',
        email: data.user?.email || values.email,
        role: 'admin',
      };

      if (!token) {
        throw new Error('Admin login failed: no token returned');
      }

      await login({ user, token });
      toast.success('Admin access granted');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #123a70 100%)', padding: 24 }}>
      <Card style={{ width: '100%', maxWidth: 460, borderRadius: 18, padding: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', background: '#123a70', color: '#fff', fontWeight: 800, fontSize: 28 }}>R</div>
          <h2 style={{ margin: '16px 0 6px' }}>Admin Login</h2>
          <p style={{ margin: 0, color: '#667085' }}>Use your administrator account to continue.</p>
        </div>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Enter a valid email' }]}>
            <Input size="large" placeholder="admin@rms.com" />
          </Form.Item>

          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Password is required' }]}>
            <Input.Password size="large" placeholder="Enter password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} size="large" block>
            Sign in as admin
          </Button>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#123a70', fontWeight: 600 }}>Return to user login</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default AdminLoginPage;
