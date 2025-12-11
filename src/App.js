import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ChatBot from './components/Chat/ChatBot';
import Profile from './components/Profile/Profile';
import LocationPermission from './components/Location/LocationPermission';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider, useLocation } from './context/LocationContext';

// CRA doesn't support import.meta; rely on REACT_APP_ env only
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)'
        }}
      >
        Checking your session...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const LocationGate = ({ children }) => {
  const { location, requestLocation } = useLocation();
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    // Always request fresh location when the gate loads to keep prompt consistent
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    setShowPrompt(!location);
  }, [location]);

  const handleAllow = () => {
    requestLocation();
    setShowPrompt(false);
  };

  const handleSkip = () => {
    setShowPrompt(false);
  };

  if (showPrompt) {
    return (
      <LocationPermission onAllow={handleAllow} onSkip={handleSkip} />
    );
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/location" />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/location" />} />
      <Route
        path="/location"
        element={
          <ProtectedRoute>
            <LocationGate>
              <Navigate to="/chat" replace />
            </LocationGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <LocationGate>
              <ChatBot />
            </LocationGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={user ? '/chat' : '/login'} />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <GoogleOAuthProvider clientId={'1098750998206-pseeigb99ahgiesvdald7em2qqahppef.apps.googleusercontent.com'}>
            <Router>
              <AppRoutes />
            </Router>
          </GoogleOAuthProvider>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
