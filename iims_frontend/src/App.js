import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TenantManagementPage from './pages/TenantManagementPage';
import AdminRequestManagementPage from './pages/AdminRequestManagementPage';
import TenantApplicationForm from './components/TenantApplicationForm';
import AdminRegistrationForm from './components/AdminRegistrationForm';
import LandingPage from './pages/LandingPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
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
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Super Admin Routes */}
            <Route 
              path="/tenant-management" 
              element={
                <ProtectedRoute>
                  <TenantManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-requests" 
              element={
                <ProtectedRoute>
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
