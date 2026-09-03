import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const ServicesPage = lazy(() => import('../pages/ServicesPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const FAQPage = lazy(() => import('../pages/FAQPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const AdminLoginPage = lazy(() => import('../pages/AdminLoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const Signup = lazy(() => import('../pages/Signup'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const PropertyListingsPage = lazy(() => import('../pages/PropertyListingsPage'));
const PropertyDetailsPage = lazy(() => import('../pages/PropertyDetailsPage'));
const ComparePage = lazy(() => import('../pages/ComparePage'));
const SavedSearchesPage = lazy(() => import('../pages/SavedSearchesPage'));
const AIRecommendationsPage = lazy(() => import('../pages/AIRecommendationsPage'));
const BookingsPage = lazy(() => import('../pages/BookingsPage'));
const HostelListingsPage = lazy(() => import('../pages/HostelListingsPage'));
const HostelDetailsPage = lazy(() => import('../pages/HostelDetailsPage'));
const UserDashboardPage = lazy(() => import('../pages/UserDashboardPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const PaymentsPage = lazy(() => import('../pages/PaymentsPage'));
const AdminPaymentsPage = lazy(() => import('../pages/AdminPaymentsPage'));
const ResidentDuesPage = lazy(() => import('../pages/ResidentDuesPage'));
const MaintenancePage = lazy(() => import('../pages/MaintenancePage'));
const RentManagementPage = lazy(() => import('../pages/RentManagementPage'));
const MyRentPage = lazy(() => import('../pages/MyRentPage'));
const AdminRentPage = lazy(() => import('../pages/AdminRentPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const NotificationsErrorBoundary = lazy(() => import('../components/Notifications/NotificationsErrorBoundary'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const DemoLandingPage = lazy(() => import('../pages/DemoLandingPage'));
const HouseDemoPage = lazy(() => import('../pages/HouseDemoPage'));
const HostelDemoPage = lazy(() => import('../pages/HostelDemoPage'));
const FlatsDemoPage = lazy(() => import('../pages/FlatsDemoPage'));
const RoomsDemoPage = lazy(() => import('../pages/RoomsDemoPage'));
const ApartmentsDemoPage = lazy(() => import('../pages/ApartmentsDemoPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading RMS experience...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/demo" element={<DemoLandingPage />} />
          <Route path="/demo/house" element={<HouseDemoPage />} />
          <Route path="/demo/hostel" element={<HostelDemoPage />} />
          <Route path="/demo/flats" element={<FlatsDemoPage />} />
          <Route path="/demo/rooms" element={<RoomsDemoPage />} />
          <Route path="/demo/apartments" element={<ApartmentsDemoPage />} />
          <Route path="/pricing" element={<Navigate to="/demo" replace />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="properties" element={<PropertyListingsPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/saved-searches" element={<SavedSearchesPage />} />
          <Route path="/ai-recommendations" element={<AIRecommendationsPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/hostels" element={<HostelListingsPage />} />
          <Route path="/hostels/:id" element={<HostelDetailsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/notifications" element={<NotificationsErrorBoundary><NotificationsPage /></NotificationsErrorBoundary>} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/my-rent" element={<MyRentPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/rent-management" element={<RentManagementPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/dues" element={<ResidentDuesPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/rent" element={<AdminRentPage />} />
          <Route path="/admin/notifications" element={<NotificationsErrorBoundary><NotificationsPage /></NotificationsErrorBoundary>} />
        </Route>

        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
