import axios from './axiosConfig';

// Templates
export const getTemplates = (tenantId) => {
  if (tenantId) {
    return axios.get(`/api/progresstracking/templates/tenant/${tenantId}`).then(res => res.data);
  }
  return axios.get(`/api/progresstracking/templates`).then(res => res.data);
};
export const createTemplate = (data) => axios.post(`/api/progresstracking/templates`, data).then(res => res.data);
export const updateTemplate = (id, data) => axios.put(`/api/progresstracking/templates/${id}`, data).then(res => res.data);
export const deleteTemplate = (id) => axios.delete(`/api/progresstracking/templates/${id}`).then(res => res.data);

// Phases
export const getPhases = (templateId) => axios.get(`/api/progresstracking/phases`, { params: { templateId } }).then(res => res.data);
export const createPhase = (data) => axios.post(`/api/progresstracking/phases`, data).then(res => res.data);
export const updatePhase = (id, data) => axios.put(`/api/progresstracking/phases/${id}`, data).then(res => res.data);
export const deletePhase = (id) => axios.delete(`/api/progresstracking/phases/${id}`).then(res => res.data);

// Tasks
export const getTasks = (phaseId) => axios.get(`/api/progresstracking/tasks`, { params: { phaseId } }).then(res => res.data);
export const createTask = (data) => axios.post(`/api/progresstracking/tasks`, data).then(res => res.data);
export const updateTask = (id, data) => axios.put(`/api/progresstracking/tasks/${id}`, data).then(res => res.data);
export const deleteTask = (id) => axios.delete(`/api/progresstracking/tasks/${id}`).then(res => res.data);

export const assignTemplate = (data) =>
  axios.post('/api/progresstracking/assignments', data).then(res => res.data);

export const getTrackings = () =>
  axios.get('/api/progresstracking/trackings').then(res => res.data);

export const getSubmissions = () =>
  axios.get('/api/progresstracking/submissions').then(res => res.data);

export const updateSubmission = async (submissionId, data) => {
  const res = await fetch(`/api/progresstracking/submissions/${submissionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update submission');
  return res.json();
};

const API_URL = "http://localhost:8081/api";
export const uploadSubmissionFile = async (file, submissionId, token) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('submissionId', submissionId);
  const res = await fetch(`${API_URL}/progresstracking/submission-files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload file');
  return res.json();
};

export const createSubmission = async (trackingId, taskId, token) => {
  const res = await fetch('/api/progresstracking/submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ trackingId, taskId }),
  });
  if (!res.ok) throw new Error('Failed to create submission');
  return res.json();
};

export const getAssignedTemplatesForStartup = async (startupId) => {
  // Fetch assignments for this startup
  const assignments = await axios.get(`/api/progresstracking/assignments/assigned/USER/${startupId}`).then(res => res.data);
  // For each assignment, fetch the template details
  const templateIds = assignments.map(a => a.templateId).filter(Boolean);
  if (templateIds.length === 0) return [];
  // Fetch all templates for tenant (or all), then filter
  const allTemplates = await axios.get(`/api/progresstracking/templates`).then(res => res.data);
  return allTemplates.filter(t => templateIds.includes(t.id));
}; 