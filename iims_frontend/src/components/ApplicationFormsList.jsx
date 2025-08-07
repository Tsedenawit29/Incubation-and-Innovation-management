import React, { useState } from "react";

export default function ApplicationFormsList({ forms }) {
  const [selectedId, setSelectedId] = useState(forms.length > 0 ? forms[0].id : null);
  const selectedForm = forms.find(f => f.id === selectedId);

  return (
    <div className="flex w-full min-h-[400px]">
      {/* Sidebar menu */}
      <div className="w-1/4 border-r pr-4">
        <h4 className="font-semibold mb-2 text-gray-700">Forms</h4>
        <ul className="space-y-1">
          {forms.map(form => (
            <li key={form.id}>
              <button
                className={`w-full text-left px-3 py-2 rounded transition-colors duration-150 ${selectedId === form.id ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedId(form.id)}
              >
                <div className="flex justify-between items-center">
                  <span>{form.name}</span>
                  {form.active ? (
                    <span className="ml-2 text-xs text-green-600 font-semibold">Active</span>
                  ) : (
                    <span className="ml-2 text-xs text-red-600 font-semibold">Inactive</span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Main details area */}
      <div className="flex-1 pl-8">
        {selectedForm ? (
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">{selectedForm.name}</h2>
            <form className="bg-gray-50 rounded-lg shadow p-6">
              <div className="mb-4 flex justify-between">
                <div>
                  <span className="font-semibold">Type:</span> {selectedForm.type}
                </div>
                <div>
                  <span className="font-semibold">Status:</span> {selectedForm.active ? (
                    <span className="text-green-600 font-semibold ml-1">Active</span>
                  ) : (
                    <span className="text-red-600 font-semibold ml-1">Inactive</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold">Created:</span> {new Date(selectedForm.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="mb-2 font-semibold text-gray-700">Fields:</div>
              <div className="space-y-4">
                {selectedForm.fields.map((field, idx) => (
                  <div key={field.id} className="flex flex-col">
                    <label className="font-medium mb-1">
                      {field.label}
                      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.fieldType === "TEXT" && (
                      <input type="text" disabled className="border rounded px-3 py-2 bg-white" placeholder="Text input" />
                    )}
                    {field.fieldType === "TEXTAREA" && (
                      <textarea disabled className="border rounded px-3 py-2 bg-white" placeholder="Textarea" />
                    )}
                    {field.fieldType === "DATE" && (
                      <input type="date" disabled className="border rounded px-3 py-2 bg-white" />
                    )}
                    {field.fieldType === "SELECT" && (
                      <select disabled className="border rounded px-3 py-2 bg-white">
                        <option>Select...</option>
                        {field.options && field.options.map((opt, i) => (
                          <option key={i}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.fieldType === "CHECKBOX" && field.options && (
                      <div className="flex flex-col space-y-1">
                        {field.options.map((opt, i) => (
                          <label key={i} className="inline-flex items-center">
                            <input type="checkbox" disabled className="mr-2" /> {opt}
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">Order: {field.orderIndex}</div>
                  </div>
                ))}
              </div>
            </form>
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-12">Select a form to view details.</div>
        )}
      </div>
    </div>
  );
} 