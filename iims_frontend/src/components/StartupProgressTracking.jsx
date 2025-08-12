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
  Calendar
} from 'lucide-react';
import { getAssignedTemplatesForStartup, getPhases, getTasks, uploadSubmissionFile, createSubmission, getSubmissions, updateSubmission } from '../api/progresstracking';

export default function StartupProgressTracking({ userId, token }) {
  // State hooks
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const [expandedPhases, setExpandedPhases] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UNDER_REVIEW':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NEEDS_REVISION':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'OVERDUE':
        return 'bg-red-200 text-red-900 border-red-300';
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        return '📋 Submitted';
      case 'UNDER_REVIEW':
        return '👁️ Under Review';
      case 'PENDING':
        return '⏳ Pending Review';
      case 'REJECTED':
        return '❌ Rejected';
      case 'NEEDS_REVISION':
        return '🔄 Needs Revision';
      case 'IN_PROGRESS':
        return '🚧 In Progress';
      case 'OVERDUE':
        return '⚠️ Overdue';
      case 'NOT_STARTED':
        return '⏳ Not Started';
      default:
        return '⏳ Not Started';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SUBMITTED':
        return <Eye className="w-5 h-5 text-blue-500" />;
      case 'UNDER_REVIEW':
        return <Eye className="w-5 h-5 text-indigo-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'REJECTED':
      case 'NEEDS_REVISION':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // Main functions
  const fetchPhases = async (templateId) => {
    if (!templateId) return;
    setLoading(true);
    try {
      console.log('=== STARTING PHASES FETCH ===');
      console.log('Template ID:', templateId);
      console.log('Token exists:', !!token);
      const phasesData = await getPhases(token, templateId);
      console.log('Phases fetched:', phasesData.length);
      setPhases(phasesData);
      setExpandedPhases(phasesData.map(phase => phase.id));
      
      const allTasks = [];
      for (const phase of phasesData) {
        try {
          const phaseTasks = await getTasks(token, phase.id);
          const tasksWithPhaseId = phaseTasks.map(task => ({ ...task, phaseId: phase.id }));
          allTasks.push(...tasksWithPhaseId);
        } catch (error) {
          console.error(`Failed to fetch tasks for phase ${phase.id}:`, error);
        }
      }
      setTasks(allTasks);
      
      try {
        console.log('=== STARTING SUBMISSION FETCH ===');
        console.log('Fetching submissions for startup:', userId);
        console.log('Token exists:', !!token);
        const submissionsData = await getSubmissions(token);
        console.log('=== SUBMISSION FETCH COMPLETED ===');
        console.log('Fetched submissions:', submissionsData.length);
        console.log('All submissions data:', submissionsData);
        
        // Filter submissions for this startup only
        const startupSubmissions = submissionsData.filter(sub => {
          console.log('Checking submission:', {
            id: sub.id,
            startupId: sub.startupId,
            userId: sub.userId,
            taskId: sub.taskId,
            status: sub.status,
            mentorFeedback: sub.mentorFeedback,
            feedback: sub.feedback,
            score: sub.score
          });
          console.log('Current userId:', userId, typeof userId);
          console.log('Submission startupId:', sub.startupId, typeof sub.startupId);
          console.log('Submission userId:', sub.userId, typeof sub.userId);
          const matches = sub.startupId === userId || sub.userId === userId;
          console.log('Submission matches:', matches);
          return matches;
        });
        
        console.log('Filtered startup submissions:', startupSubmissions.length);
        console.log('All startup submissions:', startupSubmissions);
        setSubmissions(startupSubmissions);
      } catch (error) {
        console.error('=== SUBMISSION FETCH ERROR ===');
        console.error('Failed to fetch submissions:', error);
        console.error('Error details:', error.message, error.stack);
        setSubmissions([]);
      }
    } catch (e) {
      console.error('Failed to load phases:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files, taskId, description) => {
    setSubmitting(true);
    setUploadStatus(prev => ({ ...prev, [taskId]: 'Creating submission...' }));
    
    try {
      console.log('Creating submission for task:', taskId);
      console.log('Files to upload:', files.length);
      console.log('Description:', description);
      
      // Create submission with null trackingId, the actual taskId, and startup ID
      console.log('Creating submission with userId (startupId):', userId);
      const submission = await createSubmission(null, taskId, token, userId);
      console.log('Created submission:', submission);
      console.log('Submission created:', submission);
      
      setUploadStatus(prev => ({ ...prev, [taskId]: 'Uploading files...' }));
      
      // Upload all files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1}/${files.length}:`, file.name);
        setUploadStatus(prev => ({ ...prev, [taskId]: `Uploading file ${i + 1}/${files.length}: ${file.name}` }));
        await uploadSubmissionFile(file, submission.id, token);
      }
      
      setUploadStatus(prev => ({ ...prev, [taskId]: 'Finalizing submission...' }));
      
      // Update submission with description and status
      const updateData = {
        status: 'SUBMITTED',
        submissionDate: new Date().toISOString()
      };
      
      // Add description if provided
      if (description && description.trim()) {
        updateData.comments = description.trim();
      }
      
      await updateSubmission(submission.id, updateData, token);
      
      console.log('Submission status updated to SUBMITTED');
      setUploadStatus(prev => ({ ...prev, [taskId]: 'Submission completed successfully!' }));
      
      // Show success message
      alert('Work submitted successfully! Your mentor will review it soon.');
      
      // Clear form and close modal
      setSubmissionFiles([]);
      setSubmissionDescription('');
      setShowSubmissionModal(false);
      setSelectedTask(null);
      
      // Refresh phases to update UI
      if (selectedTemplate) {
        await fetchPhases(selectedTemplate.id);
      }
    } catch (e) {
      console.error('Failed to submit work:', e);
      const errorMessage = e.message || 'Unknown error occurred';
      setUploadStatus(prev => ({ ...prev, [taskId]: `Submission failed: ${errorMessage}` }));
      alert(`Submission failed: ${errorMessage}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalSubmit = async () => {
    if (!selectedTask) {
      alert('No task selected. Please try again.');
      return;
    }
    
    if (!submissionDescription.trim() && submissionFiles.length === 0) {
      alert('Please provide either a description or upload files before submitting.');
      return;
    }
    
    if (!submissionDescription.trim()) {
      alert('Please provide a description of your work.');
      return;
    }
    
    console.log('Submitting work for task:', selectedTask.id);
    console.log('Files:', submissionFiles.length);
    console.log('Description length:', submissionDescription.trim().length);
    
    await handleFileUpload(submissionFiles, selectedTask.id, submissionDescription);
  };

  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered - forcing fresh data fetch');
    if (selectedTemplate) {
      setLoading(true);
      try {
        // Force a fresh fetch of all data including submissions
        await fetchPhases(selectedTemplate.id);
        console.log('Manual refresh completed');
      } catch (error) {
        console.error('Manual refresh failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const togglePhaseExpansion = (phaseId) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  // Effects
  useEffect(() => {
    console.log('=== COMPONENT INITIALIZATION ===');
    console.log('UserId:', userId);
    console.log('Token exists:', !!token);
    
    if (!userId || !token) {
      console.log('Missing userId or token, skipping initialization');
      return;
    }
    
    console.log('Fetching assigned templates...');
    getAssignedTemplatesForStartup(userId, token)
      .then(data => {
        console.log('Templates fetched:', data.length);
        setTemplates(data);
        if (data && data.length > 0) {
          console.log('Setting selected template:', data[0].id);
          setSelectedTemplate(data[0]);
          console.log('About to call fetchPhases...');
          fetchPhases(data[0].id);
        } else {
          console.log('No templates found');
        }
      })
      .catch(error => {
        console.error('TEMPLATE FETCH ERROR:', error);
        setTemplates([]);
      });
  }, [userId, token]);

  // Add periodic refresh to get updated feedback
  useEffect(() => {
    if (!selectedTemplate) return;
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing submissions for feedback updates...');
      fetchPhases(selectedTemplate.id);
    }, 10000); // 10 seconds for faster feedback sync
    
    return () => clearInterval(interval);
  }, [selectedTemplate, token]);

  // Loading state
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

  // No templates state
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
        </div>
      </div>
    );
  }

  // Main render
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-blue-900">📊 Progress Overview</h3>
              <button
                onClick={handleManualRefresh}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                title="Refresh to see latest feedback"
              >
                🔄 Refresh
              </button>
            </div>
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
                    submissions.some(sub => sub.taskId === task.id && (sub.status === 'APPROVED' || sub.status === 'COMPLETED'))
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
                    submissions.some(sub => sub.taskId === task.id && (sub.status === 'APPROVED' || sub.status === 'COMPLETED'))
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
                                console.log('=== PROCESSING TASK ===');
                                console.log('Task ID:', task.id);
                                console.log('Total submissions available:', submissions.length);
                                console.log('All submissions:', submissions);
                                
                                const taskSubmission = submissions.find(sub => sub.taskId === task.id);
                                console.log('Found task submission:', taskSubmission);
                                
                                const hasSubmitted = taskSubmission && (['SUBMITTED', 'COMPLETED', 'APPROVED', 'REJECTED', 'NEEDS_REVISION', 'UNDER_REVIEW', 'PENDING'].includes(taskSubmission.status));
                                const isPending = taskSubmission && (['PENDING', 'IN_PROGRESS'].includes(taskSubmission.status));
                                const needsAction = taskSubmission && (['NEEDS_REVISION'].includes(taskSubmission.status));
                                
                                // Also check if there's any feedback for this task in all submissions (not just this startup's)
                                const taskFeedback = submissions.find(sub => sub.taskId === task.id && (sub.mentorFeedback || sub.feedback));
                              
                                return (
                                  <div key={task.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          {getStatusIcon(taskSubmission?.status || 'PENDING')}
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
                                          <div className="mb-3">
                                            <h6 className="font-medium text-gray-700 text-sm mb-1">Deliverables:</h6>
                                            <p className="text-gray-600 text-sm">{task.deliverables}</p>
                                          </div>
                                        )}
                                        
                                        {task.dueDate && (
                                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                            <Calendar size={16} />
                                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="ml-4">
                                        {hasSubmitted ? (
                                          <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(taskSubmission.status)}`}>
                                              {getStatusText(taskSubmission.status)}
                                            </span>
                                            {needsAction && (
                                              <button
                                                onClick={() => {
                                                  setSelectedTask(task);
                                                  setShowSubmissionModal(true);
                                                }}
                                                className="px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 transition-colors"
                                              >
                                                🔄 Resubmit
                                              </button>
                                            )}
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              setSelectedTask(task);
                                              setShowSubmissionModal(true);
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                                          >
                                            📝 Submit Work
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Mentor Feedback - Always Visible */}
                                     <div className="mt-4 pt-4 border-t border-gray-200">
                                       <div className="mt-3 p-4 rounded-lg border-2 bg-gray-50 border-gray-200">
                                         <div className="flex items-center gap-2 mb-2">
                                           <MessageCircle className="w-4 h-4 text-gray-600" />
                                           <span className="text-sm font-medium text-gray-900">Mentor Feedback</span>
                                         </div>
                                         {(() => {
                                           // Debug logging for feedback
                                           console.log('Task submission for feedback check:', {
                                             taskId: task.id,
                                             submissionId: taskSubmission?.id,
                                             mentorFeedback: taskSubmission?.mentorFeedback,
                                             feedback: taskSubmission?.feedback,
                                             score: taskSubmission?.score,
                                             status: taskSubmission?.status,
                                             feedbackDate: taskSubmission?.feedbackDate
                                           });
                                           
                                           return (taskSubmission?.mentorFeedback || taskSubmission?.feedback) ? (
                                             <div>
                                               <p className="text-sm text-gray-800">{taskSubmission.mentorFeedback || taskSubmission.feedback}</p>
                                               {taskSubmission?.score && (
                                                 <div className="flex items-center gap-2 mt-2">
                                                   <Star className="w-4 h-4 text-yellow-500" />
                                                   <span className="text-sm font-medium text-yellow-700">Score: {taskSubmission.score}/10</span>
                                                 </div>
                                               )}
                                             </div>
                                           ) : (
                                             <p className="text-sm text-gray-500">No feedback provided yet</p>
                                           );
                                         })()}
                                       </div>
                                       
                                       {taskSubmission?.feedbackDate && (
                                         <p className="text-xs mt-2 text-gray-500">
                                           Reviewed: {new Date(taskSubmission.feedbackDate).toLocaleDateString()}
                                         </p>
                                       )}
                                     </div>

                                     {/* Task Submission Status */}
                                     {taskSubmission && (
                                       <div className="mt-4 pt-4 border-t border-gray-200">
                                         <div className="flex items-center justify-between mb-2">
                                           <div className="flex items-center gap-2">
                                             {getStatusIcon(taskSubmission.status)}
                                             <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(taskSubmission.status)}`}>
                                               {getStatusText(taskSubmission.status)}
                                             </span>
                                           </div>
                                           {taskSubmission.submissionDate && (
                                             <span className="text-xs text-gray-500">
                                               Submitted: {new Date(taskSubmission.submissionDate).toLocaleDateString()}
                                             </span>
                                           )}
                                         </div>
                                        
                                        {/* Submission Files */}
                                        {taskSubmission && (taskSubmission.files && taskSubmission.files.length > 0 || taskSubmission.submissionFileUrl) && (
                                          <div className="mt-3">
                                            <h6 className="text-sm font-medium text-gray-700 mb-2">Submitted Files:</h6>
                                            <div className="space-y-1">
                                              {taskSubmission.files && taskSubmission.files.map((file, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                                                  <FileText className="w-4 h-4" />
                                                  <span className="flex-1">{file.name}</span>
                                                  <span className="text-xs text-gray-500">
                                                    {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                                                  </span>
                                                  <button 
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                    title="Download file"
                                                    onClick={() => {
                                                      // TODO: Implement file download
                                                      console.log('Download file:', file);
                                                    }}
                                                  >
                                                    <Download className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              ))}
                                              {taskSubmission.submissionFileUrl && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                                                  <FileText className="w-4 h-4" />
                                                  <span className="flex-1">Submission File</span>
                                                  <button 
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                    title="Download file"
                                                    onClick={() => {
                                                      window.open(taskSubmission.submissionFileUrl, '_blank');
                                                    }}
                                                  >
                                                    <Download className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
      
      {/* Submission Modal */}
      {showSubmissionModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
                        const validFiles = [];
                        const invalidFiles = [];
                        
                        files.forEach(file => {
                          if (file.size <= maxSize) {
                            validFiles.push(file);
                          } else {
                            invalidFiles.push(file);
                          }
                        });
                        
                        if (invalidFiles.length > 0) {
                          alert(`The following files exceed the 10MB limit and were not added:\n${invalidFiles.map(f => f.name).join('\n')}`);
                        }
                        
                        setSubmissionFiles(validFiles);
                      }}
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
