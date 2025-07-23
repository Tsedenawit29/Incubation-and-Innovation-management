import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const placeholderForms = [
  { id: "1", name: "Startup Application", createdAt: "2024-06-01", active: true },
  { id: "2", name: "Mentor Application", createdAt: "2024-05-20", active: false },
];

export default function ApplicationFormDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const form = placeholderForms.find(f => f.id === id);

  if (!form) return <div className="p-10 text-center">Form not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 relative">
        <button
          className="absolute left-4 top-4 text-blue-600 hover:text-blue-800 text-2xl"
          onClick={() => navigate("/application-forms")}
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">{form.name}</h1>
        <div className="mb-2 text-gray-600 text-center">Created: {form.createdAt}</div>
        <div className="mb-4 text-center">
          <span className="text-xs font-medium px-2 py-1 rounded" style={{background: form.active ? '#d1fae5' : '#fee2e2', color: form.active ? '#065f46' : '#991b1b'}}>
            {form.active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="text-gray-500 text-center">[Form details and editing UI coming soon]</div>
      </div>
    </div>
  );
} 