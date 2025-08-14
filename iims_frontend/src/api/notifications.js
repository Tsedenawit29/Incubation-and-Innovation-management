import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Create axios instance with auth token
const createAuthenticatedRequest = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const getNotifications = async () => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.post(`/notifications/${notificationId}/mark-read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};
