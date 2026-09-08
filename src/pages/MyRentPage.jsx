import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Tag, Table, Statistic, Button } from 'antd';
import { useSelector } from 'react-redux';
import { read, getMyRentSummary } from '../services/rentService.jsx';
import { createNotification } from '../services/notificationService.jsx';
import { addStoredNotification } from '../utils/notificationsStorage.jsx';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import api from '../services/api';

function MyRentPage() {
  const user = useSelector((state) => state.auth?.user || {});
  const [records, setRecords] = useState([]);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const refreshBookings = async () => {
    try {
      const response = await api.request('/bookings/me');
      if (response && response.success) {
        setBookings(response.data || []);
      }
    } catch (error) {
      console.error('Unable to load bookings from backend', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const nextRecords = await read();
      setRecords(nextRecords);
      await refreshBookings();
    };

    loadData();
  }, []);

  const summary = useMemo(() => getMyRentSummary(user, records), [user, records]);

  const columns = [
    { title: 'Month', dataIndex: 'month', key: 'month' },
    { title: 'Property', dataIndex: 'propertyName', key: 'propertyName' },
    { title: 'Rent', dataIndex: 'monthlyRent', key: 'monthlyRent', render: (value) => `Rs ${Number(value || 0).toLocaleString()}` },
    { title: 'Paid', dataIndex: 'paid', key: 'paid', render: (value) => `Rs ${Number(value || 0).toLocaleString()}` },
    { title: 'Remaining', dataIndex: 'remaining', key: 'remaining', render: (value) => `Rs ${Number(value || 0).toLocaleString()}` },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (value) => <Tag color={value === 'Paid' ? 'green' : value === 'Overdue' ? 'red' : value === 'Partial' ? 'gold' : 'blue'}>{value}</Tag> },
  ];

  const bookingColumns = [
    { title: 'Booking ID', dataIndex: 'bookingId', key: 'bookingId' },
    { title: 'Property', dataIndex: 'propertyName', key: 'propertyName' },
    { title: 'Type', dataIndex: 'propertyType', key: 'propertyType' },
    { title: 'Rent', dataIndex: 'rent', key: 'rent', render: (v) => `Rs ${Number(v || 0).toLocaleString()}` },
    { title: 'Frequency', dataIndex: 'rentFrequency', key: 'rentFrequency' },
    { title: 'Move-in', dataIndex: 'moveInDate', key: 'moveInDate', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Booking Status', dataIndex: 'bookingStatus', key: 'bookingStatus', render: (v) => <Tag color={v === 'Approved' ? 'green' : v === 'Rejected' ? 'red' : v === 'Pending' ? 'gold' : 'blue'}>{v}</Tag> },
    { title: 'Payment Status', dataIndex: 'paymentStatus', key: 'paymentStatus', render: (v) => <Tag color={v === 'Paid' || v === 'Advance Paid' ? 'green' : 'blue'}>{v}</Tag> },
    { title: 'Actions', key: 'actions', render: (_text, record) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onClick={() => navigate(`/properties/${record.propertyId}`)}>View Property</Button>
        <Button type="primary" onClick={() => { setSelectedBooking(record); setPaymentOpen(true); }}>Pay</Button>
        <Button danger onClick={() => handleCancelBooking(record)}>Cancel</Button>
      </div>
    ) },
  ];

  const handleSimulatePayment = (booking) => {
    // kept for backward compatibility; open payment modal by default
    setSelectedBooking(booking);
    setPaymentOpen(true);
  };

  const handleCancelBooking = async (booking) => {
    try {
      const id = booking.id || booking.bookingId;
      await api.request(`/bookings/${id}/reject`, { method: 'POST', body: { reason: 'Cancelled by user' } });
      const next = await api.request('/bookings/me');
      if (next && next.success) setBookings(next.data || []);
      try {
        const note = createNotification({ type: 'booking', title: 'Booking Cancelled', message: `Booking ${booking.bookingId} for ${booking.propertyName} was cancelled by user.`, userName: booking.userName, email: booking.userEmail });
        addStoredNotification(note);
      } catch (e) {}
    } catch (e) {
      console.error('Unable to cancel booking', e);
    }
  };

  return (
    <div className="page-shell">
      <section className="section-card">
        <h2 className="section-title">My Rent</h2>
        <p className="section-subtitle">Track your rent, outstanding balance, and payment schedule.</p>

        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col xs={24} md={6}>
            <Card>
              <Statistic title="Current Rent" value={summary.totalMonthly} prefix="Rs " formatter={(value) => Number(value).toLocaleString()} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic title="Outstanding" value={summary.totalDue} prefix="Rs " formatter={(value) => Number(value).toLocaleString()} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic title="Next Due" value={summary.nextDue ? new Date(summary.nextDue.dueDate).toLocaleDateString() : '—'} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic title="Status" value={summary.records.some((item) => item.status === 'Overdue') ? 'Overdue' : summary.records.some((item) => item.status === 'Partial') ? 'Partial' : 'On Track'} />
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 24 }}>
          {(!summary.records || summary.records.length === 0) && (!bookings || bookings.length === 0) ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <h3>No rental records found.</h3>
              <p>It looks like you don't have any active rentals yet. Browse properties to find a place to rent.</p>
              <Button type="primary" onClick={() => navigate('/properties')}>Explore Properties</Button>
            </div>
          ) : (
            <>
              <Table dataSource={summary.records} columns={columns} rowKey="id" pagination={{ pageSize: 8 }} />
              <h3 style={{ marginTop: 24 }}>My Rental Bookings</h3>
              <Table dataSource={bookings} columns={bookingColumns} rowKey="id" pagination={{ pageSize: 8 }} />
              <PaymentModal open={paymentOpen} booking={selectedBooking} onClose={async (ok) => {
                setPaymentOpen(false);
                setSelectedBooking(null);
                await refreshBookings();
                if (ok) { /* optional toast */ }
              }} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default MyRentPage;
