import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getApplicationFormById, updateApplicationForm, submitApplication } from "../api/applicationForms";

const FORM_TYPES = ["STARTUP", "MENTOR"];
const FIELD_TYPES = ["TEXT", "TEXTAREA", "SELECT", "RADIO", "CHECKBOX", "DATE", "FILE"];

export default function ApplicationFormDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [showApply, setShowApply] = useState(false);
  const [applicant, setApplicant] = useState({ email: "", firstName: "", lastName: "", applicantType: form ? form.type : "STARTUP" });
  const [responses, setResponses] = useState([]);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");
  const [copied, setCopied] = useState(false); // New state for copy feedback

  useEffect(() => {
    if (!token || !user?.tenantId || !id) return;
    setLoading(true);
    setError("");
    getApplicationFormById(token, user.tenantId, id)
      .then(data => { setForm(data); setEditForm(data); })
      .catch(err => setError(err.message || "Failed to load form"))
      .finally(() => setLoading(false));
  }, [token, user?.tenantId, id]);

  useEffect(() => {
    if (form) {
      setApplicant(a => ({ ...a, applicantType: form.type }));
      // Ensure responses are correctly initialized even if form.fields changes during edit
      setResponses(form.fields.map(f => ({ fieldId: f.id, response: "" })));
    }
  }, [form]);

  // --- Handlers for editing form (no changes needed here for your request) ---
  const handleEditChange = (key, value) => {
    setEditForm(f => ({ ...f, [key]: value }));
  };

  const handleFieldChange = (idx, key, value) => {
    setEditForm(f => ({ ...f, fields: f.fields.map((fld, i) => i === idx ? { ...fld, [key]: value } : fld) }));
  };

  const handleFieldTypeChange = (idx, value) => {
    setEditForm(f => ({ ...f, fields: f.fields.map((fld, i) => i === idx ? { ...fld, fieldType: value, options: [""], } : fld) }));
  };

  const handleOptionChange = (fieldIdx, optIdx, value) => {
    setEditForm(f => ({ ...f, fields: f.fields.map((fld, i) => i === fieldIdx ? { ...fld, options: fld.options.map((o, oi) => oi === optIdx ? value : o) } : fld) }));
  };

  const addOption = (fieldIdx) => {
    setEditForm(f => ({ ...f, fields: [...f.fields.map((fld, i) => i === fieldIdx ? { ...fld, options: [...(fld.options || []), ""] } : fld)] }));
  };

  const removeOption = (fieldIdx, optIdx) => {
    setEditForm(f => ({ ...f, fields: f.fields.map((fld, i) => i === fieldIdx ? { ...fld, options: fld.options.filter((_, oi) => oi !== optIdx) } : fld) }));
  };

  const addField = () => {
    setEditForm(f => ({ ...f, fields: [...f.fields, { label: "", fieldType: "TEXT", isRequired: false, options: [], orderIndex: f.fields.length }] }));
  };

  const removeField = (idx) => {
    setEditForm(f => ({ ...f, fields: f.fields.filter((_, i) => i !== idx).map((fld, i) => ({ ...fld, orderIndex: i })) }));
  };

  const moveField = (idx, dir) => {
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === editForm.fields.length - 1)) return;
    const newFields = [...editForm.fields];
    const temp = newFields[idx];
    newFields[idx] = newFields[idx + dir];
    newFields[idx + dir] = temp;
    setEditForm(f => ({ ...f, fields: newFields.map((fld, i) => ({ ...fld, orderIndex: i })) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateApplicationForm(token, user.tenantId, id, {
        ...editForm,
        fields: editForm.fields.map(fld => ({
          label: fld.label,
          fieldType: fld.fieldType,
          isRequired: fld.isRequired,
          options: ["SELECT", "RADIO", "CHECKBOX"].includes(fld.fieldType) ? fld.options : [],
          orderIndex: fld.orderIndex,
        })),
      });
      setForm(updated);
      setEditForm(updated);
      setEditMode(false);
      setSuccess("Form updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update form");
    } finally {
      setSaving(false);
    }
  };
  // --- End of handlers for editing form ---


  // --- Handlers for submitting application (no changes needed here for your request) ---
  const handleApplicantChange = (key, value) => {
    setApplicant(a => ({ ...a, [key]: value }));
  };

  const handleResponseChange = (idx, value) => {
    setResponses(rs => rs.map((r, i) => i === idx ? { ...r, response: value } : r));
  };

  const handleOptionResponseChange = (idx, value) => {
    setResponses(rs => rs.map((r, i) => i === idx ? { ...r, response: value } : r));
  };

  const handleCheckboxResponseChange = (idx, option) => {
    setResponses(rs => rs.map((r, i) => {
      if (i !== idx) return r;
      const arr = r.response ? r.response.split(";;;") : [];
      if (arr.includes(option)) {
        return { ...r, response: arr.filter(o => o !== option).join(";;;") };
      } else {
        return { ...r, response: [...arr, option].join(";;;") };
      }
    }));
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError("");
    setApplySuccess("");
    try {
      await submitApplication({
        formId: form.id,
        email: applicant.email,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        applicantType: applicant.applicantType,
        fieldResponses: responses.map((r, idx) => ({
          fieldId: r.fieldId,
          response: r.response
        }))
      });
      setApplySuccess("Application submitted successfully!");
      setShowApply(false);
      // Reset form fields after successful submission
      setApplicant({ email: "", firstName: "", lastName: "", applicantType: form.type });
      setResponses(form.fields.map(f => ({ fieldId: f.id, response: "" })));
    } catch (err) {
      setApplyError(err.message || "Failed to submit application");
    } finally {
      setApplyLoading(false);
    }
  };
  // --- End of handlers for submitting application ---

  // --- New function to handle copying the link ---
  const handleCopyLink = () => {
    const publicFormUrl = `${window.location.origin}/apply/${form.id}`; // This is the public URL path
    navigator.clipboard.writeText(publicFormUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset "copied" state after 2 seconds
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        setError("Failed to copy link."); // Optionally set an error state for user feedback
      });
  };

  if (loading) return <div className="p-10 text-center text-blue-600">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!form) return <div className="p-10 text-center">Form not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 relative border-t-8 border-blue-600">
        <button
          className="absolute left-4 top-4 text-blue-600 hover:text-blue-800 text-2xl"
          onClick={() => navigate("/application-forms")}
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">{editMode ? "Edit Application Form" : form.name}</h1>
        {success && <div className="text-green-600 mb-2 text-center">{success}</div>}
        {editMode ? (
          <form onSubmit={handleSave}>
            {/* ... (Existing edit mode form content) ... */}
            <div className="mb-4">
              <input
                className="w-full text-2xl font-bold border-b-2 border-blue-300 focus:border-blue-600 outline-none bg-transparent mb-2 text-blue-900 placeholder-blue-400"
                placeholder="Untitled form"
                value={editForm.name}
                onChange={e => handleEditChange("name", e.target.value)}
                required
              />
              <div className="flex space-x-4 mt-2">
                <select
                  className="border rounded px-3 py-1 text-blue-700"
                  value={editForm.type}
                  onChange={e => handleEditChange("type", e.target.value)}
                >
                  {FORM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                </select>
                <label className="flex items-center space-x-2 text-blue-700">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={e => handleEditChange("isActive", e.target.checked)}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
            <div className="mb-6">
              {editForm.fields.map((field, idx) => (
                <div key={idx} className="bg-blue-50 rounded-lg p-4 mb-4 shadow-sm border border-blue-200 relative">
                  <div className="flex items-center mb-2">
                    <input
                      className="flex-1 text-lg font-semibold border-b-2 border-blue-200 focus:border-blue-600 outline-none bg-transparent text-blue-900 placeholder-blue-400 mr-2"
                      placeholder="Question"
                      value={field.label}
                      onChange={e => handleFieldChange(idx, "label", e.target.value)}
                      required
                    />
                    <select
                      className="border rounded px-2 py-1 text-blue-700 ml-2"
                      value={field.fieldType}
                      onChange={e => handleFieldTypeChange(idx, e.target.value)}
                    >
                      {FIELD_TYPES.map(ft => <option key={ft} value={ft}>{ft.charAt(0) + ft.slice(1).toLowerCase()}</option>)}
                    </select>
                    <button type="button" className="ml-2 text-blue-500 hover:text-blue-800" onClick={() => moveField(idx, -1)} disabled={idx === 0}>↑</button>
                    <button type="button" className="ml-1 text-blue-500 hover:text-blue-800" onClick={() => moveField(idx, 1)} disabled={idx === editForm.fields.length - 1}>↓</button>
                    <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => removeField(idx)} disabled={editForm.fields.length === 1}>🗑</button>
                  </div>
                  <div className="flex items-center space-x-4 mb-2">
                    <label className="flex items-center space-x-2 text-blue-700">
                      <input
                        type="checkbox"
                        checked={field.isRequired}
                        onChange={e => handleFieldChange(idx, "isRequired", e.target.checked)}
                      />
                      <span>Required</span>
                    </label>
                  </div>
                  {["SELECT", "RADIO", "CHECKBOX"].includes(field.fieldType) && (
                    <div className="mb-2">
                      <div className="font-medium text-blue-700 mb-1">Options</div>
                      {field.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center mb-1">
                          <input
                            className="flex-1 border-b-2 border-blue-200 focus:border-blue-600 outline-none bg-transparent text-blue-900 placeholder-blue-400"
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            onChange={e => handleOptionChange(idx, optIdx, e.target.value)}
                            required
                          />
                          <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => removeOption(idx, optIdx)} disabled={field.options.length === 1}>🗑</button>
                        </div>
                      ))}
                      <button type="button" className="mt-1 text-blue-600 hover:text-blue-800 text-sm" onClick={() => addOption(idx)}>+ Add Option</button>
                    </div>
                  )}
                </div>
              ))}
              <button type="button" className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg border-2 border-dashed border-blue-400" onClick={addField}>+ Add Question</button>
            </div>
            {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                onClick={() => { setEditMode(false); setEditForm(form); }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-4">
              <div className="w-full text-2xl font-bold border-b-2 border-blue-300 mb-2 text-blue-900">{form.name}</div>
              <div className="flex space-x-4 mt-2">
                <span className="border rounded px-3 py-1 text-blue-700 bg-blue-50">{form.type.charAt(0) + form.type.slice(1).toLowerCase()}</span>
                <span className="text-xs font-medium px-2 py-1 rounded w-fit" style={{background: form.isActive ? '#d1fae5' : '#fee2e2', color: form.isActive ? '#065f46' : '#991b1b'}}>
                  {form.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-gray-500 ml-2">Created: {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "-"}</span>
              </div>
            </div>
            <div className="mb-6">
              {form.fields.map((field, idx) => (
                <div key={idx} className="bg-blue-50 rounded-lg p-4 mb-4 shadow-sm border border-blue-200">
                  <div className="flex items-center mb-2">
                    <div className="flex-1 text-lg font-semibold text-blue-900">{field.label}</div>
                    <span className="ml-2 border rounded px-2 py-1 text-blue-700 bg-blue-100 text-xs">{field.fieldType.charAt(0) + field.fieldType.slice(1).toLowerCase()}</span>
                    {field.isRequired && <span className="ml-2 text-red-500 text-xs">*</span>}
                  </div>
                  {["SELECT", "RADIO", "CHECKBOX"].includes(field.fieldType) && (
                    <div className="mt-2">
                      <div className="font-medium text-blue-700 mb-1">Options:</div>
                      <ul className="list-disc list-inside text-blue-900">
                        {field.options.map((opt, optIdx) => (
                          <li key={optIdx}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center"> {/* Use flex justify-between here */}
              {/* Copy Link Section */}
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-blue-700">Public Application Link:</span>
                <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded">
                  {`${window.location.origin}/apply/${form.id}`}
                </span>
                <button
                  className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold flex items-center"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v10a2 2 0 002 2h6M15 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M9 13l3-3m0 0l3 3m-3-3v8" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              {/* Edit Button */}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow"
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
            </div>


            {/* The "Apply Now" form area - moved to its own component or page for clarity */}
            {/* You might want to remove this inline "Apply Now" section from the admin's form detail view.
                It's generally not needed here as admins primarily manage forms, not apply to them directly.
                Public users will access the form via the copied link.
            */}
            {/* The following section is kept for now as per your original code, but consider removing it */}
            <div className="mb-8 mt-4"> {/* Added some margin-top for spacing */}
                <button className="text-blue-600 hover:underline text-sm" onClick={() => setShowApply(v => !v)}>{showApply ? "Hide Apply Form Preview" : "Show Apply Form Preview"}</button>
            </div>
            {showApply && (
                <form className="bg-blue-50 rounded-lg p-4 mt-2" onSubmit={handleApplySubmit}>
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Preview: Public Application Form</h3>
                    <div className="mb-2 flex flex-col sm:flex-row sm:space-x-4">
                        <input className="flex-1 mb-2 sm:mb-0 border rounded px-3 py-2" type="email" placeholder="Email" value={applicant.email} onChange={e => handleApplicantChange("email", e.target.value)} required />
                        <input className="flex-1 mb-2 sm:mb-0 border rounded px-3 py-2" placeholder="First Name" value={applicant.firstName} onChange={e => handleApplicantChange("firstName", e.target.value)} />
                        <input className="flex-1 border rounded px-3 py-2" placeholder="Last Name" value={applicant.lastName} onChange={e => handleApplicantChange("lastName", e.target.value)} />
                    </div>
                    <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Applicant Type</label>
                        <select className="w-full border rounded px-3 py-2" value={applicant.applicantType} onChange={e => handleApplicantChange("applicantType", e.target.value)} required>
                            {['STARTUP','MENTOR','COACH','FACILITATOR'].map(type => <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>)}
                        </select>
                    </div>
                    <div className="mb-4">
                        {form.fields.map((field, idx) => (
                            <div key={field.id} className="mb-3">
                                <label className="block text-blue-700 font-medium mb-1">{field.label}{field.isRequired && <span className="text-red-500">*</span>}</label>
                                {(() => {
                                    switch (field.fieldType) {
                                        case "TEXT":
                                            return <input className="w-full border rounded px-3 py-2" value={responses[idx]?.response || ""} onChange={e => handleResponseChange(idx, e.target.value)} required={field.isRequired} />;
                                        case "TEXTAREA":
                                            return <textarea className="w-full border rounded px-3 py-2" value={responses[idx]?.response || ""} onChange={e => handleResponseChange(idx, e.target.value)} required={field.isRequired} />;
                                        case "SELECT":
                                            return <select className="w-full border rounded px-3 py-2" value={responses[idx]?.response || ""} onChange={e => handleOptionResponseChange(idx, e.target.value)} required={field.isRequired}><option value="">Select...</option>{field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>;
                                        case "RADIO":
                                            return <div className="flex flex-wrap gap-4">{field.options.map(opt => <label key={opt} className="flex items-center"><input type="radio" name={`radio-${field.id}`} value={opt} checked={responses[idx]?.response === opt} onChange={e => handleOptionResponseChange(idx, opt)} required={field.isRequired} className="mr-2" />{opt}</label>)}</div>;
                                        case "CHECKBOX":
                                            return <div className="flex flex-wrap gap-4">{field.options.map(opt => <label key={opt} className="flex items-center"><input type="checkbox" checked={(responses[idx]?.response || "").split(";;;").includes(opt)} onChange={() => handleCheckboxResponseChange(idx, opt)} className="mr-2" />{opt}</label>)}</div>;
                                        case "DATE":
                                            return <input type="date" className="w-full border rounded px-3 py-2" value={responses[idx]?.response || ""} onChange={e => handleResponseChange(idx, e.target.value)} required={field.isRequired} />;
                                        case "FILE":
                                            return <input type="file" className="w-full border rounded px-3 py-2" disabled title="File upload not implemented" />;
                                        default:
                                            return null;
                                    }
                                })()}
                            </div>
                        ))}
                    </div>
                    {applyError && <div className="text-red-600 mb-2 text-center">{applyError}</div>}
                    {applySuccess && <div className="text-green-600 mb-2 text-center">{applySuccess}</div>}
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow" disabled={applyLoading}>{applyLoading ? "Submitting..." : "Submit Application"}</button>
                    </div>
                </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}