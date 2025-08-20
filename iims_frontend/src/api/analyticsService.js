import api from './api';

// Time period constants
export const TIME_PERIODS = {
  WEEK: '7d',
  MONTH: '30d',
  QUARTER: '90d',
  YEAR: '365d',
  ALL: 'all'
};

// User roles for role-based exports
export const USER_ROLES = {
  ALL: 'all',
  STARTUP: 'startup',
  MENTOR: 'mentor',
  ALUMNI: 'alumni',
  INVESTOR: 'investor',
  ADMIN: 'admin',
  TENANT_ADMIN: 'tenant_admin'
};

// Module endpoints
const ENDPOINTS = {
  DASHBOARD: '/api/analytics/dashboard',
  USERS: '/api/analytics/users',
  USERS_BY_ROLE: '/api/analytics/users/role',
  STARTUPS: '/api/analytics/startups',
  MENTORS: '/api/analytics/mentors',
  ALUMNI: '/api/analytics/alumni',
  INVESTORS: '/api/analytics/investors',
  APPLICATIONS: '/api/analytics/applications',
  PROGRESS: '/api/analytics/progress',
  COLLABORATION: '/api/analytics/collaboration',
  EVENTS: '/api/analytics/events',
  // Detail endpoints for drilldowns
  USER_DETAILS: '/api/analytics/users/details',
  STARTUP_DETAILS: '/api/analytics/startups/details',
  MENTOR_DETAILS: '/api/analytics/mentors/details'
};

/**
 * Fetches analytics data for a specific module
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date in YYYY-MM-DD format
 * @param {string} params.endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Analytics data
 */
