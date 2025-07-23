// src/pages/PublicApplicationFormView.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationFormById, submitApplication } from "../api/applicationForms";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

// Define these if they are not imported from a constants file
const FORM_TYPES = ["STARTUP", "MENTOR", "COACH", "FACILITATOR"];
const FIELD_TYPES = ["TEXT", "TEXTAREA", "SELECT", "RADIO", "CHECKBOX", "DATE", "FILE"];


export default function PublicApplicationFormView() {
  const { id: formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // ADD THESE LINES:
  const [applicant, setApplicant] = useState({ email: "", firstName: "", lastName: "", applicantType: "STARTUP" });
  const [responses, setResponses] = useState([]);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");
  // END ADDED LINES

  useEffect(() => {
    if (!formId) {
      setError("Form ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    getApplicationFormById(null, null, formId)
      .then(data => {
        setForm(data);
        // Initialize applicantType from the fetched form data
        setApplicant(a => ({ ...a, applicantType: data.type }));
        // Initialize responses for each field from the fetched form data
        setResponses(data.fields.map(f => ({ fieldId: f.id, response: "" })));
      })
      .catch(err => {
        console.error("Error loading public form:", err);
        setError(err.message || "Failed to load application form.");
      })
      .finally(() => setLoading(false));
  }, [formId]);

  // Include all the handler functions (handleApplicantChange, handleResponseChange, etc.)
  // and the full JSX from the previous PublicApplicationFormView.jsx code block.
  // I won't repeat them here to keep this response concise.
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
      setApplySuccess("Application submitted successfully! You can close this window.");
      setApplicant({ email: "", firstName: "", lastName: "", applicantType: form.type });
      setResponses(form.fields.map(f => ({ fieldId: f.id, response: "" })));
    } catch (err) {
      setApplyError(err.message || "Failed to submit application");
    } finally {
      setApplyLoading(false);
    }
  };


  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!form) return <div className="p-10 text-center">Application form not found or is inactive.</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 border-t-8 border-blue-600">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">{form.name}</h1>
        <p className="text-gray-600 mb-6 text-center">Please fill out the form below to apply.</p>
        {applySuccess && <div className="text-green-600 mb-2 text-center text-lg font-semibold">{applySuccess}</div>}
        {applyError && <div className="text-red-600 mb-2 text-center text-lg font-semibold">{applyError}</div>}

        <form className="bg-blue-50 rounded-lg p-6" onSubmit={handleApplySubmit}>
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Applicant Information</h2>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input id="email" className="w-full border rounded px-3 py-2 mt-1" type="email" placeholder="Email" value={applicant.email} onChange={e => handleApplicantChange("email", e.target.value)} required />
            </div>
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input id="firstName" className="w-full border rounded px-3 py-2 mt-1" placeholder="First Name" value={applicant.firstName} onChange={e => handleApplicantChange("firstName", e.target.value)} />
            </div>
            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input id="lastName" className="w-full border rounded px-3 py-2 mt-1" placeholder="Last Name" value={applicant.lastName} onChange={e => handleApplicantChange("lastName", e.target.value)} />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="applicantType" className="block text-sm font-medium text-gray-700">Applicant Type <span className="text-red-500">*</span></label>
            <select id="applicantType" className="w-full border rounded px-3 py-2 mt-1" value={applicant.applicantType} onChange={e => handleApplicantChange("applicantType", e.target.value)} required>
              {FORM_TYPES.map(type => <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>)}
            </select>
          </div>

          <h2 className="text-xl font-semibold text-blue-700 mb-4">Form Questions</h2>
          <div className="mb-4">
            {form.fields.map((field, idx) => (
              <div key={field.id} className="mb-4 p-3 bg-white rounded shadow-sm border border-blue-100">
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

          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg" disabled={applyLoading}>
              {applyLoading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}