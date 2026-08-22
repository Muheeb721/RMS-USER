import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { propertyData as initialPropertyData } from "../data/dummyData";
import { recordDashboardSubmission } from '../utils/dashboardSubmissionStorage.jsx';
import { add as addPriceHistory } from '../utils/priceHistoryStorage.jsx';
import { setVerified as setVerifiedStorage, isVerified as isPropertyVerified } from '../utils/propertyVerificationStorage.jsx';
import { createNotification } from '../services/notificationService.jsx';
import { addStoredNotification } from '../utils/notificationsStorage.jsx';
import { increment as incrementPropertyView, getCount as getPropertyViewCount } from "../utils/propertyViewsStorage.jsx";

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

  const image = item.image || images[0] || FALLBACK_IMAGE;

  return {
    id: item.id ?? fallbackId,
    source: 'property',
    title: item.title || item.name || "Untitled Property",
    description: item.description || "Premium property managed through RMS.",
    price:
      item.price || item.rentPrice || item.salePrice || "Contact for price",
    rentPrice: item.rentPrice || item.price || "",
    salePrice: item.salePrice || "",
    type: item.type || "Property",
    location: item.location || item.address || "Lahore",
    address: item.address || item.location || "Lahore",
    area: item.area || "Lahore",
    bedrooms: item.bedrooms ?? 0,
    bathrooms: item.bathrooms ?? 0,
    parking: item.parking ?? 1,
    status: item.status || item.availability || "Available",
    availability: item.availability || item.status || "Available",
    amenities: Array.isArray(item.amenities) ? item.amenities : [],
    contact: item.contact || "+92 300 1234567",
    owner: item.owner || "RMS Admin",
    image,
    images,
    lat: item.lat ?? 31.5204,
    lng: item.lng ?? 74.3587,
    category: item.category || "Featured",
  };
};

const getInitialProperties = () => {
  if (typeof window === "undefined") {
    return initialPropertyData.map((item, index) =>
      normalizeProperty(item, index + 1),
    );
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((item, index) => normalizeProperty(item, index + 1));
      }
    }
  } catch (error) {
    console.error("Unable to load saved properties:", error);
  }

  return initialPropertyData.map((item, index) =>
    normalizeProperty(item, index + 1),
  );
};

const PropertyContext = createContext(null);

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState(getInitialProperties);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    }
  }, [properties]);

  const value = useMemo(
    () => ({
      properties,
      addProperty: (property) => {
        const nextProperty = normalizeProperty(
          { ...property, id: property.id || Date.now() },
          Date.now(),
        );
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
      updateProperty: (id, updates) => {
        setProperties((prev) =>
          prev.map((item) => {
            if (item.id !== id) return item;

            const nextImages =
              Array.isArray(updates.images) && updates.images.length
                ? updates.images
                : Array.isArray(item.images) && item.images.length
                  ? item.images
                  : [item.image];

            // preserve price history when price changes
            const prevPrice = item.price;
            const nextPrice = updates.price ?? updates.salePrice ?? updates.rentPrice ?? prevPrice;
            if (nextPrice !== prevPrice) {
              try {
                addPriceHistory({ propertyId: id, previousPrice: prevPrice, newPrice: nextPrice, changedAt: new Date().toISOString() });
                try {
                  const note = createNotification({ type: 'announcement', title: 'Price Changed', message: `${item.title || 'Property'}: ${prevPrice} → ${nextPrice}` });
                  addStoredNotification(note);
                } catch (e) {}
              } catch (e) {
                console.error('unable to record price history', e);
              }
            }

            // update verification state if provided
            if (typeof updates.verified !== 'undefined') {
              try {
                setVerifiedStorage(id, Boolean(updates.verified));
              } catch (e) {
                console.error('unable to set verification', e);
              }
            }

            return normalizeProperty(
              {
                ...item,
                ...updates,
                id,
                image: updates.image || item.image || nextImages[0],
                images: nextImages,
                amenities: Array.isArray(updates.amenities)
                  ? updates.amenities
                  : typeof updates.amenities === "string"
                    ? updates.amenities
                        .split(",")
                        .map((entry) => entry.trim())
                        .filter(Boolean)
                    : item.amenities || [],
                status:
                  updates.status ||
                  item.status ||
                  item.availability ||
                  "Available",
                availability:
                  updates.availability ||
                  updates.status ||
                  item.availability ||
                  item.status ||
                  "Available",
              },
              id,
            );
          }),
        );
      },
      setPropertyStatus: (id, status) => {
        setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, status, availability: status } : p)));
        try {
          const prop = properties.find((p) => p.id === id);
          const note = createNotification({ type: 'announcement', title: 'Property Status Changed', message: `${prop?.title || 'Property'} status updated to ${status}` });
          addStoredNotification(note);
        } catch (e) {}
      },
      setPropertyVerified: (id, verified) => {
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
