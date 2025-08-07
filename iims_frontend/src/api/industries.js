// src/api/industries.js

const API_URL = "http://localhost:8081/api/v1";

// Create a new industry for a tenant
export async function createIndustry(token, tenantId, industryData) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/industries`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(industryData),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create industry: ${errorText}`);
  }
  return res.json();
}

// Get all industries for a tenant
export async function getAllIndustries(token, tenantId) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/industries`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch industries: ${errorText}`);
  }
  return res.json();
}
