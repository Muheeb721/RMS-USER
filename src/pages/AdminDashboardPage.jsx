import { useEffect, useState } from 'react';
import { Row, Col, Card, Table, List, Tag, Button } from "antd";
import { adminMetrics, bookings } from "../data/dummyData";
import { read as readPayments } from '../utils/paymentsStorage.jsx';
import "./AdminDashboardPage.css";
import { useProperties } from "../contexts/PropertyContext";
import { read as readInquiries, update as updateInquiry } from '../utils/propertyInquiriesStorage.jsx';
import { read as readVisits, update as updateVisit } from '../utils/propertyVisitsStorage.jsx';
import { read as readViews } from '../utils/propertyViewsStorage.jsx';
import { read as readComparisons } from '../utils/propertyComparisonsStorage.jsx';
import { read as readSavedSearches } from '../utils/savedSearchesStorage.jsx';
import { read as readPriceHistory } from '../utils/priceHistoryStorage.jsx';
import { read as readVerifications, setVerified } from '../utils/propertyVerificationStorage.jsx';
import { createNotification } from '../services/notificationService.jsx';
import { addStoredNotification } from '../utils/notificationsStorage.jsx';
import { toast } from 'react-toastify';
import { Select } from 'antd';

const columns = [
  { title: "Booking ID", dataIndex: "id", key: "id" },
  { title: "Client", dataIndex: "client", key: "client" },
  { title: "Property", dataIndex: "property", key: "property" },
  { title: "Status", dataIndex: "status", key: "status" },
];

const paymentColumns = [
  { title: "Payment ID", dataIndex: "id", key: "id" },
  { title: "Client", dataIndex: "client", key: "client" },
  { title: "Amount", dataIndex: "amount", key: "amount" },
  { title: "Status", dataIndex: "status", key: "status" },
];

