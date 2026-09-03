import { Layout, Dropdown } from "antd";
import {
  HomeOutlined,
  InfoCircleOutlined,
  CompassOutlined,
  DollarCircleOutlined,
  PhoneOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/store";
import NotificationBell from "./Notifications/NotificationBell";
import "../pages/header.css";

const { Header } = Layout;

function HeaderNav() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const demoMenuItems = [
    { key: "demo-overview", label: <Link to="/demo">Demo</Link> },
    { key: "demo-house", label: <Link to="/demo/house">Demo House</Link> },
    { key: "demo-flat", label: <Link to="/demo/flats">Demo Flat / Apartment</Link> },
    { key: "demo-hostel", label: <Link to="/demo/hostel">Demo Hostel</Link> },
    { key: "demo-rooms", label: <Link to="/demo/rooms">Demo Rooms</Link> },
    { key: "demo-apartments", label: <Link to="/demo/apartments">Demo Apartments</Link> },
  ];

  const navItems = [
    { to: "/", label: "Home", icon: <HomeOutlined /> },
    { to: "/about", label: "About", icon: <InfoCircleOutlined /> },
    { to: "/services", label: "Services", icon: <DashboardOutlined /> },
    { to: "/demo", label: "Demo", special: "dropdown" },
    { to: "/contact", label: "Contact", icon: <PhoneOutlined /> },
    { to: "/properties", label: "Properties", icon: <CompassOutlined /> },
    { to: "/ai-recommendations", label: "AI Recommendations", icon: <DashboardOutlined /> },
    { to: "/bookings", label: "Bookings", icon: <DollarCircleOutlined /> },
    { to: "/maintenance", label: "Maintenance", icon: <DashboardOutlined /> },
    { to: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    { to: "/payments", label: "Payments", icon: <DollarCircleOutlined /> },
  ];

  const renderNavItem = (item) => {
    if (item.special === "dropdown") {
      return (
        <Dropdown
          key={item.label}
          menu={{ items: demoMenuItems }}
          trigger={["click"]}
          placement="bottomLeft"
        >
          <button type="button" className="top-nav-link dropdown-nav-button">
            {item.label}
          </button>
        </Dropdown>
      );
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          isActive ? "top-nav-link active" : "top-nav-link"
        }
      >
        {item.label}
      </NavLink>
    );
  };

  return (
    <Header
      className="topbar"
      style={{
        background: theme === "dark" ? "#0b2450" : "rgba(255,255,255,0.9)",
        position: "relative",
        zIndex: 100,
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(231,235,242,0.9)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: theme === "dark" ? "#fff" : "#0b2450",
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #0b2450 0%, #28b463 100%)",
              color: "#fff",
            }}
          >
            🏠
          </div>
          <div>
            <div style={{ fontSize: 16, lineHeight: 1.1 }}>RMS</div>
            <div
              style={{
                fontSize: 12,
                color: theme === "dark" ? "#cbd5e1" : "#687386",
                fontWeight: 600,
              }}
            >
              Residential Management System
            </div>
          </div>
        </Link>

        <nav className="topbar-nav">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Mobile hamburger button */}
        <button
          className="hamburger"
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen((s) => !s)}
        >
          <span className={isMenuOpen ? "line open" : "line"} />
          <span className={isMenuOpen ? "line open" : "line"} />
          <span className={isMenuOpen ? "line open" : "line"} />
        </button>

        <div className="topbar-actions">
          <NotificationBell />
          <Link to="/dashboard" className="btn-primary" style={{ padding: '8px 12px', marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <DashboardOutlined /> Dashboard
          </Link>
          <Link to="/my-rent" className="btn-secondary" style={{ padding: '8px 12px', marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <DollarCircleOutlined /> My Rent
          </Link>
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: theme === "dark" ? "#fff" : "#0b2450",
              fontSize: 18,
            }}
          >
          </button>
          <Link to="/login" className="btn-secondary" style={{ padding: "8px 14px" }}>
            Login
          </Link>
        </div>

        {/* Mobile fixed menu overlay (keeps header fixed) */}
        <div className={isMenuOpen ? "mobile-menu open" : "mobile-menu"}>
          <div className="mobile-menu-inner">
            <nav className="mobile-nav">
              {navItems.map((item) => {
                if (item.special === "dropdown") {
                  return (
                    <Dropdown
                      key={item.label}
                      menu={{ items: demoMenuItems }}
                      trigger={["click"]}
                      placement="bottomLeft"
                    >
                      <button
                        type="button"
                        className="top-nav-link dropdown-nav-button"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </button>
                    </Dropdown>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      isActive ? "top-nav-link active" : "top-nav-link"
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mobile-actions">
              <Link to="/login" className="btn-secondary" onClick={() => setIsMenuOpen(false)} style={{ padding: '8px 14px' }}>Login</Link>
              <Link to="/signup" className="btn-secondary" onClick={() => setIsMenuOpen(false)} style={{ padding: '8px 14px' }}>Signup</Link>
              {/* Get Started removed from mobile menu per request */}
            </div>
          </div>
        </div>
      </div>
    </Header>
  );
}

export default HeaderNav;
