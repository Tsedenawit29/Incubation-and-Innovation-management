export const createNewsPost = async (token, formData) => {
  const response = await fetch("http://localhost:8081/api/v1/news", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create news post.");
  }

  return response.json();
};

export const getNewsPostsByTenant = async (token, tenantId) => {
  const response = await fetch(`http://localhost:8081/api/v1/news/tenant/${tenantId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch news posts.");
  }

  return response.json();
};

export const getNewsPostsByCategory = async (token, tenantId, category) => {
  const response = await fetch(`http://localhost:8081/api/v1/news/tenant/${tenantId}/category/${category}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch news posts by category.");
  }

  return response.json();
};

export const getNewsPostsByTenantAndCategory = async (token, tenantId, category) => {
  try {
    const response = await fetch(`http://localhost:8081/api/v1/news/tenant/${tenantId}/category/${category}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching news posts by category:', error);
    throw error;
  }
};

export const updateNewsPost = async (token, postId, formData) => {
  try {
    const response = await fetch(`http://localhost:8081/api/v1/news/${postId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating news post:', error);
    throw error;
  }
};

export const deleteNewsPost = async (token, postId) => {
  try {
    const response = await fetch(`http://localhost:8081/api/v1/news/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting news post:', error);
    throw error;
  }
};