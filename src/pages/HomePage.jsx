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
import apiClient from '../services/apiClient';
import { useProperties } from "../contexts/PropertyContext";
import { useAuth } from '../contexts/AuthContext';
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
// dashboard submissions are handled on the dedicated Dashboard page
import { FALLBACK_IMAGE } from '../utils/imageUtils';
import { getPrimaryImage } from '../utils/imageUtils';
import { resolveUniquePropertyImage } from '../utils/propertyImageCatalog';

function HomePage() {
  const [selectedListing, setSelectedListing] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [catalogImages, setCatalogImages] = useState({ HOME: [], HOUSE: [], FLAT: [], APARTMENT: [], PROPERTY: [], DEMO: [] });
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

        const response = await apiClient.get('/images');
        if (mounted && response?.data?.success) {
          const grouped = { HOME: [], HOUSE: [], FLAT: [], APARTMENT: [], PROPERTY: [], DEMO: [] };
          for (const item of response.data.data || []) {
            const key = String(item.category || 'OTHER').toUpperCase();
            if (grouped[key]) grouped[key].push(item);
          }
          setCatalogImages(grouped);
        }
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
    const candidates = [property?.type, property?.propertyType, property?.category, property?.title];
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
      return value;
    }
    return '';
  };

  const normalizePropertyType = (property) => inferPropertyType(property);

  const HOME_VIP_HOUSES = catalogImages.HOUSE.length
    ? catalogImages.HOUSE.map((item) => item.imageUrl).filter(Boolean)
    : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
      ];

  const HOME_FLATS_INTERIOR = catalogImages.FLAT.length
    ? catalogImages.FLAT.map((item) => item.imageUrl).filter(Boolean)
    : [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502005229762-ee1b2b93e0f5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      ];

  const HOME_APARTMENTS_BUILDINGS = catalogImages.APARTMENT.length
    ? catalogImages.APARTMENT.map((item) => item.imageUrl).filter(Boolean)
    : [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502005096674-719299666c97?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
      ];

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
  const isDemoProperty = (p) => {
    if (!p) return false;
    const title = String(p.title || p.name || '').toLowerCase();
    if (title.includes('demo') || title.includes('demo prop') || title.includes('prop-demo')) return true;
    if (String(p.ownerId || '').toLowerCase() === 'demo-seed') return true;
    return false;
  };
  const baseProperties = rawBaseProperties.filter(p => !isDemoProperty(p));
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
  const fallbackSectionCatalog = {
    Houses: [
      { id: 'fallback-house-1', title: '2 Storey Family Villa', type: 'House', category: 'House', propertyType: 'House', address: 'Bahria Town, Lahore', bedrooms: 4, bathrooms: 3, area: '2,500 sq ft', price: 'PKR 14,500,000', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'] },
      { id: 'fallback-house-2', title: 'Modern Corner House', type: 'House', category: 'House', propertyType: 'House', address: 'Gulberg, Lahore', bedrooms: 5, bathrooms: 4, area: '3,200 sq ft', price: 'PKR 18,900,000', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'] },
      { id: 'fallback-house-3', title: 'Luxury Garden Villa', type: 'House', category: 'House', propertyType: 'House', address: 'Defence, Lahore', bedrooms: 6, bathrooms: 5, area: '4,100 sq ft', price: 'PKR 27,400,000', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'] },
    ],
    Apartments: [
      { id: 'fallback-apartment-1', title: 'Skyline Residency', type: 'Apartment', category: 'Apartment', propertyType: 'Apartment', address: 'Johar Town, Lahore', bedrooms: 3, bathrooms: 2, area: '1,750 sq ft', price: 'PKR 9,800,000', image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80', images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80'] },
      { id: 'fallback-apartment-2', title: 'City View Heights', type: 'Apartment', category: 'Apartment', propertyType: 'Apartment', address: 'Model Town, Lahore', bedrooms: 2, bathrooms: 2, area: '1,250 sq ft', price: 'PKR 6,200,000', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'] },
      { id: 'fallback-apartment-3', title: 'Pearl Apartments', type: 'Apartment', category: 'Apartment', propertyType: 'Apartment', address: 'DHA Phase 6, Lahore', bedrooms: 4, bathrooms: 3, area: '2,300 sq ft', price: 'PKR 13,600,000', image: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80', images: ['https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80'] },
    ],
    Flats: [
      { id: 'fallback-flat-1', title: 'Comfort Flat Deluxe', type: 'Flat', category: 'Flat', propertyType: 'Flat', address: 'Wapda Town, Lahore', bedrooms: 2, bathrooms: 2, area: '1,050 sq ft', price: 'PKR 70,000 / month', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'], transactionType: 'Rent' },
      { id: 'fallback-flat-2', title: 'Riverside Studio Flat', type: 'Flat', category: 'Flat', propertyType: 'Flat', address: 'Faisal Town, Lahore', bedrooms: 1, bathrooms: 1, area: '760 sq ft', price: 'PKR 52,000 / month', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'], transactionType: 'Rent' },
      { id: 'fallback-flat-3', title: 'Executive Family Flat', type: 'Flat', category: 'Flat', propertyType: 'Flat', address: 'Cavalry Ground, Lahore', bedrooms: 3, bathrooms: 2, area: '1,450 sq ft', price: 'PKR 88,000 / month', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80', images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'], transactionType: 'Rent' },
    ],
  };

  const buildFallbackSectionItems = (title) => {
    const source = fallbackSectionCatalog[title] || [];
    return source.map((item, index) => ({
      ...item,
      id: item.id || `${title.toLowerCase()}-${index + 1}`,
      title: item.title || `${title} Listing`,
      address: item.address || 'Lahore, Pakistan',
      location: item.address || 'Lahore, Pakistan',
      bedrooms: item.bedrooms || 2,
      bathrooms: item.bathrooms || 2,
      area: item.area || '1,200 sq ft',
      price: item.price || 'Contact',
      transactionType: item.transactionType || (title === 'Flats' ? 'Rent' : 'Sale'),
      type: item.type || title.replace(/s$/, ''),
      propertyType: item.propertyType || title.replace(/s$/, ''),
      category: item.category || title.replace(/s$/, ''),
      image: item.image || item.images?.[0] || FALLBACK_IMAGE,
      images: item.images || [item.image || FALLBACK_IMAGE],
    }));
  };

  const buildDefaultSections = () => defaultSectionOrder.map((title) => ({
    title,
    accent: title === 'Flats' ? '#14b8a6' : title === 'Apartments' ? '#0ea5e9' : '#d97706',
    items: buildFallbackSectionItems(title),
  }));

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
      return allowedValues.includes(typeValue) || typeValue === normalizedCategory || typeValue === `${normalizedCategory}s`;
    });

    return matches.slice(0, 3);
  };

  const getCustomCategoryGroups = () => {
    const groups = new Map();
    for (const property of baseProperties) {
      const label = normalizeCategoryLabel(
        inferPropertyType(property) || property?.category || property?.type || property?.propertyType || 'Properties'
      );
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(property);
    }

    const defaultGroups = ['Houses', 'Apartments', 'Flats'];
    const orderedGroups = [];

    for (const key of defaultGroups) {
      const inheritedItems = groups.get(key) || getCategoryProperties(key.toLowerCase().replace(/s$/, ''));
      orderedGroups.push({
        title: key,
        items: Array.isArray(inheritedItems) ? inheritedItems.slice(0, 3) : [],
        accent: key === 'Flats' ? '#14b8a6' : key === 'Apartments' ? '#0ea5e9' : '#d97706',
      });
    }

    for (const [title, items] of groups.entries()) {
      if (defaultGroups.includes(title)) continue;
      if (!Array.isArray(items) || !items.length) continue;
      orderedGroups.push({
        title,
        items: items.slice(0, 3),
        accent: title === 'Flats' ? '#14b8a6' : title === 'Apartments' ? '#0ea5e9' : '#d97706',
      });
    }

    return orderedGroups.slice(0, 6);
  };

  const dynamicPropertySections = useMemo(() => getCustomCategoryGroups(), [baseProperties]);

  const houseProperties = getCategoryProperties('house');
  const apartmentProperties = getCategoryProperties('apartment');
  const flatProperties = getCategoryProperties('flat');
  const visiblePropertySections = useMemo(() => {
    const grouped = new Map();
    const orderedTitles = defaultSectionOrder;

    for (const property of baseProperties) {
      const label = normalizeCategoryLabel(
        inferPropertyType(property) || property?.category || property?.type || property?.propertyType || 'Properties'
      );
      const items = grouped.get(label) || [];
      items.push(property);
      grouped.set(label, items);
    }

    const ordered = orderedTitles.map((title) => {
      const fallbackItems = grouped.get(title) || getCategoryProperties(title.toLowerCase().replace(/s$/, ''));
      const resolvedItems = Array.isArray(fallbackItems) && fallbackItems.length > 0
        ? fallbackItems.slice(0, 3)
        : buildFallbackSectionItems(title);
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
        items: items.slice(0, 3),
      }));

    return [...ordered, ...extras];
  }, [baseProperties]);

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
    const id = property?.id || property?._id || '';
    const rentRoute = `/rental-application${id ? `?propertyId=${encodeURIComponent(id)}` : ''}`;

    if (!isLoggedIn) {
      try {
        const m = await import('../utils/selectedPropertyStorage.jsx');
        await m.saveSelectedProperty(property);
      } catch (e) {
        console.warn('Unable to persist selected property before redirect', e);
      }

      try {
        const authRedirect = await import('../utils/authRedirect');
        authRedirect.default?.savePendingAction?.({
          action: 'RENT_NOW',
          propertyId: id,
          propertyType: property?.type || property?.propertyType || '',
          propertyTitle: property?.title || property?.name || '',
          returnRoute: rentRoute,
        });
      } catch (e) {
        console.warn('Unable to save pending action for rent redirect', e);
      }

      navigate(`/login?redirect=${encodeURIComponent(rentRoute)}`);
      return;
    }

    try {
      const m = await import('../utils/selectedPropertyStorage.jsx');
      await m.saveSelectedProperty(property);
    } catch (e) {
      console.warn('Unable to persist selected property, falling back to navigation', e);
    }

    navigate(rentRoute);
  };

  const getCardPriceText = (property, blockTitle = '') => {
    const isRentBlock = blockTitle === 'Flats' || String(property?.transactionType || '').toLowerCase() === 'rent';
    if (isRentBlock) return 'Rent';
    return property?.price || property?.rentPrice || 'Contact';
  };

  const renderCategoryShowcase = (title, items, accentColor = '#0f172a', overlayText = '') => {
    const safeItems = Array.isArray(items) && items.length > 0 ? items : buildFallbackSectionItems(title);

    return (
    <section className="hr-section home-category-section" key={title}>
      <div className="section-header">
        <div>
          <h3 className="section-title">{title}</h3>
          <p className="section-sub">Premium {title.toLowerCase()} listings with curated images.</p>
        </div>
        <Link to="/properties" className="btn-ghost">View all</Link>
      </div>

      <Row gutter={[18, 18]} className="home-category-grid" style={{ marginTop: 12 }}>
        {safeItems.slice(0, 3).map((property, index) => (
          <Col xs={24} sm={12} md={8} key={property.id || `${title}-${property.title}`}>
            <Card
              cover={
                <div className="home-category-image-wrap">
                  <img
                    alt={property.title}
                    src={
                      Array.isArray(property?.images) && property.images.length
                        ? property.images[0]
                        : property?.image || resolveUniquePropertyImage(property, 'home', index) || FALLBACK_IMAGE
                    }
                    loading="lazy"
                    style={{ width: '100%', height: 260, objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                  {overlayText ? (
                    <div className="home-category-overlay">{overlayText}</div>
                  ) : null}
                </div>
              }
              className="property-card home-category-card"
            >
              <div className="card-body">
                <div className="card-top-row">
                  <Tag color={accentColor}>{title === 'Flats' ? 'FOR RENT' : 'FEATURED'}</Tag>
                  <span className="card-price">{getCardPriceText(property, title)}</span>
                </div>
                <div className="card-title">{property.title}</div>
                <div className="card-address">{property.address || property.location}</div>
                <div className="meta-row">
                  <span className="meta-pill">{property.bedrooms || 0} beds</span>
                  <span className="meta-pill">{property.bathrooms || 0} baths</span>
                  <span className="meta-pill">{property.area || 'Area'}</span>
                </div>
                <div className="card-actions">
                  <Button onClick={() => handleContactProperty(property, title === 'Flats' ? 'rent' : 'sale')}>
                    {title === 'Houses' ? 'House Sale' : title === 'Apartments' ? 'Apartment Enquiry' : 'Rent Inquiry'}
                  </Button>
                  <Button type="primary" onClick={() => handleRentProperty(property)}>
                    {title === 'Flats' ? 'Rent' : 'Book Now'}
                  </Button>
                  <FavoriteToggle item={property} label="Save" />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
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
                <Card cover={<img alt={property.title} src={resolveUniquePropertyImage(property, 'home', index) || FALLBACK_IMAGE} style={{ width: '100%', height: 260, objectFit: 'cover' }} onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} />} className="property-card">
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
                      <Button type="primary" onClick={() => handleRentProperty(property)}>Rent Now</Button>
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
