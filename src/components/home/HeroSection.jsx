import React from 'react';
import { Link } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import './home-redesign.css';

export default function HeroSection() {
  return (
    <section className="hr-hero">
      <div className="hr-hero-inner">
        <div className="hr-hero-copy">
          <span className="hr-chip">SMART RESIDENTIAL MANAGEMENT</span>
          <h1 className="hr-title">Find Your Perfect Property</h1>
          <p className="hr-sub">Buy your dream house or apartment, or find the perfect flat or room for rent.</p>
          <div className="hr-cta">
            <Link to="/properties" className="btn-primary"><SearchOutlined /> Explore Properties</Link>
            <Link to="/properties?transaction=Rent" className="btn-secondary">Find a Rental</Link>
          </div>
        </div>
        <div className="hr-hero-image" aria-hidden>
          <div className="hr-image" />
        </div>
      </div>
    </section>
  );
}
