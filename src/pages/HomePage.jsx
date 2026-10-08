import { useEffect, useMemo, useRef, useState } from "react";
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
import apiClient from '../services/apiClient';
import { useProperties } from "../contexts/PropertyContext";
import { useAuth } from '../contexts/AuthContext';
import authRedirect from '../utils/authRedirect';
import { getPropertyId, getSaleInterestRoute, isSaleProperty } from '../utils/saleInterest';
import FavoriteToggle from '../components/FavoriteToggle';
import "./HomePage.css";
import "./home-redesign.css";
import HeroSection from '../components/home/HeroSection';
import PropertySearch from '../components/home/PropertySearch';
import WhyChooseRMS from '../components/home/WhyChooseRMS';
import HowItWorks from '../components/home/HowItWorks';
// HomeCTA removed from HomePage to match requested layout
import HomeFooter from '../components/home/HomeFooter';
import ActionModal from "../components/ActionModal";
import { toast } from "react-toastify";
import RentalBookingModal from '../components/RentalBookingModal';
import { getRentUnavailableStatus, startRentNow } from '../utils/rentFlow';
// dashboard submissions are handled on the dedicated Dashboard page

function HomePage() {
  const [selectedListing, setSelectedListing] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [carouselStarts, setCarouselStarts] = useState({});
  const carouselSections = useRef([]);
  // removed inline dashboard UI/state from Home page
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { user } = useSelector((state) => state.auth || {});
  const { isAuthenticated } = useAuth();
  const isLoggedIn = Boolean(isAuthenticated || user?.isLoggedIn || user?.email);
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

  const inferPropertyType = (property) => {
    const candidates = [property?.propertyType, property?.category, property?.type, property?.title];
    for (const candidate of candidates) {
      const value = String(candidate || '').trim();
      if (!value) continue;
      const lower = value.toLowerCase();
      if (['house', 'houses', 'villa', 'villas'].includes(lower)) return 'House';
      if (['apartment', 'apartments', 'condo', 'condos'].includes(lower)) return 'Apartment';
      if (['flat', 'flats', 'studio', 'studios'].includes(lower)) return 'Flat';
      if (['room', 'rooms', 'hostel', 'hostels'].includes(lower)) return 'Room';
      if (lower.includes('house')) return 'House';
      if (lower.includes('apartment')) return 'Apartment';
      if (lower.includes('flat')) return 'Flat';
      if (lower === 'property' || lower === 'properties') continue;
      return value;
    }
    return '';
  };

  const normalizePropertyType = (property) => inferPropertyType(property);

  const rawBaseProperties = Array.isArray(properties) && properties.length > 0 ? properties : [];
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get('/areas');
        if (mounted && res && Array.isArray(res.data)) setAreas(res.data.map(a => a.name));
      } catch (e) {
        // keep fallback popularAreas
      }
    })();
    return () => { mounted = false; };
  }, []);
  const baseProperties = rawBaseProperties;
  const normalizeCategoryLabel = (value = '') => {
    const normalized = String(value || '').trim();
    if (!normalized) return 'Properties';
    const lower = normalized.toLowerCase();
    if (['house', 'houses', 'villa', 'villas'].includes(lower)) return 'Houses';
    if (['apartment', 'apartments', 'condo', 'condos'].includes(lower)) return 'Apartments';
    if (['flat', 'flats', 'studio', 'studios'].includes(lower)) return 'Flats';
    if (lower.includes('house')) return 'Houses';
    if (lower.includes('apartment')) return 'Apartments';
    if (lower.includes('flat')) return 'Flats';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const defaultSectionOrder = ['Houses', 'Apartments', 'Flats'];
  const getCategoryProperties = (categoryName) => {
    const normalizedCategory = String(categoryName || '').toLowerCase();
    const aliases = {
      house: ['house', 'houses', 'villa', 'villas'],
      apartment: ['apartment', 'apartments', 'condo', 'condos'],
      flat: ['flat', 'flats', 'studio', 'studios'],
    };

    const matches = baseProperties.filter((property) => {
      const typeValue = normalizePropertyType(property).toLowerCase();
      const allowedValues = aliases[normalizedCategory] || [normalizedCategory];
      return !isSaleProperty(property)
        && (allowedValues.includes(typeValue) || typeValue === normalizedCategory || typeValue === `${normalizedCategory}s`);
    });

    return matches;
  };

  const houseProperties = getCategoryProperties('house');
  const apartmentProperties = getCategoryProperties('apartment');
  const flatProperties = getCategoryProperties('flat');
  const visiblePropertySections = useMemo(() => {
    const grouped = new Map();
    const orderedTitles = defaultSectionOrder;

    for (const property of baseProperties) {
      if (isSaleProperty(property)) continue;
      const label = normalizeCategoryLabel(
        inferPropertyType(property) || property?.category || property?.type || property?.propertyType || 'Properties'
      );
      const items = grouped.get(label) || [];
      items.push(property);
      grouped.set(label, items);
    }

    const ordered = orderedTitles.map((title) => {
      const fallbackItems = grouped.get(title) || getCategoryProperties(title.toLowerCase().replace(/s$/, ''));
      const resolvedItems = Array.isArray(fallbackItems) ? fallbackItems.slice(0, 5) : [];
      return {
        title,
        accent: title === 'Flats' ? '#14b8a6' : title === 'Apartments' ? '#0ea5e9' : '#d97706',
        items: resolvedItems,
      };
    });

    const extras = [...grouped.entries()]
      .filter(([title]) => !orderedTitles.includes(title))
      .map(([title, items]) => ({
        title,
        accent: title === 'Flats' ? '#14b8a6' : title === 'Apartments' ? '#0ea5e9' : '#d97706',
        items: items.slice(0, 5),
      }));

    return [...ordered, ...extras];
  }, [baseProperties]);

  carouselSections.current = visiblePropertySections;
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCarouselStarts((current) => {
        const next = { ...current };
        for (const section of carouselSections.current) {
          if (section.items.length > 1) {
            next[section.title] = ((current[section.title] || 0) + 1) % section.items.length;
          }
        }
        return next;
      });
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const featuredHouseProperties = [...houseProperties].sort((a, b) => {
    const lowA = String(a.title || '').toLowerCase();
    const lowB = String(b.title || '').toLowerCase();
    const order = { '2 storey house': 1, '5 storey house': 2, '7 storey house': 3 };
    return (order[lowA] || 99) - (order[lowB] || 99);
  }).slice(0, 3);

  const handleContactProperty = (property, mode = 'sale') => {
    const title = encodeURIComponent(property?.title || '');
    const type = encodeURIComponent(normalizePropertyType(property) || 'Property');
    const inquiryType = encodeURIComponent(mode === 'rent' ? 'Rent Inquiry' : mode === 'sale' ? 'Sale Inquiry' : 'Property Inquiry');
    navigate(`/contact?propertyTitle=${title}&propertyType=${type}&inquiryType=${inquiryType}`);
  };

  const handleRentProperty = async (property) => {
    if (isSaleProperty(property)) {
      const saleRoute = getSaleInterestRoute(property);
      if (!isLoggedIn) {
        authRedirect.savePendingAction({
          action: 'SALE_INTEREST',
          propertyId: getPropertyId(property),
          propertyType: property?.type || property?.propertyType || '',
          propertyTitle: property?.title || property?.name || '',
          returnRoute: saleRoute,
        });
        navigate(`/login?redirect=${encodeURIComponent(saleRoute)}`);
        return;
      }

      navigate(saleRoute);
      return;
    }

    if (getRentUnavailableStatus(property)) return;
    await startRentNow(property, isLoggedIn, navigate);
  };

  const renderCategoryShowcase = (title, items, accentColor = '#0f172a', overlayText = '') => {
    const safeItems = Array.isArray(items) ? items : [];
    const carouselStart = safeItems.length ? (carouselStarts[title] || 0) % safeItems.length : 0;
    const visibleItems = safeItems.length
      ? [...safeItems.slice(carouselStart), ...safeItems.slice(0, carouselStart)]
      : [];
    const uniqueImages = new Set();
    const moveCarousel = (direction) => {
      setCarouselStarts((current) => ({
        ...current,
        [title]: safeItems.length ? (carouselStart + direction + safeItems.length) % safeItems.length : 0,
      }));
    };

    return (
    <section className="hr-section home-category-section" key={title}>
      <div className="section-header">
        <div>
          <h3 className="section-title">{title}</h3>
          <p className="section-sub">Premium {title.toLowerCase()} listings with curated images.</p>
        </div>
        <Link to="/properties" className="btn-ghost">View all</Link>
      </div>

      {safeItems.length ? (
      <div className="home-carousel">
        <div className="home-carousel-controls">
          <Button
            aria-label={`Previous ${title}`}
            onClick={() => moveCarousel(-1)}
          >‹</Button>
          <span>{safeItems.length} properties</span>
          <Button
            aria-label={`Next ${title}`}
            onClick={() => moveCarousel(1)}
          >›</Button>
        </div>
        <div className="home-carousel-track" style={{ marginTop: 12 }}>
        {visibleItems.map((property, index) => {
          const rawImage = Array.isArray(property?.images) && property.images.length
            ? property.images[0]
            : property?.image || property?.featuredImage?.url || '';
          const imageUrl = typeof rawImage === 'string' ? rawImage : rawImage?.url || '';
          const imageIsUnique = imageUrl && !uniqueImages.has(imageUrl);
          if (imageIsUnique) uniqueImages.add(imageUrl);
          const propertyId = property.id || property._id;
          const price = property.rent || property.rentPrice || property.price || 'Contact';
          return (
          <div className="home-carousel-item" key={propertyId || `${title}-${property.title}-${index}`}>
            <Card
              cover={
                <div className="home-category-image-wrap">
                  {imageIsUnique ? (
                    <img alt={property.title} src={imageUrl} loading="lazy" style={{ width: '100%', height: 260, objectFit: 'cover' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
                  ) : <div className="home-category-no-image">No image available</div>}
                  {overlayText ? (
                    <div className="home-category-overlay">{overlayText}</div>
                  ) : null}
                </div>
              }
              className="property-card home-category-card"
            >
              <div className="card-body">
                <div className="card-top-row">
                  <Tag color={accentColor}>FOR RENT</Tag>
                  <span className="card-price">{Number(price) > 0 ? `PKR ${Number(price).toLocaleString()} / month` : price}</span>
                </div>
                <div className="card-title">{property.title}</div>
                <div className="card-address">{property.address || property.location}</div>
                <div className="meta-row">
                  <span className="meta-pill">{property.bedrooms || 0} beds</span>
                  <span className="meta-pill">{property.bathrooms || 0} baths</span>
                  <span className="meta-pill">{property.area || 'Area'}</span>
                </div>
                <div className="card-actions">
                  <Button
                    type="primary"
                    disabled={Boolean(getRentUnavailableStatus(property))}
                    onClick={() => handleRentProperty({ ...property, transactionType: 'Rent', listingType: 'rent' })}
                  >
                    {getRentUnavailableStatus(property) || 'Rent Now'}
                  </Button>
                  <FavoriteToggle item={property} label="Save" />
                </div>
              </div>
            </Card>
          </div>
          );
        })}
        </div>
      </div>
      ) : (
        <div className="home-category-empty">No {title.toLowerCase()} are available yet.</div>
      )}
    </section>
    );
  };

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

      {visiblePropertySections.map((section) => renderCategoryShowcase(section.title, section.items, section.accent, section.title === 'Flats' ? 'FOR RENT' : ''))}

      <WhyChooseRMS />
      <HowItWorks />
      <HomeFooter />

      {baseProperties.filter(p => p.transactionType === 'Rent').length > 0 && (
        <section className="section-card section-spacing">
          <div className="section-header">
            <div>
              <h3 className="section-title">Properties for Rent</h3>
              <p className="section-subtitle">Flats and Rooms available for immediate move-in.</p>
            </div>
            <Link to="/properties?transaction=Rent" className="btn-ghost">View all rents</Link>
          </div>

          <Row gutter={[16,16]} style={{ marginTop: 8 }}>
            {baseProperties.filter(p => p.transactionType === 'Rent').slice(0,4).map((property, index) => (
              <Col xs={24} md={12} lg={6} key={property.id}>
                <Card cover={<img alt={property.title} src={property.image || ''} style={{ width: '100%', height: 260, objectFit: 'cover' }} onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />} className="property-card">
                  <div className="card-body">
                    <div className="card-top-row">
                      <Tag color="cyan">FOR RENT</Tag>
                      <span className="card-price">Rent</span>
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
                      <Button
                        type="primary"
                        disabled={Boolean(getRentUnavailableStatus(property))}
                        onClick={() => handleRentProperty(property)}
                      >
                        {getRentUnavailableStatus(property) || 'Rent Now'}
                      </Button>
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
          {/** dynamic areas from API (fallback to popularAreas) */}
          {Array.isArray(areas) && areas.length > 0 ? (
            areas.map((area) => (
              <Link key={area} to={`/properties?area=${encodeURIComponent(area)}`} className="area-tag">{area}</Link>
            ))
          ) : (
            popularAreas.map((area) => (
              <Link key={area} to={`/properties?area=${encodeURIComponent(area)}`} className="area-tag">{area}</Link>
            ))
          )}
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
