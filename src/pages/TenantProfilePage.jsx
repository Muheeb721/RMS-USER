import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Input, Row, Spin, Typography } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

function TenantProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.auth?.user || {});
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const returnTo = useMemo(() => {
    const route = searchParams.get('returnTo');
    if (!route) return '/my-rent';
    try {
      const decoded = decodeURIComponent(route);
      return decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : '/my-rent';
    } catch (error) {
      return '/my-rent';
    }
  }, [searchParams]);

  const propertyId = searchParams.get('propertyId') || '';
  const propertyTitle = searchParams.get('propertyTitle') || '';
  const propertyType = searchParams.get('propertyType') || '';

  useEffect(() => {
    if (!user?.email && !user?.id) {
      const target = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
      navigate(`/login?redirect=${target}`, { replace: true });
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.request('/tenant-profiles/me');
        if (response?.success && response.data) {
          setProfile(response.data);
          form.setFieldsValue({
            fullName: response.data.fullName || user.name || '',
            email: response.data.email || user.email || '',
            phone: response.data.phone || user.phone || '',
            profileImage: response.data.profileImage || '',
            address: response.data.currentAddress || response.data.address || '',
            city: response.data.city || '',
            occupation: response.data.occupation || '',
            emergencyContact: response.data.emergencyContactName || '',
            emergencyContactNumber: response.data.emergencyContactPhone || '',
          });
        }
      } catch (err) {
        // no existing profile yet; keep empty form
      } finally {
        setLoading(false);
      }
    })();
  }, [form, navigate, user]);

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        fullName: values.fullName?.trim(),
        email: (values.email || user.email || '').trim(),
        phone: values.phone?.trim(),
        profileImage: values.profileImage?.trim() || '',
        currentAddress: values.address?.trim(),
        city: values.city?.trim(),
        occupation: values.occupation?.trim(),
        emergencyContactName: values.emergencyContact?.trim(),
        emergencyContactPhone: values.emergencyContactNumber?.trim(),
        propertyId,
        propertyName: propertyTitle,
        propertyType,
        status: 'Pending',
      };

      const response = profile
        ? await api.request(`/tenant-profiles/${profile._id || profile.id}`, {
            method: 'PUT',
            data: payload,
          })
        : await api.request('/tenant-profiles', {
            method: 'POST',
            data: payload,
          });

      if (!response || !response.success) {
        throw new Error(response?.message || 'Unable to save rental profile.');
      }

      toast.success(profile ? 'Rental profile updated.' : 'Rental profile created successfully.');
      navigate(returnTo, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to save rental profile.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="Loading rental profile..." />
      </div>
    );
  }

  return (
    <div className="page-shell" style={{ maxWidth: 1000, margin: '32px auto', padding: '0 16px' }}>
      <Card>
        <Title level={3}>{profile ? 'Update Rental Profile' : 'Create Rental Profile'}</Title>
        <Text type="secondary">
          {propertyTitle
            ? `Complete your profile to continue with ${propertyTitle}.`
            : 'Complete your tenant profile to continue with your rental application.'}
        </Text>

        {error && <Alert type="error" message={error} showIcon style={{ marginTop: 16 }} />}

        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 24 }}
          onFinish={handleSubmit}
          initialValues={{
            fullName: user.name || '',
            email: user.email || '',
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: 'Full name is required.' }]}>
                <Input placeholder="Enter your full name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Valid email is required.' }]}>
                <Input placeholder="Enter your email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Phone number is required.' }]}>
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="city" label="City" rules={[{ required: true, message: 'City is required.' }]}>
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="profileImage" label="Profile Image URL (optional)">
            <Input placeholder="https://example.com/your-photo.jpg" />
          </Form.Item>

          <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Address is required.' }]}>
            <Input placeholder="Enter your current address" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="occupation" label="Occupation" rules={[{ required: true, message: 'Occupation is required.' }]}>
                <Input placeholder="Enter occupation" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="emergencyContact" label="Emergency Contact" rules={[{ required: true, message: 'Emergency contact is required.' }]}>
                <Input placeholder="Emergency contact name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="emergencyContactNumber" label="Emergency Contact Number" rules={[{ required: true, message: 'Emergency contact number is required.' }]}>
            <Input placeholder="Emergency contact number" />
          </Form.Item>

          {propertyId && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message={`Property context: ${propertyTitle || propertyId}${propertyType ? ` (${propertyType})` : ''}`}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => navigate(returnTo, { replace: true })}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {profile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default TenantProfilePage;
