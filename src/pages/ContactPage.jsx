import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import "./ContactPage.css";
import { addNotification } from "../redux/store";
import { createContactNotification } from "../services/notificationService.jsx";
import { addStoredNotification } from '../utils/notificationsStorage.jsx';
import { recordDashboardSubmission } from "../utils/dashboardSubmissionStorage.jsx";
import { add as addContactRequest } from "../utils/contactRequestsStorage.jsx";
import { sanitizeFullName } from "../utils/nameValidation.jsx";
import api from "../services/api.js";
import { FALLBACK_IMAGE } from '../utils/imageUtils';
import {
  readSelectedProperty,
  clearSelectedProperty,
} from "../utils/selectedPropertyStorage.jsx";

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
};

const propertyOptions = {
  House: [
    "Modern Family House",
    "Luxury Villa",
    "Green View House",
    "City Residence",
    "Premium Family Home",
  ],
  Apartment: [
    "Downtown Apartment",
    "Luxury Apartment",
    "City View Apartment",
    "Modern Studio",
    "Skyline Residence",
  ],
  Hostel: [
    "City Student Hostel",
    "Prime Boys Hostel",
    "Green View Hostel",
    "University Hostel",
    "Scholars Hostel",
  ],
};

const contactDetails = {
  phone: "+92 304 0044410",
  phoneHref: "tel:+923040044410",
  email: "muheebshahid75@gmail.com",
  emailHref: "mailto:muheebshahid75@gmail.com",
  locationLabel: "DHA Lahore, Pakistan",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=DHA+Lahore+Pakistan",
};

const infoCards = [
  {
    icon: "📞",
    title: "Call Us",
    text: contactDetails.phone,
    href: contactDetails.phoneHref,
    actionLabel: "Call now",
    isActionable: true,
  },
  {
    icon: "✉️",
    title: "Email Us",
    text: contactDetails.email,
    href: contactDetails.emailHref,
    actionLabel: "Email now",
    isActionable: true,
  },
  {
    icon: "📍",
    title: "Visit Our Office",
    text: contactDetails.locationLabel,
    href: contactDetails.mapsHref,
    actionLabel: "Open map",
    isActionable: true,
  },
  {
    icon: "🕒",
    title: "Working Hours",
    text: "Monday - Saturday\n9:00 AM - 6:00 PM",
    isActionable: false,
  },
];

