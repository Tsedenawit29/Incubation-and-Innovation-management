import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { getMentorsForStartup } from '../api/mentorAssignment';
import { getAssignedTemplatesForStartup, getPhases, getTasks, uploadSubmissionFile, createSubmission } from '../api/progresstracking';
import { getTenantUsersByRole } from '../api/users';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

export default function StartupDashboard() {
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

  // File upload handler
  const handleFileUpload = async (file, phaseId, taskId) => {
    setUploadStatus(prev => ({ ...prev, [taskId]: 'Uploading...' }));
    try {
      // Find or create a ProgressSubmission for this startup, template, and task
      // For simplicity, assume one template is selected and one tracking per startup/template
      // You may need to fetch or create a StartupProgressTracking (not shown here)
      // For now, mock trackingId as `${id}-${selectedTemplate?.id}`
      const trackingId = `${id}-${selectedTemplate?.id}`; // TODO: Replace with real trackingId from backend
      // Create the submission
      const submission = await createSubmission(trackingId, taskId);
      // Upload the file
      await uploadSubmissionFile(file, submission.id, token);
      setUploadStatus(prev => ({ ...prev, [taskId]: 'Uploaded!' }));
    } catch (e) {
      setUploadStatus(prev => ({ ...prev, [taskId]: 'Failed to upload' }));
    }
  };

  // Calculate progress statistics
  const totalTasks = phases.reduce((sum, p) => sum + (tasksByPhase[p.id]?.length || 0), 0);
  const completedTasks = phases.reduce((sum, p) => sum + (tasksByPhase[p.id]?.filter(t => t.status === 'COMPLETED').length || 0), 0);
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Remaining', value: totalTasks - completedTasks },
  ];
  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <div className="min-h-screen flex flex-col items-center bg-brand-dark p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mb-8">
        <h1 className="text-2xl font-bold mb-4 text-brand-primary">Startup Dashboard</h1>
        <p className="mb-2 text-brand-dark">Welcome, Startup user!</p>
        <p className="mb-4 text-brand-dark">Your ID: <span className="font-mono">{id}</span></p>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-brand-primary mb-2">Assigned Mentors</h2>
          {mentors.length === 0 ? (
            <p className="text-gray-500">No mentors assigned yet.</p>
          ) : (
            <ul className="list-disc pl-5">
              {mentors.map(m => (
                <li key={m.id}>{m.fullName || m.email}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold text-brand-primary mb-4">Progress Tracking</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {templates.length === 0 ? (
          <div>
            <p className="text-gray-500">No progress templates assigned yet.</p>
            {/* Guide for adding phases as Tenant Admin */}
            {user?.role === 'TENANT_ADMIN' && (
              <p className="text-xs text-blue-600 mt-2">Tip: After creating a template, select it in Progress Tracking Management and click "New Phase" to add phases.</p>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Template</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={selectedTemplate?.id || ''}
                onChange={e => {
                  const t = templates.find(t => t.id === e.target.value);
                  handleSelectTemplate(t);
                }}
              >
                <option value="">Select a template...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            {phases.length === 0 ? (
              <div>
                <p className="text-gray-500">No phases found for this template.</p>
                {/* Guide for adding phases as Tenant Admin */}
                {user?.role === 'TENANT_ADMIN' && (
                  <p className="text-xs text-blue-600 mt-2">Tip: Add phases for this template in Progress Tracking Management.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {phases.map(p => {
                  const expanded = expandedPhases.includes(p.id);
                  const phaseTasks = tasksByPhase[p.id] || [];
                  return (
                    <div key={p.id} className="bg-gray-50 rounded-xl shadow p-4 border transition-all">
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
                            ▼
                          </button>
                          <h4 className="text-lg font-semibold text-brand-primary">{p.name}</h4>
                          <span className="text-xs text-gray-500">Order: {p.orderIndex}</span>
                        </div>
                      </div>
                      {/* Animated expand/collapse */}
                      <div
                        className={`transition-all duration-300 overflow-hidden ${expanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="space-y-2">
                          {expanded && (
                            <button
                              className="bg-brand-primary text-white px-3 py-1 rounded flex items-center gap-2 mb-2"
                              onClick={() => fetchTasks(p.id)}
                            >
                              Load Tasks
                            </button>
                          )}
                          {expanded && phaseTasks.length === 0 ? (
                            <div className="text-gray-400 italic">No tasks found.</div>
                          ) : expanded && phaseTasks.map(t => (
                            <div key={t.id} className="flex flex-col gap-2 bg-white rounded p-3 shadow-sm border">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{t.taskName}</div>
                                  <div className="text-xs text-gray-500">{t.description}</div>
                                  <div className="text-xs text-gray-400">Due in {t.dueDays} days</div>
                                </div>
                                {/* TODO: Add file upload, status, feedback, etc. */}
                              </div>
                              {/* File upload UI */}
                              <div className="flex items-center gap-2 mt-2">
                                <input type="file" className="border rounded px-2 py-1" onChange={e => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleFileUpload(file, p.id, t.id);
                                  }
                                }} />
                                <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={e => {
                                  e.preventDefault();
                                  const fileInput = e.target.parentNode.querySelector('input[type=file]');
                                  const file = fileInput && fileInput.files[0];
                                  if (file) {
                                    handleFileUpload(file, p.id, t.id);
                                  }
                                }}>Upload</button>
                                <span className="text-xs ml-2">{uploadStatus[t.id]}</span>
                              </div>
                              {/* Feedback UI */}
                              <div className="mt-2">
                                <label className="block text-xs font-medium">Mentor Feedback:</label>
                                <textarea className="w-full border rounded px-2 py-1 text-xs" rows={2} readOnly value={t.mentorFeedback || ''} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Progress Visualization */}
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl mt-8">
        <h3 className="text-lg font-bold text-brand-primary mb-2">Progress Overview</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2">
            <div className="mb-2 text-sm">{completedTasks} of {totalTasks} tasks completed</div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="text-xs text-gray-500">{progressPercent}% completed</div>
          </div>
          <div className="w-full md:w-1/2 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="mt-6 bg-brand-primary hover:bg-brand-dark text-white px-4 py-2 rounded w-full max-w-xs font-semibold shadow"
      >
        Logout
      </button>
    </div>
  );
} 