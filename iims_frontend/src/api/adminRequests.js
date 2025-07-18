const API_URL = "http://localhost:8080/api";

// Admin Request Management APIs
export async function requestAdmin(adminData) {
  console.log("Requesting admin registration:", adminData);
  
  const res = await fetch(`${API_URL}/users/request-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(adminData),
  });
  
  console.log("Admin request response status:", res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Admin request error response:", errorText);
    throw new Error(`Failed to request admin: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
}

export async function getPendingAdminRequests(token) {
  console.log("Getting pending admin requests");
  
  const res = await fetch(`${API_URL}/users/pending-admins`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  
  if (!res.ok) {
    console.error("Get pending admin requests failed:", res.status, res.statusText);
    throw new Error("Failed to fetch pending admin requests");
  }
  
  return res.json();
}

export async function getAllAdminRequests(token) {
  console.log("Getting all admin requests");
  
  const res = await fetch(`${API_URL}/users/admin-requests`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  
  if (!res.ok) {
    console.error("Get all admin requests failed:", res.status, res.statusText);
    throw new Error("Failed to fetch admin requests");
  }
  
  return res.json();
}

export async function getAdminRequestById(token, id) {
  const res = await fetch(`${API_URL}/users/admin-requests/${id}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch admin request");
  }
  
  return res.json();
}

export async function approveAdminRequest(token, requestId, approvedBy) {
  console.log("Approving admin request:", requestId);
  
  const res = await fetch(`${API_URL}/users/approve-admin/${requestId}?approvedBy=${approvedBy}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Approve admin request error response:", errorText);
    throw new Error(`Failed to approve admin request: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
}

export async function rejectAdminRequest(token, requestId, rejectedBy, reason) {
  console.log("Rejecting admin request:", requestId);
  
  const res = await fetch(`${API_URL}/users/reject-admin/${requestId}?rejectedBy=${rejectedBy}&reason=${encodeURIComponent(reason)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Reject admin request error response:", errorText);
    throw new Error(`Failed to reject admin request: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
} 