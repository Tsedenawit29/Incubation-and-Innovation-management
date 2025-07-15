import React, { useState } from 'react';
import { FaBuilding, FaUserShield, FaArrowRight } from 'react-icons/fa';
// Placeholder API functions (to be implemented in src/api/tenants.js and src/api/adminRequests.js)
const applyForTenant = async (formData) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};
const requestAdmin = async (formData) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

function TenantApplicationForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    address: '',
    phone: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await applyForTenant(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        description: '',
        address: '',
        phone: '',
        website: ''
      });
      if (onSuccess) onSuccess({ ...formData, id: 'TENANT_ID_PLACEHOLDER' }); // Replace with real ID if available
    } catch (error) {
      setError(error.message || 'Failed to submit application');
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
    <div className="w-full md:w-[400px] bg-white/90 rounded-2xl shadow-xl p-8 border-t-8 border-[#299DFF] relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
      <div className="absolute -top-8 right-6 opacity-10 text-[7rem] pointer-events-none group-hover:opacity-20 transition-opacity duration-300">
        <FaBuilding className="text-[#299DFF]" />
      </div>
      <h2 className="text-2xl font-extrabold text-[#0A2D5C] mb-2 flex items-center gap-2">
        <FaBuilding className="text-[#299DFF]" /> Tenant Application
      </h2>
      <p className="mb-4 text-sm text-[#299DFF]">Apply to register your organization as a tenant</p>
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-700">
            ✅ Application submitted successfully! We will review your application and contact you soon.
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Organization Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter organization name"
              value={formData.name}
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Describe your organization"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter organization address"
              value={formData.address}
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
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website *
            </label>
            <input
              id="website"
              name="website"
              type="url"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="https://example.com"
              value={formData.website}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#299DFF] hover:bg-[#0A2D5C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#299DFF] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              "Submit Application"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminRegistrationForm({ tenantId: propTenantId, tenantName: propTenantName }) {
  // No useParams since not using react-router here
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    tenantId: propTenantId || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const finalTenantId = propTenantId || formData.tenantId;

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
    <div className="w-full md:w-[400px] bg-white/90 rounded-2xl shadow-xl p-8 border-t-8 border-[#0A2D5C] relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
      <div className="absolute -top-8 right-6 opacity-10 text-[7rem] pointer-events-none group-hover:opacity-20 transition-opacity duration-300">
        <FaUserShield className="text-[#0A2D5C]" />
      </div>
      <h2 className="text-2xl font-extrabold text-[#299DFF] mb-2 flex items-center gap-2">
        <FaUserShield className="text-[#0A2D5C]" /> Admin Registration
      </h2>
      <p className="mb-4 text-sm text-[#0A2D5C]">Register an admin for {propTenantName || 'your organization'}</p>
      {finalTenantId && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Tenant ID:</strong> {finalTenantId}
          </p>
        </div>
      )}
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
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0A2D5C] hover:bg-[#299DFF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2D5C] disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}

const Application = () => {
  const [step, setStep] = useState(1); // 1 = tenant, 2 = admin
  const [tenantInfo, setTenantInfo] = useState(null);

  const handleTenantSuccess = (tenant) => {
    setTenantInfo(tenant);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#299DFF]/10 to-[#0A2D5C]/10 py-16 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-[#0A2D5C] mb-2 text-center drop-shadow-lg">Application</h1>
      <p className="text-lg text-[#299DFF] mb-6 text-center max-w-2xl">
        {step === 1
          ? 'Step 1: Register your organization as a tenant to get started.'
          : 'Step 2: Register an admin for your newly created tenant.'}
      </p>
      <div className="w-full max-w-6xl flex flex-col items-center justify-center relative">
        {step === 1 && (
          <TenantApplicationForm onSuccess={handleTenantSuccess} />
        )}
        {step === 2 && (
          <div className="flex flex-col items-center gap-8">
            <div className="rounded-md bg-green-50 p-4 mb-2 max-w-lg text-center">
              <div className="text-green-700 text-base font-semibold mb-2">
                ✅ Tenant registration successful!
              </div>
              <div className="text-gray-700 text-sm">
                An email will be sent to you containing your Tenant ID. Once you receive it, you can proceed to register an admin for your organization below.
              </div>
            </div>
            <AdminRegistrationForm tenantId={tenantInfo?.id} tenantName={tenantInfo?.name} />
          </div>
        )}
      </div>
      <style>{`
        .group:hover .group-hover\\:opacity-20 { opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default Application; 