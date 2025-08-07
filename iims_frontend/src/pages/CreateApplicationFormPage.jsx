import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createApplicationForm } from "../api/applicationForms";
import { createCohort, getAllCohorts } from "../api/cohorts";
import { createIndustry, getAllIndustries } from "../api/industries";

const FORM_TYPES = ["STARTUP", "MENTOR"];
const FIELD_TYPES = ["TEXT", "TEXTAREA", "SELECT", "RADIO", "CHECKBOX", "DATE", "FILE"];

function emptyField(orderIndex = 0) {
  return {
    label: "",
    description: "", // Added description for individual fields
    fieldType: "TEXT",
    isRequired: false,
    options: [],
    orderIndex,
  };
}

// A custom modal component to handle alerts and confirmations
const Modal = ({ isOpen, title, message, onConfirm, onCancel, showConfirm = true, showCancel = true }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          {showCancel && (
            <button
              onClick={onCancel}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}
          {showConfirm && (
            <button
              onClick={onConfirm}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


export default function CreateApplicationFormPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); // Added description for the main form
  const [type, setType] = useState(FORM_TYPES[0]);
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState([emptyField(0)]);

  // Cohort & Industry State
  const [cohorts, setCohorts] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [selectedIndustryId, setSelectedIndustryId] = useState("");
  const [newCohortName, setNewCohortName] = useState("");
  const [newIndustryName, setNewIndustryName] = useState("");

  // UI & Loading State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });

  // Fetch cohorts and industries on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!user?.tenantId || !token) {
         console.error("Authentication data is missing. Cannot fetch dropdowns.");
         setModal({ isOpen: true, title: 'Error', message: 'Authentication data is missing or invalid. Please ensure you are logged in.', showCancel: false });
         return;
      }
      try {
        const [cohortsData, industriesData] = await Promise.all([
          getAllCohorts(token, user.tenantId),
          getAllIndustries(token, user.tenantId),
        ]);
        setCohorts(cohortsData);
        setIndustries(industriesData);
      } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
        setModal({ isOpen: true, title: 'Error', message: `Failed to load cohorts and industries. Cause: ${err.message}`, showCancel: false });
      }
    };
    fetchDropdownData();
  }, [token, user.tenantId]);

  // Handler for form field changes
  const handleFieldChange = (idx, key, value) => {
    setFields(fields => fields.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  };

  const handleFieldTypeChange = (idx, value) => {
    setFields(fields => fields.map((f, i) => i === idx ? { ...f, fieldType: value, options: ["SELECT", "RADIO", "CHECKBOX"].includes(value) ? [""] : [], } : f));
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

  // Handlers for creating new cohort and industry
  const handleCreateNewCohort = async () => {
    if (!newCohortName.trim()) {
      setModal({ isOpen: true, title: 'Error', message: 'Cohort name is required.', showCancel: false });
      return;
    }
    if (!user?.tenantId || !token) {
         setModal({ isOpen: true, title: 'Error', message: 'Authentication data is missing. Cannot create cohort.', showCancel: false });
         return;
    }
    try {
      const newCohort = await createCohort(token, user.tenantId, { name: newCohortName });
      setCohorts([...cohorts, newCohort]);
      setNewCohortName("");
      setModal({ isOpen: true, title: 'Success', message: 'New cohort created successfully.', showCancel: false });
    } catch (err) {
      setModal({ isOpen: true, title: 'Error', message: err.message || 'Failed to create cohort.', showCancel: false });
    }
  };

  const handleCreateNewIndustry = async () => {
    if (!newIndustryName.trim()) {
      setModal({ isOpen: true, title: 'Error', message: 'Industry name is required.', showCancel: false });
      return;
    }
    if (!user?.tenantId || !token) {
         setModal({ isOpen: true, title: 'Error', message: 'Authentication data is missing. Cannot create industry.', showCancel: false });
         return;
    }
    try {
      const newIndustry = await createIndustry(token, user.tenantId, { name: newIndustryName });
      setIndustries([...industries, newIndustry]);
      setNewIndustryName("");
      setModal({ isOpen: true, title: 'Success', message: 'New industry created successfully.', showCancel: false });
    } catch (err) {
      setModal({ isOpen: true, title: 'Error', message: err.message || 'Failed to create industry.', showCancel: false });
    }
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
    if (!selectedCohortId || !selectedIndustryId) {
      setError("Please select a cohort and an industry.");
      return;
    }
    if (!user?.tenantId || !token) {
        setError('Authentication data is missing. Cannot submit form.');
        return;
    }

    setLoading(true);
    try {
      // Create request payload with optional cohort and industry
      const formData = {
        name,
        description, // Pass the form description to the API
        type,
        isActive,
        fields: fields.map(f => ({
          label: f.label,
          description: f.description, // Pass the field description to the API
          fieldType: f.fieldType,
          isRequired: f.isRequired,
          options: ["SELECT", "RADIO", "CHECKBOX"].includes(f.fieldType) ? f.options : [],
          orderIndex: f.orderIndex,
        })),
      };
      
      // Only add cohort and industry if they are selected
      if (selectedCohortId) {
        formData.cohortId = selectedCohortId;
      }
      
      if (selectedIndustryId) {
        formData.industryId = selectedIndustryId;
      }
      
      await createApplicationForm(token, user.tenantId, formData);
      setSuccess("Form created successfully!");
      setTimeout(() => navigate("/application-forms"), 1200);
    } catch (err) {
      setError(err.message || "Failed to create form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
       <div className="max-w-7xl mx-auto">
         <div className="flex justify-start mb-6">
           <button
             className="text-blue-600 hover:text-blue-800 text-2xl transition-colors flex items-center"
             onClick={() => navigate("/application-forms")}
             aria-label="Back"
           >
             <span className="mr-2">←</span> Back to Forms
           </button>
         </div>
         
         <div className="flex flex-col lg:flex-row gap-6">
           {/* Left Column - Form */}
           <div className="lg:w-2/3">
             <form onSubmit={handleSubmit}>
               <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                 <div className="p-8 bg-blue-600 text-white">
                   <h1 className="text-3xl font-bold">Create Application Form</h1>
                   <p className="mt-2 text-blue-100">Design your custom application form with the fields you need</p>
                 </div>
                 
                 <div className="p-6 space-y-6">
                   {/* Form Details Section */}
                   <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                     <h2 className="text-2xl font-bold text-blue-800 mb-4">Form Details</h2>
                     <div className="mb-4">
                       <input
                         className="w-full text-2xl font-bold border-b-2 border-blue-300 focus:border-blue-600 outline-none bg-transparent mb-2 text-blue-900 placeholder-blue-400 px-2 pb-1"
                         placeholder="Untitled form"
                         value={name}
                         onChange={e => setName(e.target.value)}
                         required
                       />
                       <textarea
                         className="w-full text-sm border-b-2 border-blue-300 focus:border-blue-600 outline-none bg-transparent mb-2 text-blue-900 placeholder-blue-400 px-2 pb-1"
                         placeholder="Form Description"
                         value={description}
                         onChange={e => setDescription(e.target.value)}
                         rows="2"
                       />
                     </div>
                     <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
                       <div className="flex-1">
                         <label className="block text-blue-700 font-medium mb-1">Form Type</label>
                         <select
                           className="w-full border rounded-xl px-3 py-2 text-blue-700 bg-white"
                           value={type}
                           onChange={e => setType(e.target.value)}
                         >
                           {FORM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                         </select>
                       </div>
                       <div className="flex-1 flex items-center mt-6">
                         <label className="flex items-center space-x-2 text-blue-700 font-medium">
                           <input
                             type="checkbox"
                             className="form-checkbox h-5 w-5 text-blue-600 rounded"
                             checked={isActive}
                             onChange={e => setIsActive(e.target.checked)}
                           />
                           <span>Active</span>
                         </label>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Form Fields Section */}
               <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                 <div className="p-6 space-y-6">
                   <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                     <h2 className="text-2xl font-bold text-gray-800 mb-4">Form Questions</h2>
                     <div className="space-y-6">
                       {fields.map((field, idx) => (
                         <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 relative">
                           <div className="flex flex-wrap items-center mb-2 -mx-2">
                             <div className="flex-1 px-2 mb-2 md:mb-0">
                               <input
                                 className="w-full text-lg font-semibold border-b-2 border-gray-200 focus:border-blue-600 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                                 placeholder="Question"
                                 value={field.label}
                                 onChange={e => handleFieldChange(idx, "label", e.target.value)}
                                 required
                               />
                             </div>
                             <div className="px-2 w-full md:w-auto mb-2 md:mb-0">
                               <select
                                 className="w-full md:w-auto border rounded-xl px-3 py-1 text-gray-700 bg-white"
                                 value={field.fieldType}
                                 onChange={e => handleFieldTypeChange(idx, e.target.value)}
                               >
                                 {FIELD_TYPES.map(ft => <option key={ft} value={ft}>{ft.charAt(0) + ft.slice(1).toLowerCase()}</option>)}
                               </select>
                             </div>
                             <div className="flex items-center px-2">
                               <button type="button" className="ml-2 text-blue-500 hover:text-blue-800" onClick={() => moveField(idx, -1)} disabled={idx === 0}>↑</button>
                               <button type="button" className="ml-1 text-blue-500 hover:text-blue-800" onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1}>↓</button>
                               <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => removeField(idx)} disabled={fields.length === 1}>🗑</button>
                             </div>
                           </div>

                           <textarea
                             className="w-full text-sm mt-2 border-b-2 border-gray-200 focus:border-blue-600 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                             placeholder="Field Description (e.g., 'Please provide a detailed summary of your experience.')"
                             value={field.description}
                             onChange={e => handleFieldChange(idx, "description", e.target.value)}
                             rows="2"
                           />

                           <label className="flex items-center space-x-2 text-gray-700 mb-2 mt-2">
                             <input
                               type="checkbox"
                               className="form-checkbox h-4 w-4 text-blue-600 rounded"
                               checked={field.isRequired}
                               onChange={e => handleFieldChange(idx, "isRequired", e.target.checked)}
                             />
                             <span>Required</span>
                           </label>

                           {["SELECT", "RADIO", "CHECKBOX"].includes(field.fieldType) && (
                             <div className="mb-2 pl-4">
                               <div className="font-medium text-gray-700 mb-1">Options</div>
                               {field.options.map((opt, optIdx) => (
                                 <div key={optIdx} className="flex items-center mb-1">
                                   <input
                                     className="flex-1 border-b-2 border-gray-200 focus:border-blue-600 outline-none bg-transparent text-gray-900 placeholder-gray-400"
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
                       <button type="button" className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl border-2 border-dashed border-gray-400 transition-colors" onClick={addField}>+ Add Question</button>
                     </div>
                   </div>
                   
                   {error && <div className="text-red-600 mt-6 text-center font-medium">{error}</div>}
                   {success && <div className="text-green-600 mt-6 text-center font-medium">{success}</div>}
                   
                   <div className="flex justify-end mt-8">
                     <button
                       type="submit"
                       className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-colors text-lg"
                       disabled={loading}
                     >
                       {loading ? "Creating..." : "Create Form"}
                     </button>
                   </div>
                 </div>
               </div>
             </form>
           </div>
           
           {/* Right Column - Cohort & Industry Cards */}
           <div className="lg:w-1/3 space-y-6">
             {/* Cohort Card */}
             <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
               <div className="p-6 bg-green-50 rounded-t-2xl border-b border-green-200">
                 <div className="flex items-center mb-2">
                   <h2 className="text-2xl font-bold text-green-800">Cohort</h2>
                   <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Optional</span>
                 </div>
                 <p className="text-green-700 text-sm">Assign this form to a specific cohort</p>
               </div>
               <div className="p-6">
                 <div className="flex flex-col space-y-4">
                   <select
                     className="w-full border rounded-xl px-3 py-2 text-green-700 bg-white"
                     value={selectedCohortId}
                     onChange={e => setSelectedCohortId(e.target.value)}
                   >
                     <option value="">Select a Cohort</option>
                     {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                   
                   <div className="flex flex-col space-y-2">
                     <div className="text-sm font-medium text-gray-700">Create New Cohort</div>
                     <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                       <input
                         type="text"
                         className="flex-1 w-full border rounded-xl px-3 py-2 text-green-900 placeholder-green-400"
                         placeholder="New Cohort Name"
                         value={newCohortName}
                         onChange={e => setNewCohortName(e.target.value)}
                       />
                       <button
                         type="button"
                         onClick={handleCreateNewCohort}
                         className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow transition-colors"
                       >
                         Create
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Industry Card */}
             <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
               <div className="p-6 bg-green-50 rounded-t-2xl border-b border-green-200">
                 <div className="flex items-center mb-2">
                   <h2 className="text-2xl font-bold text-green-800">Industry</h2>
                   <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Optional</span>
                 </div>
                 <p className="text-green-700 text-sm">Assign this form to a specific industry</p>
               </div>
               <div className="p-6">
                 <div className="flex flex-col space-y-4">
                   <select
                     className="w-full border rounded-xl px-3 py-2 text-green-700 bg-white"
                     value={selectedIndustryId}
                     onChange={e => setSelectedIndustryId(e.target.value)}
                   >
                     <option value="">Select an Industry</option>
                     {industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                   </select>
                   
                   <div className="flex flex-col space-y-2">
                     <div className="text-sm font-medium text-gray-700">Create New Industry</div>
                     <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                       <input
                         type="text"
                         className="flex-1 w-full border rounded-xl px-3 py-2 text-green-900 placeholder-green-400"
                         placeholder="New Industry Name"
                         value={newIndustryName}
                         onChange={e => setNewIndustryName(e.target.value)}
                       />
                       <button
                         type="button"
                         onClick={handleCreateNewIndustry}
                         className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow transition-colors"
                       >
                         Create
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
       <Modal 
         isOpen={modal.isOpen} 
         title={modal.title} 
         message={modal.message} 
         onConfirm={() => setModal({ ...modal, isOpen: false })} 
         onCancel={() => setModal({ ...modal, isOpen: false })}
         showCancel={modal.showCancel}
       />
     </div>
   );
}
