// Define the base URL for your backend API
// IMPORTANT: Ensure this matches the URL where your Spring Boot application is running.
const API_URL = "http://localhost:8081/api";

/**
 * Authenticates a user with the backend.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<{token: string, userId: string, role: string}>} - The authentication data including JWT, user ID, and role.
 * @throws {Error} If login fails or network error occurs.
 */
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

/**
 * Fetches all users from the backend. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @returns {Promise<Array<Object>>} - An array of user objects.
 * @throws {Error} If fetching users fails.
 */
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

/**
 * Creates a new user. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {Object} user - The user data to create.
 * @returns {Promise<Object>} - The created user object.
 * @throws {Error} If creating user fails.
 */
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

/**
 * Updates an existing user. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} id - The ID of the user to update.
 * @param {Object} user - The updated user data.
 * @returns {Promise<Object>} - The updated user object.
 * @throws {Error} If updating user fails.
 */
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

/**
 * Updates a user's profile. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} id - The ID of the user whose profile to update.
 * @param {Object} profileData - The updated profile data.
 * @returns {Promise<Object>} - The updated profile object.
 * @throws {Error} If updating profile fails.
 */
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
    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
    const error = new Error(errorData.message || `Failed to update profile: ${res.status} ${res.statusText}`);
    error.status = res.status; // Attach the status for specific handling
    console.error("Update profile error response:", error);
    throw error;
  }
  return res.json();
}

/**
 * Deletes a user. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} id - The ID of the user to delete.
 * @throws {Error} If deleting user fails.
 */
export async function deleteUser(token, id) {
  console.log(`Deleting user: ${id}`);

  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });

  console.log("Delete user response status:", res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Delete user error response:", errorText);
    throw new Error(`Failed to delete user: ${res.status} ${res.statusText}`);
  }
}

/**
 * Updates a user's active status. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} id - The ID of the user to update.
 * @param {boolean} isActive - The new active status.
 * @returns {Promise<Object>} - The updated user object.
 * @throws {Error} If updating status fails.
 */
export async function updateUserStatus(token, id, isActive) {
  console.log(`Updating user status: ${id}, isActive: ${isActive}`);
  console.log("Request body:", JSON.stringify({ isActive: isActive }));

  const res = await fetch(`${API_URL}/users/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive: isActive }),
  });

  console.log("Update status response status:", res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Update status error response:", errorText);
    throw new Error(`Failed to update user status: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Updates a user's role. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} id - The ID of the user to update.
 * @param {string} role - The new role.
 * @returns {Promise<Object>} - The updated user object.
 * @throws {Error} If updating role fails.
 */
export async function updateUserRole(token, id, role) {
  console.log(`Updating user role: ${id}, role: ${role}`);
  console.log("Request body:", JSON.stringify(role));

  const res = await fetch(`${API_URL}/users/${id}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(role),
  });

  console.log("Update role response status:", res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Update role error response:", errorText);
    throw new Error(`Failed to update user role: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Updates a user's password. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} id - The ID of the user to update.
 * @param {string} currentPassword - The user's current password.
 * @param {string} newPassword - The user's new password.
 * @returns {Promise<Object>} - A message indicating success.
 * @throws {Error} If updating password fails.
 */
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

/**
 * Tests authentication. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @returns {Promise<string>} - A success message.
 * @throws {Error} If authentication test fails.
 */
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

/**
 * Creates a tenant user. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {Object} user - The tenant user data to create.
 * @returns {Promise<Object>} - The created tenant user object.
 * @throws {Error} If creating tenant user fails.
 */
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

/**
 * Fetches all tenant users. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @returns {Promise<Array<Object>>} - An array of tenant user objects.
 * @throws {Error} If fetching tenant users fails.
 */
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

/**
 * Fetches tenant users by role. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} role - The role to filter by.
 * @returns {Promise<Array<Object>>} - An array of tenant user objects matching the role.
 * @throws {Error} If fetching tenant users by role fails.
 */
export async function getTenantUsersByRole(token, role) {
  const res = await fetch(`${API_URL}/users/tenant-users/role/${role}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch tenant users by role");
  return res.json();
}

/**
 * Fetches a startup profile. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} userId - The ID of the user whose profile to fetch.
 * @returns {Promise<Object>} - The startup profile object.
 * @throws {Error} If fetching profile fails.
 */
export async function getStartupProfile(token, userId) {
  const res = await fetch(`${API_URL}/profile/startup/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
    const error = new Error(errorData.message || `Failed to fetch profile: ${res.status} ${res.statusText}`);
    error.status = res.status; // Attach the status for specific handling
    throw error;
  }
  return await res.json();
}

/**
 * Updates a startup profile. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} userId - The ID of the user whose profile to update.
 * @param {Object} data - The updated profile data.
 * @returns {Promise<Object>} - The updated profile object.
 * @throws {Error} If updating profile fails.
 */
export async function updateStartupProfile(token, userId, data) {
  const res = await fetch(`${API_URL}/profile/startup/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || `Failed to update profile: ${res.status} ${res.statusText}`);
    error.status = res.status; // Attach the status for specific handling
    throw error;
  }
  return await res.json();
}

/**
 * Creates a startup profile. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} userId - The ID of the user for whom to create the profile.
 * @returns {Promise<Object>} - The created profile object.
 * @throws {Error} If creating profile fails.
 */
export async function createStartupProfile(token, userId) {
  const res = await fetch(`${API_URL}/profile/startup/${userId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` } // Assuming POST for creation might not need a body initially, but needs auth
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || `Failed to create profile: ${res.status} ${res.statusText}`);
    error.status = res.status; // Attach the status for specific handling
    throw error;
  }
  return await res.json();
}

/**
 * Fetches a mentor profile. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} userId - The ID of the mentor whose profile to fetch.
 * @returns {Promise<Object>} - The mentor profile object.
 * @throws {Error} If fetching profile fails.
 */
export async function getMentorProfile(token, userId) {
  const res = await fetch(`${API_URL}/profile/mentor/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
    const error = new Error(errorData.message || `Failed to fetch mentor profile: ${res.status} ${res.statusText}`);
    error.status = res.status;
    throw error;
  }
  return await res.json();
}

/**
 * Updates a mentor profile. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} userId - The ID of the mentor whose profile to update.
 * @param {Object} data - The updated profile data.
 * @returns {Promise<Object>} - The updated profile object.
 * @throws {Error} If updating profile fails.
 */
export async function updateMentorProfile(token, userId, data) {
  const res = await fetch(`${API_URL}/profile/mentor/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || `Failed to update mentor profile: ${res.status} ${res.statusText}`);
    error.status = res.status;
    throw error;
  }
  return await res.json();
}

/**
 * Creates a mentor profile. Requires authentication.
 * @param {string} token - The JWT for authentication.
 * @param {string} userId - The ID of the mentor for whom to create the profile.
 * @returns {Promise<Object>} - The created profile object.
 * @throws {Error} If creating profile fails.
 */
export async function createMentorProfile(token, userId) {
  const res = await fetch(`${API_URL}/profile/mentor/${userId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || `Failed to create mentor profile: ${res.status} ${res.statusText}`);
    error.status = res.status;
    throw error;
  }
  return await res.json();
}
