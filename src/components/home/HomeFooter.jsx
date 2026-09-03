import React from 'react';
import { Link } from 'react-router-dom';
import './home-redesign.css';

export default function HomeFooter(){
  return (
    <footer className="hr-footer">
      <div className="hr-footer-inner">
        <div className="hr-brand">RMS</div>
        <div className="hr-links">
          <div>
            <h5>Quick Links</h5>
            <Link to="/properties">Properties</Link>
            <Link to="/properties?transaction=Sale">For Sale</Link>
            <Link to="/properties?transaction=Rent">For Rent</Link>
          </div>
          <div>
            <h5>Company</h5>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/faq">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
