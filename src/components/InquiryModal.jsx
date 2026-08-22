import { Modal, Form, Input, Select, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { add as addInquiry } from '../utils/propertyInquiriesStorage.jsx';
import { createContactNotification } from '../services/notificationService.jsx';
import { addStoredNotification } from '../utils/notificationsStorage.jsx';

function InquiryModal({ open, onClose, property, onSubmitted }) {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        propertyId: property?.id,
        propertyTitle: property?.title,
        preferredContactMethod: values.preferredContactMethod,
        message: values.message,
        status: 'New',
        createdAt: new Date().toISOString(),
      };

      addInquiry(payload);

      // add a notification
      try {
        const note = createContactNotification({ fullName: payload.name, inquiryType: 'Property Inquiry', property: payload.propertyTitle, message: payload.message, email: payload.email });
        addStoredNotification(note);
      } catch (e) {
        console.error('notify inquiry', e);
      }

      form.resetFields();
      onClose();
      onSubmitted && onSubmitted(payload);
    });
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} title={`Contact About This Property`} centered>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone" rules={[{ required: true }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="preferredContactMethod" label="Preferred Contact Method" initialValue="Email">
          <Select>
            <Select.Option value="Email">Email</Select.Option>
            <Select.Option value="Phone">Phone</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="message" label="Message" rules={[{ required: true }]}> 
          <Input.TextArea rows={4} />
        </Form.Item>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>Send Inquiry</Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </Form>
    </Modal>
  );
}

export default InquiryModal;
