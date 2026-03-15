import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import ReportPage from './pages/ReportPage';
import { AnimatePresence } from 'framer-motion';
import CursorEffect from './components/ui/CursorEffect';
import FallingLeaves from './components/ui/FallingLeaves';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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

const Layout = ({ children }) => {
    const location = useLocation();
    // Hide Navbar on login and signup pages
    const showNavbar = !['/login', '/signup'].includes(location.pathname);

    return (
        <div className="min-h-screen relative text-white font-sans">
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
                {/* 2025 Aurora Animated Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00ff88] rounded-full mix-blend-screen filter blur-[80px] opacity-15 animate-aurora"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#00ccff] rounded-full mix-blend-screen filter blur-[80px] opacity-15 animate-aurora" style={{ animationDelay: '-4s', animationDirection: 'reverse' }}></div>
                <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-[#7b2fff] rounded-full mix-blend-screen filter blur-[80px] opacity-15 animate-aurora" style={{ animationDelay: '-8s' }}></div>
            </div>
            <FallingLeaves />
            {showNavbar && <Navbar />}
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
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <CursorEffect />
        <Layout>
            <AnimatedRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
