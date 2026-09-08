import { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, addNotification } from '../../redux/store';
import { createLoginNotification, saveSessionUser } from '../../services/notificationService.jsx';
import { addStoredNotification } from '../../utils/notificationsStorage.jsx';
import { sanitizeFullName, fullNameRule } from '../../utils/nameValidation.jsx';

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values) => {
    setLoading(true);

    const now = new Date();
    const userName = sanitizeFullName(values.name) || values.email?.split('@')[0].replace(/[._-]/g, ' ').trim() || 'RMS User';
    const user = saveSessionUser({
      name: userName,
      email: values.email.trim(),
      role: 'user',
      isLoggedIn: true,
      loginDate: now.toLocaleDateString('en-PK'),
      loginTime: now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
    });

    dispatch(login(user));
    const note = createLoginNotification(user);
    dispatch(addNotification(note));
    // persist notification to backend when possible
    try { addStoredNotification(note); } catch (e) { /* ignore */ }
    form.resetFields();
    setLoading(false);
    toast.success(`Welcome back, ${user.name}!`);
    navigate('/dashboard');
  };

  return (
    <Form form={form} layout="vertical" className="auth-form" onFinish={handleSubmit}>
      <Form.Item label="Name" name="name" rules={[fullNameRule('Name')]} getValueFromEvent={(event) => sanitizeFullName(event.target.value)}>
        <Input placeholder="Ahmed Khan" />
      </Form.Item>
      <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }] }>
        <Input placeholder="you@example.com" />
      </Form.Item>
      <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }] }>
        <Input.Password placeholder="Enter password" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={loading}>
        Login
      </Button>
    </Form>
  );
}

export default LoginForm;
