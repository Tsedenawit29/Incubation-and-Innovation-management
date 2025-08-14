import React, { useState, useEffect } from 'react';
import DocumentList from './DocumentList';
import { getApplicationDocuments, deleteDocument, updateApplicationStatus } from '../api/applications';

export default function ApplicationDetails({ application, tenantId, onStatusUpdate }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (application?.id) {
      loadDocuments();
    }
  }, [application?.id]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getApplicationDocuments(application.id);
      setDocuments(docs);
    } catch (error) {
      setError('Failed to load documents');
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      setError('Failed to delete document');
      console.error('Error deleting document:', error);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      await updateApplicationStatus(tenantId, {
        applicationId: application.id,
        newStatus: newStatus
      });
      
      if (onStatusUpdate) {
        onStatusUpdate(application.id, newStatus);
      }
    } catch (error) {
      setError('Failed to update application status');
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  if (!application) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No application selected</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Application Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {application.firstName} {application.lastName}
            </h2>
            <p className="text-gray-600">{application.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {application.applicantType}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                {getStatusLabel(application.status)}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Submitted</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(application.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Status Management */}
      {application.status === 'PENDING' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Review Application</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => handleStatusUpdate('APPROVED')}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => handleStatusUpdate('REJECTED')}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Field Responses */}
      {application.fieldResponses && application.fieldResponses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Application Responses</h3>
          <div className="space-y-3">
            {application.fieldResponses.map((response, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">{response.fieldLabel}</p>
                <p className="text-sm text-gray-900 mt-1">{response.response}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Supporting Documents</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading documents...</p>
          </div>
        ) : (
          <DocumentList
            documents={documents}
            onDelete={handleDeleteDocument}
            showDelete={application.status === 'PENDING'}
          />
        )}
      </div>

      {/* Application Metadata */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Application ID</p>
            <p className="font-medium text-gray-900">{application.id}</p>
          </div>
          <div>
            <p className="text-gray-500">Form ID</p>
            <p className="font-medium text-gray-900">{application.formId}</p>
          </div>
          <div>
            <p className="text-gray-500">Tenant ID</p>
            <p className="font-medium text-gray-900">{application.tenantId}</p>
          </div>
          <div>
            <p className="text-gray-500">Submitted At</p>
            <p className="font-medium text-gray-900">
              {new Date(application.submittedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
