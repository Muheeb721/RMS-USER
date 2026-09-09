import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import './home-redesign.css';

export default function HeroSection() {
  return (
    <section className="hr-hero">
      <div className="hr-hero-inner">
        <div className="hr-hero-copy">
          <span className="hr-chip">SMART PROPERTY + RENTAL MANAGEMENT</span>
          <h1 className="hr-title">Find Your Perfect Home</h1>
          <p className="hr-sub">
            RMS helps you buy, rent, manage rentals, track payments, and stay on top of maintenance in DHA and Askari communities.
          </p>

          <div className="hr-cta">
            <Link to="/properties" className="btn-primary"><SearchOutlined /> Explore Properties</Link>
            <Link to="/properties?transaction=Rent" className="btn-secondary">Find a Rental</Link>
          </div>

          <div className="hr-feature-badges">
            <span>Property Buying</span>
            <span>Property Renting</span>
            <span>Rental Management</span>
            <span>Tenant Support</span>
          </div>
        </div>

        <div className="hr-hero-visual" aria-hidden>
          <div className="hr-visual-card hr-card-top">
            <strong>1,240+</strong>
            <span>Listings</span>
          </div>
          <div className="hr-visual-image" />
          <div className="hr-visual-card hr-card-bottom">
            <strong>24/7</strong>
            <span>Tenant support</span>
          </div>
        </div>
      </div>

      <div className="hr-trust-row">
        <div className="hr-trust-item">
          <span className="hr-trust-icon">🏠</span>
          <div>
            <strong>Property Buying</strong>
            <small>Modern homes & investments</small>
          </div>
        </div>
        <div className="hr-trust-item">
          <span className="hr-trust-icon">🔑</span>
          <div>
            <strong>Property Renting</strong>
            <small>Find homes & rooms easily</small>
          </div>
        </div>
        <div className="hr-trust-item">
          <span className="hr-trust-icon">💳</span>
          <div>
            <strong>Payments</strong>
            <small>Track rent & reminders</small>
          </div>
        </div>
        <div className="hr-trust-item">
          <span className="hr-trust-icon">🛠️</span>
          <div>
            <strong>Maintenance</strong>
            <small>Complaint resolution flow</small>
          </div>
        </div>
      </div>
    </section>
  );
}
