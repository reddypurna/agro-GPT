import { createContext, useCallback, useContext, useState } from 'react';

const LocationContext = createContext(null);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError(error.message);
      }
    );
  }, []);

  const value = {
    location,
    locationError,
    requestLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

