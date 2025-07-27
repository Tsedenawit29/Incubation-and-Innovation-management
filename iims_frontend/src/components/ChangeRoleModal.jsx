import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const ROLES = [
  'SUPER_ADMIN',
  'TENANT_ADMIN', 
  'STARTUP',
  'MENTOR',
  'COACH',
  'FACILITATOR',
  'INVESTOR',
  'ALUMNI'
];

export default function ChangeRoleModal({ isOpen, onClose, user, onSave }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pre-fill current role when user changes
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await onSave(selectedRole);
      setSuccess(true);
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change User Role">
      <form onSubmit={handleSubmit} className="space-y-4">
        {success && (
          <div className="rounded-md bg-green-50 p-4 mb-4">
            <div className="text-sm text-green-700">
              ✅ User role updated successfully!
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current User: {user?.fullName} ({user?.email})
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a role</option>
            {ROLES.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedRole}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </form>
    </Modal>
  );
} 