const API_URL = "http://localhost:8081/api";

export const getLandingPage = async (tenantId, isPublic = false, token = null) => {
  const url = isPublic
    ? `${API_URL}/tenants/${tenantId}/landing-page/public`
    : `${API_URL}/tenants/${tenantId}/landing-page`;
  const headers = isPublic ? {} : { 'Authorization': `Bearer ${token}` };
  
  try {
    console.log(`Fetching landing page from: ${url}`);
    console.log(`Is public: ${isPublic}`);
    console.log(`Headers:`, headers);
    
    const response = await fetch(url, { headers });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Landing page fetch failed: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${errorText}`);
      
      if (response.status === 403) {
        throw new Error(`Access forbidden (403): The landing page endpoint is not accessible. This might be due to authentication issues or the endpoint not being properly configured.`);
      }
      
      throw new Error(`Failed to fetch landing page: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Landing page data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching landing page:', error);
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(`Network error: Cannot connect to backend at ${API_URL}. Please check if the backend server is running.`);
    }
    throw error;
  }
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

export const uploadLandingPageImage = async (tenantId, file, token) => {
  console.log('🖼️ Starting image upload:', {
    tenantId,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    hasToken: !!token
  });

  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_URL}/tenants/${tenantId}/landing-page/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('📤 Upload response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Failed to upload image: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Upload successful, response data:', data);
    
    // Handle different possible response formats
    const imageUrl = data.url || data.imageUrl || data.filePath || data;
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('❌ Invalid response format:', data);
      throw new Error('Invalid response format from server');
    }
    
    console.log('✅ Returning image URL:', imageUrl);
    return imageUrl;
    
  } catch (error) {
    console.error('❌ Image upload error:', error);
    throw error;
  }
}; 