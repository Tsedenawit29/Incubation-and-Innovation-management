import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicationFormById, submitApplication } from "../api/applicationForms";

export default function SubmitApplicationPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicant, setApplicant] = useState({ email: "", firstName: "", lastName: "", applicantType: "STARTUP" });
  const [responses, setResponses] = useState([]);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getApplicationFormById(null, null, formId)
      .then(data => {
        setForm(data);
        setApplicant(a => ({ ...a, applicantType: data.type }));
        setResponses(data.fields.map(f => ({ fieldId: f.id, response: "" })));
      })
      .catch(err => setError(err.message || "Failed to load form"))
      .finally(() => setLoading(false));
  }, [formId]);

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
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setApplyError(err.message || "Failed to submit application");
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-blue-600">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!form) return <div className="p-10 text-center">Form not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 border-t-8 border-blue-600">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">{form.name}</h1>
        <form className="bg-blue-50 rounded-lg p-4 mt-2" onSubmit={handleApplySubmit}>
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
      </div>
    </div>
  );
} 