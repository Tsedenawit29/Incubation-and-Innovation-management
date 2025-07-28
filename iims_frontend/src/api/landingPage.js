const API_URL = "http://localhost:8081/api";

export const getLandingPage = (tenantId, isPublic = false) => {
  const url = isPublic
    ? `${API_URL}/tenants/${tenantId}/landing-page/public`
    : `${API_URL}/tenants/${tenantId}/landing-page`;
  return fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch landing page');
    return res.json();
  });
};

export const saveLandingPage = (tenantId, data, token) => {
  return fetch(`${API_URL}/tenants/${tenantId}/landing-page`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(res => {
    if (!res.ok) throw new Error('Failed to save landing page');
    return res.json();
  });
};

export const deleteLandingPage = (tenantId, token) => {
  return fetch(`${API_URL}/tenants/${tenantId}/landing-page`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(res => {
    if (!res.ok) throw new Error('Failed to delete landing page');
  });
};

export const uploadLandingPageImage = (tenantId, file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  return fetch(`${API_URL}/tenants/${tenantId}/landing-page/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  }).then(res => {
    if (!res.ok) throw new Error('Failed to upload image');
    return res.json();
  });
}; 