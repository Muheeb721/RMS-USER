import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Tag } from 'antd';
import { getPayments, createPayment } from '../services/paymentsService.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from '../redux/store';

const statusColor = (s) => {
  if (!s) return 'default';
  if (s === 'Paid') return 'green';
  if (s === 'Partial Payment') return 'orange';
  if (s === 'Pending') return 'gold';
  if (s === 'Overdue') return 'red';
  return 'blue';
};

function PaymentsPage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [payments, setPayments] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setPayments(getPayments().filter((p) => !user || String(p.userEmail) === String(user.email) || String(p.userId) === String(user.id)));
    const onUpdate = () => setPayments(getPayments().filter((p) => !user || String(p.userEmail) === String(user.email) || String(p.userId) === String(user.id)));
    window.addEventListener('rms-payments-updated', onUpdate);
    return () => window.removeEventListener('rms-payments-updated', onUpdate);
  }, [user]);

  const submit = (vals) => {
    const payload = {
      userName: vals.fullName,
      userEmail: vals.email,
      userPhone: vals.phone,
      propertyName: vals.propertyName,
      propertyType: vals.propertyType,
      bookingId: vals.bookingId,
      totalAmount: Number(vals.totalAmount || 0),
      advanceAmount: Number(vals.advanceAmount || 0),
      amountPaid: Number(vals.paymentAmount || 0),
      method: vals.paymentMethod,
      paymentDate: vals.paymentDate ? vals.paymentDate.toISOString() : new Date().toISOString(),
      notes: vals.notes || '',
      status: undefined,
    };

    const rec = createPayment(payload);
    setOpen(false);
    form.resetFields();
    dispatch(addNotification({ id: Date.now(), title: 'Payment submitted successfully.', message: `Payment ${rec.id} recorded.`, unread: true, accent: 'success' }));
    setPayments(getPayments().filter((p) => !user || String(p.userEmail) === String(user.email) || String(p.userId) === String(user.id)));
  };

  const columns = [
    { title: 'Payment ID', dataIndex: 'id', key: 'id' },
    { title: 'Property', dataIndex: 'propertyName', key: 'propertyName' },
    { title: 'Amount', dataIndex: 'amountPaid', key: 'amountPaid', render: (v) => `$${v}` },
    { title: 'Remaining', dataIndex: 'remainingAmount', key: 'remainingAmount', render: (v) => `$${v}` },
    { title: 'Method', dataIndex: 'method', key: 'method' },
    { title: 'Date', dataIndex: 'paymentDate', key: 'paymentDate', render: (d) => d ? new Date(d).toLocaleString() : '' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColor(s)}>{s}</Tag> },
  ];

  return (
    <div className="page-shell">
      <section className="section-card">
        <h2 className="section-title">Payments</h2>
        <p className="section-subtitle">Manage your payments and view payment history.</p>

        <div style={{ marginBottom: 12 }}>
          <Button type="primary" onClick={() => setOpen(true)}>Make a Payment</Button>
        </div>

        <Table dataSource={payments} rowKey={(r) => r.id} columns={columns} pagination={{ pageSize: 8 }} />

        <Modal open={open} onCancel={() => setOpen(false)} footer={null} title="Make a Payment">
          <Form layout="vertical" form={form} onFinish={submit}>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="propertyName" label="Property Name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="propertyType" label="Property Type"><Select><Select.Option value="House">House</Select.Option><Select.Option value="Flat">Flat</Select.Option><Select.Option value="Apartment">Apartment</Select.Option></Select></Form.Item>
            <Form.Item name="bookingId" label="Booking ID"><Input /></Form.Item>
            <Form.Item name="totalAmount" label="Total Amount" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="advanceAmount" label="Advance Amount"><Input /></Form.Item>
            <Form.Item name="paymentAmount" label="Payment Amount" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="paymentMethod" label="Payment Method" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="Cash">Cash</Select.Option>
                <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
                <Select.Option value="JazzCash">JazzCash</Select.Option>
                <Select.Option value="Easypaisa">Easypaisa</Select.Option>
                <Select.Option value="Card">Card</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="paymentDate" label="Payment Date"><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="dueDate" label="Due Date"><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="notes" label="Notes"><Input.TextArea rows={3} /></Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Submit Payment</Button>
            </div>
          </Form>
        </Modal>
      </section>
    </div>
  );
}

export default PaymentsPage;
