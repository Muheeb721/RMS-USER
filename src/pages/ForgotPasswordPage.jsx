import { Card } from 'antd';
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h2 className="auth-title">Reset your password</h2>
        <p className="auth-subtitle">Enter your email and we will send you recovery instructions.</p>
        <ForgotPasswordForm />
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;
