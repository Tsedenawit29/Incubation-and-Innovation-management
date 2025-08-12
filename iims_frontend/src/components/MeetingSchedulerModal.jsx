import React, { useState } from 'react';
import axios from 'axios';

const MeetingSchedulerModal = ({ isOpen, onClose, onMeetingCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendeeEmails, setAttendeeEmails] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleEmailChange = (index, value) => {
    const emails = [...attendeeEmails];
    emails[index] = value;
    setAttendeeEmails(emails);
  };

  const addEmailField = () => {
    setAttendeeEmails([...attendeeEmails, '']);
  };

  const removeEmailField = (index) => {
    if (attendeeEmails.length === 1) return; // keep at least one
    setAttendeeEmails(attendeeEmails.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // Basic validation
  if (!title.trim()) return setError('Title is required');
  if (!startTime || !endTime) return setError('Start and End time are required');
  if (new Date(startTime) >= new Date(endTime)) return setError('End time must be after start time');
  if (attendeeEmails.some(email => email && !/^\S+@\S+\.\S+$/.test(email))) {
    return setError('Please enter valid email addresses');
  }

  const payload = {
    title: title.trim(),
    description: description.trim(),
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    attendeeEmails: attendeeEmails.filter(email => email.trim() !== ''),
  };

  try {
    setLoading(true);

    // Get JWT from local storage (adjust if you store elsewhere)
    const token = localStorage.getItem('springBootAuthToken');

    if (!token) {
      setError('You must be logged in to schedule a meeting.');
      setLoading(false);
      return;
    }

    await axios.post(
      'http://localhost:8081/api/meetings',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setLoading(false);
    onMeetingCreated();
    onClose();
  } catch (err) {
    setLoading(false);
    setError('Failed to schedule meeting. Please try again.');
    console.error(err);
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg relative">
        <h2 className="text-xl font-semibold mb-4">Schedule a Meeting</h2>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1">Attendees (Emails)</label>
            {attendeeEmails.map((email, i) => (
              <div key={i} className="flex items-center mb-2 space-x-2">
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={e => handleEmailChange(i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeEmailField(i)}
                  className="text-red-600 hover:text-red-800 font-bold px-2"
                  title="Remove email"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addEmailField}
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              + Add another email
            </button>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingSchedulerModal;
