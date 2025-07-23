const API_URL = "http://localhost:8081/api/v1";

// Create a new application form for a tenant
export async function createApplicationForm(token, tenantId, formData) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/application-forms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create application form: ${errorText}`);
  }
  return res.json();
}

// Get all application forms for a tenant
export async function getAllApplicationForms(token, tenantId) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/application-forms`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch application forms");
  }
  return res.json();
} 