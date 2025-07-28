import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './apps/PortfolioApp/components/Navbar';
import LoginPage from './pages/LoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import TenantAdminDashboard from './pages/TenantAdminDashboard';
import TenantManagementPage from './pages/TenantManagementPage';
import AdminRequestManagementPage from './pages/AdminRequestManagementPage';
import TenantApplicationForm from './components/TenantApplicationForm';
// import AdminRegistrationForm from './components/AdminRegistrationForm';
// import StartupDashboard from './pages/startupprogress';
// import MentorDashboard from './pages/mentorprogress';
import CoachDashboard from './pages/CoachDashboard';
import FacilitatorDashboard from './pages/FacilitatorDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import AlumniDashboard from './pages/AlumniDashboard';
import LandingPageManagement from './pages/LandingPageManagement';
import PublicLandingPage from './pages/PublicLandingPage';
import ProgressTrackingManagement from './pages/ProgressTrackingManagement';
import StartupManagement from './mentorAssignment/StartupManagement';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/login" replace />;
  return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (isAuthenticated) {
    if (user?.role === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
    if (user?.role === 'TENANT_ADMIN') return <Navigate to="/tenant-admin/dashboard" replace />;
    // if (user?.role === 'STARTUP') return <Navigate to={`/startup-dashboard/${user.id}`} replace />;
    // if (user?.role === 'MENTOR') return <Navigate to={`/mentor-dashboard/${user.id}`} replace />;
    if (user?.role === 'COACH') return <Navigate to={`/coach-dashboard/${user.id}`} replace />;
    if (user?.role === 'FACILITATOR') return <Navigate to={`/facilitator-dashboard/${user.id}`} replace />;
    if (user?.role === 'INVESTOR') return <Navigate to={`/investor-dashboard/${user.id}`} replace />;
    if (user?.role === 'ALUMNI') return <Navigate to={`/alumni-dashboard/${user.id}`} replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppNavbar() {
  const { isAuthenticated, user } = useAuth();
  // Show Sign Up only on /public-landing/:tenantId
  const location = useLocation();
  const showSignUp = location.pathname.startsWith('/public-landing/');

  // Professional management links for tenant admins
  let managementLinks = [];
  if (isAuthenticated && user?.role === 'TENANT_ADMIN') {
    managementLinks = [
      { label: 'Dashboard', to: '/tenant-admin/dashboard' },
      { label: 'Startup Management', to: '/tenant-admin/startup-management' },
      { label: 'Progress Tracking', to: `/tenant-admin/${user.tenantId}/progress-tracking-management` },
      { label: 'Landing Page', to: `/tenant-admin/${user.tenantId}/landing-page-management` },
    ];
  }
  return (
    <Navbar showSignUp={showSignUp} managementLinks={managementLinks} />
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          {/* <AppNavbar /> */}
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            {/* Super Admin Dashboard */}
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute role="SUPER_ADMIN">
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* Tenant Admin Dashboard */}
            <Route
              path="/tenant-admin/dashboard"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <TenantAdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* Super Admin Routes */}
            <Route 
              path="/tenant-management" 
              element={
                <ProtectedRoute role="SUPER_ADMIN">
                  <TenantManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-requests" 
              element={
                <ProtectedRoute role="SUPER_ADMIN">
                  <AdminRequestManagementPage />
                </ProtectedRoute>
              } 
            />
            {/* Public Application Routes */}
            <Route path="/apply-tenant" element={<TenantApplicationForm />} />
            <Route path="/register-admin" element={<AdminRegistrationForm />} />
            <Route path="/register-admin/:tenantId" element={<AdminRegistrationForm />} />
            {/* Startup Dashboard */}
            {/* <Route
              path="/startup-dashboard/:id"
              element={
                <ProtectedRoute role="STARTUP">
                  <StartupDashboard />
                </ProtectedRoute>
              }
            /> */}
            {/* Mentor Dashboard */}
            {/* <Route
              path="/mentor-dashboard/:id"
              element={
                <ProtectedRoute role="MENTOR">
                  <MentorDashboard />
                </ProtectedRoute>
              }
            /> */}
            {/* Coach Dashboard */}
            <Route
              path="/coach-dashboard/:id"
              element={
                <ProtectedRoute role="COACH">
                  <CoachDashboard />
                </ProtectedRoute>
              }
            />
            {/* Facilitator Dashboard */}
            <Route
              path="/facilitator-dashboard/:id"
              element={
                <ProtectedRoute role="FACILITATOR">
                  <FacilitatorDashboard />
                </ProtectedRoute>
              }
            />
            {/* Investor Dashboard */}
            <Route
              path="/investor-dashboard/:id"
              element={
                <ProtectedRoute role="INVESTOR">
                  <InvestorDashboard />
                </ProtectedRoute>
              }
            />
            {/* Alumni Dashboard */}
            <Route
              path="/alumni-dashboard/:id"
              element={
                <ProtectedRoute role="ALUMNI">
                  <AlumniDashboard />
                </ProtectedRoute>
              }
            />
            {/* Landing Page Management */}
            <Route path="/tenant-admin/:tenantId/landing-page-management" element={<LandingPageManagement />} />
            {/* Progress Tracking Management */}
            <Route
              path="/tenant-admin/:tenantId/progress-tracking-management"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <ProgressTrackingManagement />
                </ProtectedRoute>
              }
            />
            {/* Startup Management for Tenant Admin */}
            <Route
              path="/tenant-admin/startup-management"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <StartupManagement />
                </ProtectedRoute>
              }
            />
            {/* Public Landing Page */}
            <Route path="/public-landing/:tenantId" element={<PublicLandingPage />} />
            {/* Catch all route - must be last */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
