import { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, Form, Input, Select, DatePicker } from 'antd';
import { getPayments, updatePayment, deletePayment } from '../services/paymentsService.jsx';
import { createNotification } from '../services/notificationService.jsx';
import { addStoredNotification } from '../utils/notificationsStorage.jsx';

const statusColor = (s) => {
  if (!s) return 'default';
  if (s === 'Paid') return 'green';
  if (s === 'Partial Payment') return 'orange';
  if (s === 'Pending') return 'gold';
  if (s === 'Overdue') return 'red';
  return 'blue';
};

function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setPayments(getPayments());
    const onUpdate = () => setPayments(getPayments());
    window.addEventListener('rms-payments-updated', onUpdate);
    return () => window.removeEventListener('rms-payments-updated', onUpdate);
  }, []);

  const columns = [
    { title: 'Payment ID', dataIndex: 'id', key: 'id' },
    { title: 'User', dataIndex: 'userName', key: 'userName' },
    { title: 'Property', dataIndex: 'propertyName', key: 'propertyName' },
    { title: 'Amount', dataIndex: 'amountPaid', key: 'amountPaid', render: (v) => `$${v}` },
    { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', render: (v) => `$${v}` },
    { title: 'Remaining', dataIndex: 'remainingAmount', key: 'remainingAmount', render: (v) => `$${v}` },
    { title: 'Method', dataIndex: 'method', key: 'method' },
    { title: 'Date', dataIndex: 'paymentDate', key: 'paymentDate', render: (d) => d ? new Date(d).toLocaleString() : '' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColor(s)}>{s}</Tag> },
    { title: 'Actions', key: 'actions', render: (_, record) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onClick={() => { setEditing(record); form.setFieldsValue(record); }}>View / Edit</Button>
        <Button danger onClick={() => { if (window.confirm('Delete payment?')) { deletePayment(record.id); setPayments(getPayments()); } }}>Delete</Button>
      </div>
    ) },
  ];

  const saveEdit = (vals) => {
    updatePayment(editing.id, { ...vals });
    setEditing(null);
  };

  return (
    <div className="page-shell">
      <section className="section-card">
        <h2 className="section-title">Admin — Payments</h2>
        <p className="section-subtitle">Manage payments, update status, and review history.</p>

        <Table dataSource={payments} rowKey={(r) => r.id} columns={columns} pagination={{ pageSize: 10 }} />

        <Modal open={!!editing} onCancel={() => setEditing(null)} footer={null} title="Payment Details">
          <Form layout="vertical" form={form} onFinish={saveEdit}>
            <Form.Item name="userName" label="Customer Name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="userEmail" label="Email" rules={[{ type: 'email' }]}><Input /></Form.Item>
            <Form.Item name="amountPaid" label="Amount Paid" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="totalAmount" label="Total Amount" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="remainingAmount" label="Remaining"><Input /></Form.Item>
            <Form.Item name="method" label="Method"><Select><Select.Option value="Cash">Cash</Select.Option><Select.Option value="Bank Transfer">Bank Transfer</Select.Option><Select.Option value="Card">Card</Select.Option><Select.Option value="Other">Other</Select.Option></Select></Form.Item>
            <Form.Item name="status" label="Status"><Select><Select.Option value="Paid">Paid</Select.Option><Select.Option value="Partial Payment">Partial Payment</Select.Option><Select.Option value="Pending">Pending</Select.Option><Select.Option value="Overdue">Overdue</Select.Option></Select></Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditing(null)}>Close</Button>
              <Button type="primary" htmlType="submit">Save</Button>
            </div>
          </Form>
        </Modal>
      </section>
    </div>
  );
}

export default AdminPaymentsPage;
