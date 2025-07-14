import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import TenantAdminDashboard from './pages/TenantAdminDashboard';
import TenantManagementPage from './pages/TenantManagementPage';
import AdminRequestManagementPage from './pages/AdminRequestManagementPage';
import TenantApplicationForm from './components/TenantApplicationForm';
import AdminRegistrationForm from './components/AdminRegistrationForm';
import LandingPage from './pages/LandingPage';
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
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
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
            {/* Default redirect */}
            <Route path="/" element={<LandingPage />} />
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
