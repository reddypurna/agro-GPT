import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ChatBot from './components/Chat/ChatBot';
import Profile from './components/Profile/Profile';
import LocationPermission from './components/Location/LocationPermission';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';

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

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/chat" />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/chat" />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <LocationPermission>
              <ChatBot />
            </LocationPermission>
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
          <Router>
            <AppRoutes />
          </Router>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
