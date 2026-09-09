import { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, InputNumber, Row, Col, Button, Checkbox, Card, Modal, Typography } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import bookingService from '../services/bookingService';
import propertyService from '../services/propertyService';
import selectedPropertyStorage from '../utils/selectedPropertyStorage.jsx';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

function RentalApplicationPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((s) => s.auth?.user || {});
  const [property, setProperty] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // try selectedProperty from profile
      const sp = await selectedPropertyStorage.readSelectedProperty().catch(() => null);
      if (mounted && sp) {
        setProperty(sp);
        form.setFieldsValue({ propertyTitle: sp.title, propertyId: sp.id || sp._id, propertyType: sp.type || sp.propertyType, rent: sp.rent || sp.price || 0 });
        return;
      }

      const propId = searchParams.get('propertyId');
      if (propId) {
        try {
          const res = await propertyService.getPropertyById(propId);
          if (res && res.success && res.data) {
            const p = res.data;
            setProperty(p);
            form.setFieldsValue({ propertyTitle: p.title, propertyId: p._id || p.id, propertyType: p.propertyType || p.type, rent: p.rent || p.price || 0 });
          }
        } catch (e) {
          console.warn('Unable to load property', e);
        }
      }
    })();
    return () => { mounted = false; };
  }, [searchParams]);

  useEffect(() => {
    form.setFieldsValue({ fullName: user.name || '', email: user.email || '' });
  }, [user]);

  const isPurchase = (prop) => {
    if (!prop) return false;
    const tx = String(prop.transactionType || prop.purpose || '').toLowerCase();
    if (tx.includes('sale') || tx.includes('buy') || tx.includes('purchase')) return true;
    if (prop.salePrice || prop.saleAmount) return true;
    if (prop.price && !prop.rent) return true;
    return false;
  };

  const handleReset = () => {
    form.resetFields();
    setSuccessData(null);
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      if (!values.termsAccepted) {
        toast.error('You must accept the terms and conditions to submit.');
        setSubmitting(false);
        return;
      }

      const payload = {
        // user info
        userId: user.id || user.email || null,
        userName: values.fullName,
        userEmail: values.email,
        userPhone: values.phone,
        // property
        propertyId: values.propertyId || (property && (property._id || property.id)),
        propertyTitle: values.propertyTitle || (property && property.title),
        propertyType: values.propertyType || (property && (property.propertyType || property.type)),
        rent: Number(values.rent || 0),
        rentFrequency: values.rentFrequency || 'Monthly',
        // personal
        cnic: values.cnic || '',
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
        nationality: values.nationality || '',
        // address
        addressLine1: values.addressLine1 || '',
        addressLine2: values.addressLine2 || '',
        city: values.city || '',
        province: values.province || '',
        country: values.country || '',
        // employment
        employmentStatus: values.employmentStatus || '',
        companyName: values.companyName || '',
        jobTitle: values.jobTitle || '',
        monthlyIncome: Number(values.monthlyIncome || 0),
        workAddress: values.workAddress || '',
        yearsExperience: Number(values.yearsExperience || 0),
        // rental
        reasonForRent: values.reasonForRent || '',
        occupants: Number(values.occupants || 1),
        preferredMoveInDate: values.preferredMoveInDate ? values.preferredMoveInDate.toISOString() : null,
        rentalDuration: values.rentalDuration || '',
        message: values.additionalComments || '',
        // references
        previousLandlordName: values.previousLandlordName || '',
        previousLandlordPhone: values.previousLandlordPhone || '',
        previousLandlordRelationship: values.previousLandlordRelationship || '',
        // terms
        termsAccepted: !!values.termsAccepted,
      };

      const res = await bookingService.createBooking(payload);
      if (res && res.success && res.data) {
        setSuccessData(res.data);
        toast.success('Your rental application has been submitted successfully.');
        // optionally clear selected property
        try { await selectedPropertyStorage.clearSelectedProperty(); } catch (e) {}
        // show confirmation modal and then redirect after a short delay
        // auto-redirect after 5 seconds so user sees confirmation
        setTimeout(() => { navigate('/my-rent'); }, 5000);
      } else {
        toast.error(res?.message || 'Unable to submit application.');
      }
    } catch (e) {
      console.error('Submit rental application failed', e);
      toast.error('Unable to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="section-card">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card>
              <Title level={4}>{isPurchase(property) ? 'Purchase Application' : 'Rental Application'}</Title>
              <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Title level={5}>Personal Information</Title>
                <Row gutter={12}>
                  <Col xs={24} md={12}><Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="cnic" label="CNIC/Identification Number" rules={[{ required: true }]}><Input /></Form.Item></Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} md={12}><Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}><Input /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item></Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} md={12}><Form.Item name="dateOfBirth" label="Date of Birth"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="nationality" label="Nationality"><Input /></Form.Item></Col>
                </Row>

                <Title level={5} style={{ marginTop: 12 }}>Current Address</Title>
                <Row gutter={12}>
                  <Col xs={24}><Form.Item name="addressLine1" label="Address Line 1" rules={[{ required: true }]}><Input /></Form.Item></Col>
                  <Col xs={24}><Form.Item name="addressLine2" label="Address Line 2"><Input /></Form.Item></Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} md={8}><Form.Item name="city" label="City" rules={[{ required: true }]}><Input /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="province" label="Province/State" rules={[{ required: true }]}><Input /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="country" label="Country" rules={[{ required: true }]}><Input /></Form.Item></Col>
                </Row>

                <Title level={5} style={{ marginTop: 12 }}>Employment Information</Title>
                <Row gutter={12}>
                  <Col xs={24} md={8}><Form.Item name="employmentStatus" label="Employment Status" rules={[{ required: true }]}><Select><Select.Option value="Employed">Employed</Select.Option><Select.Option value="Self-Employed">Self-Employed</Select.Option><Select.Option value="Unemployed">Unemployed</Select.Option><Select.Option value="Student">Student</Select.Option></Select></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="companyName" label="Company Name"><Input /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="jobTitle" label="Job Title"><Input /></Form.Item></Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} md={8}><Form.Item name="monthlyIncome" label="Monthly Income"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="workAddress" label="Work Address"><Input /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="yearsExperience" label="Years of Experience"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
                </Row>

                <Title level={5} style={{ marginTop: 12 }}>Rental Information</Title>
                <Row gutter={12}>
                  <Col xs={24} md={12}><Form.Item name="rent" label={isPurchase(property) ? 'Price' : 'Monthly Rent'}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} md={8}><Form.Item name="reasonForRent" label="Reason for Renting" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="occupants" label="Number of Occupants" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="preferredMoveInDate" label="Preferred Move-in Date"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                </Row>
                <Row gutter={12}>
                  {!isPurchase(property) ? (
                    <Col xs={24} md={12}><Form.Item name="rentalDuration" label="Rental Duration" rules={[{ required: true }]}><Select><Select.Option value="1 month">1 month</Select.Option><Select.Option value="3 months">3 months</Select.Option><Select.Option value="6 months">6 months</Select.Option><Select.Option value="12 months">12 months</Select.Option></Select></Form.Item></Col>
                  ) : null}
                  <Col xs={24} md={12}><Form.Item name="additionalComments" label="Additional Comments"><Input.TextArea rows={3} /></Form.Item></Col>
                </Row>

                <Title level={5} style={{ marginTop: 12 }}>References</Title>
                <Row gutter={12}>
                  <Col xs={24} md={8}><Form.Item name="previousLandlordName" label="Previous Landlord Name"><Input /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="previousLandlordPhone" label="Previous Landlord Phone"><Input /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="previousLandlordRelationship" label="Relationship"><Input /></Form.Item></Col>
                </Row>

                <Form.Item name="termsAccepted" valuePropName="checked" rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('You must accept terms')) }]}>
                  <Checkbox>I accept the terms & conditions</Checkbox>
                </Form.Item>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Button onClick={handleReset}>Reset</Button>
                  <Button type="primary" htmlType="submit" loading={submitting}>{isPurchase(property) ? 'Submit Purchase Application' : 'Submit Rental Application'}</Button>
                </div>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card>
              <Title level={5}>Application Preview</Title>
              {property ? (
                <div>
                  <Text strong>{property.title}</Text>
                  <div>{property.location || property.address}</div>
                  <div style={{ marginTop: 8 }}>{isPurchase(property) ? 'Price' : 'Monthly Rent'}: Rs {Number(property.rent || property.price || 0).toLocaleString()}</div>
                </div>
              ) : (
                <div>No property selected</div>
              )}
            </Card>
          </Col>
        </Row>

        <Modal open={!!successData} title="Application Submitted" footer={null} onCancel={() => { setSuccessData(null); navigate('/my-rent'); }}>
          {successData && (
            <div>
                  <p>Thank you! Your application has been submitted successfully. Our team will review your application and contact you soon.</p>
              <p><strong>Application ID:</strong> {successData.bookingId || successData._id}</p>
              <p><strong>Property:</strong> {successData.propertyTitle || successData.propertyName}</p>
              <p><strong>Property Type:</strong> {successData.propertyType}</p>
              <p><strong>{isPurchase(property) ? 'Price' : 'Rent'}:</strong> Rs {Number(successData.rent || successData.amount || 0).toLocaleString()}</p>
              <p><strong>Status:</strong> {successData.status || successData.bookingStatus || 'Pending'}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <Button onClick={() => { setSuccessData(null); navigate('/my-rent'); }}>Close</Button>
              </div>
            </div>
          )}
        </Modal>
      </section>
    </div>
  );
}

export default RentalApplicationPage;
