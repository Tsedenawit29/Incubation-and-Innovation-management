import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaChevronDown, FaHome, FaChartLine, FaCogs } from 'react-icons/fa';
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
  assignTemplate,
  getAllAssignments,
  deleteAssignment,
  getTrackings,
  getSubmissions
} from '../api/progresstracking';
import { getTenantUsers } from '../api/users';
import { TemplateForm, PhaseForm, TaskForm, AssignmentForm } from '../components/ProgressTrackingForms';
import ProgressDashboard from '../components/ProgressDashboard';

export default function ProgressTrackingManagement() {
  const { tenantId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [trackings, setTrackings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ type: null, data: null });
  const [activeTab, setActiveTab] = useState('manage');
  const [success, setSuccess] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [expandedPhases, setExpandedPhases] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Fetch templates on mount
  useEffect(() => {
    // Test backend connectivity
    const testBackend = async () => {
      try {
        const response = await fetch('http://localhost:8081/ping');
        console.log('Backend connectivity test:', response.ok);
      } catch (e) {
        console.error('Backend connectivity test failed:', e);
      }
    };
    
    // Test authentication
    const testAuth = async () => {
      try {
        const token = localStorage.getItem('springBootAuthToken');
        if (token) {
          const response = await fetch('http://localhost:8081/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const userData = await response.json();
          console.log('Current user data:', userData);
        }
      } catch (e) {
        console.error('Auth test failed:', e);
      }
    };
    
    testBackend();
    testAuth();
    fetchTemplates();
    fetchDashboardData();
    fetchUsers();
    fetchAssignments();
  }, [tenantId]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching templates for tenantId:', tenantId);
      console.log('TenantId type:', typeof tenantId);
      console.log('Auth token:', localStorage.getItem('springBootAuthToken') ? 'Present' : 'Missing');
      const userData = localStorage.getItem('springBootUser');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('User role:', user.role);
        console.log('User tenantId:', user.tenantId);
        console.log('User data:', user);
      }
      const data = await getTemplates(tenantId);
      console.log('Templates fetched successfully:', data);
      setTemplates(data);
      setSelectedTemplate(null);
      setPhases([]);
      setTasks([]);
    } catch (e) {
      console.error('Error fetching templates:', e);
      setError(`Failed to load templates: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const [trackingsData, submissionsData] = await Promise.all([
        getTrackings(),
        getSubmissions()
      ]);
      console.log('Trackings data:', trackingsData);
      console.log('Submissions data:', submissionsData);
      setTrackings(trackingsData);
      setSubmissions(submissionsData);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('springBootAuthToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const allUsers = await getTenantUsers(token);
      console.log('All users fetched:', allUsers);
      console.log('Total users count:', allUsers.length);
      
      // Log all user roles to see what's available
      const roles = [...new Set(allUsers.map(user => user.role))];
      console.log('Available roles:', roles);
      
      // Log each user's role for debugging
      allUsers.forEach((user, index) => {
        console.log(`User ${index + 1}:`, {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          name: user.name
        });
      });
      
      // Filter to show only STARTUP users
      const startupUsers = allUsers.filter(user => user.role === 'STARTUP');
      console.log('Startup users filtered:', startupUsers);
      console.log('Startup users count:', startupUsers.length);
      
      // Log each startup user's details for debugging
      startupUsers.forEach((user, index) => {
        console.log(`Startup ${index + 1}:`, {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          name: user.name,
          startupName: user.startupName,
          role: user.role
        });
      });
      
      // If no STARTUP users found, show all users for debugging
      if (startupUsers.length === 0) {
        console.log('No STARTUP users found, showing all users for debugging');
        setUsers(allUsers);
      } else {
        setUsers(startupUsers);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
      setError('Failed to load users');
    }
  };

  const fetchAssignments = async () => {
    try {
      console.log('Fetching all assignments...');
      const assignmentsData = await getAllAssignments();
      console.log('Assignments fetched:', assignmentsData);
      setAssignments(assignmentsData);
    } catch (e) {
      console.error('Failed to fetch assignments:', e);
      setError('Failed to load assignments');
    }
  };

  const fetchPhases = async (templateId) => {
    setLoading(true);
    setError('');
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
    setLoading(true);
    setError('');
    try {
      const data = await getTasks(phaseId);
      setTasks(data);
    } catch (e) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template);
    setPhases([]);
    setTasks([]);
    await fetchPhases(template.id);
    
    // Load tasks for all phases of this template
    try {
      const phasesData = await getPhases(template.id);
      setPhases(phasesData);
      
      // Fetch tasks for all phases
      const allTasks = [];
      for (const phase of phasesData) {
        try {
          const phaseTasks = await getTasks(phase.id);
          allTasks.push(...phaseTasks);
        } catch (e) {
          console.error(`Failed to load tasks for phase ${phase.id}:`, e);
        }
      }
      setTasks(allTasks);
    } catch (e) {
      console.error('Error loading phases and tasks:', e);
    }
  };

  const handleSelectPhase = (phase) => {
    setSelectedPhase(phase);
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
    setLoading(true);
    setError('');
    try {
      console.log('Creating template with data:', { ...form, tenantId });
      const data = await createTemplate({ ...form, tenantId });
      console.log('Template created successfully:', data);
      setSuccess('Template created successfully!');
      fetchTemplates();
      closeModal();
    } catch (e) {
      console.error('Error creating template:', e);
      setError(`Failed to create template: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = async (id, form) => {
    setLoading(true);
    try {
      await updateTemplate(id, form);
      setSuccess('Template updated successfully!');
      fetchTemplates();
      closeModal();
    } catch (e) {
      setError('Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    setLoading(true);
    try {
      await deleteTemplate(id);
      setSuccess('Template deleted successfully!');
      fetchTemplates();
      closeModal();
    } catch (e) {
      setError('Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePhase = async (form) => {
    setLoading(true);
    try {
      await createPhase(form);
      setSuccess('Phase created successfully!');
      // Refresh phases and tasks
      const phasesData = await getPhases(selectedTemplate.id);
      setPhases(phasesData);
      
      // Fetch tasks for all phases
      const allTasks = [];
      for (const phase of phasesData) {
        try {
          const phaseTasks = await getTasks(phase.id);
          allTasks.push(...phaseTasks);
        } catch (e) {
          console.error(`Failed to load tasks for phase ${phase.id}:`, e);
        }
      }
      setTasks(allTasks);
      closeModal();
    } catch (e) {
      setError('Failed to create phase');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhase = async (id, form) => {
    setLoading(true);
    try {
      await updatePhase(id, form);
      setSuccess('Phase updated successfully!');
      // Refresh phases and tasks
      const phasesData = await getPhases(selectedTemplate.id);
      setPhases(phasesData);
      
      // Fetch tasks for all phases
      const allTasks = [];
      for (const phase of phasesData) {
        try {
          const phaseTasks = await getTasks(phase.id);
          allTasks.push(...phaseTasks);
        } catch (e) {
          console.error(`Failed to load tasks for phase ${phase.id}:`, e);
        }
      }
      setTasks(allTasks);
      closeModal();
    } catch (e) {
      setError('Failed to update phase');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhase = async (id) => {
    setLoading(true);
    try {
      await deletePhase(id);
      setSuccess('Phase deleted successfully!');
      // Refresh phases and tasks
      const phasesData = await getPhases(selectedTemplate.id);
      setPhases(phasesData);
      
      // Fetch tasks for all phases
      const allTasks = [];
      for (const phase of phasesData) {
        try {
          const phaseTasks = await getTasks(phase.id);
          allTasks.push(...phaseTasks);
        } catch (e) {
          console.error(`Failed to load tasks for phase ${phase.id}:`, e);
        }
      }
      setTasks(allTasks);
      closeModal();
    } catch (e) {
      setError('Failed to delete phase');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (form) => {
    setLoading(true);
    try {
      await createTask(form);
      setSuccess('Task created successfully!');
      // Refresh all tasks for the template
      const phasesData = await getPhases(selectedTemplate.id);
      const allTasks = [];
      for (const phase of phasesData) {
        try {
          const phaseTasks = await getTasks(phase.id);
          allTasks.push(...phaseTasks);
        } catch (e) {
          console.error(`Failed to load tasks for phase ${phase.id}:`, e);
        }
      }
      setTasks(allTasks);
      closeModal();
    } catch (e) {
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (id, form) => {
    setLoading(true);
    try {
      await updateTask(id, form);
      setSuccess('Task updated successfully!');
      // Refresh all tasks for the template
      const phasesData = await getPhases(selectedTemplate.id);
      const allTasks = [];
      for (const phase of phasesData) {
        try {
          const phaseTasks = await getTasks(phase.id);
          allTasks.push(...phaseTasks);
        } catch (e) {
          console.error(`Failed to load tasks for phase ${phase.id}:`, e);
        }
      }
      setTasks(allTasks);
      closeModal();
    } catch (e) {
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    setLoading(true);
    try {
      await deleteTask(id);
      setSuccess('Task deleted successfully!');
      // Refresh all tasks for the template
      const phasesData = await getPhases(selectedTemplate.id);
      const allTasks = [];
      for (const phase of phasesData) {
        try {
          const phaseTasks = await getTasks(phase.id);
          allTasks.push(...phaseTasks);
        } catch (e) {
          console.error(`Failed to load tasks for phase ${phase.id}:`, e);
        }
      }
      setTasks(allTasks);
      closeModal();
    } catch (e) {
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTemplate = async (form) => {
    setLoading(true);
    try {
      console.log('Assigning template with data:', form);
      const result = await assignTemplate(form);
      console.log('Template assignment result:', result);
      setSuccess('Template assigned successfully!');
      // Refresh assignments after successful assignment
      await fetchAssignments();
      closeModal();
    } catch (e) {
      console.error('Failed to assign template:', e);
      setError('Failed to assign template: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    setLoading(true);
    try {
      console.log('Deleting assignment with ID:', assignmentId);
      await deleteAssignment(assignmentId);
      setSuccess('Assignment deleted successfully!');
      // Refresh assignments after successful deletion
      await fetchAssignments();
      closeModal();
    } catch (e) {
      console.error('Failed to delete assignment:', e);
      setError('Failed to delete assignment: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  function Toast({ message, type, onClose }) {
    if (!message) return null;
    return (
      <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        <div className="flex items-center gap-2">
          <span>{message}</span>
          <button onClick={onClose} className="ml-2 hover:opacity-75">×</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/tenant-admin/dashboard" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaHome className="text-lg" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Progress Tracking Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'manage' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            <FaCogs />
            Manage Templates
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'dashboard' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartLine />
            Progress Dashboard
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'assignments' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => setActiveTab('assignments')}
          >
            <FaEdit />
            Assignment Management
          </button>
        </div>

        <Toast message={success || error} type={success ? 'success' : 'error'} onClose={() => { setSuccess(''); setError(''); }} />

        {activeTab === 'manage' ? (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                onClick={() => openModal('assignTemplate')}
              >
                <FaPlus />
                Assign Template
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Templates List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <input
                      type="text"
                      placeholder="Search templates..."
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={templateSearch}
                      onChange={e => setTemplateSearch(e.target.value)}
                    />
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                      onClick={() => openModal('createTemplate')}
                    >
                      <FaPlus />
                      New Template
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {templates.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase())).length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No templates found.</div>
                  ) : templates.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                    <div
                      key={t.id}
                      className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        selectedTemplate?.id === t.id 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                      onClick={() => handleSelectTemplate(t)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{t.name}</h3>
                        <div className="flex gap-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800 p-1" 
                            onClick={e => { e.stopPropagation(); openModal('editTemplate', t); }}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 p-1" 
                            onClick={e => { e.stopPropagation(); openModal('deleteTemplate', t); }}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{t.description}</p>
                      <div className="text-sm text-gray-500">
                        Phases: {phases.filter(p => p.templateId === t.id).length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phases and Tasks */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                {selectedTemplate && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Phases for: {selectedTemplate.name}
                    </h3>
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                      onClick={() => openModal('createPhase')}
                    >
                      <FaPlus />
                      New Phase
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {phases.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      {selectedTemplate ? 'No phases found.' : 'Select a template to view phases.'}
                    </div>
                  ) : phases.map(p => {
                    const expanded = expandedPhases.includes(p.id);
                    return (
                      <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => togglePhase(p.id)}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''} text-blue-600`}
                              tabIndex={-1}
                            >
                              <FaChevronDown />
                            </button>
                            <h4 className="text-lg font-semibold text-gray-900">{p.name}</h4>
                            <span className="text-sm text-gray-500">Order: {p.orderIndex}</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800 p-1" 
                              onClick={e => { e.stopPropagation(); openModal('editPhase', p); }}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800 p-1" 
                              onClick={e => { e.stopPropagation(); openModal('deletePhase', p); }}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>

                        {/* Tasks */}
                        <div className={`transition-all duration-300 overflow-hidden ${
                          expanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="mb-4">
                            <button
                              className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                              onClick={() => {
                                setSelectedPhase(p);
                                openModal('createTask');
                              }}
                            >
                              <FaPlus />
                              New Task
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {tasks.filter(t => t.phaseId === p.id).map(task => (
                              <div key={task.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                                <div>
                                  <h5 className="font-medium text-gray-900">{task.name}</h5>
                                  <p className="text-sm text-gray-600">{task.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    className="text-blue-600 hover:text-blue-800 p-1" 
                                    onClick={() => openModal('editTask', task)}
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button 
                                    className="text-red-600 hover:text-red-800 p-1" 
                                    onClick={() => openModal('deleteTask', task)}
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </button>
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
          </div>
        ) : activeTab === 'dashboard' ? (
          <ProgressDashboard trackings={trackings} submissions={submissions} />
        ) : (
          // Assignment Management Tab
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📋 Template Assignments Overview</h3>
              
              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-lg p-8">
                    <FaEdit size={48} className="mx-auto text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Assignments Found</h4>
                    <p className="text-gray-600">
                      No progress tracking templates have been assigned yet. 
                      Use the "Assign Template" button in the Manage Templates tab to create assignments.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map(assignment => {
                    // Find the template and user details
                    const template = templates.find(t => t.id === assignment.templateId);
                    const user = users.find(u => u.id === assignment.assignedToId);
                    
                    return (
                      <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {template?.name || 'Unknown Template'}
                              </h4>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {assignment.assignedToType}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Assigned to:</span>
                                <p className="text-gray-600">
                                  {user?.fullName || user?.name || user?.email || 'Unknown User'}
                                  {user?.startupName && (
                                    <span className="block text-xs text-gray-500">
                                      Startup: {user.startupName}
                                    </span>
                                  )}
                                </p>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Assigned on:</span>
                                <p className="text-gray-600">
                                  {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : 'Unknown'}
                                </p>
                              </div>
                            </div>
                            
                            {template?.description && (
                              <div className="mt-3">
                                <span className="font-medium text-gray-700">Template Description:</span>
                                <p className="text-gray-600 text-sm">{template.description}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <button 
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2" 
                              onClick={() => openModal('deleteAssignment', assignment)}
                              title="Delete Assignment"
                            >
                              <FaTrash />
                              <span className="text-sm">Delete</span>
                            </button>
                            <span className="text-xs text-gray-500">
                              ID: {assignment.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">📊 Assignment Summary</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Total Assignments:</span>
                    <span className="ml-2 text-blue-700">{assignments.length}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Unique Templates:</span>
                    <span className="ml-2 text-blue-700">
                      {new Set(assignments.map(a => a.templateId)).size}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Assigned Startups:</span>
                    <span className="ml-2 text-blue-700">
                      {new Set(assignments.map(a => a.assignedToId)).size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {modal.type === 'createTemplate' && (
          <TemplateForm
            template={null}
            onSubmit={handleCreateTemplate}
            onCancel={closeModal}
            loading={loading}
          />
        )}

        {modal.type === 'editTemplate' && (
          <TemplateForm
            template={modal.data}
            onSubmit={(form) => handleEditTemplate(modal.data.id, form)}
            onCancel={closeModal}
            loading={loading}
          />
        )}

        {modal.type === 'deleteTemplate' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Template</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{modal.data?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTemplate(modal.data.id)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {modal.type === 'createPhase' && (
          <PhaseForm
            phase={null}
            templateId={selectedTemplate?.id}
            onSubmit={handleCreatePhase}
            onCancel={closeModal}
            loading={loading}
          />
        )}

        {modal.type === 'editPhase' && (
          <PhaseForm
            phase={modal.data}
            templateId={selectedTemplate?.id}
            onSubmit={(form) => handleEditPhase(modal.data.id, form)}
            onCancel={closeModal}
            loading={loading}
          />
        )}

        {modal.type === 'deletePhase' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Phase</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{modal.data?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePhase(modal.data.id)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {modal.type === 'createTask' && (
          <TaskForm
            task={null}
            phaseId={selectedPhase?.id}
            users={users}
            onSubmit={handleCreateTask}
            onCancel={closeModal}
            loading={loading}
          />
        )}

        {modal.type === 'editTask' && (
          <TaskForm
            task={modal.data}
            phaseId={selectedPhase?.id}
            users={users}
            onSubmit={(form) => handleEditTask(modal.data.id, form)}
            onCancel={closeModal}
            loading={loading}
          />
        )}

        {modal.type === 'deleteTask' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Task</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{modal.data?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTask(modal.data.id)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {modal.type === 'assignTemplate' && (
          <AssignmentForm
            templates={templates}
            users={users}
            onSubmit={handleAssignTemplate}
            onCancel={closeModal}
            loading={loading}
          />
        )}

        {modal.type === 'deleteAssignment' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🗑️ Delete Assignment</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this assignment? This will remove the template assignment from the startup and they will no longer see it on their dashboard.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm">
                  <div className="font-medium text-gray-900 mb-1">
                    Template: {templates.find(t => t.id === modal.data?.templateId)?.name || 'Unknown'}
                  </div>
                  <div className="text-gray-600">
                    Assigned to: {users.find(u => u.id === modal.data?.assignedToId)?.fullName || 'Unknown User'}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAssignment(modal.data.id)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Deleting...' : 'Delete Assignment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}