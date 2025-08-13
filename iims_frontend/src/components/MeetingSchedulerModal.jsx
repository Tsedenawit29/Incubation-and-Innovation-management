import React, { useState, useEffect } from 'react';
import { createMeeting, getSystemUsers } from '../api/meetings';
import { MagnifyingGlassIcon, XMarkIcon, UserIcon, PlusIcon } from '@heroicons/react/24/outline';

const MeetingSchedulerModal = ({ isOpen, onClose, onMeetingCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // User selection state
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Guest emails state
  const [guestEmails, setGuestEmails] = useState(['']);
  
  const roles = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'STARTUP', label: 'Startups' },
    { value: 'MENTOR', label: 'Mentors' },
    { value: 'COACH', label: 'Coaches' },
    { value: 'FACILITATOR', label: 'Facilitators' },
    { value: 'INVESTOR', label: 'Investors' },
    { value: 'ALUMNI', label: 'Alumni' },
    { value: 'TENANT_ADMIN', label: 'Tenant Admins' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const loadUsers = async () => {
    try {
      const usersData = await getSystemUsers();
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    const notSelected = !selectedUsers.find(selected => selected.id === user.id);
    return matchesSearch && matchesRole && notSelected;
  });

  const handleUserSelect = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setShowUserDropdown(false);
    setSearchTerm('');
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const handleGuestEmailChange = (index, value) => {
    const emails = [...guestEmails];
    emails[index] = value;
    setGuestEmails(emails);
  };

  const addGuestEmailField = () => {
    setGuestEmails([...guestEmails, '']);
  };

  const removeGuestEmailField = (index) => {
    if (guestEmails.length === 1) return;
    setGuestEmails(guestEmails.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setSelectedUsers([]);
    setGuestEmails(['']);
    setSearchTerm('');
    setSelectedRole('ALL');
    setShowUserDropdown(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Title is required');
    if (!startTime || !endTime) return setError('Start and End time are required');
    if (new Date(startTime) >= new Date(endTime)) return setError('End time must be after start time');

    const validGuestEmails = guestEmails.filter(email => email.trim() !== '');
    if (validGuestEmails.some(email => !/^\S+@\S+\.\S+$/.test(email))) {
      return setError('Please enter valid email addresses');
    }

    // Send the datetime-local values directly to backend (no toISOString conversion)
    const payload = {
      title: title.trim(),
      description: description.trim(),
      startTime, // keep local time
      endTime,   // keep local time
      attendeeIds: selectedUsers.map(user => user.id),
      attendeeEmails: validGuestEmails,
    };

    try {
      setLoading(true);
      await createMeeting(payload);
      setLoading(false);
      
      resetForm();
      onMeetingCreated();
      onClose();
    } catch (err) {
      setLoading(false);
      setError('Failed to schedule meeting. Please try again.');
      console.error('Meeting creation error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Schedule a Meeting</h2>
        {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title<span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time<span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Time<span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Attendees</label>
            <div className="flex gap-2 mb-3">
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              
              <div className="flex-1 relative user-dropdown-container">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => setShowUserDropdown(true)}
                  className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                
                {showUserDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center space-x-2"
                      >
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{user.fullName}</div>
                          <div className="text-xs text-gray-500">{user.email} • {user.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium mb-2">Selected Users ({selectedUsers.length})</div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div key={user.id} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <UserIcon className="h-3 w-3 mr-1" />
                      <span>{user.fullName}</span>
                      <button
                        type="button"
                        onClick={() => handleUserRemove(user.id)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Guest Emails</label>
            {guestEmails.map((email, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input
                  type="email"
                  placeholder="Guest email"
                  value={email}
                  onChange={e => handleGuestEmailChange(idx, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => removeGuestEmailField(idx)} className="text-red-600 hover:text-red-800">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addGuestEmailField}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
            >
              <PlusIcon className="h-4 w-4" /> Add Guest
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingSchedulerModal;
