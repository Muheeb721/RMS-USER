import { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Tag, Button, Divider, List } from "antd";
import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import {
  readDashboardSubmissions,
  removeDashboardSubmission,
} from "../utils/dashboardSubmissionStorage.jsx";
import { readStoredNotifications } from '../utils/notificationsStorage.jsx';
import "./UserDashboardPage.css";
import { read as readInquiries } from '../utils/propertyInquiriesStorage';
import { read as readVisits } from '../utils/propertyVisitsStorage';
import { read as readSavedSearches } from '../utils/savedSearchesStorage.jsx';

const formatDate = (value) => {
  if (!value) return "Just now";

  try {
    return new Date(value).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (error) {
    return "Just now";
  }
};

function UserDashboardPage() {
  const [submissions, setSubmissions] = useState(() => readDashboardSubmissions());
  const [inquiries, setInquiries] = useState(() => readInquiries());
  const [visits, setVisits] = useState(() => readVisits());
  const [savedSearches, setSavedSearches] = useState(() => readSavedSearches());

  const [notificationsState, setNotificationsState] = useState(() => []);

  const refreshSubmissions = () => setSubmissions(readDashboardSubmissions());

  useEffect(() => {
    refreshSubmissions();

    if (typeof window === "undefined") {
      return undefined;
    }

    const handleStorageUpdate = () => refreshSubmissions();
    window.addEventListener("rms-dashboard-update", handleStorageUpdate);

    const onInquiries = () => setInquiries(readInquiries());
    const onVisits = () => setVisits(readVisits());
    const onSavedSearches = () => setSavedSearches(readSavedSearches());
    const onNotifications = () => setNotificationsState(readStoredNotifications([]));

    window.addEventListener('rms-property-inquiries-updated', onInquiries);
    window.addEventListener('rms-property-visits-updated', onVisits);
    window.addEventListener('rms-saved-searches-updated', onSavedSearches);
    window.addEventListener('rms-notifications-updated', onNotifications);

    return () => {
      window.removeEventListener("rms-dashboard-update", handleStorageUpdate);
      window.removeEventListener('rms-property-inquiries-updated', onInquiries);
      window.removeEventListener('rms-property-visits-updated', onVisits);
      window.removeEventListener('rms-saved-searches-updated', onSavedSearches);
      window.removeEventListener('rms-notifications-updated', onNotifications);
    };
  }, []);

  const stats = useMemo(() => {
    const total = submissions.length;
    const newCount = submissions.filter((item) => item.status === "New").length;
    const propertyCount = submissions.filter((item) =>
      ["House", "Apartment", "Flat", "Room", "Hostel", "Property"].includes(item.propertyType || item.category),
    ).length;
    const uniqueTypes = new Set(submissions.map((item) => item.formType || item.source)).size;

    return { total, newCount, propertyCount, uniqueTypes };
  }, [submissions]);

  const groupedTypes = useMemo(() => {
    const map = new Map();

    submissions.forEach((item) => {
      const key = item.formType || item.source || "General";
      map.set(key, (map.get(key) || 0) + 1);
    });

    return [...map.entries()].map(([name, count]) => ({ name, count }));
  }, [submissions]);

  const handleDelete = (id) => {
    removeDashboardSubmission(id);
    refreshSubmissions();
  };

  return (
    <div className="page-shell">
      <section className="section-card dashboard-shell">
        <div className="dashboard-header">
          <div>
            <h2 className="section-title">User Dashboard</h2>
            <p className="section-subtitle">
              All website submissions are tracked here from the moment they are submitted.
            </p>
          </div>
          <Tag color="blue">{stats.total} total records</Tag>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card className="metric-card">
              <span className="metric-label">Total submissions</span>
              <strong className="metric-value">{stats.total}</strong>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="metric-card">
              <span className="metric-label">New requests</span>
              <strong className="metric-value">{stats.newCount}</strong>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="metric-card">
              <span className="metric-label">Property items</span>
              <strong className="metric-value">{stats.propertyCount}</strong>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="metric-card">
              <span className="metric-label">Form types</span>
              <strong className="metric-value">{stats.uniqueTypes}</strong>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16,16]}>
          <Col xs={24} lg={8}>
            <Card title="My Inquiries">
              <List dataSource={readInquiries().slice(0,8)} renderItem={(item) => (
                <List.Item>
                  <div><strong>{item.propertyTitle || '—'}</strong><div style={{ fontSize: 12 }}>{item.name} — {item.status}</div></div>
                </List.Item>
              )} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="My Visit Requests">
              <List dataSource={readVisits().slice(0,8)} renderItem={(item) => (
                <List.Item>
                  <div><strong>{item.propertyTitle || '—'}</strong><div style={{ fontSize: 12 }}>{item.name} — {item.status}</div></div>
                </List.Item>
              )} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="My Saved Searches">
              <List dataSource={readSavedSearches().slice(0,8)} renderItem={(item) => (
                <List.Item>
                  <div><strong>{item.name}</strong><div style={{ fontSize: 12 }}>{JSON.stringify(item.filters)}</div></div>
                </List.Item>
              )} />
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            <Card title="Recent submissions" className="dashboard-panel">
              {submissions.length === 0 ? (
                <div className="empty-state">
                  <InboxOutlined className="empty-icon" />
                  <p>No submissions yet. Forms submitted from the site will appear here automatically.</p>
                </div>
              ) : (
                <List
                  dataSource={submissions.slice(0, 8)}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          key="delete"
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>,
                      ]}
                    >
                      <div className="submission-row">
                        <div className="submission-header">
                          <strong>{item.title || item.formType}</strong>
                          <Tag color={item.status === "New" ? "blue" : "green"}>{item.status || "New"}</Tag>
                        </div>
                        <div className="submission-meta">
                          <span>{item.userName || "RMS User"}</span>
                          <span>{item.email || "No email"}</span>
                          <span>{item.formType || item.source}</span>
                        </div>
                        <div className="submission-footer">
                          <span>{item.location || item.propertyType || "General"}</span>
                          <span>{item.price || "—"}</span>
                          <span>{formatDate(item.submittedAt)}</span>
                        </div>
                        {item.description ? <p className="submission-description">{item.description}</p> : null}
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <Card title="Submission breakdown" className="dashboard-panel">
              {groupedTypes.length === 0 ? (
                <div className="empty-state compact">
                  <p>No detailed form data available yet.</p>
                </div>
              ) : (
                <div className="type-list">
                  {groupedTypes.map(({ name, count }) => (
                    <div key={name} className="type-item">
                      <span>{name}</span>
                      <Tag color="geekblue">{count}</Tag>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
}

export default UserDashboardPage;
