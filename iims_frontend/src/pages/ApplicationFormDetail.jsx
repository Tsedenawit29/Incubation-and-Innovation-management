import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getApplicationFormById, updateApplicationForm, submitApplication, cloneApplicationForm } from "../api/applicationForms"; // Import cloneApplicationForm

const FORM_TYPES = ["STARTUP", "MENTOR", "COACH", "FACILITATOR"];
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
  const [showApply, setShowApply] = useState(false); // For previewing the public form
  const [applicant, setApplicant] = useState({ email: "", firstName: "", lastName: "", applicantType: "" });
  const [responses, setResponses] = useState([]);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [cloning, setCloning] = useState(false); // New state for cloning process

  useEffect(() => {
    if (!token || !user?.tenantId || !id) return;
    setLoading(true);
    setError("");
    getApplicationFormById(token, user.tenantId, id)
      .then(data => {
        setForm(data);
        setEditForm(data);
        setApplicant(a => ({ ...a, applicantType: data.type }));
        setResponses(data.fields.map(f => ({ fieldId: f.id, response: "" })));
      })
      .catch(err => setError(err.message || "Failed to load form"))
      .finally(() => setLoading(false));
  }, [token, user?.tenantId, id]);

  useEffect(() => {
    if (form) {
      setApplicant(a => ({ ...a, applicantType: form.type }));
      setResponses(form.fields.map(f => ({ fieldId: f.id, response: "" })));
    }
  }, [form]);

  const handleEditChange = (key, value) => {
    setEditForm(f => ({ ...f, [key]: value }));
  };

  const handleFieldChange = (idx, key, value) => {
    setEditForm(f => ({ ...f, fields: f.fields.map((fld, i) => i === idx ? { ...fld, [key]: value } : fld) }));
  };

  const handleFieldTypeChange = (idx, value) => {
    setEditForm(f => ({ ...f, fields: f.fields.map((fld, i) => i === idx ? { ...fld, fieldType: value, options: [""] } : fld) }));
  };

  const handleOptionChange = (fieldIdx, optIdx, value) => {
    setEditForm(f => ({ ...f, fields: f.fields.map((fld, i) => i === fieldIdx ? { ...fld, options: fld.options.map((o, oi) => oi === optIdx ? value : o) } : fld) }));
  };

  const addOption = (fieldIdx) => {
    setEditForm(f => ({ ...f, fields: f.fields.map((fld, i) => i === fieldIdx ? { ...fld, options: [...(fld.options || []), ""] } : fld) }));
  };

  const removeOption = (fieldIdx, optIdx) => {
    setEditForm(f => ({ ...f, fields: f.fields.map((fld, i) => i === fieldIdx ? { ...fld, options: fld.options.filter((_, oi) => oi !== optIdx) } : fld) }));
  };

  const addField = () => {
    setEditForm(f => ({ ...f, fields: [...f.fields, { label: "", fieldType: "TEXT", isRequired: false, options: [], orderIndex: f.fields.length }] }));
  };

  // Modified removeField to prevent deleting existing fields
  const removeField = (idx) => {
    if (editForm.fields[idx].id !== undefined) { // Check if the field already has a backend ID (i.e., it's saved)
      setError("Cannot delete a field that has already been saved and might have associated responses. Please clone this form to make structural changes.");
      setSuccess(""); // Clear success message if there was one
      return;
    }
    if (editForm.fields.length === 1) { // Prevent deleting the last field
        setError("Cannot delete the last field of the form.");
        setSuccess("");
        return;
    }
    setEditForm(f => ({ ...f, fields: f.fields.filter((_, i) => i !== idx).map((fld, i) => ({ ...fld, orderIndex: i })) }));
    setError(""); // Clear error message if removal successful
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
          id: fld.id || undefined, // Send ID only if it exists, else undefined for new fields
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
        fieldResponses: responses.map((r) => ({
          fieldId: r.fieldId,
          response: r.response
        }))
      });
      setApplySuccess("Application submitted successfully!");
      setApplicant({ email: "", firstName: "", lastName: "", applicantType: form.type });
      setResponses(form.fields.map(f => ({ fieldId: f.id, response: "" })));
    } catch (err) {
      setApplyError(err.message || "Failed to submit application");
    } finally {
      setApplyLoading(false);
    }
  };

  const handleCopyLink = () => {
    const publicFormUrl = `${window.location.origin}/apply/${form.id}`;
    navigator.clipboard.writeText(publicFormUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        setError("Failed to copy link.");
      });
  };

  // --- NEW: Handle Clone Form ---
  const handleCloneForm = async () => {
    if (!token || !user?.tenantId || !id) {
      setError("Authentication missing to clone form.");
      return;
    }
    setCloning(true);
    setError("");
    setSuccess("");
    try {
      const cloned = await cloneApplicationForm(token, user.tenantId, id);
      setSuccess("Form cloned successfully! Redirecting to new form.");
      setTimeout(() => {
        navigate(`/application-forms/${cloned.id}`); // Navigate to the new form's detail page
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to clone form.");
    } finally {
      setCloning(false);
    }
  };
  // --- END NEW: Handle Clone Form ---


  if (loading) return <div className="flex justify-center items-center min-h-screen bg-gray-50 text-blue-600 text-xl">Loading form details...</div>;
  if (error && !cloning && !saving) return <div className="flex justify-center items-center min-h-screen bg-red-50 text-red-600 text-xl">{error}</div>; // Display error unless cloning/saving
  if (!form) return <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-600 text-xl">Form not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-inter">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8 relative border-t-8 border-blue-600">
        <button
          className="absolute left-6 top-6 text-blue-600 hover:text-blue-800 text-3xl transition-colors duration-200"
          onClick={() => navigate("/application-forms")}
          aria-label="Back to forms"
        >
          &larr;
        </button>
        <h1 className="text-4xl font-extrabold text-blue-800 mb-2 text-center tracking-tight">
          {editMode ? "Edit Application Form" : form.name}
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Manage the structure and settings of your application form.
        </p>

        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4 text-center shadow-sm">{success}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4 text-center shadow-sm">{error}</div>}

        {editMode ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <label htmlFor="formName" className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input
                id="formName"
                className="w-full text-3xl font-bold border-b-2 border-blue-300 focus:border-blue-600 outline-none bg-transparent pb-1 text-gray-900 placeholder-gray-400 transition-colors duration-200"
                placeholder="Untitled form"
                value={editForm.name}
                onChange={e => handleEditChange("name", e.target.value)}
                required
              />
              <div className="flex flex-wrap items-center space-x-6 mt-4">
                <div>
                  <label htmlFor="formType" className="block text-sm font-medium text-gray-700 mb-1">Form Type</label>
                  <select
                    id="formType"
                    className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={editForm.type}
                    onChange={e => handleEditChange("type", e.target.value)}
                  >
                    {FORM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                <label className="flex items-center space-x-2 text-gray-700 mt-2 sm:mt-0">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={e => handleEditChange("isActive", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span>Active Form</span>
                </label>
              </div>
            </div>

            {editForm.fields.map((field, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow-md border border-gray-200 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
                    <label htmlFor={`question-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                    <input
                      id={`question-${idx}`}
                      className="w-full text-lg font-semibold border-b-2 border-gray-200 focus:border-blue-600 outline-none bg-transparent pb-1 text-gray-900 placeholder-gray-400 transition-colors duration-200"
                      placeholder="Enter your question"
                      value={field.label}
                      onChange={e => handleFieldChange(idx, "label", e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label htmlFor={`fieldType-${idx}`} className="sr-only">Field Type</label>
                    <select
                      id={`fieldType-${idx}`}
                      className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      value={field.fieldType}
                      onChange={e => handleFieldTypeChange(idx, e.target.value)}
                    >
                      {FIELD_TYPES.map(ft => <option key={ft} value={ft}>{ft.charAt(0) + ft.slice(1).toLowerCase()}</option>)}
                    </select>
                    <button type="button" className="text-gray-500 hover:text-blue-700 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200" onClick={() => moveField(idx, -1)} disabled={idx === 0} title="Move up">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                    </button>
                    <button type="button" className="text-gray-500 hover:text-blue-700 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200" onClick={() => moveField(idx, 1)} disabled={idx === editForm.fields.length - 1} title="Move down">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    {/* Disable delete button if field has an ID (meaning it's an existing, potentially referenced field) */}
                    <button type="button" className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors duration-200" onClick={() => removeField(idx)} disabled={field.id !== undefined || editForm.fields.length === 1} title={field.id !== undefined ? "Cannot delete a saved field." : "Delete question"}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm1 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4 text-gray-700">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={e => handleFieldChange(idx, "isRequired", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span>Required</span>
                  </label>
                </div>

                {["SELECT", "RADIO", "CHECKBOX"].includes(field.fieldType) && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="font-medium text-gray-700 mb-2">Options</div>
                    {field.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center mb-2">
                        <input
                          className="flex-1 border-b border-gray-200 focus:border-blue-600 outline-none bg-transparent pb-1 text-gray-900 placeholder-gray-400 transition-colors duration-200"
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt}
                          onChange={e => handleOptionChange(idx, optIdx, e.target.value)}
                          required
                        />
                        <button type="button" className="ml-3 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors duration-200" onClick={() => removeOption(idx, optIdx)} disabled={field.options.length === 1} title="Remove option">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm1 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" className="mt-2 flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200" onClick={() => addOption(idx)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                      Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button type="button" className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border-2 border-dashed border-blue-300 transition-colors duration-200 flex items-center justify-center text-lg" onClick={addField}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Add Question
            </button>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium transition-colors duration-200 shadow-sm"
                onClick={() => { setEditMode(false); setEditForm(form); }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-semibold shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-6">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">{form.name}</h2>
              <div className="flex flex-wrap items-center space-x-6">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {form.type.charAt(0) + form.type.slice(1).toLowerCase()} Form
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${form.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {form.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-gray-500 text-sm">
                  Created: {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {form.fields.map((field, idx) => (
                <div key={idx} className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="flex-1 text-lg font-semibold text-gray-900">{field.label}</div>
                    <span className="ml-4 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      {field.fieldType.charAt(0) + field.fieldType.slice(1).toLowerCase()}
                    </span>
                    {field.isRequired && <span className="ml-2 text-red-500 text-sm font-semibold">* Required</span>}
                  </div>
                  {/* Render the actual input types for display mode, but disabled */}
                  {(() => {
                    const displayInputClass = "w-full border border-gray-200 rounded-md px-4 py-2 text-gray-700 bg-gray-50 cursor-not-allowed";
                    switch (field.fieldType) {
                      case "TEXT":
                        return <input type="text" className={displayInputClass} value="[Text input preview]" disabled readOnly />;
                      case "TEXTAREA":
                        return <textarea className={`${displayInputClass} h-24`} disabled readOnly value="[Textarea input preview]"></textarea>;
                      case "SELECT":
                        return (
                          <select className={displayInputClass} disabled>
                            <option value="">[Select option preview]</option>
                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        );
                      case "RADIO":
                        return (
                          <div className="flex flex-col space-y-2 mt-2"> {/* Vertical layout */}
                            {field.options.map(opt => (
                              <label key={opt} className="flex items-center text-gray-700 cursor-not-allowed">
                                <input type="radio" name={`displayRadio-${field.id}`} value={opt} className="mr-2 h-4 w-4 text-blue-600 border-gray-300 cursor-not-allowed" disabled />
                                {opt}
                              </label>
                            ))}
                          </div>
                        );
                      case "CHECKBOX":
                        return (
                          <div className="flex flex-col space-y-2 mt-2"> {/* Vertical layout */}
                            {field.options.map(opt => (
                              <label key={opt} className="flex items-center text-gray-700 cursor-not-allowed">
                                <input type="checkbox" className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 cursor-not-allowed" disabled />
                                {opt}
                              </label>
                            ))}
                          </div>
                        );
                      case "DATE":
                        return <input type="date" className={displayInputClass} value="" disabled readOnly />;
                      case "FILE":
                        return (
                          <div className="relative border border-gray-300 rounded-md px-4 py-2 bg-gray-50 cursor-not-allowed">
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-not-allowed" disabled title="File upload not implemented yet." />
                            <span className="block text-gray-500">File upload (not implemented)</span>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })()}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-t border-gray-200 pt-6 space-y-4 sm:space-y-0">
              {/* Public Application Link Section */}
              <div className="relative bg-gray-100 text-gray-800 pl-4 pr-12 py-2 rounded-md border border-gray-200 flex items-center break-all flex-grow mr-4">
                <span className="font-semibold text-gray-700 text-sm mr-2">Public Link:</span>
                <span className="font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                  {`${window.location.origin}/apply/${form.id}`}
                </span>
                <button
                  className="absolute top-1/2 -translate-y-1/2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full text-sm font-semibold flex items-center justify-center transition-colors duration-200 shadow-md"
                  onClick={handleCopyLink}
                  title={copied ? "Copied!" : "Copy Link"}
                >
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v10a2 2 0 002 2h6M15 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M9 13l3-3m0 0l3 3m-3-3v8" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Edit Button - made oval and nicely positioned */}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex-shrink-0"
                onClick={() => setEditMode(true)}
              >
                Edit Form
              </button>
            </div>

            <div className="mt-8 text-center border-t border-gray-200 pt-6">
                <button className="text-blue-600 hover:underline text-sm font-medium" onClick={() => setShowApply(v => !v)}>
                    {showApply ? "Hide Public Form Preview" : "Show Public Form Preview"}
                </button>
            </div>
            {showApply && (
                <form className="bg-white rounded-lg p-7 border border-blue-100 shadow-inner mt-6" onSubmit={handleApplySubmit}>
                    <h3 className="text-2xl font-bold text-blue-700 mb-5 pb-2 border-b border-blue-200">Preview: Public Application Form</h3>
                    <p className="text-gray-600 mb-6 text-center">This is how your public form will appear to applicants.</p>
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label htmlFor="previewEmail" className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                            <input id="previewEmail" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800 cursor-not-allowed bg-gray-50" type="email" placeholder="Your email address" value={applicant.email} onChange={e => handleApplicantChange("email", e.target.value)} required disabled readOnly />
                        </div>
                        <div>
                            <label htmlFor="previewFirstName" className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                            <input id="previewFirstName" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800 cursor-not-allowed bg-gray-50" placeholder="Your first name" value={applicant.firstName} onChange={e => handleApplicantChange("firstName", e.target.value)} disabled readOnly />
                        </div>
                        <div>
                            <label htmlFor="previewLastName" className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                            <input id="previewLastName" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800 cursor-not-allowed bg-gray-50" placeholder="Your last name" value={applicant.lastName} onChange={e => handleApplicantChange("lastName", e.target.value)} disabled readOnly />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-blue-700 mb-5 pb-2 border-b border-blue-200">Form Questions (Preview)</h2>
                    <div className="space-y-6 mb-6">
                        {form.fields.map((field, idx) => (
                            <div key={field.id} className="p-5 bg-white rounded-lg shadow-md border border-blue-50"> {/* Removed hover:shadow-lg for static preview */}
                                <label className="block text-blue-800 font-semibold mb-2 text-base">
                                    {field.label}{field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {(() => {
                                    // Consolidated class for disabled inputs in preview
                                    const previewInputClass = "w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 cursor-not-allowed bg-gray-50";

                                    switch (field.fieldType) {
                                        case "TEXT":
                                            return <input type="text" className={previewInputClass} value="[Text input preview]" disabled readOnly />;
                                        case "TEXTAREA":
                                            return <textarea className={`${previewInputClass} h-24`} disabled readOnly value="[Textarea input preview]"></textarea>;
                                        case "SELECT":
                                            return (
                                                <select className={previewInputClass} disabled>
                                                    <option value="">[Select option preview]</option>
                                                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            );
                                        case "RADIO":
                                            return (
                                                <div className="flex flex-col space-y-2 mt-2"> {/* Vertical layout */}
                                                    {field.options.map(opt => (
                                                        <label key={opt} className="flex items-center text-gray-700 cursor-not-allowed">
                                                            <input type="radio" name={`previewRadio-${field.id}`} value={opt} className="mr-2 h-4 w-4 text-blue-600 border-gray-300 cursor-not-allowed" disabled />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            );
                                        case "CHECKBOX":
                                            return (
                                                <div className="flex flex-col space-y-2 mt-2"> {/* Vertical layout */}
                                                    {field.options.map(opt => (
                                                        <label key={opt} className="flex items-center text-gray-700 cursor-not-allowed">
                                                            <input type="checkbox" className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 cursor-not-allowed" disabled />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            );
                                        case "DATE":
                                            return <input type="date" className={previewInputClass} value="" disabled readOnly />;
                                        case "FILE":
                                            return (
                                                <div className="relative border border-gray-300 rounded-md px-4 py-2 bg-gray-50 cursor-not-allowed">
                                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-not-allowed" disabled title="File upload not implemented yet." />
                                                    <span className="block text-gray-500">File upload (not implemented)</span>
                                                </div>
                                            );
                                        default:
                                            return null;
                                    }
                                })()}
                            </div>
                        ))}
                    </div>
                    {applyError && <div className="text-red-600 mb-2 text-center">{applyError}</div>}
                    {applySuccess && <div className="text-green-600 mb-2 text-center">{applySuccess}</div>}
                    <div className="flex justify-center mt-8">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled={true}>
                            Submit Application (Preview)
                        </button>
                    </div>
                </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
