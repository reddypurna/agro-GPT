import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaTractor, FaLock, FaUser, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import { authService } from '../../services/authService';


const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleConfirm, setShowGoogleConfirm] = useState(false);
  const navigate = useNavigate();
  const { signup, socialLogin } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await signup(email, password, name);

    if (result.success) {
      navigate('/location');
    } else {
      setError(result.error || 'Sign up failed');
    }

    setLoading(false);
  };

  const handleSocialLogin = async () => {
    setError('');
    setLoading(true);
    // Simulate redirect to Google account consent for a realistic flow
    if (typeof window !== 'undefined') {
      window.open('https://accounts.google.com/', '_blank', 'noopener,noreferrer');
    }
    const result = await socialLogin('google');
    if (result.success) {
      navigate('/location');
    } else {
      setError(result.error || 'Could not sign up with Google');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      <div className="auth-card glassmorphism">
        <div className="auth-header">
          <div className="logo-wrapper">
            <FaTractor className="auth-icon" />
          </div>
          <h1>Create Account</h1>
          <p>Join Agriculture ChatBot and start your farming journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button primary-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-login single-provider">
          <button
            type="button"
            className="social-button primary-button icon-only"
            onClick={() => setShowGoogleConfirm(true)}
            aria-label="Open Google sign-up"
            disabled={loading}
          >
            <FaGoogle />
          </button>
          {showGoogleConfirm && (
            <button
              type="button"
              className="social-button confirm-button"
              onClick={handleSocialLogin}
              aria-label="Continue with Google"
              disabled={loading}
            >
              Continue with Google
            </button>
          )}
        </div>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;