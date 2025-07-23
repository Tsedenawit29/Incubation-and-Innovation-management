import React from "react";
import { useNavigate } from "react-router-dom";

export default function CreateApplicationFormPage() {
  const navigate = useNavigate();
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
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Create Application Form</h1>
        <div className="text-gray-500 text-center">[Form builder UI coming soon]</div>
      </div>
    </div>
  );
} 