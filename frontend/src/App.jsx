import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import ReportPage from './pages/ReportPage';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen relative text-white font-sans">
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-green-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float-slow" style={{ animationDelay: '-4s' }}></div>
            <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-teal-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float-slow" style={{ animationDelay: '-2s' }}></div>
            {/* Particle dots */}
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-1 h-1 rounded-full bg-white/20 animate-float-slow"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${6 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
          <Navbar />
          <Routes>
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
