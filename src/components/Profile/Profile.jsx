import { FaArrowLeft, FaEnvelope, FaMoon, FaSun, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      <div className="profile-card">
        <button className="back-button" onClick={() => navigate('/chat')}>
          <FaArrowLeft /> Back to chat
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <h2>{user?.name || 'Farmer'}</h2>
        </div>

        <div className="profile-content">
          <section className="profile-section">
            <h3>Account Information</h3>
            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <div>
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
            </div>
            <div className="info-item">
              <FaUser className="info-icon" />
              <div>
                <label>Name</label>
                <p>{user?.name || 'Not set'}</p>
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h3>Preferences</h3>
            <div className="preference-item">
              <div>
                <label>Theme</label>
                <p>Current: {theme === 'light' ? 'Light' : 'Dark'}</p>
              </div>
              <button className="theme-toggle-btn" onClick={toggleTheme}>
                {theme === 'light' ? <FaMoon /> : <FaSun />}
                Switch to {theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </div>
          </section>

          <section className="profile-section">
            <h3>Highlights</h3>
            <div className="features-list">
              <div className="feature-item">✓ Chat history per session</div>
              <div className="feature-item">✓ Location-aware suggestions</div>
              <div className="feature-item">✓ Quick farming actions</div>
              <div className="feature-item">✓ Theme customization</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;

