import { Link } from 'react-router-dom';
import './AboutPage.css';
import { FALLBACK_IMAGE } from '../utils/imageUtils';

const benefits = [
  { title: 'Easy to Use', icon: '✓' },
  { title: 'Secure & Reliable', icon: '🔒' },
  { title: 'Faster Management', icon: '⚡' },
  { title: 'Better Resident Experience', icon: '✨' },
];

function AboutPage() {
  return (
    <div className="about-page">
      <section className="hero-section" id="home">
        <div className="hero-copy1">
          <span className="section-tag">ABOUT US</span>
          <h1>Making Residential Management Simple & Smarter</h1>
          <p>
            RMS is a smart and comprehensive Residential Management System designed to connect residents, property managers, landlords, and service providers on one integrated platform.
          </p>
          <div className="hero-actions">
            <Link to="/contact" className="primary-btn">Get Started →</Link>
            <a href="#contact" className="secondary-btn">Contact Us</a>
          </div>
        </div>
        <div className="hero-visual">
          <img src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80" alt="Luxury apartment" style={{ width: '100%', objectFit: 'cover' }} onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} />
        </div>
      </section>

      <section className="who-we-are-section" id="about">
        <div className="who-we-are-image">
          <img src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80" alt="Residential community" style={{ width: '100%', objectFit: 'cover' }} onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} />
        </div>
        <div className="who-we-are-copy">
          <span className="section-tag green">WHO WE ARE</span>
          <h2>Who We Are</h2>
          <p>
            RMS is a digital platform designed to simplify and automate residential property management with modern tools for residents, owners, and operators.
          </p>
          <div className="feature-list">
            <div className="feature-pill">Smart Solutions</div>
            <div className="feature-pill">Better Communities</div>
            <div className="feature-pill">Trusted Platform</div>
          </div>
        </div>
      </section>

      

      <section className="mission-section">
        
        <div className="mission-copy">
          <span className="section-tag">OUR MISSION</span>
          <h2>Our mission is to create smarter, safer, and better-managed residential communities.</h2>
        </div>
      </section>

      <section className="vision-mission-section">
        <div className="vision-card">
          <span className="section-tag green">OUR VISION</span>
          <h3>Our Vision</h3>
          <p>
            To become a leading residential management platform that transforms how communities are managed, experienced, and connected.
          </p>
        </div>
        <div className="vision-card">
          <span className="section-tag">OUR MISSION</span>
          <h3>Our Mission</h3>
          <p>
            To provide smart, secure, and efficient tools that simplify property operations and improve the living experience for residents and managers.
          </p>
        </div>
      </section>

      <section className="benefits-section" id="properties">
        <div className="section-heading-center">
          <h2>Why Thousands Choose RMS</h2>
        </div>
        <div className="benefits-grid">
          {benefits.map((item) => (
            <div className="benefit-card" key={item.title}>
              <div className="benefit-icon">{item.icon}</div>
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-section" id="pricing">
        <div className="stat-card">
          <h3>500+</h3>
          <p>Properties Managed</p>
        </div>
        <div className="stat-card">
          <h3>10K+</h3>
          <p>Residents Served</p>
        </div>
        <div className="stat-card">
          <h3>95%</h3>
          <p>Satisfaction Rate</p>
        </div>
        <div className="stat-card">
          <h3>24/7</h3>
          <p>Support</p>
        </div>
      </section>

      <section className="cta-section" id="contact">
        <div className="cta-image">
          <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80" alt="Premium property" style={{ width: '100%', objectFit: 'cover' }} onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} />
        </div>
        <div className="cta-copy">
          <h2>Ready to Manage Your Property Smarter?</h2>
          <p>Join RMS and simplify your residential management experience.</p>
          <Link to="/contact" className="primary-btn">Get Started →</Link>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
