import { useMemo, useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Button, Select, Statistic, Divider, Typography, InputNumber, Spin, Alert } from 'antd';
import { ShareAltOutlined, EyeOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hostelData } from '../data/dummyData';
import { useProperties } from '../contexts/PropertyContext';
import { getRecommendations } from '../services/recommendationService.jsx';
import MapView from '../components/MapView';
import ActionModal from '../components/ActionModal';
import InquiryModal from '../components/InquiryModal';
import VisitModal from '../components/VisitModal';
import FavoriteToggle from '../components/FavoriteToggle';
import RentalBookingModal from '../components/RentalBookingModal';
import './PropertyListingsPage.css';
import { toast } from 'react-toastify';
import { FALLBACK_IMAGE } from '../utils/imageUtils';
import { getPrimaryImage } from '../utils/imageUtils';

const { Paragraph } = Typography;

function PropertyListingsPage() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [modalType, setModalType] = useState('details');
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, updateProperty } = useProperties();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const propertyService = await import('../services/propertyService');
        await propertyService.listProperties();
      } catch (e) {
        console.warn('PropertyListings initial load failed', e);
        if (mounted) setError('Unable to load properties');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const { user } = useSelector((state) => state.auth || {});

  const selectedArea = searchParams.get('area') || 'All Areas';
  const areaOptions = useMemo(() => {
    const areas = Array.from(new Set([...properties.map((property) => property.area), ...hostelData.map((hostel) => hostel.area)]));
    return ['All Areas', ...areas];
  }, []);

  // filteredProperties derives from properties, selected area and additional filters below

  const handleAction = (type, item) => {
    setSelectedProperty(item);
    setModalType(type);
  };

  const navigate = useNavigate();
  const [compareSelection, setCompareSelection] = useState([]);

  const toggleCompare = (id) => {
    setCompareSelection((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const goToCompare = () => {
    if (!compareSelection.length) return toast.info('Select properties to compare (up to 3)');
    navigate(`/compare?ids=${compareSelection.join(',')}`);
  };

  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
      const [filters, setFilters] = useState({
        transaction: searchParams.get('transaction') || 'All',
        type: searchParams.get('type') || 'All',
        minPrice: '',
        maxPrice: searchParams.get('budget') || '',
        bedrooms: 'Any',
        bathrooms: 'Any',
        availability: 'All',
      });
  const [bookingOpen, setBookingOpen] = useState(false);

  const handleOpenInquiry = (item) => {
    setSelectedProperty(item);
    setInquiryOpen(true);
  };

  const handleProtectedNavigation = (targetUrl) => {
    if (!user?.isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }

    navigate(targetUrl);
  };

  const filteredProperties = useMemo(() => {
    let list = properties.slice();

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((p) => {
        const text = `${p.title || ''} ${p.location || p.address || ''} ${p.type || ''} ${p.area || ''}`.toLowerCase();
        return text.includes(term);
      });
    }

    if (selectedArea && selectedArea !== 'All Areas') {
      list = list.filter((p) => p.area === selectedArea);
    }

    if (filters.transaction && filters.transaction !== 'All') {
      list = list.filter((p) => p.transactionType === filters.transaction);
    }

    if (filters.type && filters.type !== 'All') {
      list = list.filter((p) => p.type === filters.type);
    }

    const min = Number(filters.minPrice || 0);
    const max = Number(filters.maxPrice || 0);
    if (filters.minPrice) list = list.filter((p) => { const v = Number(String(p.price || p.rentPrice || p.salePrice || 0).replace(/[^0-9.-]+/g, '')); return v >= min; });
    if (filters.maxPrice) list = list.filter((p) => { const v = Number(String(p.price || p.rentPrice || p.salePrice || 0).replace(/[^0-9.-]+/g, '')); return max ? v <= max : true; });

    if (filters.bedrooms && filters.bedrooms !== 'Any') {
      const num = Number(filters.bedrooms);
      list = list.filter((p) => Number(p.bedrooms || 0) >= num);
    }

    if (filters.bathrooms && filters.bathrooms !== 'Any') {
      const num = Number(filters.bathrooms);
      list = list.filter((p) => Number(p.bathrooms || 0) >= num);
    }

    if (filters.availability && filters.availability !== 'All') {
      list = list.filter((p) => p.availability === filters.availability || p.status === filters.availability);
    }

    return list;
  }, [properties, selectedArea, filters, searchTerm]);

  // Build AI recommendations based on current search preferences
  const recommendationPreferences = useMemo(() => ({
    budget: Number(filters.maxPrice || 0) || 0,
    type: filters.type && filters.type !== 'All' ? filters.type : 'Any',
    location: selectedArea && selectedArea !== 'All Areas' ? selectedArea : '',
    bedrooms: filters.bedrooms && filters.bedrooms !== 'Any' ? Number(filters.bedrooms) : 0,
    bathrooms: filters.bathrooms && filters.bathrooms !== 'Any' ? Number(filters.bathrooms) : 0,
    saleType: filters.transaction && filters.transaction !== 'All' ? filters.transaction : '',
  }), [filters, selectedArea]);

  const recommendations = useMemo(() => {
    try {
      return getRecommendations(properties, recommendationPreferences).slice(0, 12);
    } catch (e) {
      return [];
    }
  }, [properties, recommendationPreferences]);
  const handleModalSubmit = (payload) => {
    if (!payload) return;
    const { item, ...updates } = payload;
    if (modalType === 'edit' && item) {
      // convert numeric fields
      const numericUpdates = { ...updates };
      if (numericUpdates.bedrooms) numericUpdates.bedrooms = Number(numericUpdates.bedrooms);
      if (numericUpdates.bathrooms) numericUpdates.bathrooms = Number(numericUpdates.bathrooms);
      if (numericUpdates.seats) numericUpdates.seats = Number(numericUpdates.seats);
      if (numericUpdates.lat) numericUpdates.lat = Number(numericUpdates.lat);
      if (numericUpdates.lng) numericUpdates.lng = Number(numericUpdates.lng);
      updateProperty(item.id, numericUpdates);
      return;
    }

    // default behavior for other modal types
    toast.success('Request sent successfully');
  };

  return (
    <div className="page-shell property-search-shell">
      <section className="section-card property-search-panel">
        <div className="property-search-header">
          <div>
            <h2 className="section-title">Explore Properties</h2>
            <Paragraph className="section-subtitle">Find the right property for your needs.</Paragraph>
          </div>
          <Tag color="blue">{filteredProperties.length} properties</Tag>
        </div>

        <div className="property-search-bar">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search property or location"
            aria-label="Search property or location"
          />
          <Button type="primary" icon={<ShareAltOutlined />} onClick={() => setSearchParams({ q: searchTerm.trim() })}>Search</Button>
        </div>

        <div className="property-filter-layout">
          <aside className="property-filter-sidebar">
            <div className="filter-group">
              <h4>Transaction</h4>
              <Select value={filters.transaction} style={{ width: '100%' }} onChange={(v) => setFilters((s)=>({...s, transaction: v}))}>
                <Select.Option value="All">Buy/Rent</Select.Option>
                <Select.Option value="Sale">Buy</Select.Option>
                <Select.Option value="Rent">Rent</Select.Option>
              </Select>
            </div>

            <div className="filter-group">
              <h4>Property Type</h4>
              <Select value={filters.type} style={{ width: '100%' }} onChange={(v) => setFilters((s)=>({...s, type: v}))}>
                <Select.Option value="All">All</Select.Option>
                <Select.Option value="House">House</Select.Option>
                <Select.Option value="Apartment">Apartment</Select.Option>
                <Select.Option value="Flat">Flat</Select.Option>
                <Select.Option value="Room">Hostel</Select.Option>
              </Select>
            </div>

            <div className="filter-group">
              <h4>Location</h4>
              <Select value={selectedArea} style={{ width: '100%' }} onChange={(v) => setSearchParams({ area: v === 'All Areas' ? '' : v })}>
                {areaOptions.map((area) => <Select.Option key={area} value={area}>{area}</Select.Option>)}
              </Select>
            </div>

            <div className="filter-group">
              <h4>Price</h4>
              <div className="inline-price-inputs">
                <InputNumber placeholder="Min" value={filters.minPrice} onChange={(v)=>setFilters((s)=>({...s, minPrice: v}))} style={{ width: '48%' }} />
                <InputNumber placeholder="Max" value={filters.maxPrice} onChange={(v)=>setFilters((s)=>({...s, maxPrice: v}))} style={{ width: '48%' }} />
              </div>
            </div>

            <div className="filter-group compact-grid">
              <div>
                <h4>Bedrooms</h4>
                <Select value={filters.bedrooms} style={{ width: '100%' }} onChange={(v) => setFilters((s)=>({...s, bedrooms: v}))}>
                  <Select.Option value="Any">Any</Select.Option>
                  <Select.Option value="1">1+</Select.Option>
                  <Select.Option value="2">2+</Select.Option>
                  <Select.Option value="3">3+</Select.Option>
                  <Select.Option value="4">4+</Select.Option>
                </Select>
              </div>
              <div>
                <h4>Bathrooms</h4>
                <Select value={filters.bathrooms} style={{ width: '100%' }} onChange={(v) => setFilters((s)=>({...s, bathrooms: v}))}>
                  <Select.Option value="Any">Any</Select.Option>
                  <Select.Option value="1">1+</Select.Option>
                  <Select.Option value="2">2+</Select.Option>
                  <Select.Option value="3">3+</Select.Option>
                </Select>
              </div>
            </div>

            <div className="filter-group">
              <h4>Availability</h4>
              <Select value={filters.availability} style={{ width: '100%' }} onChange={(v) => setFilters((s)=>({...s, availability: v}))}>
                <Select.Option value="All">All</Select.Option>
                <Select.Option value="Available">Available</Select.Option>
                <Select.Option value="Reserved">Reserved</Select.Option>
                <Select.Option value="Sold">Sold</Select.Option>
                <Select.Option value="For Rent">For Rent</Select.Option>
              </Select>
            </div>

            <div className="filter-group">
              <h4>Sort</h4>
              <Select value="Recommended" style={{ width: '100%' }}>
                <Select.Option value="Recommended">Recommended</Select.Option>
                <Select.Option value="Newest">Newest</Select.Option>
                <Select.Option value="PriceLow">Price Low → High</Select.Option>
                <Select.Option value="PriceHigh">Price High → Low</Select.Option>
              </Select>
            </div>

            <Button block onClick={()=>setFilters({ transaction: 'All', type: 'All', minPrice: '', maxPrice: '', bedrooms: 'Any', bathrooms: 'Any', availability: 'All' })}>Reset filters</Button>
          </aside>

          <div className="property-results-panel">
            <div style={{ marginBottom: 16 }}>
              {error ? <Alert type="error" message={error} style={{ marginBottom: 12 }} /> : null}
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
              ) : (
                <MapView selectedArea={selectedArea} />
              )}
            </div>

            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
              <Button onClick={goToCompare} disabled={compareSelection.length < 2}>Compare Selected ({compareSelection.length})</Button>
              <Button onClick={() => setCompareSelection([])}>Clear Selection</Button>
            </div>

            <Divider />

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} md={8}><Card><Statistic title="Verified Listings" value="240+" /></Card></Col>
              <Col xs={24} md={8}><Card><Statistic title="Quick Response" value="< 10 min" /></Card></Col>
              <Col xs={24} md={8}><Card><Statistic title="Neighborhoods" value="14" /></Card></Col>
            </Row>

            <Row gutter={[16, 16]}>
              {filteredProperties.map((property) => (
                <Col xs={24} md={12} lg={8} key={property.id}>
                  <Card
                    className="property-card"
                    cover={
                      <div className="property-cover">
                        <img alt={property.title} src={getPrimaryImage(property) || FALLBACK_IMAGE} loading="lazy" style={{ width: '100%', height: 260, objectFit: 'cover' }} onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src=FALLBACK_IMAGE; }} />
                        <div className="cover-actions">
                          <Button type="primary" icon={<EyeOutlined />} onClick={() => { import('../utils/selectedPropertyStorage.jsx').then(m => m.saveSelectedProperty(property)); handleProtectedNavigation(`/properties/${property.id}`); }}>View</Button>
                          <Button onClick={() => { import('../utils/selectedPropertyStorage.jsx').then(m => m.saveSelectedProperty(property)); handleProtectedNavigation(`/contact?propertyId=${property.id}&propertyTitle=${encodeURIComponent(property.title || '')}&propertyType=${encodeURIComponent(property.type || '')}`); }}>Contact</Button>
                          {property.transactionType === 'Rent' && (
                            <Button type="primary" style={{ background: '#28b463', borderColor: '#28b463' }} onClick={() => { setSelectedProperty(property); setBookingOpen(true); }}>Rent Now</Button>
                          )}
                        </div>
                      </div>
                    }
                  >
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Tag color="blue">{property.type}</Tag>
                        <span style={{ fontWeight: 700 }}>{property.price}</span>
                      </div>
                      <div className="card-title">{property.title}</div>
                      <div style={{ color: '#64809b', display: 'flex', alignItems: 'center', gap: 6 }}><EnvironmentOutlined /> {property.address}</div>
                      <div className="meta-row">
                        <span className="meta-pill">{property.area}</span>
                        <span className="meta-pill">{property.bedrooms} beds</span>
                        <span className="meta-pill">{property.bathrooms} baths</span>
                      </div>
                      <div style={{ marginTop: 12, color: '#506a80' }}>
                        <div>Owner: {property.owner}</div>
                        <div>Availability: {property.availability}</div>
                      </div>
                      <div className="card-actions">
                        <FavoriteToggle item={property} label="Save" />
                        <Button icon={<ShareAltOutlined />} onClick={() => handleAction('share', property)}>Share</Button>
                        <Button onClick={() => handleOpenVisit(property)}>Schedule Visit</Button>
                        <Button type={compareSelection.includes(property.id) ? 'primary' : 'default'} onClick={() => toggleCompare(property.id)}>{compareSelection.includes(property.id) ? 'Selected' : 'Add to Compare'}</Button>
                        <Button onClick={() => handleAction('edit', property)}>Edit</Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {filteredProperties.length === 0 && recommendations && recommendations.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <Card title="No exact matches — similar recommendations" style={{ marginBottom: 12 }}>
                  <Row gutter={[12, 12]}>
                    {recommendations.map((property) => (
                      <Col xs={24} md={12} lg={8} key={property.id}>
                        <Card size="small" hoverable onClick={() => navigate(`/properties/${property.id}`)}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <img src={getPrimaryImage(property) || FALLBACK_IMAGE} alt={property.title} loading="lazy" style={{ width: 90, height: 60, objectFit: 'cover', borderRadius: 6 }} onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src=FALLBACK_IMAGE; }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700 }}>{property.title}</div>
                              <div style={{ color: '#64748b' }}>{property.area || property.location}</div>
                              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700 }}>{property.price}</span>
                                <Tag color="green">{property.matchScore}%</Tag>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      <ActionModal open={Boolean(selectedProperty) && modalType !== 'contact'} onClose={() => setSelectedProperty(null)} type={modalType} item={selectedProperty} onSubmit={handleModalSubmit} />
      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} property={selectedProperty} onSubmitted={() => toast.success('Inquiry submitted.')} />
      <VisitModal open={visitOpen} onClose={() => setVisitOpen(false)} property={selectedProperty} onSubmitted={() => toast.success('Visit request submitted.')} />
      <RentalBookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} property={selectedProperty} />
    </div>
  );
}

export default PropertyListingsPage;
