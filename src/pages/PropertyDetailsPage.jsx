import { useEffect, useState } from 'react';
import { Card, Row, Col, Descriptions, Button, Tag, Typography, Modal } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperties } from '../contexts/PropertyContext';
import './PropertyDetailsPage.css';
import ActionModal from '../components/ActionModal';
import InquiryModal from '../components/InquiryModal';
import VisitModal from '../components/VisitModal';
import SimilarProperties from '../components/SimilarProperties';
import { listForProperty as listPriceHistory } from '../utils/priceHistoryStorage';
import { increment as incrementView, getCount as getViewCount } from '../utils/propertyViewsStorage';
import { isVerified as isPropertyVerified } from '../utils/propertyVerificationStorage';
const { Text } = Typography;
import { toast } from 'react-toastify';

function PropertyDetailsPage() {
  const { id } = useParams();
  const { properties } = useProperties();
  const property = properties.find((item) => item.id === Number(id));
  const [contactOpen, setContactOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [viewCount, setViewCount] = useState(0);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!property) return <div className="page-shell">Property not found.</div>;

  useEffect(() => {
    try {
      incrementView(property.id);
      setViewCount(getViewCount(property.id));
    } catch (e) {
      // ignore
    }

    try {
      setPriceHistory(listPriceHistory(property.id));
    } catch (e) {}

    try {
      setVerified(isPropertyVerified(property.id));
    } catch (e) {}
  }, [property?.id]);

  useEffect(() => {
    // build images list for gallery
    try {
      const imgs = Array.isArray(property.images) && property.images.length > 0
        ? property.images.slice()
        : property.image ? [property.image] : [];
      // fallback default image if empty
      if (!imgs.length) imgs.push('/src/assets/default-property.jpg');
      setImages(imgs);
      setCurrentIndex(0);
    } catch (e) {
      setImages([]);
    }
  }, [property?.id]);

  useEffect(() => {
    const refreshViews = () => {
      try {
        setViewCount(getViewCount(property.id));
      } catch (e) {}
    };

    const refreshPriceHistory = () => {
      try {
        setPriceHistory(listPriceHistory(property.id));
      } catch (e) {}
    };

    const refreshVerified = () => {
      try {
        setVerified(isPropertyVerified(property.id));
      } catch (e) {}
    };

    window.addEventListener('rms-property-views-updated', refreshViews);
    window.addEventListener('rms-price-history-updated', refreshPriceHistory);
    window.addEventListener('rms-property-verification-updated', refreshVerified);

    return () => {
      window.removeEventListener('rms-property-views-updated', refreshViews);
      window.removeEventListener('rms-price-history-updated', refreshPriceHistory);
      window.removeEventListener('rms-property-verification-updated', refreshVerified);
    };
  }, [property?.id]);

  return (
    <div className="page-shell">
      <section className="section-card">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card>
              <div style={{ position: 'relative' }}>
                <img
                  alt={property.title}
                  src={images[currentIndex]}
                  style={{ width: '100%', height: 420, objectFit: 'cover', borderRadius: 6 }}
                  onClick={() => setLightboxOpen(true)}
                />
                {images.length > 1 && (
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                    <Button onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}>&larr;</Button>
                  </div>
                )}
                {images.length > 1 && (
                  <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                    <Button onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}>&rarr;</Button>
                  </div>
                )}
                <div style={{ position: 'absolute', right: 12, bottom: 12, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '6px 10px', borderRadius: 16, fontWeight: 700 }}>
                  {currentIndex + 1}/{images.length}
                </div>
              </div>

              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto' }}>
                  {images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`${property.title} ${idx + 1}`}
                      onClick={() => setCurrentIndex(idx)}
                      style={{ width: 84, height: 64, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: idx === currentIndex ? '2px solid #28b463' : '1px solid #e6eef6' }}
                    />
                  ))}
                </div>
              )}

              <Modal visible={lightboxOpen} footer={null} onCancel={() => setLightboxOpen(false)} centered width={'80%'}>
                <div style={{ textAlign: 'center' }}>
                  <img src={images[currentIndex]} alt={property.title} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
                </div>
              </Modal>

              <h2 className="section-title" style={{ marginTop: 16 }}>{property.title}</h2>
              <p style={{ color: '#64809b' }}>{property.address}</p>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Tag color={property.status === 'Sold' ? 'red' : property.status === 'Reserved' ? 'gold' : property.status === 'For Rent' ? 'blue' : 'green'}>
                  {property.status}
                </Tag>
                {verified && <Tag color="cyan">✓ RMS Verified Property</Tag>}
                <Text type="secondary" style={{ marginLeft: 'auto' }}>Views: {viewCount}</Text>
              </div>
              <Descriptions column={1} style={{ marginTop: 12 }}>
                <Descriptions.Item label="Price">{property.price}</Descriptions.Item>
                {priceHistory && priceHistory.length > 0 ? (
                  <Descriptions.Item label="Price History">
                    <div>
                      {priceHistory.map((h) => (
                        <div key={h.id} style={{ fontSize: 12 }}>
                          <span style={{ color: '#888' }}>{new Date(h.changedAt).toLocaleString()}</span>: {h.previousPrice} → {h.newPrice}{' '}
                          {Number(String(h.previousPrice).replace(/[^0-9.-]+/g, '')) > Number(String(h.newPrice).replace(/[^0-9.-]+/g, '')) ? <span style={{ color: 'red' }}>Price Reduced</span> : null}
                        </div>
                      ))}
                    </div>
                  </Descriptions.Item>
                ) : null}
                <Descriptions.Item label="Area">{property.area}</Descriptions.Item>
                <Descriptions.Item label="Bedrooms">{property.bedrooms}</Descriptions.Item>
                <Descriptions.Item label="Bathrooms">{property.bathrooms}</Descriptions.Item>
                <Descriptions.Item label="Parking">{property.parking}</Descriptions.Item>
                <Descriptions.Item label="Owner">{property.owner}</Descriptions.Item>
                <Descriptions.Item label="Contact">{property.contact}</Descriptions.Item>
              </Descriptions>
              <div className="card-actions">
                <Button type="primary" onClick={() => { import('../utils/selectedPropertyStorage.jsx').then(m => m.saveSelectedProperty(property)); navigate('/contact'); }}>Contact About This Property</Button>
                <Button onClick={() => setVisitOpen(true)}>Schedule a Visit</Button>
                <Button onClick={() => { setIsSaved((saved) => !saved); toast.success(isSaved ? 'Listing removed from saved items.' : 'Listing saved successfully.'); }}>{isSaved ? 'Saved' : 'Save Listing'}</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </section>
      <ActionModal open={contactOpen} onClose={() => setContactOpen(false)} type="contact" item={property} onSubmit={() => toast.success('Your viewing request has been sent.')} />
      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} property={property} onSubmitted={() => toast.success('Inquiry submitted.')} />
      <VisitModal open={visitOpen} onClose={() => setVisitOpen(false)} property={property} onSubmitted={() => toast.success('Visit request submitted.')} />
      <SimilarProperties property={property} />
    </div>
  );
}

export default PropertyDetailsPage;
