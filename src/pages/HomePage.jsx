import { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Statistic,
  Tag,
  Rate,
  Avatar,
  List,
  Modal,
  Form,
} from "antd";
import {
  SearchOutlined,
  HomeOutlined,
  BuildOutlined,
  SafetyOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { hostelData, popularAreas, stats, reviews } from "../data/dummyData";
import { useProperties } from "../contexts/PropertyContext";
import FavoriteToggle from '../components/FavoriteToggle';
import ChatBot from "../components/ChatBot/ChatBot";
import "./HomePage.css";
import ActionModal from "../components/ActionModal";
import { toast } from "react-toastify";
import {
  clearDashboardSubmissions,
  readDashboardSubmissions,
  removeDashboardSubmission,
  updateDashboardSubmission,
} from "../utils/dashboardSubmissionStorage.jsx";

function HomePage() {
  const [selectedListing, setSelectedListing] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [dashboardEntries, setDashboardEntries] = useState(() => readDashboardSubmissions());
  const [dashboardModal, setDashboardModal] = useState(null);
  const [editForm] = Form.useForm();
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { user } = useSelector((state) => state.auth || {});

  const refreshDashboardEntries = () => setDashboardEntries(readDashboardSubmissions());

  useEffect(() => {
    refreshDashboardEntries();

    if (typeof window === "undefined") {
      return undefined;
    }

    const handleDashboardUpdate = () => refreshDashboardEntries();
    window.addEventListener("rms-dashboard-update", handleDashboardUpdate);

    return () => {
      window.removeEventListener("rms-dashboard-update", handleDashboardUpdate);
    };
  }, []);

  const currentUser = user || {
    name: "RMS User",
    email: "",
    role: "resident",
  };

  const userDashboardEntries = useMemo(() => {
    const list = readDashboardSubmissions();
    const userEmail = (currentUser.email || "").toLowerCase();
    const userName = (currentUser.name || "").toLowerCase();

    if (!userEmail && !userName) {
      return list;
    }

    return list.filter((entry) => {
      const entryEmail = (entry.email || "").toLowerCase();
      const entryName = (entry.userName || "").toLowerCase();
      return !entryEmail || entryEmail === userEmail || entryName === userName;
    });
  }, [currentUser.email, currentUser.name, dashboardEntries]);

  const handleNewsletterSignup = () => {
    if (!newsletterEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    toast.success("You are subscribed to the RMS newsletter.");
    setNewsletterEmail("");
  };

  const openViewModal = (entry) => setDashboardModal({ type: "view", entry });
  const openEditModal = (entry) => {
    setDashboardModal({ type: "edit", entry });
    editForm.setFieldsValue({
      title: entry.title || "",
      location: entry.location || "",
      price: entry.price || "",
      description: entry.description || "",
      status: entry.status || "New",
    });
  };

  const handleSaveEdit = () => {
    editForm.validateFields().then((values) => {
      if (!dashboardModal?.entry?.id) return;

      updateDashboardSubmission(dashboardModal.entry.id, {
        title: values.title,
        location: values.location,
        price: values.price,
        description: values.description,
        status: values.status,
      });

      refreshDashboardEntries();
      setDashboardModal(null);
      editForm.resetFields();
      toast.success("Submission updated successfully.");
    });
  };

  const handleDelete = (id) => {
    removeDashboardSubmission(id);
    refreshDashboardEntries();
    toast.success("Submission removed.");
  };

  const handleClearAll = () => {
    clearDashboardSubmissions();
    refreshDashboardEntries();
    toast.success("All submissions cleared.");
  };

  return (
    <div className="page-shell home-shell">
      <motion.section
        className="hero-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={14}>
            <span className="soft-chip">SMART RESIDENTIAL MANAGEMENT</span>
            <h1 className="hero-title">
              Manage Properties. Connect Residents. Simplify Everything.
            </h1>
            <p className="hero-description">
              RMS brings property management, resident communication, payments,
              maintenance, and analytics together in one premium platform.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary">
                <SearchOutlined /> Get Started
              </Link>
              <Link to="/services" className="btn-secondary">
                Explore Services
              </Link>
            </div>
            <div className="hero-quick-stats">
              <div>
                <strong>240+</strong>
                <span>Properties managed</span>
              </div>
              <div>
                <strong>18k</strong>
                <span>Residents served</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Support available</span>
              </div>
            </div>
          </Col>
          <Col xs={24} lg={10}>
            <div className="hero-illustration">
              <div className="building-scene">
                <div className="scene-glow" />
                <div className="building-tower large" />
                <div className="building-tower small" />
                <div className="tree tree-left" />
                <div className="tree tree-right" />
                <div className="road" />
                <div className="floating-card top-card">+12% occupancy</div>
                <div className="floating-card mid-card">PKR 4.2M revenue</div>
                <div className="floating-card bottom-card">
                  Maintenance on track
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </motion.section>

      <section className="section-card section-spacing">
        <div className="section-header">
          <div>
            <h3 className="section-title">Featured Properties</h3>
            <p className="section-subtitle">
              Curated homes and apartments across premium communities.
            </p>
          </div>
          <Link to="/properties" className="btn-ghost">
            View all
          </Link>
        </div>
        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          {properties.slice(0, 3).map((property) => (
            <Col xs={24} md={8} key={property.id}>
              <Card
                className="property-card card-hover"
                cover={<img alt={property.title} src={property.image} />}
              >
                <div className="card-body">
                  <div className="card-top-row">
                    <Tag color="blue">{property.type}</Tag>
                    <span className="card-price">{property.price}</span>
                  </div>
                  <div className="card-title">{property.title}</div>
                  <div className="card-address">{property.address}</div>
                  <div className="meta-row">
                    <span className="meta-pill">{property.bedrooms} beds</span>
                    <span className="meta-pill">
                      {property.bathrooms} baths
                    </span>
                    <span className="meta-pill">
                      Parking {property.parking}
                    </span>
                  </div>
                  <div className="card-actions">
                    <Button type="primary" onClick={() => navigate("/demo")}>
                      View
                    </Button>
                    <FavoriteToggle item={property} label="Save" />
                    <Button onClick={() => navigate("/contact")}>
                      Contact
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="section-card section-spacing">
        <div className="section-header">
          <div>
            <h3 className="section-title">Why Choose RMS</h3>
            <p className="section-subtitle">
              A premium experience for residents, owners, and administrators.
            </p>
          </div>
        </div>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="benefit-list">
              <div className="benefit-item">
                <SafetyOutlined className="benefit-icon" />
                <div>
                  <strong>Verified listings</strong>
                  <div className="benefit-text">
                    Trusted properties with verified owner profiles and smart
                    onboarding.
                  </div>
                </div>
              </div>
              <div className="benefit-item">
                <HomeOutlined className="benefit-icon" />
                <div>
                  <strong>Smart dues management</strong>
                  <div className="benefit-text">
                    Track bills, payment progress, and due reminders in one
                    place.
                  </div>
                </div>
              </div>
              <div className="benefit-item">
                <BuildOutlined className="benefit-icon" />
                <div>
                  <strong>Responsive support</strong>
                  <div className="benefit-text">
                    Get instant help for maintenance, bookings, and resident
                    communication.
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Row gutter={[12, 12]}>
              {stats.map((item) => (
                <Col xs={24} sm={12} key={item.title}>
                  <Card className="card-hover">
                    <Statistic title={item.title} value={item.value} />
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </section>

      <section className="section-card section-spacing">
        <h3 className="section-title">What Residents Say</h3>
        <Row gutter={[16, 16]}>
          {reviews.map((review) => (
            <Col xs={24} md={12} key={review.name}>
              <Card className="card-hover">
                <div className="review-header">
                  <Avatar size="large" className="review-avatar">
                    {review.name[0]}
                  </Avatar>
                  <div>
                    <strong>{review.name}</strong>
                    <div className="review-role">{review.role}</div>
                  </div>
                </div>
                <Rate disabled defaultValue={5} className="review-rate" />
                <p className="review-quote">{review.quote}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="section-card section-spacing">
        <div className="section-header">
          <div>
            <h3 className="section-title">Popular Areas</h3>
            <p className="section-subtitle">
              Premium neighborhoods with an excellent lifestyle and
              infrastructure.
            </p>
          </div>
        </div>
        <div className="area-tags">
          {popularAreas.map((area) => (
            <Link
              key={area}
              to={`/properties?area=${encodeURIComponent(area)}`}
              className="area-tag"
            >
              {area}
            </Link>
          ))}
        </div>
      </section>

      <section className="section-card section-spacing">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <h3 className="section-title">Ready to move?</h3>
            <p className="section-subtitle">
              Partner with RMS for modern listings, resident payments, and
              premium support.
            </p>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </Col>
          <Col xs={24} md={12}>
            <Card className="card-hover">
              <Input
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="Email address"
                className="newsletter-input"
              />
              <Button type="primary" block onClick={handleNewsletterSignup}>
                Join Newsletter
              </Button>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="section-card section-spacing dashboard-home-section">
        <div className="dashboard-home-header">
          <div>
            <h3 className="section-title">User Dashboard</h3>
            <p className="section-subtitle">
              Your current account details and all saved submissions from the website.
            </p>
          </div>
          {userDashboardEntries.length > 0 && (
            <Button danger onClick={handleClearAll}>Clear All</Button>
          )}
        </div>

        <div className="dashboard-user-summary">
          <div className="dashboard-user-meta">
            <Avatar size={56} style={{ background: "linear-gradient(135deg, #0b2450, #28b463)" }}>
              {(currentUser.name || "RMS").charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <h4>{currentUser.name || "RMS User"}</h4>
              <p>{currentUser.email || "No email linked yet"}</p>
              <Tag color="green">{currentUser.role || "resident"}</Tag>
            </div>
          </div>
          <div className="dashboard-metric-wrap">
            <div className="dashboard-metric">
              <span>Total</span>
              <strong>{userDashboardEntries.length}</strong>
            </div>
            <div className="dashboard-metric">
              <span>Contact</span>
              <strong>{userDashboardEntries.filter((item) => item.source === "contact" || item.formType?.includes("Contact")).length}</strong>
            </div>
            <div className="dashboard-metric">
              <span>Property</span>
              <strong>{userDashboardEntries.filter((item) => item.propertyType || item.category).length}</strong>
            </div>
          </div>
        </div>

        {userDashboardEntries.length === 0 ? (
          <div className="dashboard-empty-state">No data available yet.</div>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={userDashboardEntries}
            renderItem={(entry) => (
              <List.Item
                actions={[
                  <Button key="view" type="link" onClick={() => openViewModal(entry)}>View</Button>,
                  <Button key="edit" type="link" onClick={() => openEditModal(entry)}>Edit</Button>,
                  <Button key="delete" type="link" danger onClick={() => handleDelete(entry.id)}>Delete</Button>,
                ]}
              >
                <div className="dashboard-entry-card">
                  <div className="dashboard-entry-top">
                    <div>
                      <strong>{entry.title || entry.formType || "Submission"}</strong>
                      <div className="dashboard-entry-type">{entry.formType || entry.source || "General Form"}</div>
                    </div>
                    <Tag color={entry.status === "New" ? "blue" : "green"}>{entry.status || "New"}</Tag>
                  </div>
                  <div className="dashboard-entry-details">
                    <span>{entry.userName || currentUser.name || "RMS User"}</span>
                    <span>{entry.email || currentUser.email || "No email"}</span>
                    <span>{entry.location || entry.propertyType || "General"}</span>
                    <span>{entry.price || "No price"}</span>
                  </div>
                  {entry.description && <p className="dashboard-entry-description">{entry.description}</p>}
                </div>
              </List.Item>
            )}
          />
        )}
      </section>

      <ChatBot />
      <ActionModal
        open={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        type="contact"
        item={selectedListing}
        onSubmit={() => toast.success("Your viewing request has been sent.")}
      />

      <Modal
        open={Boolean(dashboardModal)}
        onCancel={() => setDashboardModal(null)}
        footer={
          dashboardModal?.type === "edit"
            ? [
                <Button key="cancel" onClick={() => setDashboardModal(null)}>Cancel</Button>,
                <Button key="save" type="primary" onClick={handleSaveEdit}>Save</Button>,
              ]
            : [<Button key="close" type="primary" onClick={() => setDashboardModal(null)}>Close</Button>]
        }
        title={dashboardModal?.type === "edit" ? "Edit submission" : "Submission details"}
      >
        {dashboardModal?.type === "view" && dashboardModal.entry ? (
          <div className="dashboard-modal-body">
            <p><strong>Title:</strong> {dashboardModal.entry.title || dashboardModal.entry.formType}</p>
            <p><strong>Type:</strong> {dashboardModal.entry.formType || dashboardModal.entry.source}</p>
            <p><strong>User:</strong> {dashboardModal.entry.userName || currentUser.name}</p>
            <p><strong>Email:</strong> {dashboardModal.entry.email || currentUser.email || "No email"}</p>
            <p><strong>Location:</strong> {dashboardModal.entry.location || "Not provided"}</p>
            <p><strong>Price:</strong> {dashboardModal.entry.price || "Not provided"}</p>
            <p><strong>Status:</strong> {dashboardModal.entry.status || "New"}</p>
            <p><strong>Submitted:</strong> {new Date(dashboardModal.entry.submittedAt || Date.now()).toLocaleString("en-PK")}</p>
            <p><strong>Details:</strong> {dashboardModal.entry.description || "No additional details provided."}</p>
          </div>
        ) : (
          <Form form={editForm} layout="vertical">
            <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please enter a title" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="location" label="Location">
              <Input />
            </Form.Item>
            <Form.Item name="price" label="Price">
              <Input />
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}

export default HomePage;