function AdminDashboardPage() {
  const { properties, setPropertyStatus: setStatus, setPropertyVerified: setVerifiedInContext, getPropertyViewCount } = useProperties();

  const [inquiries, setInquiries] = useState(() => readInquiries());
  const [visits, setVisits] = useState(() => readVisits());
  const views = readViews();
  const [priceHistory, setPriceHistory] = useState(() => readPriceHistory());
  const [verifications, setVerifications] = useState(() => readVerifications());

  useEffect(() => {
    const onInquiries = () => setInquiries(readInquiries());
    const onVisits = () => setVisits(readVisits());
    const onPrice = () => setPriceHistory(readPriceHistory());
    const onVerifications = () => setVerifications(readVerifications());

    window.addEventListener('rms-property-inquiries-updated', onInquiries);
    window.addEventListener('rms-property-visits-updated', onVisits);
    window.addEventListener('rms-price-history-updated', onPrice);
    window.addEventListener('rms-property-verification-updated', onVerifications);

    return () => {
      window.removeEventListener('rms-property-inquiries-updated', onInquiries);
      window.removeEventListener('rms-property-visits-updated', onVisits);
      window.removeEventListener('rms-price-history-updated', onPrice);
      window.removeEventListener('rms-property-verification-updated', onVerifications);
    };
  }, []);

  const totalProperties = properties.length;
  const storedPayments = readPayments();
  const totalPaymentsCount = storedPayments.length;
  const totalRevenue = storedPayments.reduce((s, p) => s + Number(p.amountPaid || 0), 0);
  const pendingPaymentsCount = storedPayments.filter((p) => p.status === 'Pending').length;
  const partialPaymentsCount = storedPayments.filter((p) => p.status === 'Partial Payment').length;
  const overduePaymentsCount = storedPayments.filter((p) => p.status === 'Overdue').length;
  const totalOutstanding = storedPayments.reduce((s, p) => s + Number(p.remainingAmount || 0), 0);
  const available = properties.filter((p) => (p.status || p.availability) === 'Available').length;
  const reserved = properties.filter((p) => (p.status || p.availability) === 'Reserved').length;
  const sold = properties.filter((p) => (p.status || p.availability) === 'Sold').length;
  const forRent = properties.filter((p) => (p.status || p.availability) === 'For Rent').length;
  const totalInquiries = inquiries.length;
  const pendingVisits = visits.filter((v) => v.status === 'Pending').length;

  // favorites aggregation (scan localStorage keys that match rms_favorites_*)
  let totalFavorites = 0;
  try {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(window.localStorage || {}).filter((k) => k.indexOf('rms_favorites_') === 0);
      const favCounts = {};
      keys.forEach((k) => {
        try {
          const parsed = JSON.parse(window.localStorage.getItem(k) || '[]');
          if (Array.isArray(parsed)) {
            parsed.forEach((id) => { favCounts[String(id)] = (favCounts[String(id)] || 0) + 1; });
          }
        } catch (e) {}
      });
      totalFavorites = Object.values(favCounts).reduce((a, b) => a + b, 0);
    }
  } catch (e) {}

  // most viewed and most favorited property ids
  const mostViewedId = Object.entries(views).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const mostViewedProperty = properties.find((p) => String(p.id) === String(mostViewedId));

  const favoriteCounts = {};
  try {
    if (typeof window !== 'undefined') {
      Object.keys(window.localStorage || {}).forEach((k) => {
        if (k.indexOf('rms_favorites_') !== 0) return;
        try {
          const parsed = JSON.parse(window.localStorage.getItem(k) || '[]');
          if (Array.isArray(parsed)) parsed.forEach((id) => { favoriteCounts[String(id)] = (favoriteCounts[String(id)] || 0) + 1; });
        } catch (e) {}
      });
    }
  } catch (e) {}

  const mostFavoritedId = Object.entries(favoriteCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const mostFavoritedProperty = properties.find((p) => String(p.id) === String(mostFavoritedId));

  const handleInquiryStatus = (id, status) => {
    updateInquiry(id, { status });
    try {
      const note = createNotification({ type: 'contact', title: 'Inquiry Status Updated', message: `Inquiry ${id} status changed to ${status}` });
      addStoredNotification(note);
    } catch (e) {}
    window.dispatchEvent(new Event('rms-property-inquiries-updated'));
  };

  const handleVisitStatus = (id, status) => {
    updateVisit(id, { status });
    try {
      const note = createNotification({ type: 'contact', title: 'Visit Request Updated', message: `Visit ${id} status changed to ${status}` });
      addStoredNotification(note);
    } catch (e) {}
    window.dispatchEvent(new Event('rms-property-visits-updated'));
  };

  return (
    <div className="page-shell">
      <section className="section-card">
        <h2 className="section-title">Admin Dashboard</h2>
        <p className="section-subtitle">Operate users, properties, hostels, bookings, and payments from a single admin console.</p>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={4}><Card><strong>{totalProperties}</strong><div>Total Properties</div></Card></Col>
          <Col xs={24} md={4}><Card><strong>{available}</strong><div>Available</div></Card></Col>
          <Col xs={24} md={4}><Card><strong>{reserved}</strong><div>Reserved</div></Card></Col>
          <Col xs={24} md={4}><Card><strong>{sold}</strong><div>Sold</div></Card></Col>
          <Col xs={24} md={4}><Card><strong>{forRent}</strong><div>For Rent</div></Card></Col>
          <Col xs={24} md={4}><Card><strong>{totalPaymentsCount}</strong><div>Total Payments</div></Card></Col>
        </Row>

        <Row style={{ marginTop: 12 }}>
          <Col xs={24}>
            <Card title="Manage Properties">
              <Table
                dataSource={properties}
                rowKey={(r) => r.id}
                pagination={{ pageSize: 6 }}
                columns={[
                  { title: 'ID', dataIndex: 'id', key: 'id' },
                  { title: 'Title', dataIndex: 'title', key: 'title' },
                  { title: 'Area', dataIndex: 'area', key: 'area' },
                  { title: 'Price', dataIndex: 'price', key: 'price' },
                  { title: 'Status', key: 'status', render: (_, record) => (
                    <Select defaultValue={record.status || record.availability || 'Available'} style={{ width: 140 }} onChange={(val) => { setStatus(record.id, val); toast.success('Status updated'); }}>
                      <Select.Option value="Available">Available</Select.Option>
                      <Select.Option value="Reserved">Reserved</Select.Option>
                      <Select.Option value="Sold">Sold</Select.Option>
                      <Select.Option value="For Rent">For Rent</Select.Option>
                    </Select>
                  ) },
                  { title: 'Verified', key: 'verified', render: (_, record) => {
                    const isVer = Boolean(readVerifications()[String(record.id)]);
                    return <Button type={isVer ? 'primary' : 'default'} onClick={() => { setVerified(String(record.id), !isVer); setVerifiedInContext(record.id, !isVer); toast.success(isVer ? 'Unverified' : 'Verified'); }}>{isVer ? 'Verified' : 'Verify'}</Button>;
                  } },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
          <Col xs={24} lg={8}><Card title="Admin Metrics"><div>Total Inquiries: {totalInquiries}</div><div>Pending Visits: {pendingVisits}</div><div>Total Favorites: {totalFavorites}</div></Card></Col>
          <Col xs={24} lg={8}><Card title="Top Properties">{mostViewedProperty ? <div>Most Viewed: {mostViewedProperty.title} ({views[String(mostViewedProperty.id)] || 0})</div> : <div>No view data</div>}<div style={{ marginTop: 8 }}>{mostFavoritedProperty ? `Most Favorited: ${mostFavoritedProperty.title} (${favoriteCounts[String(mostFavoritedProperty.id)] || 0})` : 'No favorites yet'}</div></Card></Col>
          <Col xs={24} lg={8}><Card title="Price Changes">{priceHistory.slice(0,5).map((p) => (<div key={p.id} style={{ fontSize: 13 }}>{p.propertyId}: {p.previousPrice} → {p.newPrice} <Tag>{new Date(p.changedAt).toLocaleDateString()}</Tag></div>))}</Card></Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
          <Col xs={24} lg={12}>
            <Card title="Recent Inquiries">
              <List dataSource={inquiries.slice(0,8)} renderItem={(item) => (
                <List.Item actions={[
                  <Button key="status" onClick={() => handleInquiryStatus(item.id, item.status === 'New' ? 'Contacted' : 'Closed')}>{item.status === 'New' ? 'Mark Contacted' : 'Close'}</Button>
                ]}>
                  <div><strong>{item.name}</strong> <Tag>{item.status}</Tag><div style={{ fontSize: 12 }}>{item.propertyTitle}</div></div>
                </List.Item>
              )} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Recent Visit Requests">
              <List dataSource={visits.slice(0,8)} renderItem={(item) => (
                <List.Item actions={[
                  <Button key="confirm" onClick={() => handleVisitStatus(item.id, 'Confirmed')}>Confirm</Button>,
                  <Button key="cancel" danger onClick={() => handleVisitStatus(item.id, 'Cancelled')}>Cancel</Button>
                ]}>
                  <div><strong>{item.name}</strong> <Tag>{item.status}</Tag><div style={{ fontSize: 12 }}>{item.propertyTitle} — {item.date || item.time}</div></div>
                </List.Item>
              )} />
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
