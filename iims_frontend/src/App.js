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
import StartupDashboard from './pages/StartupDashboard';
import StartupProgress from './pages/StartupProgress';
import MentorDashboard from './pages/MentorDashboard';
import MentorProgress from './pages/MentorProgress';
import ProgressTrackingManagement from './pages/ProgressTrackingManagement';
import CoachDashboard from './pages/CoachDashboard';
import FacilitatorDashboard from './pages/FacilitatorDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import AlumniDashboard from './pages/AlumniDashboard';
import LandingPageManagement from './pages/LandingPageManagement';
import PublicLandingPage from './pages/PublicLandingPage';
import StartupManagement from './pages/StartupManagement';
import CalendarManagement from './pages/CalendarManagement';
import NewsManagement from './pages/NewsManagement';
import GoogleOAuthSuccess from './pages/GoogleOAuthSuccess';
import ApplicationFormsPage from './pages/ApplicationFormsPage';
import CreateApplicationFormPage from './pages/CreateApplicationFormPage';
import ApplicationFormDetail from './pages/ApplicationFormDetail';
import ApplicationsPage from './pages/ApplicationsPage';
import PublicApplicationFormView from './pages/PublicApplicationFormView';
import './App.css';
import Home from './pages/Home';
import Documentation from './pages/Documentation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';  
import PublicLayout from './components/PublicLayout'; 

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
    if (user?.role === 'STARTUP') return <Navigate to={`/startup-dashboard/${user.id}`} replace />;
    if (user?.role === 'MENTOR') return <Navigate to={`/mentor-dashboard/${user.id}`} replace />;
    if (user?.role === 'COACH') return <Navigate to={`/coach-dashboard/${user.id}`} replace />;
    if (user?.role === 'FACILITATOR') return <Navigate to={`/facilitator-dashboard/${user.id}`} replace />;
    if (user?.role === 'INVESTOR') return <Navigate to={`/investor-dashboard/${user.id}`} replace />;
    if (user?.role === 'ALUMNI') return <Navigate to={`/alumni-dashboard/${user.id}`} replace />;
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
                  <PublicLayout>
                  <LoginPage />
                  </PublicLayout>
                  
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
            {/* Tenant Admin Management Routes */}
            <Route
              path="/tenant-admin/:tenantId/landing-page-management"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <LandingPageManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant-admin/calendar"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <CalendarManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant-admin/startup-management"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <StartupManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant-admin/:tenantId/progress-tracking-management"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <ProgressTrackingManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant-admin/news"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <NewsManagement />
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
            
            <Route path="/apply-tenant" element={<PublicLayout><TenantApplicationForm /></PublicLayout>} />
            <Route path="/register-admin" element={<AdminRegistrationForm />} />
            <Route path="/register-admin/:tenantId" element={<AdminRegistrationForm />} />
            {/* Public Landing Page */}
            <Route path="/public-landing/:tenantId" element={<PublicLandingPage />} />
            {/* Google OAuth Success Page */}
            <Route path="/google-oauth-success" element={<GoogleOAuthSuccess />} />
            {/* Root route - redirect authenticated users to their dashboard */}
            <Route path="/" element={
              <PublicRoute>
                <PublicLayout>
                  <Home />
               </PublicLayout>
              </PublicRoute>
            } />
            {/* Startup Dashboard */}
            <Route
              path="/startup-dashboard/:id"
              element={
                <ProtectedRoute role="STARTUP">
                  <StartupDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
            path='/documentation'
            element={<PublicLayout><Documentation /></PublicLayout>} />
            <Route 
            path='/privacy-policy'
            element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />  
            <Route 
            path='/contact'
            element={ <PublicLayout><Contact /></PublicLayout>} />    
            {/* Startup Progress */}
            <Route
              path="/startup-progress/:id"
              element={
                <ProtectedRoute role="STARTUP">
                  <StartupProgress />
                </ProtectedRoute>
              }
            />
            {/* Mentor Dashboard */}
            <Route
              path="/mentor-dashboard/:id"
              element={
                <ProtectedRoute role="MENTOR">
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            {/* Mentor Progress */}
            <Route
              path="/mentor-progress/:id"
              element={
                <ProtectedRoute role="MENTOR">
                  <MentorProgress />
                </ProtectedRoute>
              }
            />
            {/* Progress Tracking Management */}
            <Route
              path="/progress-tracking-management/:tenantId"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <ProgressTrackingManagement />
                </ProtectedRoute>
              }
            />
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
            {/* Application Forms Routes */}
            <Route
              path="/application-forms"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <ApplicationFormsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/application-forms/new"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <CreateApplicationFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/application-forms/:id"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <ApplicationFormDetail />
                </ProtectedRoute>
              }
            />
            {/* Applications Management Route */}
            <Route
              path="/applications"
              element={
                <ProtectedRoute role="TENANT_ADMIN">
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            {/* Public Application Form View */}
            <Route path="/public/application-forms/:id" element={<PublicApplicationFormView />} />
            {/* Catch all route - must be last */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
