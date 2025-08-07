import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  Download,
  MessageCircle,
  Star,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react';
import { getAssignedTemplatesForStartup, getPhases, getTasks, uploadSubmissionFile, createSubmission, getSubmissions, updateSubmission } from '../api/progresstracking';

export default function StartupProgressTracking({ userId, token }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const [expandedPhases, setExpandedPhases] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [userId]);

  const fetchTemplates = async () => {
    if (!userId || !token) return;
    
    setLoading(true);
    try {
      const data = await getAssignedTemplatesForStartup(userId);
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0]);
        fetchPhases(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load templates:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhases = async (templateId) => {
    setLoading(true);
    try {
      const phasesData = await getPhases(templateId);
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
      
      // Fetch submissions
      const submissionsData = await getSubmissions();
      setSubmissions(submissionsData);
    } catch (e) {
      console.error('Failed to load phases:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    setPhases([]);
    setTasks([]);
    setSubmissions([]);
    if (template) {
      fetchPhases(template.id);
    }
  };

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const handleFileUpload = async (file, taskId) => {
    setUploadStatus(prev => ({ ...prev, [taskId]: 'Uploading...' }));
    try {
      console.log('Starting file upload for task:', taskId);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      console.log('Token available:', !!token);
      
      // Create submission first
      console.log('Creating submission...');
      const submission = await createSubmission(null, taskId, token);
      console.log('Submission created:', submission);
      
      // Then upload file
      console.log('Uploading file...');
      const uploadResult = await uploadSubmissionFile(file, submission.id, token);
      console.log('File upload result:', uploadResult);
      
      setUploadStatus(prev => ({ ...prev, [taskId]: 'Uploaded!' }));
      
      // Refresh data
      fetchPhases(selectedTemplate.id);
    } catch (e) {
      console.error('Failed to upload file:', e);
      console.error('Error details:', e.message);
      setUploadStatus(prev => ({ ...prev, [taskId]: `Upload failed: ${e.message}` }));
    }
  };

  const getTaskStatus = (taskId) => {
    const submission = submissions.find(s => s.taskId === taskId);
    return submission?.status || 'PENDING';
  };

  const getPhaseProgress = (phaseId) => {
    const phaseTasks = tasks.filter(t => t.phaseId === phaseId);
    const completedTasks = phaseTasks.filter(task => {
      const submission = submissions.find(s => s.taskId === task.id);
      return submission?.status === 'COMPLETED';
    });
    return phaseTasks.length > 0 ? Math.round((completedTasks.length / phaseTasks.length) * 100) : 0;
  };

  const getProgressStats = () => {
    const allTasks = tasks;
    const completedTasks = allTasks.filter(task => {
      const submission = submissions.find(s => s.taskId === task.id);
      return submission?.status === 'COMPLETED';
    });
    return {
      total: allTasks.length,
      completed: completedTasks.length,
      percentage: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0
    };
  };

  const getTemplateProgress = () => {
    return getProgressStats().percentage;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'OVERDUE':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Beautiful Progress Visualization */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-xl p-8 border border-blue-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Progress Tracking
            </h2>
            <p className="text-gray-600 text-lg">Track your incubation journey with detailed insights</p>
          </div>
          <div className="flex items-center gap-8">
            {/* Enhanced Progress Circle */}
            <div className="text-center">
              <div className="w-32 h-32 relative">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-transparent"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    strokeDasharray={`${getTemplateProgress()}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {getTemplateProgress()}%
                    </div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Progress Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-green-600">{getProgressStats().completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-orange-600">{getProgressStats().total - getProgressStats().completed}</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-700">Overall Progress</span>
            <span className="text-lg font-semibold text-gray-700">{getTemplateProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div 
                              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${getTemplateProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Enhanced Phase Progress Bars */}
        {phases.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Phase Progress</h4>
            {phases.map(phase => {
              const phaseProgress = getPhaseProgress(phase.id);
              return (
                <div key={phase.id} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        phaseProgress >= 80 ? 'bg-green-100' :
                        phaseProgress >= 50 ? 'bg-yellow-100' :
                        phaseProgress >= 20 ? 'bg-orange-100' :
                        'bg-red-100'
                      }`}>
                        <span className={`font-bold text-lg ${
                          phaseProgress >= 80 ? 'text-green-600' :
                          phaseProgress >= 50 ? 'text-yellow-600' :
                          phaseProgress >= 20 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>{phase.orderIndex}</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">{phase.name}</h5>
                        <p className="text-sm text-gray-600">{phaseProgress}% complete</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        phaseProgress >= 80 ? 'text-green-600' :
                        phaseProgress >= 50 ? 'text-yellow-600' :
                        phaseProgress >= 20 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>{phaseProgress}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                        phaseProgress >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        phaseProgress >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        phaseProgress >= 20 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${phaseProgress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Template Selector */}
      {templates.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Template
          </label>
          <select
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const template = templates.find(t => t.id === e.target.value);
              handleTemplateChange(template);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Phases and Tasks */}
      {selectedTemplate && (
        <div className="space-y-4">
          {phases.map(phase => {
            const phaseTasks = tasks.filter(t => t.phaseId === phase.id);
            const phaseProgress = getPhaseProgress(phase.id);
            const expanded = expandedPhases.includes(phase.id);
            
            return (
              <div key={phase.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border-b border-gray-100"
                  onClick={() => togglePhase(phase.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                        phaseProgress >= 80 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                        phaseProgress >= 50 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        phaseProgress >= 20 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-red-400 to-red-600'
                      }`}>
                        <span className="font-bold text-white text-xl">{phase.orderIndex}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{phase.name}</h3>
                        <p className="text-sm text-gray-600">{phaseTasks.length} tasks • {phaseProgress}% complete</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          phaseProgress >= 80 ? 'text-green-600' :
                          phaseProgress >= 50 ? 'text-yellow-600' :
                          phaseProgress >= 20 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>{phaseProgress}%</div>
                        <div className="text-xs text-gray-600">Complete</div>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                        phaseProgress >= 80 ? 'bg-green-100' :
                        phaseProgress >= 50 ? 'bg-yellow-100' :
                        phaseProgress >= 20 ? 'bg-orange-100' :
                        'bg-red-100'
                      }`}>
                        <TrendingUp className={`w-6 h-6 ${
                          phaseProgress >= 80 ? 'text-green-600' :
                          phaseProgress >= 50 ? 'text-yellow-600' :
                          phaseProgress >= 20 ? 'text-orange-600' :
                          'text-red-600'
                        }`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className={`transition-all duration-300 overflow-hidden ${
                  expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="border-t border-gray-200 p-6">
                    <div className="space-y-4">
                      {phaseTasks.map(task => {
                        const status = getTaskStatus(task.id);
                        const submission = submissions.find(s => s.taskId === task.id);
                        
                        return (
                          <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(status)}
                                <div>
                                  <h4 className="font-medium text-gray-900">{task.taskName}</h4>
                                  <p className="text-sm text-gray-600">{task.description}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                {status}
                              </span>
                            </div>

                            {/* Task Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
                              </div>
                              {task.mentorId && task.mentorName && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <User className="w-4 h-4" />
                                  <span>Mentor: {task.mentorName}</span>
                                </div>
                              )}
                            </div>

                            {/* File Upload Section */}
                            {!submission && (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <div className="text-center">
                                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600 mb-2">Upload your submission</p>
                                  <p className="text-xs text-gray-500 mb-3">Accepted: PDF, Word, Images, Text (Max 10MB)</p>
                                  <input
                                    type="file"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        // Validate file size (max 10MB)
                                        if (file.size > 10 * 1024 * 1024) {
                                          alert('File size must be less than 10MB');
                                          return;
                                        }
                                        // Validate file type
                                        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain'];
                                        if (!allowedTypes.includes(file.type)) {
                                          alert('Please upload PDF, Word, image, or text files only');
                                          return;
                                        }
                                        handleFileUpload(file, task.id);
                                      }
                                    }}
                                    className="hidden"
                                    id={`file-${task.id}`}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                  />
                                  <label
                                    htmlFor={`file-${task.id}`}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                                  >
                                    Choose File
                                  </label>
                                </div>
                                {uploadStatus[task.id] && (
                                  <div className="text-center mt-3">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm">
                                      {uploadStatus[task.id].includes('Uploading') && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                      )}
                                      <span className={
                                        uploadStatus[task.id].includes('Uploaded') ? 'text-green-600' :
                                        uploadStatus[task.id].includes('failed') ? 'text-red-600' :
                                        'text-blue-600'
                                      }>
                                        {uploadStatus[task.id]}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Submission Details */}
                            {submission && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium">Submission</span>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {new Date(submission.submittedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                {/* File Download */}
                                {submission.submissionFileUrl && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <Download className="w-4 h-4 text-blue-600" />
                                    <a
                                      href={submission.submissionFileUrl}
                                      className="text-blue-600 hover:underline text-sm"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Download Submission
                                    </a>
                                  </div>
                                )}

                                {/* Mentor Feedback */}
                                {submission.mentorFeedback && (
                                  <div className="border-l-4 border-blue-500 pl-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <MessageCircle className="w-4 h-4 text-blue-600" />
                                      <span className="font-medium text-sm">Mentor Feedback</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{submission.mentorFeedback}</p>
                                  </div>
                                )}

                                {/* Score */}
                                {submission.score && (
                                  <div className="flex items-center gap-2 mt-3">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium">Score: {submission.score}/100</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!selectedTemplate && templates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Assigned</h3>
          <p className="text-gray-600">You haven't been assigned any progress tracking templates yet.</p>
        </div>
      )}
    </div>
  );
} 