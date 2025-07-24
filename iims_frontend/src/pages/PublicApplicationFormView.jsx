import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationFormById, submitApplication } from "../api/applicationForms";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function PublicApplicationFormView() {
  const { id: formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applicant, setApplicant] = useState({ email: "", firstName: "", lastName: "", applicantType: "" });
  const [responses, setResponses] = useState([]);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  useEffect(() => {
    if (!formId) {
      setError("Form ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    // Call the API without token/tenantId for public access
    getApplicationFormById(null, null, formId)
      .then(data => {
        setForm(data);
        setApplicant(a => ({ ...a, applicantType: data.type }));
        setResponses(data.fields.map(f => ({ fieldId: f.id, response: "" })));
      })
      .catch(err => {
        console.error("Error loading public form:", err);
        setError(err.message || "Failed to load application form.");
      })
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
        fieldResponses: responses.map((r) => ({
          fieldId: r.fieldId,
          response: r.response
        }))
      });
      setApplySuccess("Application submitted successfully! You can close this window.");
      // Reset form, ensuring applicantType is reset to the form's type, not a default
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
  if (!form) return <div className="p-10 text-center text-gray-700">Application form not found or is inactive.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-10 px-4 font-inter"> {/* Background and font */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-8 border-t-8 border-blue-600"> {/* Wider, shadows, border */}
        <h1 className="text-4xl font-extrabold text-blue-800 mb-2 text-center tracking-wide"> {/* Title style */}
          {form.name}
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center leading-relaxed"> {/* Description style */}
          Please fill out the form below to apply for our {form.type.toLowerCase()} program.
        </p>

        {applySuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6 text-center text-lg font-semibold shadow-md" role="alert">
            {applySuccess}
          </div>
        )}
        {applyError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 text-center text-lg font-semibold shadow-md" role="alert">
            {applyError}
          </div>
        )}

        <form className="bg-white rounded-lg p-7 border border-gray-200 shadow-inner" onSubmit={handleApplySubmit}> {/* Form container style */}
          <h2 className="text-2xl font-bold text-blue-700 mb-5 pb-2 border-b border-blue-200">Applicant Information</h2> {/* Section header */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-5"> {/* Grid for applicant info */}
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  id="email"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800"
                  type="email"
                  placeholder="Your email address"
                  value={applicant.email}
                  onChange={e => handleApplicantChange("email", e.target.value)}
                  required
                />
            </div>
            <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                <input
                  id="firstName"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800"
                  placeholder="Your first name"
                  value={applicant.firstName}
                  onChange={e => handleApplicantChange("firstName", e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                <input
                  id="lastName"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800"
                  placeholder="Your last name"
                  value={applicant.lastName}
                  onChange={e => handleApplicantChange("lastName", e.target.value)}
                />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-blue-700 mb-5 pb-2 border-b border-blue-200">Form Questions</h2> {/* Section header */}
          <div className="space-y-6 mb-6"> {/* Consistent vertical spacing */}
            {form.fields.map((field, idx) => (
              <div key={field.id} className="p-5 bg-white rounded-lg shadow-md border border-blue-50 transition-all duration-200 hover:shadow-lg"> {/* Card-like questions */}
                <label className="block text-blue-800 font-semibold mb-2 text-base">
                  {field.label}{field.isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                {(() => {
                  const inputClass = "w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800";
                  const currentResponse = responses[idx]?.response || "";

                  switch (field.fieldType) {
                    case "TEXT":
                      return (
                        <input
                          type="text"
                          className={inputClass}
                          value={currentResponse}
                          onChange={e => handleResponseChange(idx, e.target.value)}
                          required={field.isRequired}
                        />
                      );
                    case "TEXTAREA":
                      return (
                        <textarea
                          className={`${inputClass} h-24`}
                          value={currentResponse}
                          onChange={e => handleResponseChange(idx, e.target.value)}
                          required={field.isRequired}
                        ></textarea> // Corrected textarea value prop
                      );
                    case "SELECT":
                      return (
                        <select
                          className={inputClass}
                          value={currentResponse}
                          onChange={e => handleOptionResponseChange(idx, e.target.value)}
                          required={field.isRequired}
                        >
                          <option value="">Select...</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      );
                    case "RADIO":
                      return (
                        <div className="flex flex-col space-y-2 mt-2"> {/* Vertical layout for radio options */}
                          {field.options.map(opt => (
                            <label key={opt} className="flex items-center text-gray-700">
                              <input
                                type="radio"
                                name={`radio-${field.id}`}
                                value={opt}
                                checked={currentResponse === opt}
                                onChange={() => handleOptionResponseChange(idx, opt)}
                                required={field.isRequired}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      );
                    case "CHECKBOX":
                      return (
                        <div className="flex flex-col space-y-2 mt-2"> {/* Vertical layout for checkbox options */}
                          {field.options.map(opt => (
                            <label key={opt} className="flex items-center text-gray-700">
                              <input
                                type="checkbox"
                                checked={currentResponse.split(";;;").includes(opt)}
                                onChange={() => handleCheckboxResponseChange(idx, opt)}
                                className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      );
                    case "DATE":
                      return (
                        <input
                          type="date"
                          className={inputClass}
                          value={currentResponse}
                          onChange={e => handleResponseChange(idx, e.target.value)}
                          required={field.isRequired}
                        />
                      );
                    case "FILE":
                      return (
                        <div className="relative border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                          <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Upload a file"
                          />
                          <span className="block text-gray-700">Choose File</span>
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={applyLoading}
            >
              {applyLoading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
