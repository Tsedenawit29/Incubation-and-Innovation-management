import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { getMentorsForStartup } from '../api/mentorAssignment';
import { getAssignedTemplatesForStartup, getPhases, getTasks, uploadSubmissionFile, createSubmission } from '../api/progresstracking';
import { getTenantUsersByRole } from '../api/users';

export default function StartupProgress() {
  const { id } = useParams();
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tasksByPhase, setTasksByPhase] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});

  useEffect(() => {
    if (token && id) {
      fetchMentors();
      fetchTemplates();
    }
    // eslint-disable-next-line
  }, [token, id]);

  const fetchMentors = async () => {
    try {
      const data = await getMentorsForStartup(token, id);
      setMentors(data.map(a => a.mentor));
    } catch (e) {
      setMentors([]);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true); setError('');
    try {
      const data = await getAssignedTemplatesForStartup(id);
      // Filter templates by current user's tenantId
      const filtered = user?.tenantId ? data.filter(t => t.tenantId === user.tenantId) : data;
      setTemplates(filtered);
      setSelectedTemplate(null);
      setPhases([]); // Clear phases
      setTasks([]);  // Clear tasks
    } catch (e) {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setPhases([]); // Clear old phases
    setTasks([]);  // Clear old tasks
    if (template) fetchPhases(template.id);
  };

  const fetchPhases = async (templateId) => {
    setLoading(true); setError('');
    try {
      const data = await getPhases(templateId);
      setPhases(data);
      setTasksByPhase({}); // Clear tasks for new phases
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
      setTasksByPhase(prev => ({ ...prev, [phaseId]: data }));
    } catch (e) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleFileUpload = async (file, phaseId, taskId) => {
    setUploadStatus(prev => ({ ...prev, [`${phaseId}-${taskId}`]: 'Uploading...' }));
    try {
      // Create submission first
      const submission = await createSubmission(null, taskId, token);
      // Then upload file
      await uploadSubmissionFile(file, submission.id, token);
      setUploadStatus(prev => ({ ...prev, [`${phaseId}-${taskId}`]: 'Uploaded!' }));
      // Refresh tasks to show updated status
      fetchTasks(phaseId);
    } catch (e) {
      setUploadStatus(prev => ({ ...prev, [`${phaseId}-${taskId}`]: 'Upload failed' }));
      setError('Failed to upload file');
    }
  };

  const getProgressStats = () => {
    if (!selectedTemplate || phases.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    let completed = 0;
    let total = 0;
    
    phases.forEach(phase => {
      const phaseTasks = tasksByPhase[phase.id] || [];
      phaseTasks.forEach(task => {
        total++;
        if (task.status === 'COMPLETED') completed++;
      });
    });
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const stats = getProgressStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Startup Progress Tracking</h1>
              <p className="text-sm text-gray-600">Monitor your incubation progress and milestones</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.percentage}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Phases and Tasks */}
        {selectedTemplate && phases.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedTemplate.name} - Progress Tracking
            </h2>
            
            {phases.map(phase => (
              <div key={phase.id} className="mb-6 border border-gray-200 rounded-lg">
                <div
                  onClick={() => togglePhase(phase.id)}
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                    <span className="text-sm text-gray-600">
                      {expandedPhases.includes(phase.id) ? '▼' : '▶'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                </div>
                
                {expandedPhases.includes(phase.id) && (
                  <div className="p-4">
                    {!tasksByPhase[phase.id] && (
                      <button
                        onClick={() => fetchTasks(phase.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Load Tasks
                      </button>
                    )}
                    
                    {tasksByPhase[phase.id] && (
                      <div className="space-y-3">
                        {tasksByPhase[phase.id].map(task => (
                          <div key={task.id} className="border border-gray-200 rounded p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{task.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                <div className="flex items-center mt-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {task.status}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="ml-4">
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) handleFileUpload(file, phase.id, task.id);
                                  }}
                                  className="hidden"
                                  id={`file-${task.id}`}
                                />
                                <label
                                  htmlFor={`file-${task.id}`}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm cursor-pointer"
                                >
                                  Upload
                                </label>
                                {uploadStatus[`${phase.id}-${task.id}`] && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    {uploadStatus[`${phase.id}-${task.id}`]}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mentors Section */}
        {mentors.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assigned Mentors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentors.map(mentor => (
                <div key={mentor.id} className="border border-gray-200 rounded p-4">
                  <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                  <p className="text-sm text-gray-600">{mentor.email}</p>
                  {mentor.role && (
                    <p className="text-sm text-gray-600">{mentor.role}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 