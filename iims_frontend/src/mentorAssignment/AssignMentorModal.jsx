import React, { useState } from 'react';

export default function AssignMentorModal({ mentors, startup, onSave, onCancel }) {
  const [selectedMentor, setSelectedMentor] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Assign Mentor to {startup?.fullName || startup?.email}</h2>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Mentor:</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedMentor}
            onChange={e => setSelectedMentor(e.target.value)}
          >
            <option value="">-- Select Mentor --</option>
            {mentors.map(m => (
              <option key={m.id} value={m.id}>{m.fullName || m.email}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-brand-primary text-white hover:bg-brand-primary-dark"
            onClick={() => selectedMentor && onSave(selectedMentor)}
            disabled={!selectedMentor}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
} 