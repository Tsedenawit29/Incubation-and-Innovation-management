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

export const updateSubmission = async (submissionId, data, token) => {
  const res = await fetch(`${API_URL}/progresstracking/submissions/${submissionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Update submission error:', errorText);
    throw new Error(`Failed to update submission: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

const API_URL = "http://localhost:8081/api";
export const uploadSubmissionFile = async (file, submissionId, token) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('submissionId', submissionId);
  
  console.log('Uploading file:', { fileName: file.name, fileSize: file.size, submissionId });
  
  const res = await fetch(`${API_URL}/progresstracking/submission-files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('File upload error:', errorText);
    throw new Error(`Failed to upload file: ${res.status} ${res.statusText}`);
  }
  
  const result = await res.json();
  console.log('File upload successful:', result);
  return result;
};

export const createSubmission = async (trackingId, taskId, token) => {
  const res = await fetch(`${API_URL}/progresstracking/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ trackingId, taskId }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Create submission error:', errorText);
    throw new Error(`Failed to create submission: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

export const getAssignedTemplatesForStartup = async (startupId, token) => {
  console.log('🔍 Fetching assigned templates for startup:', startupId);
  const url = `/api/progresstracking/assignments/assigned-templates/USER/${startupId}`;
  console.log('🔗 API URL:', url);
  console.log('🔑 Using token for auth:', !!token);
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, { headers });
  console.log('📡 Response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ API Error:', errorData);
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('✅ Assigned templates response:', data);
  return data;
};

export const getAllAssignments = async () => {
  const response = await axios.get('/api/progresstracking/assignments');
  return response.data;
};

export const deleteAssignment = async (assignmentId) => {
  const response = await axios.delete(`/api/progresstracking/assignments/${assignmentId}`);
  return response.data;
};

export const getStartupsForMentor = async (mentorId) => {
  const response = await axios.get(`/api/mentor-assignment?mentorId=${mentorId}`);
  return response.data;
};

export const getSubmissionFiles = async (submissionId) => {
  const response = await axios.get(`/api/progresstracking/submission-files?submissionId=${submissionId}`);
  return response.data;
}; 