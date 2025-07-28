import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                IIMS
              </h1>
              <p className="text-lg font-semibold text-gray-700">
                Incubation and Innovation Management System
              </p>
              <p className="text-sm text-gray-600">
                Welcome to the tenant and admin registration portal
              </p>
            </div>
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto py-16 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-6">
              Get Started with IIMS
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Join our incubation and innovation management platform. Register your organization as a tenant or apply to become an admin.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Tenant Application Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="px-8 py-10">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  Register Your Organization
                </h3>
                <p className="text-gray-700 mb-8 text-center text-lg leading-relaxed">
                  Apply to register your organization as a tenant in the IIMS platform. 
                  Once approved, you'll be able to manage your incubation and innovation activities.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-base text-gray-700">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Simple application process
                  </div>
                  <div className="flex items-center text-base text-gray-700">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Quick approval by super admin
                  </div>
                  <div className="flex items-center text-base text-gray-700">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Full platform access
                  </div>
                </div>
                <Link
                  to="/apply-tenant"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-4 px-6 rounded-xl text-center block transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Apply for Tenant Registration
                </Link>
              </div>
            </div>

            {/* Admin Registration Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="px-8 py-10">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-blue-800 to-blue-900 rounded-full mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  Become an Admin
                </h3>
                <p className="text-gray-700 mb-8 text-center text-lg leading-relaxed">
                  Apply to become an admin for your organization. 
                  Admins can manage users, projects, and oversee incubation activities.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-base text-gray-700">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    For approved tenants only
                  </div>
                  <div className="flex items-center text-base text-gray-700">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Automatic credential generation
                  </div>
                  <div className="flex items-center text-base text-gray-700">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    User management capabilities
                  </div>
                </div>
                <Link
                  to="/register-admin"
                  className="w-full bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-white font-semibold py-4 px-6 rounded-xl text-center block transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Apply for Admin Role
                </Link>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-10 border border-white/20">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-8 text-center">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center group">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-full mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Apply</h4>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Submit your application for tenant registration or admin role
                </p>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-blue-700 to-blue-800 rounded-full mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Review</h4>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Super admin reviews your application and makes a decision
                </p>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-blue-800 to-blue-900 rounded-full mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Access</h4>
                <p className="text-gray-700 text-lg leading-relaxed">
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