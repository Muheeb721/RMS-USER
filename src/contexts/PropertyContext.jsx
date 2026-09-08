import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { propertyData as initialPropertyData } from "../data/dummyData";
import propertyService from '../services/propertyService';
import { recordDashboardSubmission } from '../utils/dashboardSubmissionStorage.jsx';
import { add as addPriceHistory } from '../utils/priceHistoryStorage.jsx';
import { setVerified as setVerifiedStorage, isVerified as isPropertyVerified } from '../utils/propertyVerificationStorage.jsx';
import { createNotification } from '../services/notificationService.jsx';
import { addStoredNotification } from '../utils/notificationsStorage.jsx';
import { increment as incrementPropertyView, getCount as getPropertyViewCount } from '../utils/propertyViewsStorage.jsx';
import { recordAdminAction } from '../services/adminActivityService.jsx';

const STORAGE_KEY = "rms_properties";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80";

const normalizeProperty = (item = {}, fallbackId = Date.now()) => {
  const images =
    Array.isArray(item.images) && item.images.length
      ? item.images
      : item.image
        ? [item.image]
        : [FALLBACK_IMAGE];

  const videos = Array.isArray(item.videos) && item.videos.length ? item.videos : (item.video ? [item.video] : []);
  const media3d = Array.isArray(item.media3d) && item.media3d.length ? item.media3d : (item.model3d ? [item.model3d] : []);

  const image = item.image || images[0] || FALLBACK_IMAGE;

  const rawStatus = item.status || item.availability || item.availabilityStatus || 'Available';
  const normalizedStatus = String(rawStatus).trim();

  return {
    id: item._id || item.id || fallbackId,
    source: 'property',
    title: item.title || item.name || "Untitled Property",
    description: item.description || "Premium property managed through RMS.",
    price:
      item.price || item.rentPrice || item.salePrice || "Contact for price",
    rentPrice: item.rentPrice || item.price || "",
    salePrice: item.salePrice || "",
    type: item.type || "Property",
    transactionType: (
      item.transactionType ||
      (['House', 'Apartment'].includes(item.type) ? 'Sale' : (['Flat', 'Room'].includes(item.type) ? 'Rent' : undefined)) ||
      (['House', 'Apartment'].includes(item.type) ? 'Sale' : (['Flat', 'Room'].includes(item.type) ? 'Rent' : 'Sale'))
    ),
    location: item.location || item.address || "Lahore",
    address: item.address || item.location || "Lahore",
    area: item.area || "Lahore",
    bedrooms: item.bedrooms ?? 0,
    bathrooms: item.bathrooms ?? 0,
    parking: item.parking ?? 1,
    status: normalizedStatus === 'Available Now' ? 'Available' : normalizedStatus === 'Ready' ? 'Available' : normalizedStatus === 'Soon Available' ? 'Available' : normalizedStatus,
    availability: normalizedStatus === 'Available Now' ? 'Available' : normalizedStatus === 'Ready' ? 'Available' : normalizedStatus === 'Soon Available' ? 'Available' : normalizedStatus,
    amenities: Array.isArray(item.amenities) ? item.amenities : [],
    contact: item.contact || "+92 300 1234567",
    owner: item.owner || "RMS Admin",
    image,
    images,
    videos,
    media3d,
    lat: item.lat ?? 31.5204,
    lng: item.lng ?? 74.3587,
    category: item.category || "Featured",
    verificationStatus: item.verificationStatus || 'Unverified',
    verified: Boolean(item.verified || item.verificationStatus === 'Verified'),
    views: Number(item.views || 0),
    favorites: Number(item.favorites || 0),
    demandScore: Number(item.demandScore || 0),
  };
};

const getInitialProperties = () => {
  // start with local fallback so UI remains functional until API responds
  return initialPropertyData.map((item, index) => normalizeProperty(item, index + 1));
};

