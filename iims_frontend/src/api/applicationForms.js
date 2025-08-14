// src/api/applicationForms.js

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

// Get a single application form by ID (handles both public and authenticated)
export async function getApplicationFormById(token, tenantId, formId) {
  const headers = {
    "Content-Type": "application/json",
  };

  let url;
  if (token && tenantId) {
    headers["Authorization"] = `Bearer ${token}`;
    url = `${API_URL}/tenants/${tenantId}/application-forms/${formId}`;
  } else {
    url = `${API_URL}/public/application-forms/${formId}`;
  }

  console.log("Fetching form from URL:", url);
  console.log("With headers:", headers);

  const res = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!res.ok) {
    let errorText = await res.text();
    try {
        const errorJson = JSON.parse(errorText);
        errorText = errorJson.message || errorText;
    } catch (e) {
    }
    throw new Error(`Failed to fetch application form: ${errorText}`);
  }
  return res.json();
}

// Submit an application to a form
export async function submitApplication(applicationData) {
  // Create FormData to handle file uploads
  const formData = new FormData();
  
  // Extract documents from application data
  const { documents, ...otherData } = applicationData;
  
  // Add basic application data as JSON
  formData.append('applicationData', JSON.stringify(otherData));
  
  // Add each document to formData
  if (documents && documents.length > 0) {
    documents.forEach((doc, index) => {
      formData.append(`document_${index}`, doc.file);
      formData.append(`document_${index}_name`, doc.name);
      formData.append(`document_${index}_type`, doc.type);
      if (doc.documentType) {
        formData.append(`document_${index}_documentType`, doc.documentType);
      }
    });
  }
  
  const res = await fetch(`${API_URL}/applications/submit`, {
    method: "POST",
    // Don't set Content-Type header - browser will set it with boundary for FormData
    body: formData
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to submit application: ${errorText}`);
  }
  
  return res.json();
}

// Get all applications for a tenant
export async function getAllApplicationsForTenant(token, tenantId) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch applications: ${errorText}`);
  }
  return res.json();
}

// Approve and reject applicants
export async function updateApplicationStatus(token, tenantId, applicationId, newStatus) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/applications/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      applicationId: applicationId,
      newStatus: newStatus,
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update applicants status: ${errorText}`);
  }
  const updatedApplication = await res.json();
  return updatedApplication;
}

// Cloning an exesting application to reuse it
export async function cloneApplicationForm(token, tenantId, formId) {
  const res = await fetch(`${API_URL}/tenants/${tenantId}/application-forms/${formId}/clone`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to clone application form: ${errorText}`);
  }
  return res.json();
}