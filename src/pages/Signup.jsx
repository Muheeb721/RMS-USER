import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login, addNotification } from "../redux/store";
import {
  saveSessionUser,
  createLoginNotification,
  createSignupNotification,
} from "../services/notificationService.jsx";
import { sanitizeFullName } from "../utils/nameValidation.jsx";
import "./Signup.css";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    accountType: "customer",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Please enter your full name";
    } else if (!/^[A-Za-z ]+$/.test(form.name.trim())) {
      errs.name = "Full name can contain only letters and spaces";
    }
    if (!form.email.trim()) errs.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Please enter a valid email";
    if (!form.phone.trim()) errs.phone = "Please enter your phone number";
    else if (!/^\+?[0-9]{7,15}$/.test(form.phone.replace(/\s+/g, "")))
      errs.phone = "Enter a valid phone number";
    if (!form.password) errs.password = "Please enter a password";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!form.terms) errs.terms = "You must accept the terms and conditions";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (key) => (e) => {
    const rawValue =
      e && e.target
        ? e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value
        : e;
    const value = key === "name" ? sanitizeFullName(rawValue) : rawValue;
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.accountType === "owner" ? "owner" : "resident",
      };

      const result = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await result.json();
      if (!result.ok || !json?.success) {
        throw new Error(json?.message || 'Signup failed');
      }

      const token = json?.data?.token;
      const userPayload = json?.data?.user || {};
      const user = saveSessionUser({
        name: userPayload.name || form.name.trim(),
        email: userPayload.email || form.email.trim(),
        role: userPayload.role || (form.accountType === 'owner' ? 'owner' : 'resident'),
        isLoggedIn: true,
        loginDate: new Date().toLocaleDateString('en-PK'),
        loginTime: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
      });

      if (typeof window !== 'undefined' && token) {
        window.__RMS_AUTH_TOKEN = token;
        window.__rms_inmemory_token = token;
      }

      dispatch(login(user));
      dispatch(addNotification(createLoginNotification(user)));
      dispatch(addNotification(createSignupNotification(user)));
      toast.success(`Welcome to RMS, ${user.name}!`);
      const nextRoute = form.accountType === 'owner' || user.role === 'admin' || user.role === 'owner' || user.role === 'manager'
        ? '/admin'
        : '/dashboard';
      navigate(nextRoute, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Unable to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-shell">
      <aside className="signup-hero">
        <div className="brand">
          <div className="brand-mark">R</div>
          <div className="brand-title">RMS</div>
        </div>
        <div className="hero-content">
          <h1>Welcome to RMS</h1>
          <p>
            Manage properties, tenants and payments with a modern, reliable
            platform tailored for your needs.
          </p>
          <div className="hero-illustration" aria-hidden>
            <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopColor="#28b463" />
                  <stop offset="1" stopColor="#123a70" />
                </linearGradient>
              </defs>
              <rect
                x="20"
                y="60"
                width="160"
                height="220"
                rx="12"
                fill="#f6fbf9"
                stroke="#dff3ea"
              />
              <rect
                x="220"
                y="30"
                width="220"
                height="300"
                rx="16"
                fill="url(#g1)"
                opacity="0.9"
              />
              <circle cx="420" cy="80" r="34" fill="#fff" opacity="0.12" />
            </svg>
          </div>
        </div>
      </aside>

      <main className="signup-form-panel">
        <div className="signup-card">
          <h2>Create your account</h2>
          <p className="muted">
            Create an RMS account to get started managing properties and
            residents.
          </p>

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span>Full Name</span>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Ahmed Khan"
                aria-invalid={!!errors.name}
                pattern="[A-Za-z ]+"
                title="Full name can contain only letters and spaces."
              />
              {errors.name && <div className="error">{errors.name}</div>}
            </label>

            <label className="field">
              <span>Email Address</span>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
              />
              {errors.email && <div className="error">{errors.email}</div>}
            </label>

            <label className="field">
              <span>Phone Number</span>
              <input
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="+923001234567"
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <div className="error">{errors.phone}</div>}
            </label>

            <div className="row">
              <label className="field flex-1">
                <span>Password</span>
                <div className="password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange("password")}
                    placeholder="Enter password"
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    className="show-btn"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <div className="error">{errors.password}</div>
                )}
              </label>

              <label className="field flex-1">
                <span>Confirm Password</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder="Confirm password"
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <div className="error">{errors.confirmPassword}</div>
                )}
              </label>
            </div>

            <label className="field">
              <span>Account Type</span>
              <select
                value={form.accountType}
                onChange={handleChange("accountType")}
              >
                <option value="customer">Customer</option>
                <option value="owner">Owner</option>
              </select>
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={handleChange("terms")}
              />
              <span>
                I agree to the <Link to="/terms">Terms & Conditions</Link>
              </span>
            </label>
            {errors.terms && <div className="error">{errors.terms}</div>}

            <button
              type="submit"
              className="btn-primary create-btn"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Account"}
            </button>

            <div className="divider">or continue with</div>
            <button
              type="button"
              className="btn-google"
              onClick={() => toast.info("Google Sign-in not connected in demo")}
            >
              Continue with Google
            </button>

            <div className="alt">
              Already have an account?{" "}
              <Link to="/login" className="link">
                Login
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Signup;