const decodeTokenPayload = () => {
  try {
    const token = typeof window !== 'undefined' ? window.__RMS_AUTH_TOKEN || '' : '';
    if (!token || !token.includes('.')) return null;
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch (error) {
    return null;
  }
};

const isAdminSession = () => {
  const payload = decodeTokenPayload();
  return Boolean(payload && String(payload.role || '').toLowerCase() === 'admin');
};

const PropertyContext = createContext(null);

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState(getInitialProperties);

  // no persistent localStorage writes for properties; data should come from backend via API

  // fetch properties from backend on mount, replacing local data when available
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await propertyService.listProperties();
        if (mounted && res && res.success && Array.isArray(res.data)) {
          setProperties(res.data.map((p, i) => normalizeProperty(p, i + 1)));
        }
      } catch (e) {
        // keep fallback local data
      }
    })();
    return () => { mounted = false; };
  }, []);

  const value = useMemo(
    () => ({
      properties,
      addProperty: async (property) => {
        if (!isAdminSession()) {
          console.warn('Only admin users can add property listings.');
          return null;
        }

        const nextProperty = normalizeProperty(
          { ...property, id: property.id || Date.now() },
          Date.now(),
        );
        // attempt to create on server
        try {
          const res = await propertyService.createProperty(property);
          if (res && res.success) {
            const created = res.data;
            const normalized = normalizeProperty(created, created._id || Date.now());
            setProperties((prev) => [normalized, ...prev]);
            return normalized;
          }
        } catch (e) {
          // fallback to local
        }
        setProperties((prev) => [nextProperty, ...prev]);
        recordDashboardSubmission({
          id: `property-${nextProperty.id}`,
          source: 'property',
          formType: nextProperty.type || 'Property Listing',
          title: nextProperty.title,
          category: nextProperty.type,
          status: nextProperty.status || 'New',
          userName: nextProperty.owner || 'Property Manager',
          email: '',
          phone: nextProperty.contact || '',
          propertyType: nextProperty.type,
          location: nextProperty.address || nextProperty.location || '',
          price: nextProperty.price,
          description: nextProperty.description,
          submittedAt: new Date().toISOString(),
        });
        return nextProperty;
      },
      updateProperty: async (id, updates) => {
        if (!isAdminSession()) {
          console.warn('Only admin users can update property listings.');
          return null;
        }

        // try to update on server
        try {
          const res = await propertyService.updateProperty(id, updates);
          if (res && res.success) {
            const prop = normalizeProperty(res.data, res.data._id || id);
            setProperties((prev) => prev.map((p) => (String(p.id) === String(id) ? prop : p)));
            return prop;
          }
        } catch (e) {
          console.warn('Server update failed, falling back to local update', e);
        }
        // local fallback
        setProperties((prev) => prev.map((item) => (item.id !== id ? item : normalizeProperty({ ...item, ...updates, id }, id))));
      },
      setPropertyStatus: async (id, status) => {
        if (!isAdminSession()) {
          console.warn('Only admin users can change property status.');
          return null;
        }

        const prop = properties.find((p) => p.id === id);
        const previousStatus = prop?.status || 'Available';
        // try server update
        try {
          const res = await propertyService.updateProperty(id, { status });
          if (res && res.success) {
            const updated = normalizeProperty(res.data, res.data._id || id);
            setProperties((prev) => prev.map((p) => (String(p.id) === String(id) ? updated : p)));
          } else {
            setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, status, availability: status } : p)));
          }
        } catch (e) {
          setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, status, availability: status } : p)));
        }
        try {
          await recordAdminAction({
            actionType: 'PROPERTY_STATUS_CHANGED',
            entityType: 'PROPERTY',
            entityId: id,
            userId: prop?.ownerId || '',
            userName: prop?.owner || 'Property Owner',
            propertyName: prop?.title || 'Property',
            previousStatus,
            newStatus: status,
            message: `${prop?.title || 'Property'} status updated to ${status}.`,
            reason: 'Property status was updated by admin review.',
            description: `Admin changed property status for ${prop?.title || 'property'} to ${status}`,
          });
        } catch (e) {}
        try {
          const note = createNotification({ type: 'announcement', title: 'Property Status Changed', message: `${prop?.title || 'Property'} status updated to ${status}` });
          addStoredNotification(note);
        } catch (e) {}
      },
      setPropertyVerified: (id, verified) => {
        if (!isAdminSession()) {
          console.warn('Only admin users can verify properties.');
          return;
        }
        try {
          setVerifiedStorage(id, Boolean(verified));
        } catch (e) {
          console.error('setPropertyVerified', e);
        }
      },
      incrementPropertyView: (id) => {
        try {
          incrementPropertyView(id);
        } catch (e) {
          console.error('incrementPropertyView', e);
        }
      },
      getPropertyViewCount: (id) => getPropertyViewCount(id),
      deleteProperty: (id) => {
        if (!isAdminSession()) {
          console.warn('Only admin users can delete property listings.');
          return;
        }
        setProperties((prev) => prev.filter((item) => item.id !== id));
      },
    }),
    [properties],
  );

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertyContext);

  if (!context) {
    throw new Error("useProperties must be used within a PropertyProvider");
  }

  return context;
}
