import React, { useState, useEffect } from "react";
import { useAuth } from '../hooks/useAuth';
import { getTenantUsersByRole } from '../api/users';

// Template Form
export function TemplateForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ name: "", description: "", ...initial });
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-3"
    >
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
        <button type="submit" className="bg-brand-primary text-white px-3 py-1 rounded">Save</button>
      </div>
    </form>
  );
}

// Phase Form
export function PhaseForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ name: "", orderIndex: 0, ...initial });
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-3"
    >
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Order</label>
        <input
          type="number"
          className="w-full border rounded px-2 py-1"
          value={form.orderIndex}
          onChange={e => setForm(f => ({ ...f, orderIndex: Number(e.target.value) }))}
          min={0}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
        <button type="submit" className="bg-brand-primary text-white px-3 py-1 rounded">Save</button>
      </div>
    </form>
  );
}

// Task Form
export function TaskForm({ initial, onSave, onCancel, phaseName }) {
  const [form, setForm] = useState({
    taskName: "",
    description: "",
    dueDays: 0,
    ...initial
  });
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-3"
    >
      {phaseName && (
        <div className="mb-2 text-sm text-gray-600">
          Creating task for phase: <span className="font-semibold">{phaseName}</span>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Task Name</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={form.taskName}
          onChange={e => setForm(f => ({ ...f, taskName: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Due Days</label>
        <input
          type="number"
          className="w-full border rounded px-2 py-1"
          value={form.dueDays}
          onChange={e => setForm(f => ({ ...f, dueDays: Number(e.target.value) }))}
          min={0}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
        <button type="submit" className="bg-brand-primary text-white px-3 py-1 rounded">Save</button>
      </div>
    </form>
  );
}

export function AssignmentForm({ templates, onSave, onCancel }) {
  const { token } = useAuth();
  const [startups, setStartups] = useState([]);
  const [form, setForm] = useState({
    templateId: templates[0]?.id || "",
    assignedToType: "USER",
    assignedToId: "",
    assignedById: "", // Should be set from auth context in real use
  });

  useEffect(() => {
    if (token && form.assignedToType === 'USER') {
      getTenantUsersByRole(token, 'STARTUP').then(setStartups).catch(() => setStartups([]));
    }
  }, [token, form.assignedToType]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-3"
    >
      <div>
        <label className="block text-sm font-medium">Template</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={form.templateId}
          onChange={e => setForm(f => ({ ...f, templateId: e.target.value }))}
        >
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Assign To</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={form.assignedToType}
          onChange={e => setForm(f => ({ ...f, assignedToType: e.target.value, assignedToId: "" }))}
        >
          <option value="USER">Startup</option>
          <option value="COHORT">Cohort</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">
          {form.assignedToType === "USER" ? "Startup" : "Cohort ID"}
        </label>
        {form.assignedToType === "USER" ? (
          <select
            className="w-full border rounded px-2 py-1"
            value={form.assignedToId}
            onChange={e => setForm(f => ({ ...f, assignedToId: e.target.value }))}
            required
          >
            <option value="">Select a startup...</option>
            {startups.map(s => (
              <option key={s.id} value={s.id}>{s.fullName || s.email}</option>
            ))}
          </select>
        ) : (
          <input
            className="w-full border rounded px-2 py-1"
            value={form.assignedToId}
            onChange={e => setForm(f => ({ ...f, assignedToId: e.target.value }))}
            required
          />
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
        <button type="submit" className="bg-brand-primary text-white px-3 py-1 rounded">Assign</button>
      </div>
    </form>
  );
} 