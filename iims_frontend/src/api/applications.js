import axios from './axiosConfig';

export const submitApplication = async (applicationData) => {
  try {
    const response = await axios.post('/api/v1/applications/submit', applicationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit application');
  }
};

export const getApplicationById = async (applicationId, tenantId) => {
  try {
    const response = await axios.get(`/api/v1/tenants/${tenantId}/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch application');
  }
};

export const getApplicationsByFormId = async (formId, tenantId) => {
  try {
    const response = await axios.get(`/api/v1/tenants/${tenantId}/application-forms/${formId}/applications`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch applications');
  }
};

export const getAllApplicationsByTenant = async (tenantId) => {
  try {
    const response = await axios.get(`/api/v1/tenants/${tenantId}/applications`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch applications');
  }
};

export const updateApplicationStatus = async (tenantId, reviewData) => {
  try {
    const response = await axios.put(`/api/v1/tenants/${tenantId}/applications/status`, reviewData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update application status');
  }
};

// Document management
export const uploadDocument = async (applicationId, documentData) => {
  try {
    const response = await axios.post(`/api/v1/applications/${applicationId}/documents`, documentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload document');
  }
};

export const getApplicationDocuments = async (applicationId) => {
  try {
    const response = await axios.get(`/api/v1/applications/${applicationId}/documents`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch documents');
  }
};

export const deleteDocument = async (documentId) => {
  try {
    await axios.delete(`/api/v1/applications/documents/${documentId}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete document');
  }
};

export const downloadDocument = async (documentId) => {
  try {
    const response = await axios.get(`/api/v1/applications/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to download document');
  }
};
