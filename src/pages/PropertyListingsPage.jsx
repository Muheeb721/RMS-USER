import { useMemo, useState } from 'react';
import { Row, Col, Card, Tag, Button, Select, Statistic, Divider, Typography } from 'antd';
import { ShareAltOutlined, EyeOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { hostelData } from '../data/dummyData';
import { useProperties } from '../contexts/PropertyContext';
import MapView from '../components/MapView';
import ActionModal from '../components/ActionModal';
import InquiryModal from '../components/InquiryModal';
import VisitModal from '../components/VisitModal';
import FavoriteToggle from '../components/FavoriteToggle';
import './PropertyListingsPage.css';
import { toast } from 'react-toastify';

const { Paragraph } = Typography;

function PropertyListingsPage() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [modalType, setModalType] = useState('details');
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, updateProperty } = useProperties();

  const selectedArea = searchParams.get('area') || 'All Areas';
  const areaOptions = useMemo(() => {
    const areas = Array.from(new Set([...properties.map((property) => property.area), ...hostelData.map((hostel) => hostel.area)]));
    return ['All Areas', ...areas];
  }, []);

  const filteredProperties = useMemo(() => {
    if (!selectedArea || selectedArea === 'All Areas') {
      return properties;
    }

    return properties.filter((property) => property.area === selectedArea);
  }, [properties, selectedArea]);

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

  const handleOpenInquiry = (item) => {
    setSelectedProperty(item);
    setInquiryOpen(true);
  };

  const handleOpenVisit = (item) => {
    setSelectedProperty(item);
    setVisitOpen(true);
  };

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
    <div className="page-shell">
      <section className="section-card">
        <h2 className="section-title">Property Listings</h2>
        <Paragraph className="section-subtitle">Search premium homes, apartments, flats, and commercial spaces across Lahore with real-time insights.</Paragraph>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <Select defaultValue="All Types" style={{ minWidth: 180 }}>
            <Select.Option value="All Types">All Types</Select.Option>
            <Select.Option value="House">House</Select.Option>
            <Select.Option value="Apartment">Apartment</Select.Option>
            <Select.Option value="Flat">Flat</Select.Option>
          </Select>
          <Select
            value={selectedArea}
            style={{ minWidth: 180 }}
            onChange={(value) => {
              if (value === 'All Areas') {
                setSearchParams({});
              } else {
                setSearchParams({ area: value });
              }
            }}
          >
            {areaOptions.map((area) => (
              <Select.Option key={area} value={area}>{area}</Select.Option>
            ))}
          </Select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <MapView selectedArea={selectedArea} />
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
                    <img alt={property.title} src={property.image} />
                    <div className="cover-actions">
                      <Button type="primary" icon={<EyeOutlined />} onClick={() => { import('../utils/selectedPropertyStorage.jsx').then(m => m.saveSelectedProperty(property)); navigate(`/properties/${property.id}`); }}>View</Button>
                      <Button onClick={() => { import('../utils/selectedPropertyStorage.jsx').then(m => m.saveSelectedProperty(property)); navigate(`/contact?propertyId=${property.id}&propertyTitle=${encodeURIComponent(property.title || '')}&propertyType=${encodeURIComponent(property.type || '')}`); }}>Contact</Button>
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
      </section>
      <ActionModal open={Boolean(selectedProperty) && modalType !== 'contact'} onClose={() => setSelectedProperty(null)} type={modalType} item={selectedProperty} onSubmit={handleModalSubmit} />
      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} property={selectedProperty} onSubmitted={() => toast.success('Inquiry submitted.')} />
      <VisitModal open={visitOpen} onClose={() => setVisitOpen(false)} property={selectedProperty} onSubmitted={() => toast.success('Visit request submitted.')} />
    </div>
  );
}

export default PropertyListingsPage;
