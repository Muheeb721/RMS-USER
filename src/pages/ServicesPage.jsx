import { Card, Row, Col, Button } from "antd";
import {
  HomeOutlined,
  ApartmentOutlined,
  UsergroupAddOutlined,
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  BarChartOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ServicesPage.css";
import { FALLBACK_IMAGE } from '../utils/imageUtils';

const artForService = (label, firstColor, secondColor) => {
  const safeLabel = String(label || 'RMS').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${firstColor}"/>
          <stop offset="100%" stop-color="${secondColor}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)"/>
      <circle cx="980" cy="120" r="160" fill="rgba(255,255,255,0.16)"/>
      <rect x="170" y="260" width="860" height="360" rx="30" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.35)"/>
      <rect x="250" y="330" width="220" height="150" rx="18" fill="rgba(255,255,255,0.12)"/>
      <rect x="500" y="330" width="180" height="150" rx="18" fill="rgba(255,255,255,0.1)"/>
      <rect x="710" y="330" width="200" height="150" rx="18" fill="rgba(255,255,255,0.14)"/>
      <text x="600" y="620" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="56" font-weight="700" fill="#ffffff">${safeLabel}</text>
      <text x="600" y="675" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.9)" font-weight="600">Residential Services</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const serviceItems = [
  {
    title: "House Management",
    description:
      "Manage single-family residences, upkeep, payments, and resident communication in one place.",
    image: artForService('House', '#1f7a8c', '#6bbf59'),
    badge: "House",
    icon: <HomeOutlined />,
    highlights: [],
    color: "#0f766e",
  },
  {
    title: "Apartment Operations",
    description:
      "Streamline apartment workflows with centralized access, notices, and tenant onboarding.",
    image: artForService('Apartment', '#2d6cdf', '#90e0ef'),
    badge: "Apartment",
    icon: <ApartmentOutlined />,
    highlights: [ ],
    color: "#115e59",
  },
  {
    title: "Hostel Coordination",
    description:
      "Coordinate shared accommodations, roommate matching, billing, and incident logs effortlessly.",
    image: artForService('Hostel', '#5f4b8b', '#b5d99c'),
    badge: "Hostel",
    icon: <UsergroupAddOutlined />,
    highlights: [ ],
    color: "#0c4a6e",
  },
];

const metrics = [
  {
    label: "Modules",
    value: "150+",
    description: "All-in-one tools for resident and facility management.",
    icon: <DashboardOutlined />,
  },
  {
    label: "Centralized Control",
    value: "1 Dashboard",
    description: "View approvals, finances, and tasks from one pane.",
    icon: <BarChartOutlined />,
  },
  {
    label: "Accessibility",
    value: "24/7",
    description: "Mobile-first access for managers and residents.",
    icon: <MessageOutlined />,
  },
  {
    label: "Platform",
    value: "Cloud-native",
    description: "Secure and scalable infrastructure for modern teams.",
    icon: <FileTextOutlined />,
  },
];
function ServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="services-page">
      <section className="services-hero">
        <div className="services-hero-backdrop" />
        <div className="services-hero-body">
          <span className="services-hero-label">
            Built for residential operations
          </span>
          <h1>Residential Management Services</h1>
          <p>
            Deliver modern property management for houses, apartments, and
            hostels with a polished platform that combines rent tracking,
            maintenance, resident records, and reporting.
          </p>
          <div className="services-hero-actions">
            <Button type="primary" size="large">
              Start managing now
            </Button>
            <Button size="large" ghost>
              Explore features
            </Button>
          </div>
        </div>
      </section>

     

      <nav className="services-nav" aria-label="Service navigation">
        <button type="button" onClick={() => navigate("/demo")}>Demo</button>
        <button type="button" onClick={() => navigate("/properties")}>Properties</button>
        <button type="button" onClick={() => navigate("/bookings")}>Bookings</button>
        <button type="button" onClick={() => navigate("/ai-recommendations")}>AI Match</button>
      </nav>

      <section id="stats" className="services-stats-strip">
        {metrics.map((metric) => (
          <div key={metric.label} className="stats-card">
            <div className="stats-icon">{metric.icon}</div>
            <h3>{metric.value}</h3>
            <p>{metric.label}</p>
            <span>{metric.description}</span>
          </div>
        ))}
      </section>

      <section id="offerings" className="services-offerings">
        <div className="section-heading">
          <span>Service portfolio</span>
          <h2>Designed for every residential property type</h2>
        </div>

        <Row gutter={[24, 24]}>
          {serviceItems.map((item) => (
            <Col xs={24} md={8} key={item.title}>
              <Card
                className="service-card"
                cover={<img alt={item.title} src={item.image || FALLBACK_IMAGE} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} />}
                bordered={false}
              >
                <div
                  className="service-card-badge"
                  style={{ background: item.color }}
                >
                  {item.icon}
                  <span>{item.badge}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="service-card-tags">
                  {item.highlights.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <Button
                  type="link"
                  className="service-card-link"
                  onClick={() => navigate("/demo")}
                >
                  Learn More <ArrowRightOutlined />
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section id="cta" className="services-cta-banner">
        <div>
          <p>Ready to modernize residential management?</p>
          <h2>
            Bring operations, payments and resident services together in one
            platform.
          </h2>
        </div>
        <Button type="primary" size="large" onClick={() => navigate("/demo")}>
          Book a demo
        </Button>
      </section>
    </div>
  );
}

export default ServicesPage;
