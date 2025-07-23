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

// Delete an application form
export async function deleteApplicationForm(token, tenantId, formId) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/application-forms/${formId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete application form: ${errorText}`);
  }
}

// Update an application form (e.g., to toggle active/inactive)
export async function updateApplicationForm(token, tenantId, formId, formData) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/application-forms/${formId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update application form: ${errorText}`);
  }
  return res.json();
}

// Get a single application form by ID
export async function getApplicationFormById(token, tenantId, formId) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/application-forms/${formId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch application form: ${errorText}`);
  }
  return res.json();
}

// Submit an application to a form
export async function submitApplication(applicationData) {
  const API_URL = "http://localhost:8081/api/v1";
  const res = await fetch(`${API_URL}/applications/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(applicationData)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to submit application: ${errorText}`);
  }
  return res.json();
} 