import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';


export const TemplateForm = ({ template, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    name: template?.name || '',
    description: template?.description || '',
    tenantId: template?.tenantId || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {template ? 'Edit Template' : 'Create Template'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter template name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter template description"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {template ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const PhaseForm = ({ phase, templateId, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    name: phase?.name || '',
    description: phase?.description || '',
    orderIndex: phase?.orderIndex || 1,
    templateId: templateId
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {phase ? 'Edit Phase' : 'Create Phase'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phase Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phase name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter phase description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Index</label>
            <input
              type="number"
              value={form.orderIndex}
              onChange={(e) => setForm({...form, orderIndex: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {phase ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TaskForm = ({ task, phaseId, users, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    taskName: task?.taskName || task?.name || '',
    description: task?.description || '',
    dueDays: task?.dueDays || 7,
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    phaseId: phaseId,
    mentorId: task?.mentorId || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the data according to backend expectations
    const taskData = {
      taskName: form.taskName,
      description: form.description,
      dueDays: form.dueDays,
      phaseId: form.phaseId,
      mentorId: form.mentorId || null
    };
    
    // Only include dueDate if it's provided
    if (form.dueDate) {
      taskData.dueDate = new Date(form.dueDate).toISOString();
    }
    
    // Only include mentorId if it's provided and not empty
    if (form.mentorId && form.mentorId !== '') {
      taskData.mentorId = form.mentorId;
    }
    
    onSubmit(taskData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {task ? 'Edit Task' : 'Create Task'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
            <input
              type="text"
              value={form.taskName}
              onChange={(e) => setForm({...form, taskName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter task description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Days</label>
            <input
              type="number"
              value={form.dueDays}
              onChange={(e) => setForm({...form, dueDays: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              placeholder="Number of days to complete"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date (Optional)</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({...form, dueDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Mentor (Optional)</label>
            <select
              value={form.mentorId}
              onChange={(e) => setForm({...form, mentorId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No mentor assigned</option>
              {users?.filter(user => user.role === 'MENTOR').map(mentor => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.fullName || mentor.name || mentor.email}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};




export const AssignmentForm = ({ templates, users, currentUser, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    templateId: '',
    assignedToId: '',
    assignedToType: 'STARTUP',
    assignedById: currentUser?.id || ''
  });

  // Keep assignedById in sync if currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      setForm(prev => ({ ...prev, assignedById: currentUser.id }));
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send camelCase fields to match backend DTO
    const payload = {
      templateId: form.templateId,
      assignedToId: form.assignedToId,
      assignedToType: form.assignedToType,
      assignedById: form.assignedById
    };

    console.log('🔍 ASSIGNMENT DEBUG - Selected user ID:', form.assignedToId);
    console.log('🔍 ASSIGNMENT DEBUG - Full payload:', payload);

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Assign Template to Startup</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Assign a progress tracking template to a startup. The startup will be able to view and complete tasks from this template.
          </p>

          {/* Template selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Progress Template</label>
            <select
              value={form.templateId}
              onChange={(e) => setForm({ ...form, templateId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a progress template</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}{template.description && ` - ${template.description}`}
                </option>
              ))}
            </select>
          </div>

          {/* Startup selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Startup</label>
            <select
              value={form.assignedToId}
              onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a startup</option>
              {users.length === 0
                ? <option value="" disabled>No users available</option>
                : users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.name || user.email}
                      {user.startupName && ` - ${user.startupName}`}
                      {user.role && ` [${user.role}]`}
                    </option>
                  ))
              }
            </select>
            {users.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                No users found. Please ensure there are users registered in the system.
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
