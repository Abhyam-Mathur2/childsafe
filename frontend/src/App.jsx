import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import ReportPage from './pages/ReportPage';
import ReportsHistoryPage from './pages/ReportsHistoryPage';
import AdminPage from './pages/admin/AdminPage';
import { AnimatePresence } from 'framer-motion';
import CursorEffect from './components/ui/CursorEffect';
import FallingLeaves from './components/ui/FallingLeaves';
import LocationBackground from './components/backgrounds/LocationBackground';
import ThemeDemoBanner from './components/ui/ThemeDemoBanner';
import { useTheme } from './context/ThemeContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#020617]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route wrapper for Landing Page to redirect if already logged in
const PublicOnlyRoute = ({ children }) => {
    const { user } = useAuth();
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
};

// Airpay's merchant-panel "Response URL" currently points here instead of
// the backend's /api/airpay-callback, so this just forwards into the app
// instead of a raw 404. It cannot verify the payment itself (no checksum
// secret or DB access on the frontend) - only the backend callback can do that.
const PaymentResponseRedirect = () => {
    const location = useLocation();
    return <Navigate to={`/report${location.search}`} replace />;
};

const Layout = ({ children }) => {
    const location = useLocation();
    const { theme } = useTheme();
    // Hide Navbar on login and signup pages
    const showNavbar = !['/login', '/signup'].includes(location.pathname);

    return (
        <div className="min-h-screen relative text-[var(--color-text)] font-sans">
            <LocationBackground />
            
            {/* Conditional Falling Leaves (only for default and india) */}
            {(theme.id === 'default' || theme.id === 'india') && <FallingLeaves />}
            
            {showNavbar && <Navbar />}
            <ThemeDemoBanner />
            {children}
        </div>
    );
};

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
                <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
                
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/assessment"
                    element={
                        <ProtectedRoute>
                            <AssessmentPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/report"
                    element={
                        <ProtectedRoute>
                            <ReportPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/report/:reportId"
                    element={
                        <ProtectedRoute>
                            <ReportPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <ReportsHistoryPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/payment/response" element={<PaymentResponseRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
            <CursorEffect />
            <Layout>
                <AnimatedRoutes />
            </Layout>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
