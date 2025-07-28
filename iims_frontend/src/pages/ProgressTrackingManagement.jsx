import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Import your progresstracking API functions
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getPhases,
  createPhase,
  updatePhase,
  deletePhase,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTemplate
} from '../api/progresstracking';
import { TemplateForm, PhaseForm, TaskForm, AssignmentForm } from '../components/ProgressTrackingForms';
import ProgressDashboard from '../components/ProgressDashboard';
import { useRef } from 'react';
import { FaEdit, FaTrash, FaPlus, FaChevronDown } from 'react-icons/fa';

export default function ProgressTrackingManagement() {
  const { tenantId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ type: null, data: null });
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'dashboard'
  const [success, setSuccess] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const toastRef = useRef();
  const [expandedPhases, setExpandedPhases] = useState([]);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line
  }, [tenantId]);

  const fetchTemplates = async () => {
    setLoading(true); setError('');
    try {
      const data = await getTemplates(tenantId);
      setTemplates(data);
      setSelectedTemplate(null);
      setPhases([]); // Clear phases
      setTasks([]);  // Clear tasks
    } catch (e) {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchPhases = async (templateId) => {
    setLoading(true); setError('');
    try {
      const data = await getPhases(templateId);
      setPhases(data);
      setSelectedPhase(null);
      setTasks([]);
    } catch (e) {
      setError('Failed to load phases');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (phaseId) => {
    setLoading(true); setError('');
    try {
      const data = await getTasks(phaseId);
      setTasks(data);
    } catch (e) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for selecting template/phase
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setPhases([]); // Clear old phases
    setTasks([]);  // Clear old tasks
    fetchPhases(template.id);
  };
  const handleSelectPhase = (phase) => {
    setSelectedPhase(phase);
    setTasks([]); // Clear old tasks
    fetchTasks(phase.id);
  };

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  // Modal handlers
  const openModal = (type, data = null) => setModal({ type, data });
  const closeModal = () => setModal({ type: null, data: null });

  // CRUD handlers for templates
  const handleCreateTemplate = async (form) => {
    try {
      await createTemplate({ ...form, tenantId });
      setSuccess('Template created successfully');
      fetchTemplates();
      closeModal();
    } catch (e) {
      setError('Failed to create template');
    }
  };

  const handleEditTemplate = async (id, form) => {
    try {
      await updateTemplate(id, form);
      setSuccess('Template updated successfully');
      fetchTemplates();
      closeModal();
    } catch (e) {
      setError('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id);
        setSuccess('Template deleted successfully');
        fetchTemplates();
      } catch (e) {
        setError('Failed to delete template');
      }
    }
  };

  // CRUD handlers for phases
  const handleCreatePhase = async (form) => {
    try {
      await createPhase({ ...form, templateId: selectedTemplate.id });
      setSuccess('Phase created successfully');
      fetchPhases(selectedTemplate.id);
      closeModal();
    } catch (e) {
      setError('Failed to create phase');
    }
  };

  const handleEditPhase = async (id, form) => {
    try {
      await updatePhase(id, form);
      setSuccess('Phase updated successfully');
      fetchPhases(selectedTemplate.id);
      closeModal();
    } catch (e) {
      setError('Failed to update phase');
    }
  };

  const handleDeletePhase = async (id) => {
    if (window.confirm('Are you sure you want to delete this phase?')) {
      try {
        await deletePhase(id);
        setSuccess('Phase deleted successfully');
        fetchPhases(selectedTemplate.id);
      } catch (e) {
        setError('Failed to delete phase');
      }
    }
  };

  // CRUD handlers for tasks
  const handleCreateTask = async (form) => {
    try {
      await createTask({ ...form, phaseId: selectedPhase.id });
      setSuccess('Task created successfully');
      fetchTasks(selectedPhase.id);
      closeModal();
    } catch (e) {
      setError('Failed to create task');
    }
  };

  const handleEditTask = async (id, form) => {
    try {
      await updateTask(id, form);
      setSuccess('Task updated successfully');
      fetchTasks(selectedPhase.id);
      closeModal();
    } catch (e) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        setSuccess('Task deleted successfully');
        fetchTasks(selectedPhase.id);
      } catch (e) {
        setError('Failed to delete task');
      }
    }
  };

  // Assignment handler
  const handleAssignTemplate = async (form) => {
    try {
      await assignTemplate(form);
      setSuccess('Template assigned successfully');
      closeModal();
    } catch (e) {
      setError('Failed to assign template');
    }
  };

  function Toast({ message, type, onClose }) {
    return (
      <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        <div className="flex items-center justify-between">
          <span>{message}</span>
          <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
            ×
          </button>
        </div>
      </div>
    );
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(templateSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Progress Tracking Management</h1>
              <p className="text-sm text-gray-600">Manage templates, phases, and tasks for your tenant</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Toast notifications */}
        {success && (
          <Toast
            message={success}
            type="success"
            onClose={() => setSuccess('')}
          />
        )}
        {error && (
          <Toast
            message={error}
            type="error"
            onClose={() => setError('')}
          />
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Templates
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Progress Dashboard
            </button>
          </nav>
        </div>

        {activeTab === 'manage' ? (
          <div className="space-y-6">
            {/* Templates Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Templates</h2>
                <button
                  onClick={() => openModal('template')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  <FaPlus className="inline mr-2" />
                  New Template
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Templates List */}
              <div className="space-y-4">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('template', template)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                        <button
                          onClick={() => handleSelectTemplate(template)}
                          className="text-green-600 hover:text-green-800"
                        >
                          View Phases
                        </button>
                      </div>
                    </div>

                    {/* Phases for this template */}
                    {selectedTemplate?.id === template.id && phases.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900">Phases</h4>
                          <button
                            onClick={() => openModal('phase')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            <FaPlus className="inline mr-1" />
                            New Phase
                          </button>
                        </div>
                        <div className="space-y-2">
                          {phases.map(phase => (
                            <div key={phase.id} className="border border-gray-200 rounded p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{phase.name}</h5>
                                  <p className="text-sm text-gray-600">{phase.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openModal('phase', phase)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePhase(phase.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    <FaTrash />
                                  </button>
                                  <button
                                    onClick={() => handleSelectPhase(phase)}
                                    className="text-green-600 hover:text-green-800 text-sm"
                                  >
                                    View Tasks
                                  </button>
                                </div>
                              </div>

                              {/* Tasks for this phase */}
                              {selectedPhase?.id === phase.id && tasks.length > 0 && (
                                <div className="mt-3 pl-4 border-l-2 border-gray-200">
                                  <div className="flex justify-between items-center mb-2">
                                    <h6 className="font-medium text-gray-900">Tasks</h6>
                                    <button
                                      onClick={() => openModal('task')}
                                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                                    >
                                      <FaPlus className="inline mr-1" />
                                      New Task
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    {tasks.map(task => (
                                      <div key={task.id} className="border border-gray-200 rounded p-2">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <h6 className="font-medium text-gray-900">{task.name}</h6>
                                            <p className="text-sm text-gray-600">{task.description}</p>
                                          </div>
                                          <div className="flex space-x-2">
                                            <button
                                              onClick={() => openModal('task', task)}
                                              className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                              <FaEdit />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteTask(task.id)}
                                              className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                              <FaTrash />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Template Assignments</h2>
                <button
                  onClick={() => openModal('assignment')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  <FaPlus className="inline mr-2" />
                  Assign Template
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ProgressDashboard />
        )}

        {/* Modal */}
        {modal.type && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {modal.type === 'template' ? 'Template' : 
                 modal.type === 'phase' ? 'Phase' : 
                 modal.type === 'task' ? 'Task' : 'Assignment'}
              </h3>
              
              {modal.type === 'template' && (
                <TemplateForm
                  onSubmit={modal.data ? (form) => handleEditTemplate(modal.data.id, form) : handleCreateTemplate}
                  initialData={modal.data}
                  onCancel={closeModal}
                />
              )}
              
              {modal.type === 'phase' && (
                <PhaseForm
                  onSubmit={modal.data ? (form) => handleEditPhase(modal.data.id, form) : handleCreatePhase}
                  initialData={modal.data}
                  onCancel={closeModal}
                />
              )}
              
              {modal.type === 'task' && (
                <TaskForm
                  onSubmit={modal.data ? (form) => handleEditTask(modal.data.id, form) : handleCreateTask}
                  initialData={modal.data}
                  onCancel={closeModal}
                />
              )}
              
              {modal.type === 'assignment' && (
                <AssignmentForm
                  onSubmit={handleAssignTemplate}
                  templates={templates}
                  onCancel={closeModal}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 