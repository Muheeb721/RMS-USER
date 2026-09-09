import { useEffect, useState } from 'react';
import { Card, Row, Col, Descriptions, Button, Tag, Typography, Modal, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import propertyService from '../services/propertyService';
import { useProperties } from '../contexts/PropertyContext';
import './PropertyDetailsPage.css';
import ActionModal from '../components/ActionModal';
import InquiryModal from '../components/InquiryModal';
import VisitModal from '../components/VisitModal';
import SimilarProperties from '../components/SimilarProperties';
import RentalBookingModal from '../components/RentalBookingModal';
import { listForProperty as listPriceHistory } from '../utils/priceHistoryStorage';
import { FALLBACK_IMAGE } from '../utils/imageUtils';
import { increment as incrementView, getCount as getViewCount } from '../utils/propertyViewsStorage';
import { isVerified as isPropertyVerified } from '../utils/propertyVerificationStorage';
import { resolveUniquePropertyImage } from '../utils/propertyImageCatalog';
const { Text } = Typography;
import { toast } from 'react-toastify';

const statusColorMap = {
  Available: 'green',
  Reserved: 'gold',
  Sold: 'red',
  'For Rent': 'blue',
};

function PropertyDetailsPage() {
  const { id } = useParams();
  const { properties } = useProperties();
  const [propertyState, setPropertyState] = useState(null);
  const fallbackId = id;

  const findLocal = () => properties.find((item) => String(item.id) === String(id) || String(item._id) === String(id));

  const property = propertyState || findLocal() || null;
  const [contactOpen, setContactOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [viewCount, setViewCount] = useState(0);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // fetch property from backend by id (fallback to local if needed)
        const res = await propertyService.getPropertyById(id).catch(() => null);
        if (res && res.success && res.data) {
          const item = res.data;
          const imgs = Array.isArray(item.images) && item.images.length ? item.images : item.image ? [item.image] : [];
          const uniqueImages = imgs.map((src, index) => resolveUniquePropertyImage({ ...item, image: src, title: item.title || item.name || 'Property', type: item.type || item.propertyType || item.category || 'Property' }, 'properties', index)).filter(Boolean);
          const normalized = {
            id: item._id || item.id || fallbackId,
            title: item.title || item.name || 'Untitled Property',
            description: item.description || '',
            price: item.price || item.rent || item.salePrice || '',
            type: item.type || item.propertyType || item.category || 'Property',
            location: item.location || item.address || '',
            address: item.address || item.location || '',
            area: item.area || '',
            bedrooms: item.bedrooms || 0,
            bathrooms: item.bathrooms || 0,
            parking: item.parking || 0,
            status: item.status || item.availability || 'Available',
            image: uniqueImages[0] || resolveUniquePropertyImage({ ...item, title: item.title || item.name || 'Property', type: item.type || item.propertyType || item.category || 'Property' }, 'properties', 0) || FALLBACK_IMAGE,
            images: uniqueImages.length ? uniqueImages : [resolveUniquePropertyImage({ ...item, title: item.title || item.name || 'Property', type: item.type || item.propertyType || item.category || 'Property' }, 'properties', 0) || FALLBACK_IMAGE],
            owner: item.ownerName || item.owner || 'RMS Admin',
            contact: item.contact || '+92 300 1234567',
          };
          if (mounted) setPropertyState(normalized);
        }

        const propId = (property && property.id) || id;

        await incrementView(propId).catch(() => null);

        const cnt = await getViewCount(propId).catch(() => 0);
        if (mounted) setViewCount(cnt || 0);

        const ph = await listPriceHistory(propId).catch(() => []);
        if (mounted) setPriceHistory(ph || []);

        const v = await isPropertyVerified(propId).catch(() => false);
        if (mounted) setVerified(Boolean(v));
      } catch (e) {
        if (mounted) setError('Failed to load property details');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [property?.id, id]);

  useEffect(() => {
    // build images list for gallery
    try {
      const imgs = Array.isArray(property.images) && property.images.length > 0
        ? property.images.slice()
        : property.image ? [property.image] : [];
      const unique = imgs.map((src, index) => resolveUniquePropertyImage({ ...property, image: src, title: property.title || 'Property', type: property.type || 'Property' }, 'properties', index)).filter(Boolean);
      if (!unique.length) unique.push(resolveUniquePropertyImage({ ...property, title: property.title || 'Property', type: property.type || 'Property' }, 'properties', 0) || FALLBACK_IMAGE);
      setImages(unique);
      setCurrentIndex(0);
    } catch (e) {
      setImages([]);
    }
  }, [property?.id]);

  useEffect(() => {
    if (!property?.id) return undefined;

    const refreshViews = async () => {
      try {
        const cnt = await getViewCount(property.id);
        setViewCount(cnt || 0);
      } catch (e) { console.warn(e); }
    };

    const refreshPriceHistory = async () => {
      try {
        const ph = await listPriceHistory(property.id);
        setPriceHistory(ph || []);
      } catch (e) { console.warn(e); }
    };

    const refreshVerified = async () => {
      try {
        const v = await isPropertyVerified(property.id);
        setVerified(Boolean(v));
      } catch (e) { console.warn(e); }
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

  if (!property) {
    return (
      <div className="page-shell">
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

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
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
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
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                    />
                  ))}
                </div>
              )}

              <Modal visible={lightboxOpen} footer={null} onCancel={() => setLightboxOpen(false)} centered width={'80%'}>
                <div style={{ textAlign: 'center' }}>
                  <img src={images[currentIndex]} alt={property.title} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} />
                </div>
              </Modal>

              <h2 className="section-title" style={{ marginTop: 16 }}>{property.title}</h2>
              <p style={{ color: '#64809b' }}>{property.address}</p>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Tag color={statusColorMap[property.status] || 'green'}>{property.status}</Tag>
                {verified && <Tag color="cyan">🛡️ RMS Verified</Tag>}
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
                <Button
                  type="primary"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      const params = new URLSearchParams();
                      params.set('propertyTitle', property.title || property.name || '');
                      params.set('propertyType', property.type || property.propertyType || '');
                      navigate(`/login?redirect=${encodeURIComponent('/contact?' + params.toString())}`);
                      return;
                    }

                    try {
                      const m = await import('../utils/selectedPropertyStorage.jsx');
                      await m.saveSelectedProperty(property);
                    } catch (e) {
                      console.warn('Save selected property failed, proceeding to contact page', e);
                    }

                    navigate('/contact');
                  }}
                >
                  Contact About This Property
                </Button>
                <Button onClick={() => setVisitOpen(true)}>Schedule a Visit</Button>
                {property.transactionType === 'Rent' && (
                  <Button
                    type="primary"
                    onClick={async () => {
                      if (!isAuthenticated) {
                        navigate(`/login?redirect=${encodeURIComponent(`/rental-application?propertyId=${property.id}`)}`);
                        return;
                      }
                      try {
                        const m = await import('../utils/selectedPropertyStorage.jsx');
                        await m.saveSelectedProperty(property);
                      } catch (e) {
                        console.warn('Save selected property failed', e);
                      }
                      navigate(`/rental-application?propertyId=${property.id}`);
                    }}
                    style={{ background: '#28b463', borderColor: '#28b463' }}
                  >
                    Rent Now
                  </Button>
                )}
                <Button onClick={() => { setIsSaved((saved) => !saved); toast.success(isSaved ? 'Listing removed from saved items.' : 'Listing saved successfully.'); }}>{isSaved ? 'Saved' : 'Save Listing'}</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </section>
      <ActionModal open={contactOpen} onClose={() => setContactOpen(false)} type="contact" item={property} onSubmit={() => toast.success('Your viewing request has been sent.')} />
      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} property={property} onSubmitted={() => toast.success('Inquiry submitted.')} />
      <VisitModal open={visitOpen} onClose={() => setVisitOpen(false)} property={property} onSubmitted={() => toast.success('Visit request submitted.')} />
      <RentalBookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} property={property} />
      <SimilarProperties property={property} />
    </div>
  );
}

export default PropertyDetailsPage;
