import api from './api';

/**
 * Fetches analytics data from the backend
 * @param {string} timeRange - The time range for analytics (week, month, quarter, year)
 * @returns {Promise<Object>} Analytics data
 */
export const getAnalytics = async (timeRange = 'month') => {
  try {
    const response = await api.get(`/api/analytics?timeRange=${timeRange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

/**
 * Exports analytics data in the specified format
 * @param {string} timeRange - The time range for analytics
 * @param {string} format - Export format (csv or json)
 * @returns {Promise<Blob>} The exported file as a Blob
 */
export const exportAnalytics = async (timeRange = 'month', format = 'csv') => {
  try {
    const response = await api.get(`/api/analytics/export?timeRange=${timeRange}&format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting analytics:', error);
    throw error;
  }
};

/**
 * Fetches user engagement metrics
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} User engagement metrics
 */
export const getUserEngagementMetrics = async (userId) => {
  try {
    const response = await api.get(`/api/analytics/users/${userId}/engagement`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user engagement metrics:', error);
    throw error;
  }
};

/**
 * Fetches startup performance metrics
 * @param {string} startupId - The startup ID
 * @returns {Promise<Object>} Startup performance metrics
 */
export const getStartupPerformanceMetrics = async (startupId) => {
  try {
    const response = await api.get(`/api/analytics/startups/${startupId}/performance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching startup performance metrics:', error);
    throw error;
  }
};

/**
 * Fetches mentor performance metrics
 * @param {string} mentorId - The mentor ID
 * @returns {Promise<Object>} Mentor performance metrics
 */
export const getMentorPerformanceMetrics = async (mentorId) => {
  try {
    const response = await api.get(`/api/analytics/mentors/${mentorId}/performance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentor performance metrics:', error);
    throw error;
  }
};

/**
 * Fetches tenant-wide metrics
 * @param {string} tenantId - The tenant ID
 * @returns {Promise<Object>} Tenant-wide metrics
 */
export const getTenantMetrics = async (tenantId) => {
  try {
    const response = await api.get(`/api/analytics/tenants/${tenantId}/metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant metrics:', error);
    throw error;
  }
};