const fetchAnalytics = async (endpoint, params = {}) => {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching analytics from ${endpoint}:`, error);
    throw error;
  }
};

// Base analytics methods
export const getDashboardAnalytics = (params) => 
  fetchAnalytics(ENDPOINTS.DASHBOARD, params);

// User analytics
export const getUserAnalytics = (params) => 
  fetchAnalytics(ENDPOINTS.USERS, params);

export const getUsersByRole = (role, params = {}) => {
  if (!Object.values(USER_ROLES).includes(role)) {
    throw new Error(`Invalid user role. Must be one of: ${Object.values(USER_ROLES).join(', ')}`);
  }
  return fetchAnalytics(`${ENDPOINTS.USERS_BY_ROLE}/${role}`, params);
};

// Startup analytics
export const getStartupAnalytics = (params) => 
  fetchAnalytics(ENDPOINTS.STARTUPS, params);

// Mentor analytics
export const getMentorAnalytics = (params) => 
  fetchAnalytics(ENDPOINTS.MENTORS, params);

// Alumni analytics
export const getAlumniAnalytics = (params) => 
  fetchAnalytics(ENDPOINTS.ALUMNI, params);

// Investor analytics
export const getInvestorAnalytics = (params) => 
  fetchAnalytics(ENDPOINTS.INVESTORS, params);

// Application analytics
export const getApplicationAnalytics = (params) => 
  fetchAnalytics(ENDPOINTS.APPLICATIONS, params);

// Progress analytics
export const getProgressAnalytics = (params) => 
  fetchAnalytics(ENDPOINTS.PROGRESS, params);

// Collaboration analytics
export const getCollaborationAnalytics = (params) => 
  fetchAnalytics(ENDPOINTS.COLLABORATION, params);

// Event analytics
export const getEventAnalytics = (params) => 
  fetchAnalytics(ENDPOINTS.EVENTS, params);

// Engagement analytics
export const getEngagementAnalytics = (params) =>
  fetchAnalytics('/api/analytics/engagement', params);

// Detailed analytics for drilldowns
export const getUserDetails = (userId, params = {}) =>
  fetchAnalytics(`${ENDPOINTS.USER_DETAILS}/${userId}`, params);

export const getStartupDetails = (startupId, params = {}) =>
  fetchAnalytics(`${ENDPOINTS.STARTUP_DETAILS}/${startupId}`, params);

export const getMentorDetails = (mentorId, params = {}) =>
  fetchAnalytics(`${ENDPOINTS.MENTOR_DETAILS}/${mentorId}`, params);

/**
 * Base export function for analytics data
 * @param {string} endpoint - The API endpoint
 * @param {Object} params - Export parameters
 * @returns {Promise<Blob>} The exported file as a Blob
 */
const exportData = async (endpoint, params = {}) => {
  try {
    const response = await api.get(endpoint, {
      params: {
        format: params.format || 'csv',
        startDate: params.startDate,
        endDate: params.endDate
      },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// Export functions
export const exportDashboardAnalytics = (params) =>
  exportData('/api/analytics/export/dashboard', params);

/**
 * Export user analytics with role filtering
 * @param {Object} params - Export parameters
 * @param {string} [params.role] - Role to filter users by (optional)
 * @param {string} [params.format='csv'] - Export format (csv, xlsx, pdf)
 * @param {string} [params.startDate] - Start date for filtering
 * @param {string} [params.endDate] - End date for filtering
 * @returns {Promise<Blob>} The exported file as a Blob
 */
export const exportUserAnalytics = async (params = {}) => {
  const { role, ...queryParams } = params;
  const endpoint = role && role !== USER_ROLES.ALL 
    ? `/api/analytics/export/users/role/${role}`
    : '/api/analytics/export/users';
  
  return exportData(endpoint, queryParams);
};

// Export specific role-based user data
export const exportStartupUsers = (params) =>
  exportData('/api/analytics/export/users/role/startup', params);

export const exportMentorUsers = (params) =>
  exportData('/api/analytics/export/users/role/mentor', params);

export const exportAlumniUsers = (params) =>
  exportData('/api/analytics/export/users/role/alumni', params);

export const exportInvestorUsers = (params) =>
  exportData('/api/analytics/export/users/role/investor', params);

export const exportAdminUsers = (params) =>
  exportData('/api/analytics/export/users/role/admin', params);

// Other exports
export const exportStartupAnalytics = (params) =>
  exportData('/api/analytics/export/startups', params);

export const exportEngagementAnalytics = (params) =>
  exportData('/api/analytics/export/engagement', params);

/**
 * Export data with custom endpoint and parameters
 * @param {string} resource - The resource to export (e.g., 'users', 'startups')
 * @param {Object} options - Export options
 * @param {string} [options.role] - Role filter (for user exports)
 * @param {string} [options.format='csv'] - Export format
 * @param {string} [options.startDate] - Start date filter
 * @param {string} [options.endDate] - End date filter
 * @returns {Promise<Blob>} The exported file as a Blob
 */
export const exportResource = async (resource, options = {}) => {
  const { role, ...params } = options;
  
  // Handle role-based exports
  if (resource === 'users' && role) {
    return exportUserAnalytics({ ...params, role });
  }
  
  // Handle other resource types
  const endpoint = `/api/analytics/export/${resource}`;
  return exportData(endpoint, params);
};

// Default export with all functions
export default {
  // Get analytics
  getDashboardAnalytics,
  getUserAnalytics,
  getUsersByRole,
  getStartupAnalytics,
  getMentorAnalytics,
  getAlumniAnalytics,
  getInvestorAnalytics,
  getApplicationAnalytics,
  getProgressAnalytics,
  getCollaborationAnalytics,
  getEventAnalytics,
  getEngagementAnalytics,
  
  // Get detailed data
  getUserDetails,
  getStartupDetails,
  getMentorDetails,
  
  // Export functions
  exportDashboardAnalytics,
  exportUserAnalytics,
  exportStartupUsers,
  exportMentorUsers,
  exportAlumniUsers,
  exportInvestorUsers,
  exportAdminUsers,
  exportStartupAnalytics,
  exportEngagementAnalytics,
  exportResource,
  
  // Constants
  TIME_PERIODS,
  USER_ROLES,
};
