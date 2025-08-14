import React, { useState } from 'react';
import FileUpload from './FileUpload';

export default function EnhancedApplicationForm({ 
  formId, 
  applicantType, 
  onSubmit, 
  loading = false,
  error = '',
  success = false 
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    applicantType: applicantType || 'STARTUP'
  });
  const [documents, setDocuments] = useState([]);
  const [fieldResponses, setFieldResponses] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (onSubmit) {
      const applicationData = {
        formId: formId,
        ...formData,
        fieldResponses: fieldResponses,
        documents: documents
      };
      
      await onSubmit(applicationData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (fileData) => {
    // Store the file object and metadata
    setDocuments(prev => [...prev, {
      file: fileData.file, // Raw file object
      name: fileData.name,
      type: fileData.type,
      size: fileData.size
    }]);
  };

  const handleFileRemove = (fileData) => {
    // Remove file by matching name and size
    setDocuments(prev => prev.filter(doc => 
      doc.name !== fileData.name || doc.size !== fileData.size
    ));
  };

  const getDocumentTypes = () => {
    switch (applicantType) {
      case 'STARTUP':
        return ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
      case 'MENTOR':
        return ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      case 'COACH':
        return ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      case 'FACILITATOR':
        return ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      default:
        return ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
    }
  };

  const getDocumentDescription = () => {
    switch (applicantType) {
      case 'STARTUP':
        return 'Upload pitch deck, business plan, financial statements, team photos, or other supporting documents';
      case 'MENTOR':
        return 'Upload resume, certifications, portfolio, or other supporting documents';
      case 'COACH':
        return 'Upload resume, certifications, portfolio, or other supporting documents';
      case 'FACILITATOR':
        return 'Upload resume, certifications, portfolio, or other supporting documents';
      default:
        return 'Upload supporting documents';
    }
  };

  const getApplicantTypeLabel = () => {
    switch (applicantType) {
      case 'STARTUP':
        return 'Startup';
      case 'MENTOR':
        return 'Mentor';
      case 'COACH':
        return 'Coach';
      case 'FACILITATOR':
        return 'Facilitator';
      default:
        return 'Applicant';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {getApplicantTypeLabel()} Application
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Submit your application to join our program
          </p>
        </div>

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
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
              <label htmlFor="applicantType" className="block text-sm font-medium text-gray-700">
                Applicant Type *
              </label>
              <select
                id="applicantType"
                name="applicantType"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.applicantType}
                onChange={handleChange}
              >
                <option value="STARTUP">Startup</option>
                <option value="MENTOR">Mentor</option>
                <option value="COACH">Coach</option>
                <option value="FACILITATOR">Facilitator</option>
              </select>
            </div>

            {/* File Upload Section */}
            <div className="pt-4">
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                label="Supporting Documents"
                description={getDocumentDescription()}
                acceptedTypes={getDocumentTypes()}
                maxFileSize={20 * 1024 * 1024} // 20MB
                maxFiles={10}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
