import { useEffect, useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useLocation } from '../../context/LocationContext';
import './Location.css';

const LocationPermission = ({ children, onAllow, onSkip }) => {
  const { location, locationError, requestLocation } = useLocation();
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    if (location) {
      setShowPrompt(false);
    }
  }, [location]);

  const handleAllow = () => {
    if (onAllow) {
      onAllow();
    } else {
      requestLocation();
      setShowPrompt(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      setShowPrompt(false);
    }
  };

  if (showPrompt && !location) {
    return (
      <div className="location-permission-overlay">
        <div className="location-permission-card">
          <FaMapMarkerAlt className="location-icon" />
          <h2>Location Access Required</h2>
          <p>
            We use your location to provide hyper-local crop and weather
            recommendations. Please allow access for the best experience.
          </p>
          {locationError && <div className="location-error">{locationError}</div>}
          <div className="location-buttons">
            <button className="btn-allow" onClick={handleAllow}>
              Allow Location
            </button>
            <button className="btn-deny" onClick={handleSkip}>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children || null;
};

export default LocationPermission;

