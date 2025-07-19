const API_URL = "http://localhost:8081/api";

// Tenant Management APIs
export async function applyForTenant(tenantData) {
  console.log("Applying for tenant:", tenantData);
  
  const res = await fetch(`${API_URL}/tenant/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tenantData),
  });
  
  console.log("Tenant application response status:", res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Tenant application error response:", errorText);
    throw new Error(`Failed to apply for tenant: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
}

export async function getPendingTenants(token) {
  console.log("Getting pending tenants");
  
  const res = await fetch(`${API_URL}/tenant/pending`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  
  if (!res.ok) {
    console.error("Get pending tenants failed:", res.status, res.statusText);
    throw new Error("Failed to fetch pending tenants");
  }
  
  return res.json();
}

export async function getAllTenants(token) {
  console.log("Getting all tenants");
  
  const res = await fetch(`${API_URL}/tenant`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  
  if (!res.ok) {
    console.error("Get all tenants failed:", res.status, res.statusText);
    throw new Error("Failed to fetch tenants");
  }
  
  return res.json();
}

export async function getTenantById(token, id) {
  const res = await fetch(`${API_URL}/tenant/${id}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch tenant");
  }
  
  return res.json();
}

export async function approveTenant(token, tenantId, approvedBy) {
  console.log("Approving tenant:", tenantId);
  // Backend expects { approved: true, reason: null } as body
  const res = await fetch(`${API_URL}/tenant/approve/${tenantId}?approvedBy=${approvedBy}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ approved: true, reason: null }),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Approve tenant error response:", errorText);
    throw new Error(`Failed to approve tenant: ${res.status} ${res.statusText}`);
  }
  
  const response = await res.json();
  console.log("Tenant approval response:", response);
  return response;
}

export async function rejectTenant(token, tenantId, rejectedBy, reason) {
  console.log("Rejecting tenant:", tenantId);
  
  const res = await fetch(`${API_URL}/tenant/reject/${tenantId}?rejectedBy=${rejectedBy}&reason=${encodeURIComponent(reason)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Reject tenant error response:", errorText);
    throw new Error(`Failed to reject tenant: ${res.status} ${res.statusText}`);
  }
  
  const response = await res.json();
  console.log("Tenant rejection response:", response);
  return response;
}

export async function suspendTenant(token, tenantId) {
  const res = await fetch(`${API_URL}/tenant/suspend/${tenantId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    throw new Error("Failed to suspend tenant");
  }
  
  return res.json();
}

export async function activateTenant(token, tenantId) {
  const res = await fetch(`${API_URL}/tenant/activate/${tenantId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    throw new Error("Failed to activate tenant");
  }
  
  return res.json();
} 