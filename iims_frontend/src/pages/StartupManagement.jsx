import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTenantUsersByRole } from '../api/users';
import { assignMentor, getMentorsForStartup, unassignMentor } from '../api/mentorAssignment';
import { FaUserTie, FaUsers, FaPlus, FaTrash, FaUserCheck, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function StartupManagement() {
  const { user, token } = useAuth();
  const [startups, setStartups] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    if (user?.tenantId) {
      loadData();
    }
  }, [user?.tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [startupsData, mentorsData] = await Promise.all([
        getTenantUsersByRole(token, 'STARTUP'),
        getTenantUsersByRole(token, 'MENTOR')
      ]);
      setStartups(startupsData);
      setMentors(mentorsData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMentor = async () => {
    if (!selectedStartup || !selectedMentor) {
      setError('Please select both startup and mentor');
      return;
    }

    try {
      await assignMentor(token, selectedStartup.id, selectedMentor);
      setSuccess('Mentor assigned successfully!');
      setShowAssignModal(false);
      setSelectedStartup(null);
      setSelectedMentor('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to assign mentor');
    }
  };

  const handleUnassignMentor = async (startupId, mentorId) => {
    try {
      await unassignMentor(token, startupId, mentorId);
      setSuccess('Mentor unassigned successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to unassign mentor');
    }
  };

  const openAssignModal = (startup) => {
    setSelectedStartup(startup);
    setSelectedMentor('');
    setShowAssignModal(true);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Link
                to="/tenant-admin/dashboard"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <FaHome className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-3xl font-bold text-gray-900">Startup Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <FaUsers className="inline mr-2" />
                {startups.length} Startups
              </div>
              <div className="text-sm text-gray-600">
                <FaUserTie className="inline mr-2" />
                {mentors.length} Mentors
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Startups List */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUsers className="mr-2" />
                Startups
              </h2>
              <div className="space-y-3">
                {startups.map((startup) => (
                  <div key={startup.id} className="bg-white rounded-lg p-4 border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{startup.fullName}</h3>
                        <p className="text-sm text-gray-600">{startup.email}</p>
                        <p className="text-xs text-gray-500">
                          Status: {startup.active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <button
                        onClick={() => openAssignModal(startup)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                      >
                        <FaPlus className="mr-1" />
                        Assign Mentor
                      </button>
                    </div>
                  </div>
                ))}
                {startups.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FaUsers className="text-4xl mx-auto mb-2 text-gray-300" />
                    <p>No startups found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mentors List */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUserTie className="mr-2" />
                Mentors
              </h2>
              <div className="space-y-3">
                {mentors.map((mentor) => (
                  <div key={mentor.id} className="bg-white rounded-lg p-4 border">
                    <div>
                      <h3 className="font-semibold text-gray-900">{mentor.fullName}</h3>
                      <p className="text-sm text-gray-600">{mentor.email}</p>
                      <p className="text-xs text-gray-500">
                        Status: {mentor.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                ))}
                {mentors.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FaUserTie className="text-4xl mx-auto mb-2 text-gray-300" />
                    <p>No mentors found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mentor Assignments */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaUserCheck className="mr-2" />
              Mentor Assignments
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                {startups.map((startup) => (
                  <StartupMentorAssignment
                    key={startup.id}
                    startup={startup}
                    mentors={mentors}
                    onAssignMentor={openAssignModal}
                    onUnassignMentor={handleUnassignMentor}
                    token={token}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Mentor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Assign Mentor</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Startup:</label>
              <p className="text-gray-900 font-medium">{selectedStartup?.fullName}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Mentor:</label>
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Choose a mentor...</option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.fullName} ({mentor.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignMentor}
                disabled={!selectedMentor}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
              >
                Assign Mentor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StartupMentorAssignment({ startup, mentors, onAssignMentor, onUnassignMentor, token }) {
  const [assignedMentors, setAssignedMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedMentors();
  }, [startup.id]);

  const loadAssignedMentors = async () => {
    try {
      setLoading(true);
      const mentorsData = await getMentorsForStartup(token, startup.id);
      setAssignedMentors(mentorsData);
    } catch (err) {
      console.error('Failed to load assigned mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{startup.fullName}</h3>
          <p className="text-sm text-gray-600">{startup.email}</p>
        </div>
        <button
          onClick={() => onAssignMentor(startup)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
        >
          <FaPlus className="mr-1" />
          Assign Mentor
        </button>
      </div>
      
      <div className="mt-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Mentors:</h4>
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : assignedMentors.length > 0 ? (
          <div className="space-y-2">
            {assignedMentors.map((assignment) => (
              <div key={assignment.id} className="flex justify-between items-center bg-gray-50 rounded p-2">
                <div>
                  <p className="text-sm font-medium">{assignment.mentor?.fullName}</p>
                  <p className="text-xs text-gray-600">{assignment.mentor?.email}</p>
                </div>
                <button
                  onClick={() => onUnassignMentor(startup.id, assignment.mentor?.id)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                >
                  <FaTrash className="mr-1" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No mentors assigned</div>
        )}
      </div>
    </div>
  );
} 