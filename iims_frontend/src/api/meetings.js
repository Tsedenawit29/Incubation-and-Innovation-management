import axios from './axiosConfig';

// Meeting API endpoints
export const createMeeting = async (meetingData) => {
  try {
    const response = await axios.post('/api/meetings', meetingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyMeetings = async () => {
  try {
    const response = await axios.get('/api/meetings/my-meetings');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMeeting = async (meetingId) => {
  try {
    await axios.delete(`/api/meetings/${meetingId}`);
    return true;
  } catch (error) {
    throw error;
  }
};

// Google OAuth API endpoints
export const getGoogleAuthUrl = async (type, id) => {
  try {
    const response = await axios.get('/api/google/auth-url', {
      params: { type, id }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOAuthStatus = async () => {
  try {
    const response = await axios.get('/api/meetings/oauth-status');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGoogleCalendarEvents = async () => {
  try {
    const response = await axios.get('/api/google/calendar/events');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 




// Get all system users for attendee selection
export const getSystemUsers = async () => {
  try {
    const response = await axios.get('/api/users/tenant-users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

