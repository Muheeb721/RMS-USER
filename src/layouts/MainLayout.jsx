import { Layout } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import HeaderNav from "../components/Header";
import "../styles/global.css";

const { Content, Footer } = Layout;

function MainLayout() {
  const location = useLocation();
  const [siteContent, setSiteContent] = useState({
    brandName: 'RMS',
    footerDescription: 'Premium residential management for properties, residents, payments, and maintenance.',
  });
  const showHeader = location.pathname !== "/signup" && location.pathname !== "/signup/";

  useEffect(() => {
    let active = true;
    fetch('/api/site-content')
      .then((response) => response.json())
      .then((result) => {
        if (!active || !result?.success || !result?.data) return;
        setSiteContent((prev) => ({ ...prev, ...result.data }));
      })
      .catch(() => {
        // keep defaults
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f6f8fc" }}>
      {showHeader && <HeaderNav />}

      <div className="main-content">
        <Content className="page-shell">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </Content>
      </div>

      <Footer
        style={{
          background: "#0b2450",
          color: "#e2e8f0",
          padding: "32px 16px 24px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>
              {siteContent.brandName || 'RMS'}
            </div>
            <p style={{ margin: "8px 0 0", color: "#cbd5e1", lineHeight: 1.7 }}>
              {siteContent.footerDescription || 'Premium residential management for properties, residents, payments, and maintenance.'}
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              Company
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <Link to="/about">About Us</Link>
              <Link to="/services">Services</Link>
              <Link to="/demo">Demo</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              Services
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <span>Property Management</span>
              <span>Rent Management</span>
              <span>Maintenance</span>
              <span>Resident Management</span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              Support
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <Link to="/faq">FAQ</Link>
              <a href={siteContent.emailHref || 'mailto:muheebshahid75@gmail.com'}>{siteContent.contactEmail || 'Help Center'}</a>
              <Link to="/contact">Contact Support</Link>
            </div>
          </div>
        </div>
        <div
          style={{
            maxWidth: 1280,
            margin: "20px auto 0",
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            color: "#94a3b8",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span>© 2026 RMS. All rights reserved.</span>
          <span>Privacy Policy · Terms & Conditions</span>
        </div>
      </Footer>
    </Layout>
  );
}

export default MainLayout;
