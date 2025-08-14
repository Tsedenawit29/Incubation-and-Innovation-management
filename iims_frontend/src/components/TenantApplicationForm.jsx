import React, { useState } from 'react';
import { applyForTenant } from '../api/tenants';
import FileUpload from './FileUpload';

export default function TenantApplicationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    address: '',
    phone: '',
    website: ''
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Include documents in the application data
      const applicationData = {
        ...formData,
        documents: documents
      };
      
      await applyForTenant(applicationData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        description: '',
        address: '',
        phone: '',
        website: ''
      });
      setDocuments([]);
    } catch (error) {
      setError(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (fileData) => {
    setDocuments(prev => [...prev, fileData]);
  };

  const handleFileRemove = (fileData) => {
    setDocuments(prev => prev.filter(doc => doc !== fileData));
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-[#E6F0FF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-[#0A2D5C]">

            Tenant Application
          </h2>
          <p className="mt-2 text-lg text-[#299DFF]">
            Register your organization and streamline your innovation journey.
          </p>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="text-sm text-green-700">
              ✅ Application submitted successfully! We will review your application and contact you soon.
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#0A2D5C]">Organization Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter organization name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-[#299DFF] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#299DFF] focus:border-[#299DFF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A2D5C]">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-[#299DFF] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#299DFF] focus:border-[#299DFF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A2D5C]">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-[#299DFF] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#299DFF] focus:border-[#299DFF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A2D5C]">Website *</label>
              <input
                type="url"
                name="website"
                required
                placeholder="https://example.com"
                value={formData.website}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-[#299DFF] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#299DFF] focus:border-[#299DFF]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0A2D5C]">Address *</label>
              <input
                type="text"
                name="address"
                required
                placeholder="Enter organization address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-[#299DFF] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#299DFF] focus:border-[#299DFF]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0A2D5C]">Description</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe your organization"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-[#299DFF] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#299DFF] focus:border-[#299DFF]"
              />
            </div>

            {/* File Upload Section */}
            <div className="pt-4">
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                label="Supporting Documents"
                description="Upload pitch decks, business plans, financial statements, or other supporting documents"
                acceptedTypes={['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png']}
                maxFileSize={20 * 1024 * 1024} // 20MB
                maxFiles={10}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#299DFF] to-[#0A2D5C] text-white font-semibold py-4 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
