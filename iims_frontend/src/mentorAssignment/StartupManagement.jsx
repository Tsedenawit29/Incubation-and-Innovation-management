import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTenantUsersByRole } from '../api/users';
import { assignMentor, getMentorsForStartup, unassignMentor } from '../api/mentorAssignment';
import AssignMentorModal from './AssignMentorModal';

export default function StartupManagement() {
  const { token } = useAuth();
  const [startups, setStartups] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [assignedMentorsMap, setAssignedMentorsMap] = useState({}); // { startupId: [mentors] }
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      fetchStartups();
      fetchMentors();
    }
    // eslint-disable-next-line
  }, [token]);

  const fetchStartups = async () => {
    setLoading(true); setError('');
    try {
      const data = await getTenantUsersByRole(token, 'STARTUP');
      setStartups(data);
      // Fetch assigned mentors for all startups
      const mentorsMap = {};
      for (const s of data) {
        try {
          const assigned = await getMentorsForStartup(token, s.id);
          mentorsMap[s.id] = assigned.map(a => a.mentor);
        } catch (e) {
          mentorsMap[s.id] = [];
        }
      }
      setAssignedMentorsMap(mentorsMap);
    } catch (e) {
      setError('Failed to load startups');
    } finally {
      setLoading(false);
    }
  };
  const fetchMentors = async () => {
    setLoading(true); setError('');
    try {
      const data = await getTenantUsersByRole(token, 'MENTOR');
      setMentors(data);
    } catch (e) {
      setError('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };
  const handleAssignMentor = async (startup) => {
    setSelectedStartup(startup);
    setShowModal(true);
  };
  const handleSaveMentor = async (mentorId) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      await assignMentor(token, selectedStartup.id, mentorId);
      setSuccess('Mentor assigned successfully!');
      setShowModal(false);
      fetchStartups();
    } catch (e) {
      setError('Failed to assign mentor');
    } finally {
      setLoading(false);
    }
  };
  const handleUnassignMentor = async (startupId, mentorId) => {
    setLoading(true); setError('');
    try {
      await unassignMentor(token, startupId, mentorId);
      fetchStartups();
    } catch (e) {
      setError('Failed to unassign mentor');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Startup Management</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>}
      <table className="w-full border rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left">Startup</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Assigned Mentors</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {startups.length === 0 ? (
            <tr><td colSpan={4} className="text-center text-gray-400 py-4">No startups found.</td></tr>
          ) : startups.map(s => (
            <tr key={s.id}>
              <td className="px-3 py-2">{s.fullName || s.email}</td>
              <td className="px-3 py-2">{s.email}</td>
              <td className="px-3 py-2">
                {assignedMentorsMap[s.id] && assignedMentorsMap[s.id].length > 0 ? (
                  assignedMentorsMap[s.id].map(m => (
                    <span key={m.id} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded mr-1 text-xs">
                      {m.fullName || m.email}
                      <button
                        className="ml-1 text-red-500 hover:text-red-700 font-bold"
                        title="Remove mentor"
                        onClick={() => handleUnassignMentor(s.id, m.id)}
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : <span className="text-gray-400 text-xs">None</span>}
              </td>
              <td className="px-3 py-2">
                <button className="bg-brand-primary text-white px-3 py-1 rounded" onClick={() => handleAssignMentor(s)}>Assign Mentor</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <AssignMentorModal
          mentors={mentors}
          startup={selectedStartup}
          onSave={handleSaveMentor}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
} 