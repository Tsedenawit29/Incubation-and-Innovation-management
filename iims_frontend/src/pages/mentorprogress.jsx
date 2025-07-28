import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { getStartupsForMentor } from '../api/mentorAssignment';
import { getAssignedTemplatesForStartup, getPhases, getTasks, getSubmissions, uploadSubmissionFile, updateSubmission } from '../api/progresstracking';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

export default function Mentorprogress() {
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

  // Calculate progress statistics for selected startup
  const totalTasks = phases.reduce((sum, p) => sum + (tasksByPhase[p.id]?.length || 0), 0);
  const completedTasks = phases.reduce((sum, p) => sum + (tasksByPhase[p.id]?.filter(t => {
    const submission = submissionsByTask[t.id];
    return submission && (status[t.id] === 'COMPLETED' || submission.status === 'COMPLETED');
  }).length || 0), 0);
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Remaining', value: totalTasks - completedTasks },
  ];
  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <div className="min-h-screen flex flex-col items-center bg-brand-dark p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mb-8">
        <h1 className="text-2xl font-bold mb-4 text-brand-primary">Mentor Dashboard</h1>
        <p className="mb-2 text-brand-dark">Welcome, Mentor!</p>
        <p className="mb-4 text-brand-dark">Your ID: <span className="font-mono">{user?.id || id}</span></p>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-brand-primary mb-2">Assigned Startups</h2>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {startups.length === 0 ? (
            <p className="text-gray-500">No startups assigned yet.</p>
          ) : (
            <ul className="list-disc pl-5">
              {startups.map(s => (
                <li key={s.id}>
                  <button className={`text-brand-primary underline ${selectedStartup?.id === s.id ? 'font-bold' : ''}`} onClick={() => setSelectedStartup(s)}>{s.fullName || s.email}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {selectedStartup && (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mb-8">
          <h2 className="text-xl font-bold text-brand-primary mb-4">Progress Tracking for {selectedStartup.fullName || selectedStartup.email}</h2>
          {templates.length === 0 ? (
            <p className="text-gray-500">No progress templates assigned.</p>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Template</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  onChange={e => fetchPhasesForTemplate(e.target.value)}
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              {phases.length === 0 ? (
                <p className="text-gray-500">No phases found for this template.</p>
              ) : (
                <div className="space-y-4">
                  {phases.map(p => {
                    const phaseTasks = tasksByPhase[p.id] || [];
                    return (
                      <div key={p.id} className="bg-gray-50 rounded-xl shadow p-4 border transition-all">
                        <h4 className="text-lg font-semibold text-brand-primary mb-2">{p.name}</h4>
                        <div className="space-y-2">
                          {phaseTasks.length === 0 ? (
                            <div className="text-gray-400 italic">No tasks found.</div>
                          ) : phaseTasks.map(t => {
                            const submission = submissionsByTask[t.id];
                            return (
                              <div key={t.id} className="flex flex-col gap-2 bg-white rounded p-3 shadow-sm border">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">{t.taskName}</div>
                                    <div className="text-xs text-gray-500">{t.description}</div>
                                    <div className="text-xs text-gray-400">Due in {t.dueDays} days</div>
                                  </div>
                                </div>
                                {/* Submission file */}
                                {submission && submission.submissionFileUrl ? (
                                  <a href={submission.submissionFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Submission</a>
                                ) : (
                                  <div className="text-xs text-gray-400">No submission yet.</div>
                                )}
                                {/* Feedback UI */}
                                <div className="mt-2">
                                  <label className="block text-xs font-medium">Your Feedback:</label>
                                  <textarea className="w-full border rounded px-2 py-1 text-xs" rows={2} value={feedback[t.id] || ''} onChange={e => handleFeedbackChange(t.id, e.target.value)} />
                                </div>
                                {/* Status UI */}
                                <div className="flex items-center gap-2 mt-2">
                                  <label className="text-xs">Status:</label>
                                  <select className="border rounded px-2 py-1 text-xs" value={status[t.id] || submission?.status || ''} onChange={e => handleStatusChange(t.id, e.target.value)}>
                                    <option value="">Select status</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                  </select>
                                  <button className="bg-green-600 text-white px-2 py-1 rounded text-xs" onClick={() => handleSaveFeedback(t.id)}>Save</button>
                                  <span className="text-xs ml-2">{saveStatus[t.id]}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
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