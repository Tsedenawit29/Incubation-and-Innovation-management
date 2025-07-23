const API_URL = "http://localhost:8081/api";

export async function login(email, password) {
  try {
    console.log("Attempting to login to:", `${API_URL}/auth/login`);
    console.log("Request payload:", { email, password });
    
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email, password }),
    });
    
    console.log("Response status:", res.status);
    console.log("Response headers:", res.headers);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Error response:", errorData);
      throw new Error(errorData.message || `Login failed: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log("Login successful:", data);
    return data;
  } catch (error) {
    console.error("Login error details:", error);
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(`Network error: Cannot connect to backend at ${API_URL}. Please check if the backend is running.`);
    }
    throw error;
  }
}

export async function getUsers(token) {
  console.log("Getting users with token:", token ? "present" : "missing");
  const res = await fetch(`${API_URL}/users`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!res.ok) {
    console.error("Get users failed:", res.status, res.statusText);
    throw new Error("Failed to fetch users");
  }
  return res.json();
}

export async function createUser(token, user) {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function updateUser(token, id, user) {
  console.log("Updating user:", id, "with data:", user);
  console.log("Token present:", !!token);
  
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });
  
  console.log("Update user response status:", res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Update user error response:", errorText);
    throw new Error(`Failed to update user: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function updateUserProfile(token, id, profileData) {
  console.log("Updating user profile:", id, "with data:", profileData);
  console.log("Token present:", !!token);
  
  const res = await fetch(`${API_URL}/users/${id}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  
  console.log("Update profile response status:", res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Update profile error response:", errorText);
    throw new Error(`Failed to update user profile: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function deleteUser(token, id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

export async function updateUserStatus(token, id, isActive) {
  const res = await fetch(`${API_URL}/users/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ active: isActive, isActive }),
  });
  if (!res.ok) throw new Error("Failed to update user status");
  return res.json();
}

export async function updateUserRole(token, id, role) {
  const res = await fetch(`${API_URL}/users/${id}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(role),
  });
  if (!res.ok) throw new Error("Failed to update user role");
  return res.json();
}

export async function updateUserPassword(token, id, currentPassword, newPassword) {
  console.log("Updating password for user:", id);
  console.log("Token present:", !!token);
  
  const res = await fetch(`${API_URL}/users/${id}/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  
  console.log("Update password response status:", res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Update password error response:", errorText);
    throw new Error(`Failed to update user password: ${res.status} ${res.statusText}`);
  }
  
  // Try to parse as JSON, but handle empty responses gracefully
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    // If no JSON content type, just return success
    return { message: "Password updated successfully" };
  }
} 

export async function testAuth(token) {
  console.log("Testing auth with token:", token ? "present" : "missing");
  const res = await fetch(`${API_URL}/auth/test-auth`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  console.log("Test auth response status:", res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Test auth error response:", errorText);
    throw new Error(`Auth test failed: ${res.status} ${res.statusText}`);
  }
  return res.text();
} 

export async function createTenantUser(token, user) {
  const res = await fetch(`${API_URL}/users/tenant-create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to create tenant user");
  return res.json();
}

export async function getTenantUsers(token) {
  const res = await fetch(`${API_URL}/users/tenant-users`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch tenant users");
  return res.json();
}

export async function getTenantUsersByRole(token, role) {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
    throw new Error('No valid auth token found. Please log in again.');
  }
  const res = await fetch(`${API_URL}/users/tenant-users/role/${role}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch tenant users by role");
  return res.json();
} 