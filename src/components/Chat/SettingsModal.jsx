import { useState } from 'react';
import { FaTimes, FaBell, FaDatabase, FaTrash, FaUser, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import './Chat.css';

const SettingsModal = ({ isOpen, onClose, onClearHistory }) => {
  const [notifications, setNotifications] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Preferences</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <FaBell className="setting-icon" />
                <div className="setting-text">
                  <label>Notifications</label>
                  <p>Get updates on weather and tasks</p>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notifications} 
                  onChange={() => setNotifications(!notifications)} 
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <FaDatabase className="setting-icon" />
                <div className="setting-text">
                  <label>Data Saver</label>
                  <p>Reduce data usage for images</p>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={dataSaver} 
                  onChange={() => setDataSaver(!dataSaver)} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>Account & Data</h3>
            
            <div className="setting-item clickable" onClick={() => navigate('/profile')}>
              <div className="setting-info">
                <FaUser className="setting-icon" />
                <div className="setting-text">
                  <label>Profile Settings</label>
                  <p>{user?.email}</p>
                </div>
              </div>
              <FaChevronRight className="chevron-icon" />
            </div>

            <div className="setting-item clickable danger" onClick={onClearHistory}>
              <div className="setting-info">
                <FaTrash className="setting-icon" />
                <div className="setting-text">
                  <label>Clear Chat History</label>
                  <p>Delete all local conversation data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
