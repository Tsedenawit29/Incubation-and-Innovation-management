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
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { getAssignedTemplatesForStartup, getPhases, getTasks, uploadSubmissionFile, createSubmission, getSubmissions, updateSubmission } from '../api/progresstracking';

export default function StartupProgressTracking({ userId, token }) {
  console.log('🔥 IMMEDIATE: StartupProgressTracking called with:', { userId, token: !!token });
  console.log('🔍 ACTUAL TOKEN VALUE:', token);
  console.log('🔍 TOKEN TYPE:', typeof token);
  
  // ALL HOOKS MUST BE CALLED FIRST - React Rules of Hooks
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
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Define fetchPhases function BEFORE it's used
  const fetchPhases = async (templateId) => {
    console.log('🔄 FETCH PHASES: Starting for template:', templateId);
    if (!templateId) return;
    
    setLoading(true);
    try {
      console.log('🚀 FETCH PHASES: Calling getPhases with token...');
      const phasesData = await getPhases(templateId, token);
      console.log('✅ FETCH PHASES: Phases data:', phasesData);
      setPhases(phasesData);
      
      // Auto-expand all phases
      setExpandedPhases(phasesData.map(phase => phase.id));
      
      // Fetch all tasks for all phases
      const allTasks = [];
      for (const phase of phasesData) {
        try {
          console.log('🔄 FETCH PHASES: Getting tasks for phase:', phase.id);
          const phaseTasks = await getTasks(phase.id, token);
          console.log('✅ FETCH PHASES: Tasks for phase', phase.id, ':', phaseTasks);
          // Ensure each task has the correct phaseId
          const tasksWithPhaseId = phaseTasks.map(task => ({
            ...task,
            phaseId: phase.id
          }));
          allTasks.push(...tasksWithPhaseId);
        } catch (error) {
          console.error(`❌ FETCH PHASES: Failed to fetch tasks for phase ${phase.id}:`, error);
        }
      }
      
      setTasks(allTasks);
      console.log('🎉 FETCH PHASES: All tasks loaded:', allTasks.length);
      
      // Fetch submissions
      try {
        console.log('🔄 FETCH PHASES: Getting submissions...');
        const submissionsData = await getSubmissions(token);
        console.log('✅ FETCH PHASES: Submissions data:', submissionsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
        setSubmissions([]);
      }
    } catch (e) {
      console.error('Failed to load phases:', e);
    } finally {
      setLoading(false);
    }
  };

  const togglePhaseExpansion = (phaseId) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const handleTemplateChange = async (template) => {
    setSelectedTemplate(template);
    setPhases([]);
    setTasks([]);
    setSubmissions([]);
    setExpandedPhases([]);
    if (template) {
      await fetchPhases(template.id);
    }
  };

  const handleFileUpload = async (files, taskId, description) => {
    setSubmitting(true);
    try {
      // Create submission first with description
      const submission = await createSubmission(description, taskId, token);
      
      // Upload all files
      for (const file of files) {
        await uploadSubmissionFile(file, submission.id, token);
      }
      
      setUploadStatus(prev => ({ ...prev, [taskId]: 'Submitted successfully!' }));
      
      // Reset form and close modal
      setSubmissionFiles([]);
      setSubmissionDescription('');
      setShowSubmissionModal(false);
      setSelectedTask(null);
      
      // Refresh data
      if (selectedTemplate) {
        await fetchPhases(selectedTemplate.id);
      }
    } catch (e) {
      console.error('Failed to submit work:', e);
      setUploadStatus(prev => ({ ...prev, [taskId]: `Submission failed: ${e.message}` }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWork = () => {
    if (selectedTask) {
      setShowSubmissionModal(true);
    }
  };

  const handleModalSubmit = async () => {
    if (selectedTask && (submissionFiles.length > 0 || submissionDescription.trim())) {
      await handleFileUpload(submissionFiles, selectedTask.id, submissionDescription);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <Eye className="w-5 h-5 text-blue-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'REJECTED':
      case 'NEEDS_REVISION':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
      case 'NEEDS_REVISION':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return '✅ Approved';
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return '👁️ Under Review';
      case 'PENDING':
        return '⏳ Pending';
      case 'REJECTED':
        return '❌ Rejected';
      case 'NEEDS_REVISION':
        return '🔄 Needs Revision';
      case 'IN_PROGRESS':
        return '🚧 In Progress';
      default:
        return '⏳ Not Started';
    }
  };

  // useEffect MUST be called after all useState hooks
  useEffect(() => {
    console.log('🔄 USEEFFECT: TRIGGERED!');
    console.log('🔄 USEEFFECT: userId:', userId, 'token exists:', !!token);
    console.log('🔄 USEEFFECT: userId type:', typeof userId, 'token type:', typeof token);
    
    if (!userId || !token) {
      console.log('⚠️ USEEFFECT: Skipping - missing props');
      return;
    }

    console.log('🚀 USEEFFECT: About to call API...');
    
    // Direct API call with token
    getAssignedTemplatesForStartup(userId, token)
      .then(data => {
        console.log('✅ USEEFFECT: API SUCCESS - templates:', data);
        setTemplates(data);
        
        // Fetch phases and tasks for each template
        if (data && data.length > 0) {
          // Select the first template by default and fetch its details
          setSelectedTemplate(data[0]);
          fetchPhases(data[0].id);
        }
      })
      .catch(error => {
        console.error('❌ USEEFFECT: API ERROR:', error);
        setTemplates([]); // Ensure templates stays as array on error
      });
  }, [userId, token]);

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading progress tracking...</p>
        </div>
      </div>
    );
  }

  // Manual function to load templates (bypassing hooks)
  const manualLoadTemplates = async () => {
    console.log('🚨 MANUAL LOAD: Button clicked - calling API directly');
    try {
      const data = await getAssignedTemplatesForStartup(userId, token);
      console.log('🚨 MANUAL LOAD: API SUCCESS:', data);
      setTemplates(data);
      
      if (data && data.length > 0) {
        console.log('🚨 MANUAL LOAD: Setting selected template and calling fetchPhases');
        setSelectedTemplate(data[0]);
        fetchPhases(data[0].id);
      }
    } catch (error) {
      console.error('🚨 MANUAL LOAD: API ERROR:', error);
    }
  };

  // Show templates if available
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-lg p-8">
          <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Assigned</h3>
          <p className="text-gray-600 mb-4">
            No progress tracking templates have been assigned to you yet. 
            Contact your mentor or administrator for template assignment.
          </p>
          
          {/* DEBUG BUTTON - Remove after testing */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">🔧 Debug Mode</h4>
            <p className="text-sm text-yellow-700 mb-3">
              React hooks are not executing. Click below to manually load templates:
            </p>
            <button
              onClick={manualLoadTemplates}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚨 Manual Load Templates
            </button>
            <div className="mt-2 text-xs text-yellow-600">
              UserId: {userId} | Token: {token ? 'Present' : 'Missing'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Debug templates state
  console.log('🔍 TEMPLATES STATE:', templates, 'TYPE:', typeof templates, 'IS_ARRAY:', Array.isArray(templates));
  console.log('🔍 TEMPLATES LENGTH:', templates.length);
  console.log('🔍 TEMPLATES CONTENT:', JSON.stringify(templates, null, 2));

  // Render templates with full phase/task structure
  return (
    <div className="space-y-6">
      {/* Template Selection */}
      {templates.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Your Assigned Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  fetchPhases(template.id);
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-gray-600 text-sm mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h2>
            <p className="text-gray-600">{selectedTemplate.description}</p>
          </div>

          {/* Progress Overview */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 Progress Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Total Phases:</span>
                <span className="ml-2 text-blue-700">{phases.length}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Total Tasks:</span>
                <span className="ml-2 text-blue-700">{tasks.length}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Completed Tasks:</span>
                <span className="ml-2 text-blue-700">
                  {tasks.filter(task => 
                    submissions.some(sub => sub.taskId === task.id && sub.status === 'APPROVED')
                  ).length}
                </span>
              </div>
            </div>
          </div>

          {/* Phases and Tasks */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading phases and tasks...</p>
            </div>
          ) : phases.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Phases Found</h4>
              <p className="text-gray-600">This template doesn't have any phases configured yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Phases & Tasks</h3>
              {phases
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map(phase => {
                  const phaseTasks = tasks.filter(task => task.phaseId === phase.id);
                  const completedTasks = phaseTasks.filter(task => 
                    submissions.some(sub => sub.taskId === task.id && sub.status === 'APPROVED')
                  );
                  const isExpanded = expandedPhases.includes(phase.id);
                  
                  return (
                    <div key={phase.id} className="border border-gray-200 rounded-lg">
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => togglePhaseExpansion(phase.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              completedTasks.length === phaseTasks.length && phaseTasks.length > 0
                                ? 'bg-green-500'
                                : completedTasks.length > 0
                                ? 'bg-yellow-500'
                                : 'bg-gray-400'
                            }`}>
                              {phase.orderIndex}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{phase.name}</h4>
                              <p className="text-gray-600 text-sm">{phase.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500">
                              {completedTasks.length}/{phaseTasks.length} tasks completed
                            </div>
                            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phase Tasks */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          {phaseTasks.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No tasks in this phase</p>
                          ) : (
                            <div className="space-y-3">
                              {phaseTasks.map(task => {
                                const taskSubmission = submissions.find(sub => sub.taskId === task.id);
                                const isCompleted = taskSubmission?.status === 'APPROVED';
                                const isPending = taskSubmission?.status === 'PENDING';
                                
                                return (
                                  <div key={task.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          {isCompleted ? (
                                            <CheckCircle size={20} className="text-green-500" />
                                          ) : isPending ? (
                                            <Clock size={20} className="text-yellow-500" />
                                          ) : (
                                            <AlertCircle size={20} className="text-gray-400" />
                                          )}
                                          <h5 className="font-medium text-gray-900">{task.name}</h5>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                                        
                                        {task.requirements && (
                                          <div className="mb-3">
                                            <h6 className="font-medium text-gray-700 text-sm mb-1">Requirements:</h6>
                                            <p className="text-gray-600 text-sm">{task.requirements}</p>
                                          </div>
                                        )}
                                        
                                        {task.deliverables && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Submit Work: {selectedTask.name}</h3>
            <button
              onClick={() => {
                setShowSubmissionModal(false);
                setSelectedTask(null);
                setSubmissionFiles([]);
                setSubmissionDescription('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Task Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Task Description</h4>
              <p className="text-gray-700 text-sm mb-3">{selectedTask.description}</p>
              
              {selectedTask.requirements && (
                <div className="mb-3">
                  <h5 className="font-medium text-gray-800 text-sm mb-1">Requirements:</h5>
                  <p className="text-gray-600 text-sm">{selectedTask.requirements}</p>
                </div>
              )}
              
              {selectedTask.deliverables && (
                <div>
                  <h5 className="font-medium text-gray-800 text-sm mb-1">Expected Deliverables:</h5>
                  <p className="text-gray-600 text-sm">{selectedTask.deliverables}</p>
                </div>
              )}
            </div>
            
            {/* Submission Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Description *
              </label>
              <textarea
                value={submissionDescription}
                onChange={(e) => setSubmissionDescription(e.target.value)}
                placeholder="Describe your work, approach, and any notes for the mentor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                required
              />
            </div>
            
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSubmissionFiles(Array.from(e.target.files))}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip,.rar"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload files</p>
                  <p className="text-xs text-gray-500">PDF, DOC, images, ZIP files up to 10MB each</p>
                </label>
              </div>
              
              {/* Selected Files */}
              {submissionFiles.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h5>
                  <div className="space-y-1">
                    {submissionFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          onClick={() => {
                            const newFiles = submissionFiles.filter((_, i) => i !== index);
                            setSubmissionFiles(newFiles);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Upload Status */}
            {uploadStatus[selectedTask.id] && (
              <div className={`p-3 rounded-lg ${
                uploadStatus[selectedTask.id].includes('failed') 
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : uploadStatus[selectedTask.id].includes('success')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {uploadStatus[selectedTask.id]}
              </div>
            )}
          </div>
          
          {/* Modal Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowSubmissionModal(false);
                setSelectedTask(null);
                setSubmissionFiles([]);
                setSubmissionDescription('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleModalSubmit}
              disabled={submitting || (!submissionDescription.trim() && submissionFiles.length === 0)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                '📝 Submit Work'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
);
}