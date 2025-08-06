import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { requestAdmin } from '../api/adminRequests';

export default function AdminRegistrationForm({ tenantId: propTenantId, tenantName: propTenantName }) {
  const { tenantId: urlTenantId } = useParams();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    tenantId: propTenantId || urlTenantId || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tenantInfo, setTenantInfo] = useState(null);

  // Use the tenant ID from props, URL params, or form data
  const finalTenantId = propTenantId || urlTenantId || formData.tenantId;

  useEffect(() => {
    // If we have a tenant ID from URL, update the form
    if (urlTenantId && !propTenantId) {
      setFormData(prev => ({
        ...prev,
        tenantId: urlTenantId
      }));
    }
  }, [urlTenantId, propTenantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await requestAdmin(formData);
      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        position: '',
        tenantId: finalTenantId || ''
      });
    } catch (error) {
      setError(error.message || 'Failed to submit admin request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Register an admin for {propTenantName || 'your organization'}
          </p>
          
          {finalTenantId && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Tenant ID:</strong> {finalTenantId}
              </p>
            </div>
          )}
        </div>

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">
              ✅ Admin request submitted successfully! The super admin will review your request and contact you with login credentials.
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Position *
              </label>
              <input
                id="position"
                name="position"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="e.g., Center Director, Manager"
                value={formData.position}
                onChange={handleChange}
              />
            </div>

            {!finalTenantId && (
              <div>
                <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">
                  Tenant ID *
                </label>
                <input
                  id="tenantId"
                  name="tenantId"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter tenant ID"
                  value={formData.tenantId}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  You can find your Tenant ID in the approval email or contact the super admin.
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Admin Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 