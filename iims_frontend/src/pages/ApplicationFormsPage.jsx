import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { getAllApplicationForms } from "../api/applicationForms";

const placeholderForms = [
  { id: 1, name: "Startup Application", createdAt: "2024-06-01", active: true },
  { id: 2, name: "Mentor Application", createdAt: "2024-05-20", active: false },
];

export default function ApplicationFormsPage() {
  const navigate = useNavigate();
  // const [forms, setForms] = useState([]);
  // useEffect(() => {
  //   getAllApplicationForms(token, tenantId).then(setForms);
  // }, []);
  const forms = placeholderForms;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
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
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg border border-blue-100 flex flex-col justify-between"
              onClick={() => navigate(`/application-forms/${form.id}`)}
            >
              <div className="font-bold text-lg text-blue-700 mb-2">{form.name}</div>
              <div className="text-sm text-gray-500 mb-1">Created: {form.createdAt}</div>
              <div className="text-xs font-medium px-2 py-1 rounded w-fit" style={{background: form.active ? '#d1fae5' : '#fee2e2', color: form.active ? '#065f46' : '#991b1b'}}>
                {form.active ? "Active" : "Inactive"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 