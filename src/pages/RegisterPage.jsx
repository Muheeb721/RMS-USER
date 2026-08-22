import { useState } from 'react';
import { Card, Form, Input, Button, Select } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, addNotification } from '../redux/store';
import { createLoginNotification, createSignupNotification, saveSessionUser } from '../services/notificationService.jsx';
import { sanitizeFullName, fullNameRule } from '../utils/nameValidation.jsx';
import './RegisterPage.css';

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values) => {
    setLoading(true);

    const now = new Date();
    const userName = sanitizeFullName(values.fullName) || values.email?.split('@')[0].replace(/[._-]/g, ' ').trim() || 'RMS User';
    const user = saveSessionUser({
      name: userName,
      email: values.email.trim(),
      role: values.role || 'resident',
      isLoggedIn: true,
      loginDate: now.toLocaleDateString('en-PK'),
      loginTime: now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
    });

    dispatch(login(user));
    dispatch(addNotification(createLoginNotification(user)));
    dispatch(addNotification(createSignupNotification(user)));
    form.resetFields();
    setLoading(false);
    toast.success(`Welcome to RMS, ${user.name}!`);
    navigate('/');
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">Join RMS to discover Lahore properties and hostels.</p>
        <Form form={form} layout="vertical" className="auth-form" onFinish={handleSubmit}>
          <Form.Item label="Full Name" name="fullName" rules={[fullNameRule('Full Name')]} getValueFromEvent={(event) => sanitizeFullName(event.target.value)}>
            <Input placeholder="Ahmed Khan" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}>
            <Input placeholder="you@example.com" />
          </Form.Item>
          <Form.Item label="Role" name="role" initialValue="resident">
            <Select>
              <Select.Option value="resident">Resident</Select.Option>
              <Select.Option value="owner">Owner</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Create Account
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default RegisterPage;
