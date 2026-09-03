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
  Spin,
  Alert,
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
import "./home-redesign.css";
import HeroSection from '../components/home/HeroSection';
import PropertySearch from '../components/home/PropertySearch';
import FeaturedProperties from '../components/home/FeaturedProperties';
import WhyChooseRMS from '../components/home/WhyChooseRMS';
import HowItWorks from '../components/home/HowItWorks';
import HomeCTA from '../components/home/HomeCTA';
import HomeFooter from '../components/home/HomeFooter';
import ActionModal from "../components/ActionModal";
import { toast } from "react-toastify";
import RentalBookingModal from '../components/RentalBookingModal';
// dashboard submissions are handled on the dedicated Dashboard page

function HomePage() {
  const [selectedListing, setSelectedListing] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  // removed inline dashboard UI/state from Home page
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { user } = useSelector((state) => state.auth || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const service = await import('../services/propertyService');
        await service.listProperties();
      } catch (e) {
        console.warn('HomePage property load failed', e);
        if (mounted) setError('Unable to load properties');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // dashboard data now lives on /dashboard route

  const currentUser = user || { name: "RMS User", email: "", role: "resident" };

  const [rentalSelected, setRentalSelected] = useState(null);
  const [rentalBookingOpen, setRentalBookingOpen] = useState(false);

  // no inline dashboard entries on home page

  const handleNewsletterSignup = () => {
    if (!newsletterEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    toast.success("You are subscribed to the RMS newsletter.");
    setNewsletterEmail("");
  };

  // dashboard edit/delete handled on the dashboard page

  return (
    <div className="page-shell home-shell">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {loading ? <div style={{ textAlign: 'center', padding: 30 }}><Spin size="large"/></div> : null}
        {error ? <div style={{ margin: '12px 0' }}><Alert type="error" message={error} /></div> : null}
        <HeroSection />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 1100 }}>
            <PropertySearch />
          </div>
        </div>
      </motion.div>

      <FeaturedProperties items={properties.slice(0,4)} />

      {/* Properties For Sale section */}
      {properties.filter(p => p.transactionType === 'Sale').length > 0 && (
        <section className="hr-section">
          <div className="section-header">
            <div>
              <h3 className="section-title">Properties For Sale</h3>
              <p className="section-sub">House and Apartment listings for sale.</p>
            </div>
            <Link to="/properties?transaction=Sale" className="btn-ghost">View all sales</Link>
          </div>
          <Row gutter={[16,16]} style={{ marginTop: 8 }}>
            {properties.filter(p => p.transactionType === 'Sale').slice(0,6).map((property) => (
              <Col xs={24} sm={12} md={8} key={property.id}>
                <Card cover={<img alt={property.title} src={property.image} />} className="property-card">
                  <div className="card-body">
                    <div className="card-top-row">
                      <Tag color="gold">FOR SALE</Tag>
                      <span className="card-price">{property.price}</span>
                    </div>
                    <div className="card-title">{property.title}</div>
                    <div className="card-address">{property.address}</div>
                    <div className="meta-row">
                      <span className="meta-pill">{property.bedrooms} beds</span>
                      <span className="meta-pill">{property.bathrooms} baths</span>
                      <span className="meta-pill">{property.area}</span>
                    </div>
                    <div className="card-actions">
                      <Button onClick={() => navigate(`/properties/${property.id}`)}>View Details</Button>
                      <FavoriteToggle item={property} label="Save" />
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      )}

      {properties.filter(p => p.transactionType === 'Rent').length > 0 && (
        <section className="hr-section">
          <div className="section-header">
            <div>
              <h3 className="section-title">Properties for Rent</h3>
              <p className="section-sub">Flats and Rooms available for immediate move-in.</p>
            </div>
            <Link to="/properties?transaction=Rent" className="btn-ghost">View all rents</Link>
          </div>

          <Row gutter={[16,16]} style={{ marginTop: 8 }}>
            {properties.filter(p => p.transactionType === 'Rent').slice(0,8).map((property) => (
              <Col xs={24} md={12} lg={6} key={property.id}>
                <Card cover={<img alt={property.title} src={property.image} />} className="property-card">
                  <div className="card-body">
                    <div className="card-top-row">
                      <Tag color="cyan">FOR RENT</Tag>
                      <span className="card-price">{property.rentPrice || property.price}</span>
                    </div>
                    <div className="card-title">{property.title}</div>
                    <div className="card-address">{property.address}</div>
                    <div className="meta-row">
                      <span className="meta-pill">{property.bedrooms} beds</span>
                      <span className="meta-pill">{property.bathrooms} baths</span>
                      <span className="meta-pill">{property.area}</span>
                    </div>
                    <div className="card-actions">
                      <Button onClick={() => navigate(`/properties/${property.id}`)}>View Details</Button>
                      <FavoriteToggle item={property} label="Save" />
                      <Button type="primary" onClick={() => { setRentalSelected(property); setRentalBookingOpen(true); }}>Rent Now</Button>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      )}

      <WhyChooseRMS />
      <HowItWorks />
      <HomeCTA />
      <HomeFooter />

      {properties.filter(p => p.transactionType === 'Rent').length > 0 && (
        <section className="section-card section-spacing">
          <div className="section-header">
            <div>
              <h3 className="section-title">Properties for Rent</h3>
              <p className="section-subtitle">Flats and Rooms available for immediate move-in.</p>
            </div>
            <Link to="/properties?transaction=Rent" className="btn-ghost">View all rents</Link>
          </div>

          <Row gutter={[16,16]} style={{ marginTop: 8 }}>
            {properties.filter(p => p.transactionType === 'Rent').slice(0,4).map((property) => (
              <Col xs={24} md={12} lg={6} key={property.id}>
                <Card cover={<img alt={property.title} src={property.image} />} className="property-card">
                  <div className="card-body">
                    <div className="card-top-row">
                      <Tag color="cyan">FOR RENT</Tag>
                      <span className="card-price">{property.rentPrice || property.price}</span>
                    </div>
                    <div className="card-title">{property.title}</div>
                    <div className="card-address">{property.address}</div>
                    <div className="meta-row">
                      <span className="meta-pill">{property.bedrooms} beds</span>
                      <span className="meta-pill">{property.bathrooms} baths</span>
                      <span className="meta-pill">{property.area}</span>
                    </div>
                    <div className="card-actions">
                      <Button onClick={() => navigate(`/properties/${property.id}`)}>View Details</Button>
                      <FavoriteToggle item={property} label="Save" />
                      <Button type="primary" onClick={() => { setRentalSelected(property); setRentalBookingOpen(true); }}>Rent Now</Button>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      )}

      <RentalBookingModal open={rentalBookingOpen} onClose={() => setRentalBookingOpen(false)} property={rentalSelected} />

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

      {/* Dashboard UI removed from Home page to keep Home clean. Dashboard is available at /dashboard */}

      <ChatBot />
      <ActionModal
        open={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        type="contact"
        item={selectedListing}
        onSubmit={() => toast.success("Your viewing request has been sent.")}
      />

      {/* Dashboard modal removed from Home page */}
    </div>
  );
}

export default HomePage;
