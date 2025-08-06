import React, { useState } from 'react';

export default function RejectTenantModal({ isOpen, onClose, tenant, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onConfirm(reason);
      onClose();
      setReason('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  if (!isOpen || !tenant) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">Reject Tenant</h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500">
                Are you sure you want to reject <strong>{tenant.name}</strong>?
              </p>
              <div className="mt-4 text-left text-sm text-gray-600">
                <p><strong>Email:</strong> {tenant.email}</p>
                <p><strong>Phone:</strong> {tenant.phone}</p>
                <p><strong>Address:</strong> {tenant.address}</p>
                <p><strong>Website:</strong> {tenant.website}</p>
                {tenant.description && (
                  <p><strong>Description:</strong> {tenant.description}</p>
                )}
              </div>
              
              <div className="mt-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 text-left">
                  Reason for Rejection *
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rejecting...
                </div>
              ) : (
                "Reject"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 