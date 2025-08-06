import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { getStartupsForMentor } from '../api/mentorAssignment';
import { getAssignedTemplatesForStartup, getPhases, getTasks, getSubmissions, uploadSubmissionFile, updateSubmission } from '../api/progresstracking';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

export default function MentorProgress() {
  const { id } = useParams();
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState([]);
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState("");
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [phases, setPhases] = useState([]);
  const [tasksByPhase, setTasksByPhase] = useState({});
  const [submissionsByTask, setSubmissionsByTask] = useState({});
  const [feedback, setFeedback] = useState({});
  const [status, setStatus] = useState({});
  const [progressStats, setProgressStats] = useState({});
  const [saveStatus, setSaveStatus] = useState({});

  useEffect(() => {
    if (token && (user?.id || id)) {
      fetchStartups();
    }
    // eslint-disable-next-line
  }, [token, user, id]);

  const fetchStartups = async () => {
    setError("");
    try {
      const mentorId = user?.id || id;
      const data = await getStartupsForMentor(token, mentorId);
      // Each assignment has .startup (UserSummaryDTO)
      setStartups(data.map(a => a.startup));
    } catch (e) {
      setError("Failed to load assigned startups");
      setStartups([]);
    }
  };

  // Fetch templates, phases, tasks, and submissions for selected startup
  useEffect(() => {
    if (selectedStartup) {
      fetchTemplatesForStartup(selectedStartup.id);
    }
    // eslint-disable-next-line
  }, [selectedStartup]);

  const fetchTemplatesForStartup = async (startupId) => {
    const templates = await getAssignedTemplatesForStartup(startupId);
    setTemplates(templates);
    if (templates.length > 0) {
      fetchPhasesForTemplate(templates[0].id);
    }
  };
  const fetchPhasesForTemplate = async (templateId) => {
    const phases = await getPhases(templateId);
    setPhases(phases);
    setTasksByPhase({});
    setSubmissionsByTask({});
    for (const phase of phases) {
      fetchTasksForPhase(phase.id);
    }
  };
  const fetchTasksForPhase = async (phaseId) => {
    const tasks = await getTasks(phaseId);
    setTasksByPhase(prev => ({ ...prev, [phaseId]: tasks }));
    for (const task of tasks) {
      fetchSubmissionForTask(task.id);
    }
  };
  const fetchSubmissionForTask = async (taskId) => {
    const submissions = await getSubmissions(); // TODO: Filter by taskId and startup
    const submission = submissions.find(s => s.taskId === taskId && s.status !== 'DELETED');
    setSubmissionsByTask(prev => ({ ...prev, [taskId]: submission }));
  };

  // Feedback and status update handlers (mocked)
  const handleFeedbackChange = (taskId, value) => setFeedback(prev => ({ ...prev, [taskId]: value }));
  const handleStatusChange = (taskId, value) => setStatus(prev => ({ ...prev, [taskId]: value }));
  const handleSaveFeedback = async (taskId) => {
    const submission = submissionsByTask[taskId];
    if (!submission) return;
    setSaveStatus(prev => ({ ...prev, [taskId]: 'Saving...' }));
    try {
      await updateSubmission(submission.id, {
        mentorFeedback: feedback[taskId],
        status: status[taskId] || submission.status,
      });
      setSaveStatus(prev => ({ ...prev, [taskId]: 'Saved!' }));
    } catch (e) {
      setSaveStatus(prev => ({ ...prev, [taskId]: 'Failed to save' }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getProgressStats = () => {
    if (!selectedStartup || phases.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mentor Progress Tracking</h1>
              <p className="text-sm text-gray-600">Monitor and guide your assigned startups</p>
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

        {/* Startup Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Startup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {startups.map(startup => (
              <div
                key={startup.id}
                onClick={() => setSelectedStartup(startup)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedStartup?.id === startup.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{startup.name || startup.email}</h3>
                <p className="text-sm text-gray-600 mt-1">{startup.email}</p>
                {startup.role && (
                  <p className="text-sm text-gray-600">{startup.role}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Overview */}
        {selectedStartup && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Progress Overview - {selectedStartup.name || selectedStartup.email}
            </h2>
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
        )}

        {/* Phases and Tasks */}
        {selectedStartup && phases.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Progress Tracking - {selectedStartup.name || selectedStartup.email}
            </h2>
            
            {phases.map(phase => (
              <div key={phase.id} className="mb-6 border border-gray-200 rounded-lg">
                <div className="p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                </div>
                
                <div className="p-4">
                  {tasksByPhase[phase.id] && (
                    <div className="space-y-3">
                      {tasksByPhase[phase.id].map(task => {
                        const submission = submissionsByTask[task.id];
                        return (
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
                            </div>
                            
                            {/* Mentor Feedback Section */}
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Mentor Feedback</h5>
                              <textarea
                                value={feedback[task.id] || ''}
                                onChange={(e) => handleFeedbackChange(task.id, e.target.value)}
                                placeholder="Provide feedback for this task..."
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                rows={3}
                              />
                              
                              <div className="flex items-center justify-between mt-2">
                                <select
                                  value={status[task.id] || task.status}
                                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                  <option value="PENDING">Pending</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="COMPLETED">Completed</option>
                                  <option value="REJECTED">Rejected</option>
                                </select>
                                
                                <button
                                  onClick={() => handleSaveFeedback(task.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Save Feedback
                                </button>
                              </div>
                              
                              {saveStatus[task.id] && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {saveStatus[task.id]}
                                </div>
                              )}
                            </div>
                            
                            {/* Submission Display */}
                            {submission && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <h5 className="text-sm font-medium text-gray-900 mb-2">Submitted Work</h5>
                                <div className="bg-gray-50 rounded p-2">
                                  <p className="text-sm text-gray-600">
                                    {submission.description || 'No description provided'}
                                  </p>
                                  {submission.fileUrl && (
                                    <a
                                      href={submission.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      View Submitted File
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 