import axios from './axiosConfig';

export const getLandingPage = (tenantId, isPublic = false) => {
  const url = isPublic
    ? `/api/tenants/${tenantId}/landing-page/public`
    : `/api/tenants/${tenantId}/landing-page`;
  return axios.get(url).then(res => res.data);
};

export const saveLandingPage = (tenantId, data, token) => {
  return axios.post(`/api/tenants/${tenantId}/landing-page`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(res => res.data);
};

export const deleteLandingPage = (tenantId, token) => {
  return axios.delete(`/api/tenants/${tenantId}/landing-page`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const uploadLandingPageImage = (tenantId, file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`/api/tenants/${tenantId}/landing-page/upload-image`, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    },
  }).then(res => res.data);
}; 