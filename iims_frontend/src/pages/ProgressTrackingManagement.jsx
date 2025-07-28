import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState('manage');
  const [success, setSuccess] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [expandedPhases, setExpandedPhases] = useState([]);

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
      setPhases([]);
      setTasks([]);
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

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setPhases([]);
    setTasks([]);
    fetchPhases(template.id);
  };
  const handleSelectPhase = (phase) => {
    setSelectedPhase(phase);
    setTasks([]);
    fetchTasks(phase.id);
  };

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const openModal = (type, data = null) => setModal({ type, data });
  const closeModal = () => setModal({ type: null, data: null });

  const handleCreateTemplate = async (form) => {
    setLoading(true); setError('');
    try {
      await createTemplate({ ...form, tenantId });
      await fetchTemplates();
      closeModal();
    } catch (e) {
      setError('Failed to create template');
    } finally {
      setLoading(false);
    }
  };
  const handleEditTemplate = async (id, form) => {
    setLoading(true); setError('');
    try {
      await updateTemplate(id, form);
      await fetchTemplates();
      closeModal();
    } catch (e) {
      setError('Failed to update template');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteTemplate = async (id) => {
    setLoading(true); setError('');
      try {
        await deleteTemplate(id);
      await fetchTemplates();
      closeModal();
      } catch (e) {
        setError('Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePhase = async (form) => {
    setLoading(true); setError('');
    try {
      await createPhase({ ...form, templateId: selectedTemplate.id });
      await fetchPhases(selectedTemplate.id);
      closeModal();
    } catch (e) {
      setError('Failed to create phase');
    } finally {
      setLoading(false);
    }
  };
  const handleEditPhase = async (id, form) => {
    setLoading(true); setError('');
    try {
      await updatePhase(id, form);
      await fetchPhases(selectedTemplate.id);
      closeModal();
    } catch (e) {
      setError('Failed to update phase');
    } finally {
      setLoading(false);
    }
  };
  const handleDeletePhase = async (id) => {
    setLoading(true); setError('');
      try {
        await deletePhase(id);
      await fetchPhases(selectedTemplate.id);
      closeModal();
      } catch (e) {
        setError('Failed to delete phase');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (form) => {
    setLoading(true); setError('');
    try {
      await createTask({ ...form, phaseId: selectedPhase.id });
      await fetchTasks(selectedPhase.id);
      closeModal();
    } catch (e) {
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };
  const handleEditTask = async (id, form) => {
    setLoading(true); setError('');
    try {
      await updateTask(id, form);
      await fetchTasks(selectedPhase.id);
      closeModal();
    } catch (e) {
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteTask = async (id) => {
    setLoading(true); setError('');
      try {
        await deleteTask(id);
      await fetchTasks(selectedPhase.id);
      closeModal();
      } catch (e) {
        setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTemplate = async (form) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      await assignTemplate(form);
      setSuccess('Template assigned successfully!');
      closeModal();
    } catch (e) {
      setError('Failed to assign template');
    } finally {
      setLoading(false);
    }
  };

  function Toast({ message, type, onClose }) {
    if (!message) return null;
    return (
      <div className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{message}<button className="ml-2 text-white font-bold" onClick={onClose}>&times;</button></div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-brand-primary mb-6">Progress Tracking Management</h1>
      <div className="flex gap-2 mb-4">
            <button
          className={`px-4 py-2 rounded ${activeTab === 'manage' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('manage')}
            >
              Manage Templates
            </button>
            <button
          className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Progress Dashboard
            </button>
        </div>
      <Toast message={success || error} type={success ? 'success' : 'error'} onClose={() => { setSuccess(''); setError(''); }} />
        {activeTab === 'manage' ? (
        <>
                <button
            className="bg-brand-primary text-white px-3 py-1 rounded mb-2"
            onClick={() => openModal('assignTemplate')}
                >
            Assign Template
                </button>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Templates List */}
            <div className="flex-1 bg-white rounded shadow p-4">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Search templates..."
                    className="border rounded px-2 py-1 w-1/2"
                  value={templateSearch}
                    onChange={e => setTemplateSearch(e.target.value)}
                />
                  <button className="bg-brand-primary text-white px-3 py-1 rounded flex items-center gap-2" onClick={() => openModal('createTemplate')}>
                    <FaPlus /> New Template
                  </button>
              </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase())).length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 py-8">No templates found.</div>
                  ) : templates.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                    <div
                      key={t.id}
                      className={`rounded-xl shadow-lg p-6 bg-white border hover:shadow-xl transition cursor-pointer ${selectedTemplate?.id === t.id ? 'ring-2 ring-brand-primary' : ''}`}
                      onClick={() => handleSelectTemplate(t)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-brand-primary">{t.name}</h3>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800" onClick={e => { e.stopPropagation(); openModal('editTemplate', t); }} title="Edit"><FaEdit /></button>
                          <button className="text-red-600 hover:text-red-800" onClick={e => { e.stopPropagation(); openModal('deleteTemplate', t); }} title="Delete"><FaTrash /></button>
                      </div>
                      </div>
                      <p className="text-gray-600 mb-2">{t.description}</p>
                      <div className="text-xs text-gray-500">Phases: {phases.filter(p => p.templateId === t.id).length}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Phases/Tasks */}
              {selectedTemplate && (
                <button
                  className="bg-brand-primary text-white px-3 py-1 rounded flex items-center gap-2 mb-4"
                  onClick={() => openModal('createPhase')}
                >
                  <FaPlus /> New Phase
                </button>
              )}
              <div className="space-y-4 mt-6">
                {phases.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No phases found.</div>
                ) : phases.map(p => {
                  const expanded = expandedPhases.includes(p.id);
                  return (
                    <div key={p.id} className="bg-white rounded-xl shadow-lg p-4 border transition-all">
                      <div
                        className="flex justify-between items-center cursor-pointer group"
                        onClick={() => togglePhase(p.id)}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''} text-brand-primary`}
                            tabIndex={-1}
                            aria-label={expanded ? 'Collapse phase' : 'Expand phase'}
                          >
                            <FaChevronDown />
                          </button>
                          <h4 className="text-lg font-semibold text-brand-primary">{p.name}</h4>
                          <span className="text-xs text-gray-500">Order: {p.orderIndex}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800" onClick={e => { e.stopPropagation(); openModal('editPhase', p); }} title="Edit"><FaEdit /></button>
                          <button className="text-red-600 hover:text-red-800" onClick={e => { e.stopPropagation(); openModal('deletePhase', p); }} title="Delete"><FaTrash /></button>
                        </div>
                      </div>
                      {/* Animated expand/collapse */}
                      <div
                        className={`transition-all duration-300 overflow-hidden ${expanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-semibold text-brand-primary">Tasks</h5>
                          <button className="bg-brand-primary text-white px-3 py-1 rounded flex items-center gap-2" onClick={e => { e.stopPropagation(); setSelectedPhase(p); openModal('createTask'); }}><FaPlus /> New Task</button>
                        </div>
                        <div className="space-y-2">
                          {expanded && selectedPhase?.id === p.id && tasks.length === 0 ? (
                            <div className="text-gray-400 italic">No tasks found.</div>
                          ) : expanded && selectedPhase?.id === p.id && tasks.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-gray-50 rounded p-3 shadow-sm">
                              <div>
                                <div className="font-medium">{t.taskName}</div>
                                <div className="text-xs text-gray-500">{t.description}</div>
                                <div className="text-xs text-gray-400">Due in {t.dueDays} days</div>
                              </div>
                              <div className="flex gap-2">
                                <button className="text-blue-600 hover:text-blue-800" onClick={e => { e.stopPropagation(); openModal('editTask', t); }} title="Edit"><FaEdit /></button>
                                <button className="text-red-600 hover:text-red-800" onClick={e => { e.stopPropagation(); openModal('deleteTask', t); }} title="Delete"><FaTrash /></button>
                                </div>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
        ) : (
          <ProgressDashboard />
        )}
        {modal.type && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[320px] max-w-md">
            <button className="absolute top-2 right-2 text-gray-500" onClick={closeModal}>&#10005;</button>
            {modal.type === 'assignTemplate' && (
              <div>
                <h2 className="font-bold mb-2">Assign Template</h2>
                <AssignmentForm
                  templates={templates}
                  onSave={handleAssignTemplate}
                  onCancel={closeModal}
                />
              </div>
            )}
            {modal.type === 'createTemplate' && (
              <TemplateForm
                onSave={handleCreateTemplate}
                  onCancel={closeModal}
                />
              )}
            {modal.type === 'editTemplate' && (
              <TemplateForm
                initial={modal.data}
                onSave={form => handleEditTemplate(modal.data.id, form)}
                  onCancel={closeModal}
                />
              )}
            {modal.type === 'deleteTemplate' && <div><h2 className="font-bold mb-2">Delete Template</h2><p>Are you sure?</p><button className="bg-red-600 text-white px-4 py-2 rounded mt-2" onClick={() => handleDeleteTemplate(modal.data.id)}>Delete</button></div>}
            {modal.type === 'createPhase' && (
              <PhaseForm
                onSave={handleCreatePhase}
                  onCancel={closeModal}
                />
              )}
            {modal.type === 'editPhase' && (
              <PhaseForm
                initial={modal.data}
                onSave={form => handleEditPhase(modal.data.id, form)}
                  onCancel={closeModal}
                />
              )}
            {modal.type === 'deletePhase' && <div><h2 className="font-bold mb-2">Delete Phase</h2><p>Are you sure?</p><button className="bg-red-600 text-white px-4 py-2 rounded mt-2" onClick={() => handleDeletePhase(modal.data.id)}>Delete</button></div>}
            {modal.type === 'createTask' && (
              <TaskForm
                onSave={handleCreateTask}
                onCancel={closeModal}
                phaseName={selectedPhase?.name}
              />
            )}
            {modal.type === 'editTask' && (
              <TaskForm
                initial={modal.data}
                onSave={form => handleEditTask(modal.data.id, form)}
                onCancel={closeModal}
                phaseName={selectedPhase?.name}
              />
            )}
            {modal.type === 'deleteTask' && <div><h2 className="font-bold mb-2">Delete Task</h2><p>Are you sure?</p><button className="bg-red-600 text-white px-4 py-2 rounded mt-2" onClick={() => handleDeleteTask(modal.data.id)}>Delete</button></div>}
          </div>
          </div>
        )}
    </div>
  );
} 