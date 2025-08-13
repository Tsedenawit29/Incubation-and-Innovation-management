import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8081'
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('springBootAuthToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('springBootAuthToken');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 