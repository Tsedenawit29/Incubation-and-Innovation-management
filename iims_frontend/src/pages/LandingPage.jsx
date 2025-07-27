import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <header className="bg-brand-primary shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">IIMS - Incubation and Innovation Management System</h1>
              <p className="text-sm text-brand-dark">
                Welcome to the tenant and admin registration portal
              </p>
            </div>
            <Link
              to="/login"
              className="bg-brand-dark hover:bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-primary mb-4">
              Get Started with IIMS
            </h2>
            <p className="text-xl text-brand-dark max-w-3xl mx-auto">
              Join our incubation and innovation management platform. Register your organization as a tenant or apply to become an admin.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Tenant Application Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-brand-primary rounded-full mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-brand-primary mb-4 text-center">
                  Register Your Organization
                </h3>
                <p className="text-brand-dark mb-6 text-center">
                  Apply to register your organization as a tenant in the IIMS platform. 
                  Once approved, you'll be able to manage your incubation and innovation activities.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-brand-dark">
                    <svg className="w-4 h-4 text-brand-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Simple application process
                  </div>
                  <div className="flex items-center text-sm text-brand-dark">
                    <svg className="w-4 h-4 text-brand-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Quick approval by super admin
                  </div>
                  <div className="flex items-center text-sm text-brand-dark">
                    <svg className="w-4 h-4 text-brand-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Full platform access
                  </div>
                </div>
                <Link
                  to="/apply-tenant"
                  className="w-full bg-brand-primary hover:bg-brand-dark text-white font-medium py-3 px-4 rounded-md text-center block transition duration-150 ease-in-out"
                >
                  Apply for Tenant Registration
                </Link>
              </div>
            </div>

            {/* Admin Registration Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-brand-dark rounded-full mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-4 text-center">
                  Become an Admin
                </h3>
                <p className="text-brand-dark mb-6 text-center">
                  Apply to become an admin for your organization. 
                  Admins can manage users, projects, and oversee incubation activities.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-brand-dark">
                    <svg className="w-4 h-4 text-brand-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    For approved tenants only
                  </div>
                  <div className="flex items-center text-sm text-brand-dark">
                    <svg className="w-4 h-4 text-brand-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Automatic credential generation
                  </div>
                  <div className="flex items-center text-sm text-brand-dark">
                    <svg className="w-4 h-4 text-brand-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    User management capabilities
                  </div>
                </div>
                <Link
                  to="/register-admin"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md text-center block transition duration-150 ease-in-out"
                >
                  Apply for Admin Role
                </Link>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-brand-primary mb-6 text-center">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-brand-primary rounded-full mb-4">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <h4 className="text-lg font-semibold text-brand-primary mb-2">Apply</h4>
                <p className="text-brand-dark">
                  Submit your application for tenant registration or admin role
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
                  <span className="text-yellow-600 font-bold text-lg">2</span>
                </div>
                <h4 className="text-lg font-semibold text-brand-primary mb-2">Review</h4>
                <p className="text-brand-dark">
                  Super admin reviews your application and makes a decision
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-brand-dark rounded-full mb-4">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <h4 className="text-lg font-semibold text-brand-primary mb-2">Access</h4>
                <p className="text-brand-dark">
                  Get approved and receive login credentials to access the platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 