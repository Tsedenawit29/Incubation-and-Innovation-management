import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getAllApplicationsForTenant, getAllApplicationForms } from "../api/applicationForms";

export default function ApplicationsPage() {
  const { user, token, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!token || !user?.tenantId) return;
    setLoading(true);
    setError("");
    Promise.all([
      getAllApplicationsForTenant(token, user.tenantId),
      getAllApplicationForms(token, user.tenantId)
    ])
      .then(([apps, forms]) => {
        setApplications(apps);
        setForms(forms);
      })
      .catch(err => setError(err.message || "Failed to load applications"))
      .finally(() => setLoading(false));
  }, [token, user?.tenantId]);

  const getFormName = (formId) => {
    const form = forms.find(f => f.id === formId);
    return form ? form.name : "-";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header/Profile (copied from TenantAdminDashboard) */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-400 shadow-lg p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-blue-700 font-bold text-2xl border-4 border-blue-300">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.fullName || user?.email}</h1>
            <p className="text-blue-100 text-sm">Tenant Admin</p>
            <p className="text-blue-200 text-xs">Tenant ID: <span className="font-mono">{user?.tenantId}</span></p>
          </div>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium shadow"
        >
          Logout
        </button>
      </header>
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center py-10">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Applications</h1>
        {loading ? (
          <div className="text-blue-600">Loading applications...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : applications.length === 0 ? (
          <div className="text-gray-500">No applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 border">Applicant</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Form</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Submitted</th>
                  <th className="px-4 py-2 border">View</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-blue-50">
                    <td className="px-4 py-2 border">{app.firstName || "-"} {app.lastName || "-"}</td>
                    <td className="px-4 py-2 border">{app.email}</td>
                    <td className="px-4 py-2 border">{app.applicantType}</td>
                    <td className="px-4 py-2 border">{getFormName(app.formId)}</td>
                    <td className="px-4 py-2 border">{app.status}</td>
                    <td className="px-4 py-2 border">{app.submittedAt ? new Date(app.submittedAt).toLocaleString() : "-"}</td>
                    <td className="px-4 py-2 border text-center">
                      <button className="text-blue-600 hover:underline" onClick={() => setSelected(app)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal for application details */}
        {selected && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
              <button className="absolute right-4 top-4 text-gray-500 hover:text-gray-800 text-2xl" onClick={() => setSelected(null)}>&times;</button>
              <h2 className="text-xl font-bold text-blue-700 mb-2">Application Details</h2>
              <div className="mb-2"><span className="font-semibold">Applicant:</span> {selected.firstName || "-"} {selected.lastName || "-"}</div>
              <div className="mb-2"><span className="font-semibold">Email:</span> {selected.email}</div>
              <div className="mb-2"><span className="font-semibold">Type:</span> {selected.applicantType}</div>
              <div className="mb-2"><span className="font-semibold">Form:</span> {getFormName(selected.formId)}</div>
              <div className="mb-2"><span className="font-semibold">Status:</span> {selected.status}</div>
              <div className="mb-2"><span className="font-semibold">Submitted:</span> {selected.submittedAt ? new Date(selected.submittedAt).toLocaleString() : "-"}</div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Answers:</h3>
                <ul className="list-disc list-inside">
                  {selected.fieldResponses && selected.fieldResponses.length > 0 ? (
                    selected.fieldResponses.map((resp, idx) => (
                      <li key={idx} className="mb-1">
                        <span className="font-medium text-blue-700">{resp.fieldLabel}:</span> {resp.response}
                      </li>
                    ))
                  ) : (
                    <li>No answers found.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
} 