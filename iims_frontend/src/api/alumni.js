// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:8081/api/profile/alumni';

// Helper function to get the correct token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('springBootAuthToken');
};

// Create axios instance with proper configuration
const api = {
  get: async (endpoint) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response;
  },
  post: async (endpoint, data) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response;
  },
  put: async (endpoint, data) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response;
  },
  delete: async (endpoint) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response;
  }
};

// Get alumni profile
export const getAlumniProfile = async (userId) => {
  try {
    const response = await api.get(`/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching alumni profile:', error);
    throw error;
  }
};

// Create or update alumni profile
export const createOrUpdateAlumniProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/${userId}`, profileData);
    return await response.json();
  } catch (error) {
    console.error('Error creating/updating alumni profile:', error);
    throw error;
  }
};

// Get all alumni
export const getAllAlumni = async () => {
  try {
    const response = await api.get('/all');
    return await response.json();
  } catch (error) {
    console.error('Error fetching all alumni:', error);
    throw error;
  }
};

// Get available alumni mentors
export const getAvailableMentors = async () => {
  try {
    const response = await api.get('/all');
    const data = await response.json();
    return data.filter(alumni => alumni.mentorshipInterests);
  } catch (error) {
    console.error('Error fetching available mentors:', error);
    throw error;
  }
};

// Search alumni
export const searchAlumni = async (query) => {
  try {
    const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
    return await response.json();
  } catch (error) {
    console.error('Error searching alumni:', error);
    throw error;
  }
};

// Get alumni by industry
export const getAlumniByIndustry = async (industry) => {
  try {
    const response = await api.get(`/industry/${encodeURIComponent(industry)}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching alumni by industry:', error);
    throw error;
  }
};

// Get alumni count
export const getAlumniCount = async () => {
  try {
    const response = await api.get('/count');
    return await response.json();
  } catch (error) {
    console.error('Error fetching alumni count:', error);
    throw error;
  }
};

// Delete alumni profile
export const deleteAlumniProfile = async () => {
  try {
    const response = await api.delete('/alumni/profile');
    return response.data;
  } catch (error) {
    console.error('Error deleting alumni profile:', error);
    throw error;
  }
};
