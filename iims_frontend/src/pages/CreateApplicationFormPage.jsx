import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createApplicationForm } from "../api/applicationForms";

const FORM_TYPES = ["STARTUP", "MENTOR"];
const FIELD_TYPES = ["TEXT", "TEXTAREA", "SELECT", "RADIO", "CHECKBOX", "DATE", "FILE"];

function emptyField(orderIndex = 0) {
  return {
    label: "",
    fieldType: "TEXT",
    isRequired: false,
    options: [],
    orderIndex,
  };
}

export default function CreateApplicationFormPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState(FORM_TYPES[0]);
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState([emptyField(0)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFieldChange = (idx, key, value) => {
    setFields(fields => fields.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  };

  const handleFieldTypeChange = (idx, value) => {
    setFields(fields => fields.map((f, i) => i === idx ? { ...f, fieldType: value, options: [""], } : f));
  };

  const handleOptionChange = (fieldIdx, optIdx, value) => {
    setFields(fields => fields.map((f, i) => i === fieldIdx ? { ...f, options: f.options.map((o, oi) => oi === optIdx ? value : o) } : f));
  };

  const addOption = (fieldIdx) => {
    setFields(fields => fields.map((f, i) => i === fieldIdx ? { ...f, options: [...(f.options || []), ""] } : f));
  };

  const removeOption = (fieldIdx, optIdx) => {
    setFields(fields => fields.map((f, i) => i === fieldIdx ? { ...f, options: f.options.filter((_, oi) => oi !== optIdx) } : f));
  };

  const addField = () => {
    setFields(fields => [...fields, emptyField(fields.length)]);
  };

  const removeField = (idx) => {
    setFields(fields => fields.filter((_, i) => i !== idx).map((f, i) => ({ ...f, orderIndex: i })));
  };

  const moveField = (idx, dir) => {
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === fields.length - 1)) return;
    const newFields = [...fields];
    const temp = newFields[idx];
    newFields[idx] = newFields[idx + dir];
    newFields[idx + dir] = temp;
    setFields(newFields.map((f, i) => ({ ...f, orderIndex: i })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("Form name is required");
      return;
    }
    if (!fields.length || fields.some(f => !f.label.trim())) {
      setError("All fields must have a label");
      return;
    }
    if (fields.some(f => ["SELECT", "RADIO", "CHECKBOX"].includes(f.fieldType) && (!f.options || f.options.length === 0 || f.options.some(o => !o.trim())))) {
      setError("All options must be filled for select/radio/checkbox fields");
      return;
    }
    setLoading(true);
    try {
      await createApplicationForm(token, user.tenantId, {
        name,
        type,
        isActive,
        fields: fields.map(f => ({
          label: f.label,
          fieldType: f.fieldType,
          isRequired: f.isRequired,
          options: ["SELECT", "RADIO", "CHECKBOX"].includes(f.fieldType) ? f.options : [],
          orderIndex: f.orderIndex,
        })),
      });
      setSuccess("Form created successfully!");
      setTimeout(() => navigate("/application-forms"), 1200);
    } catch (err) {
      setError(err.message || "Failed to create form");
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Create Application Form</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              className="w-full text-2xl font-bold border-b-2 border-blue-300 focus:border-blue-600 outline-none bg-transparent mb-2 text-blue-900 placeholder-blue-400"
              placeholder="Untitled form"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <div className="flex space-x-4 mt-2">
              <select
                className="border rounded px-3 py-1 text-blue-700"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                {FORM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
              </select>
              <label className="flex items-center space-x-2 text-blue-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                />
                <span>Active</span>
              </label>
            </div>
          </div>
          <div className="mb-6">
            {fields.map((field, idx) => (
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
                  <button type="button" className="ml-1 text-blue-500 hover:text-blue-800" onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1}>↓</button>
                  <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => removeField(idx)} disabled={fields.length === 1}>🗑</button>
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
          {success && <div className="text-green-600 mb-2 text-center">{success}</div>}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Form"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 