function ContactPage() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialFormState);
  const location = useLocation();
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    // prefer selected property from backend/profile (no localStorage)
    (async () => {
      try {
        const sel = await readSelectedProperty();
        if (sel) {
          setSelectedProperty(sel);
          setFormData((prev) => ({
            ...prev,
            property: sel.title || sel.name || prev.property,
            propertyType: sel.type || prev.propertyType,
            budget: sel.price || prev.budget,
          }));
          return;
        }
      } catch (e) {
        // continue to check URL params
      }
    })();

    if (!location || !location.search) return;
    const params = new URLSearchParams(location.search);
    const propertyTitle = params.get("propertyTitle");
    const propertyType = params.get("propertyType");
    const inquiryType = params.get("inquiryType");
    if (inquiryType) {
      setFormData((prev) => ({ ...prev, inquiryType: decodeURIComponent(inquiryType) }));
    }
    if (propertyTitle) {
      setFormData((prev) => ({
        ...prev,
        property: decodeURIComponent(propertyTitle),
      }));
    }
    if (propertyType) {
      setFormData((prev) => ({
        ...prev,
        propertyType: decodeURIComponent(propertyType),
      }));
    }
  }, [location]);
  const [errors, setErrors] = useState({});
  const [openFaq, setOpenFaq] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    const sanitizedValue =
      name === "fullName" ? sanitizeFullName(value) : value;
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Please enter your name.";
    } else if (!/^[A-Za-z ]+$/.test(formData.fullName.trim())) {
      nextErrors.fullName = "Name can contain only letters and spaces.";
    }
    if (!formData.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]*$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!formData.phone.trim()) {
      nextErrors.phone = "Please enter your contact number.";
    } else if (!/^\+?[0-9\s()-]{7,15}$/.test(formData.phone)) {
      nextErrors.phone = "Please enter a valid contact number.";
    }
    if (!formData.message.trim())
      nextErrors.message = "Please enter your message.";

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const inquiryNotification = {
      title: "New Inquiry Received",
      message: `Your property inquiry for ${selectedProperty?.title || "the selected property"} has been received. Our team will contact you shortly.`,
      category: "Property",
      accent: "info",
      icon: "🏠",
      action: "View Inquiry",
    };

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
      propertyId: selectedProperty?.id || "",
      propertyName: selectedProperty?.title || formData.property || "Selected Property",
      propertyType: selectedProperty?.type || formData.propertyType || "General",
      inquiryType: "General Inquiry",
    };

    try {
      await api.request('/contact', {
        method: 'POST',
        body: payload,
      });
    } catch (apiError) {
      console.error('Contact API submission failed', apiError);
    }

    // If this inquiry is a purchase/buy action and a property is selected, create a booking record
    try {
      const isPurchase = (formData.inquiryType || '').toLowerCase().includes('buy') || (formData.inquiryType || '').toLowerCase().includes('sale') || (payload.propertyType || '').toLowerCase().includes('sale');
      if (selectedProperty && isPurchase) {
        try {
          const bookingService = (await import('../services/bookingService.jsx')).default || (await import('../services/bookingService.js'));
          const bookingPayload = {
            userName: formData.fullName,
            userEmail: formData.email,
            userPhone: formData.phone,
            propertyId: selectedProperty?.id || selectedProperty?._id || '',
            propertyTitle: selectedProperty?.title || selectedProperty?.name || payload.propertyName,
            propertyType: selectedProperty?.type || payload.propertyType,
            amount: Number(selectedProperty?.price || selectedProperty?.amount || 0),
            rent: Number(selectedProperty?.rent || selectedProperty?.price || 0),
            rentFrequency: 'One-time',
            message: payload.message,
            bookingStatus: 'Pending',
            paymentStatus: 'Pending',
          };
          await bookingService.createBooking ? bookingService.createBooking(bookingPayload) : bookingService(bookingPayload);
        } catch (e) {
          console.warn('Create booking for purchase inquiry failed', e);
        }
      }
    } catch (e) {
      console.warn('Purchase booking branch failed', e);
    }

    dispatch(
      addNotification(
        createContactNotification({
          fullName: payload.fullName,
          inquiryType: payload.inquiryType,
          property: payload.propertyName,
          message: payload.message,
          email: payload.email,
        }),
      ),
    );
    // persist contact notification to backend
    try {
      const note = createContactNotification({
        fullName: payload.fullName,
        inquiryType: payload.inquiryType,
        property: payload.propertyName,
        message: payload.message,
        email: payload.email,
      });
      addStoredNotification(note);
    } catch (e) {}

    const contactRecord = {
      id: `contact-${Date.now()}`,
      source: "contact",
      formType: "Contact Inquiry",
      title: "Property inquiry request",
      category: selectedProperty?.type || payload.propertyType || "General",
      status: "New",
      fullName: payload.fullName,
      userName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      propertyId: payload.propertyId,
      propertyName: payload.propertyName,
      propertyImage:
        selectedProperty?.image || selectedProperty?.images?.[0] || "",
      propertyType: payload.propertyType,
      location: selectedProperty?.address || "General inquiry",
      price: selectedProperty?.price || "",
      bedrooms: selectedProperty?.bedrooms || "",
      bathrooms: selectedProperty?.bathrooms || "",
      area: selectedProperty?.area || "",
      description: payload.message,
      message: payload.message,
      submittedAt: new Date().toISOString(),
    };

    recordDashboardSubmission(contactRecord);

    try {
      addContactRequest({
        ...contactRecord,
        message: payload.message,
        inquiryType: payload.inquiryType,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("save contact request", e);
    }

    setShowSuccess(true);
    setFormData(initialFormState);
    setErrors({});
    // clear selected property after successful submission
    try {
      clearSelectedProperty();
      setSelectedProperty(null);
    } catch (e) {}
  };

  const propertyList = propertyOptions[formData.propertyType] || [];
  const showBudgetField = [
    "Buy House",
    "Rent House",
    "Rent Apartment",
  ].includes(formData.inquiryType);
  const showDateField = ["Book Apartment", "Book Hostel Room"].includes(
    formData.inquiryType,
  );
  const dateFieldLabel =
    formData.inquiryType === "Book Hostel Room"
      ? "Check-in Date"
      : "Preferred Date";
  const budgetLabel =
    formData.inquiryType === "Buy House"
      ? "Purchase Budget"
      : "Monthly Rent Budget";

  return (
    <div className="contact-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-badge">
            Trusted Residential Management System
          </span>
          <h1>Let's Find Your Perfect Property</h1>
          <p>
            Looking to buy a house, rent an apartment, or book a hostel? Send us
            your inquiry and our property team will help you find the right
            place.
          </p>
          <div className="hero-actions">
            <a href="#inquiry-form" className="primary-btn">
              Send an Inquiry
            </a>
            <Link to="/properties" className="secondary-btn">
              Explore Properties
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80"
            alt="Modern residential property"
            style={{ width: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
          />
        </div>
      </section>

      <section className="contact-info-section">
        <div className="section-heading">
          <p className="eyebrow">Property Support</p>
          <h2>Contact Our Property Team</h2>
          <p>
            Our team is available to help you with property booking, purchasing,
            renting, availability, and general inquiries.
          </p>
        </div>
        <div className="info-grid">
          {infoCards.map((card) => {
            if (card.isActionable) {
              return (
                <a
                  className="info-card info-card-actionable"
                  key={card.title}
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={card.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  <div className="info-icon">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <span className="info-card-action">{card.actionLabel}</span>
                </a>
              );
            }

            return (
              <div className="info-card" key={card.title}>
                <div className="info-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="inquiry-section">
        <div className="inquiry-preview">
          {selectedProperty ? (
            <div className="selected-property">
              <img
                src={selectedProperty?.image || selectedProperty?.images?.[0] || FALLBACK_IMAGE}
                alt={selectedProperty.title || selectedProperty.name || ""}
                className="selected-property-image"
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
              />
              <div className="selected-property-info">
                <h4>{selectedProperty.title || selectedProperty.name}</h4>
                <div className="selected-property-meta">
                  {selectedProperty.type} •{" "}
                  {selectedProperty.purpose ||
                    selectedProperty.saleOrRent ||
                    selectedProperty.availability ||
                    ""}
                </div>
                <div className="selected-property-price">
                  {selectedProperty.price}
                </div>
                <div className="selected-property-location">
                  {selectedProperty.address ||
                    selectedProperty.location ||
                    selectedProperty.area}
                </div>
                <div className="selected-property-status">
                  {selectedProperty.availability || selectedProperty.status}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="preview-image" />
              <h3>Interested in a Property?</h3>
              <p>
                Tell us what you're looking for and our team will contact you
                with availability, pricing, and booking information.
              </p>
              <ul>
                <li>✓ Quick Response</li>
                <li>✓ Property Availability</li>
                <li>✓ Booking Assistance</li>
                <li>✓ Purchase & Rental Support</li>
                <li>✓ Professional Property Team</li>
              </ul>
            </>
          )}
        </div>

        <div className="inquiry-card" id="inquiry-form">
          <div className="form-heading">
            <p className="eyebrow">Inquiry Form</p>
            <h2>Property Inquiry Form</h2>
            <p>
              Fill in your information and tell us which property you're
              interested in.
            </p>
          </div>

          <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="fullName">Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  pattern="[A-Za-z ]+"
                  title="Name can contain only letters and spaces."
                />
                {errors.fullName && (
                  <span className="field-error">{errors.fullName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="phone">Contact Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your contact number"
                />
                {errors.phone && (
                  <span className="field-error">{errors.phone}</span>
                )}
              </div>
            </div>

            <div className="form-field single-field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what you are looking for..."
              />
              {errors.message && (
                <span className="field-error">{errors.message}</span>
              )}
            </div>

            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>
        </div>
      </section>

      <section className="map-section">
        <div className="section-heading">
          <p className="eyebrow">Visit Us</p>
          <h2>Find Our Office</h2>
        </div>
        <div className="map-wrapper">
          <div className="map-placeholder">
            <span>Google Map Placeholder</span>
            <p>Lahore, Pakistan</p>
          </div>
          <div className="address-card">
            <h3>RMS Property Management Office</h3>
            <p>{contactDetails.locationLabel}</p>
            <p>Monday - Saturday, 9:00 AM - 6:00 PM</p>
            <a
              href={contactDetails.mapsHref}
              target="_blank"
              rel="noreferrer"
              className="primary-btn visit-office-btn"
            >
              <span aria-hidden="true">📍</span>
              Visit Our Office
            </a>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div>
          <p className="eyebrow">Ready to Move Forward</p>
          <h2>Ready to Find Your Next Home?</h2>
          <p>
            Explore our residential properties and send us an inquiry today.
          </p>
        </div>
        <div className="cta-actions">
          <Link to="/properties" className="secondary-btn">
            Explore Properties
          </Link>
          <a href="#inquiry-form" className="primary-btn">
            Contact Our Team
          </a>
        </div>
      </section>

      {showSuccess && (
        <div className="success-modal" role="dialog" aria-modal="true">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h3>Inquiry Submitted Successfully!</h3>
            <p>
              Thank you for contacting RMS. Your property inquiry has been
              received. Our team will contact you shortly.
            </p>
            <div className="success-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => setShowSuccess(false)}
              >
                Close
              </button>
              <Link
                to="/properties"
                className="secondary-btn"
                onClick={() => setShowSuccess(false)}
              >
                Back to Properties
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactPage;
