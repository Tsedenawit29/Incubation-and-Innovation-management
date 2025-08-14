import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAllApplicationForms, deleteApplicationForm, updateApplicationForm } from "../api/applicationForms";

export default function ApplicationFormsPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({}); 

  useEffect(() => {
    if (!token || !user?.tenantId) return;
    setLoading(true);
    setError("");
    getAllApplicationForms(token, user.tenantId)
      .then(setForms)
      .catch(err => setError(err.message || "Failed to load forms"))
      .finally(() => setLoading(false));
  }, [token, user?.tenantId]);

  const handleDelete = async (formId) => {
    if (!window.confirm("Are you sure you want to delete this form? This cannot be undone.")) return;
    setActionLoading(a => ({ ...a, [formId]: true }));
    try {
      await deleteApplicationForm(token, user.tenantId, formId);
      setForms(forms => forms.filter(f => f.id !== formId));
    } catch (err) {
      alert(err.message || "Failed to delete form");
    } finally {
      setActionLoading(a => ({ ...a, [formId]: false }));
    }
  };

  const handleToggleActive = async (form) => {
    setActionLoading(a => ({ ...a, [form.id]: true }));
    try {
      const updated = await updateApplicationForm(token, user.tenantId, form.id, {
        ...form,
        isActive: !form.isActive,
        fields: form.fields || [], // required by backend
      });
      setForms(forms => forms.map(f => f.id === form.id ? updated : f));
    } catch (err) {
      alert(err.message || "Failed to update form");
    } finally {
      setActionLoading(a => ({ ...a, [form.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Back to Dashboard Button */}
      <div className="bg-white shadow-md py-4 px-6">
        <button
          onClick={() => navigate("/tenant-admin/dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center py-10">
        <div className="w-full max-w-4xl">
          <h1 className="text-2xl font-bold mb-6 text-blue-700">Application Forms</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Add new form card */}
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg h-40 cursor-pointer hover:bg-blue-50 transition"
              onClick={() => navigate("/application-forms/new")}
            >
              <span className="text-5xl text-blue-400 mb-2">+</span>
              <span className="text-blue-700 font-semibold">Create New Form</span>
            </div>
            {/* Existing forms */}
            {loading ? (
              <div className="col-span-3 flex justify-center items-center h-40 text-blue-600">Loading forms...</div>
            ) : error ? (
              <div className="col-span-3 text-red-600">{error}</div>
            ) : forms.length === 0 ? (
              <div className="col-span-3 text-gray-500">No forms found.</div>
            ) : (
              forms.map((form) => (
                <div
                  key={form.id}
                  className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg border border-blue-100 flex flex-col justify-between relative group"
                  onClick={e => {
                    // Prevent navigation if clicking button
                    if (e.target.closest("button")) return;
                    navigate(`/application-forms/${form.id}`);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg text-blue-700">{form.name}</div>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">Created: {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "-"}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs font-medium px-2 py-1 rounded w-fit" style={{background: form.isActive ? '#d1fae5' : '#fee2e2', color: form.isActive ? '#065f46' : '#991b1b'}}>
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      className={`ml-2 px-3 py-1 rounded text-xs font-semibold border transition-colors duration-150 ${form.isActive ? 'bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200' : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'}`}
                      onClick={e => { e.stopPropagation(); handleToggleActive(form); }}
                      disabled={actionLoading[form.id]}
                    >
                      {actionLoading[form.id] ? '...' : (form.isActive ? 'Deactivate' : 'Activate')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}