// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:8081/api/profile/investor';

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

// Get investor profile
export const getInvestorProfile = async (userId) => {
  try {
    const response = await api.get(`/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching investor profile:', error);
    throw error;
  }
};

// Create or update investor profile
export const createOrUpdateInvestorProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/${userId}`, profileData);
    return await response.json();
  } catch (error) {
    console.error('Error creating/updating investor profile:', error);
    throw error;
  }
};

// Get all investors
export const getAllInvestors = async () => {
  try {
    const response = await api.get('/all');
    return await response.json();
  } catch (error) {
    console.error('Error fetching all investors:', error);
    throw error;
  }
};

// Get available investor mentors
export const getAvailableInvestorMentors = async () => {
  try {
    const response = await api.get('/all');
    const data = await response.json();
    return data.filter(investor => investor.mentorshipAreas);
  } catch (error) {
    console.error('Error fetching available investor mentors:', error);
    throw error;
  }
};

// Search investors
export const searchInvestors = async (query) => {
  try {
    const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
    return await response.json();
  } catch (error) {
    console.error('Error searching investors:', error);
    throw error;
  }
};

// Get investors by investment focus
export const getInvestorsByFocus = async (investmentFocus) => {
  try {
    const response = await api.get(`/focus/${encodeURIComponent(investmentFocus)}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching investors by focus:', error);
    throw error;
  }
};

// Get investors by investment stage
export const getInvestorsByStage = async (investmentStage) => {
  try {
    const response = await api.get(`/stage/${encodeURIComponent(investmentStage)}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching investors by stage:', error);
    throw error;
  }
};

// Get investor count
export const getInvestorCount = async () => {
  try {
    const response = await api.get('/count');
    return await response.json();
  } catch (error) {
    console.error('Error fetching investor count:', error);
    throw error;
  }
};
