// src/api/cohorts.js

const API_URL = "http://localhost:8081/api/v1";

// Create a new cohort for a tenant
export async function createCohort(token, tenantId, cohortData) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/cohorts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cohortData),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create cohort: ${errorText}`);
  }
  return res.json();
}

// Get all cohorts for a tenant
export async function getAllCohorts(token, tenantId) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/cohorts`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch cohorts: ${errorText}`);
  }
  return res.json();
}
