import React from 'react';
import { Row, Col, Card } from 'antd';
import { SafetyOutlined, HomeOutlined, BuildOutlined, BankOutlined } from '@ant-design/icons';
import './home-redesign.css';

export default function WhyChooseRMS() {
  const items = [
    { icon: <SafetyOutlined />, title: 'Verified Properties', text: 'Trusted properties with verified owner profiles.' },
    { icon: <HomeOutlined />, title: 'Easy Booking', text: 'Quick booking flow and confirmations.' },
    { icon: <BankOutlined />, title: 'Secure Payments', text: 'Secure payment flow and receipts.' },
    { icon: <BuildOutlined />, title: 'Professional Support', text: 'Responsive support for owners and residents.' },
  ];

  return (
    <section className="hr-section hr-why">
      <div className="section-header">
        <div>
          <h3 className="section-title">Why Choose RMS</h3>
          <p className="section-sub">A premium experience for residents, owners, and administrators.</p>
        </div>
      </div>
      <Row gutter={[16,16]}>
        {items.map((it) => (
          <Col xs={24} sm={12} md={6} key={it.title}>
            <Card className="why-card">
              <div className="why-icon">{it.icon}</div>
              <h4>{it.title}</h4>
              <p className="muted">{it.text}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
