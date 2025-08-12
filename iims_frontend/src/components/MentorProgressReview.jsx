import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Download, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Star,
  TrendingUp,
  FileText,
  User,
  Calendar,
  Send,
  ThumbsUp,
  ThumbsDown,
  Edit,
  X,
  ChevronDown,
  ChevronRight,
  Upload
} from 'lucide-react';
import { getSubmissions, updateSubmission, getTasks, getPhases, getTemplates, getStartupsForMentor, getSubmissionFiles, deleteSubmission } from '../api/progresstracking';

export default function MentorProgressReview({ mentorId, token }) {
  const [submissions, setSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [phases, setPhases] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [assignedStartups, setAssignedStartups] = useState([]);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [expandedPhases, setExpandedPhases] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmission, setFeedbackSubmission] = useState(null);

  useEffect(() => {
    fetchData();
  }, [mentorId]);

  const fetchData = async () => {
    if (!mentorId || !token) {
      console.log('Missing mentorId or token:', { mentorId, token: !!token });
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching data for mentor:', mentorId);
      
      // Fetch data with proper error handling for each API call
      const [submissionsData, tasksData, phasesData, templatesData, assignedStartupsData, submissionFilesData] = await Promise.allSettled([
        getSubmissions(token),
        getTasks(token),
        getPhases(token),
        getTemplates(token),
        getStartupsForMentor(mentorId, token),
        getSubmissionFiles(token)
      ]);
      
      // Process results with error handling
      const submissions = submissionsData.status === 'fulfilled' ? submissionsData.value : [];
      const tasks = tasksData.status === 'fulfilled' ? tasksData.value : [];
      const phases = phasesData.status === 'fulfilled' ? phasesData.value : [];
      const templates = templatesData.status === 'fulfilled' ? templatesData.value : [];
      const assignedStartups = assignedStartupsData.status === 'fulfilled' ? assignedStartupsData.value : [];
      const submissionFiles = submissionFilesData.status === 'fulfilled' ? submissionFilesData.value : [];
      
      console.log('Fetched data:', {
        submissions: submissions.length,
        tasks: tasks.length,
        phases: phases.length,
        templates: templates.length,
        assignedStartups: assignedStartups.length,
        submissionFiles: submissionFiles.length
      });
      
      // Log any failed requests
      if (submissionsData.status === 'rejected') console.error('Failed to fetch submissions:', submissionsData.reason);
      if (tasksData.status === 'rejected') console.error('Failed to fetch tasks:', tasksData.reason);
      if (phasesData.status === 'rejected') console.error('Failed to fetch phases:', phasesData.reason);
      if (templatesData.status === 'rejected') console.error('Failed to fetch templates:', templatesData.reason);
      if (assignedStartupsData.status === 'rejected') console.error('Failed to fetch assigned startups:', assignedStartupsData.reason);
      if (submissionFilesData.status === 'rejected') console.error('Failed to fetch submission files:', submissionFilesData.reason);
      
      setSubmissions(submissions);
      setTasks(tasks);
      setPhases(phases);
      setTemplates(templates);
      setAssignedStartups(assignedStartups);
      setSubmissionFiles(submissionFiles);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  const getTaskById = (taskId) => {
    return tasks.find(t => t.id === taskId);
  };

  const getPhaseById = (phaseId) => {
    return phases.find(p => p.id === phaseId);
  };

  const getTemplateById = (templateId) => {
    return templates.find(t => t.id === templateId);
  };

  const getMentorSubmissions = () => {
    console.log('Getting mentor submissions...');
    console.log('Total submissions:', submissions.length);
    console.log('Assigned startups:', assignedStartups.length);
    
    // Log all submissions for debugging
    submissions.forEach((sub, index) => {
      console.log(`Submission ${index + 1}:`, {
        id: sub.id,
        startupId: sub.startupId,
        userId: sub.userId,
        taskId: sub.taskId,
        status: sub.status,
        submissionDate: sub.submissionDate
      });
    });
    
    // Log all assigned startups for debugging
    assignedStartups.forEach((assignment, index) => {
      console.log(`Assigned startup ${index + 1}:`, {
        id: assignment.id,
        startupId: assignment.startup?.id || assignment.startupId,
        startupEmail: assignment.startup?.email,
        startupName: assignment.startup?.fullName
      });
    });
    
    // If no assigned startups yet, show all submissions (for testing)
    if (assignedStartups.length === 0) {
      console.log('No assigned startups, showing all submissions');
      return submissions;
    }
    
    // Filter submissions to only show those from assigned startups
    const assignedStartupIds = assignedStartups.map(assignment => {
      const startupId = assignment.startup?.id || assignment.startupId || assignment.userId;
      console.log('Assigned startup ID:', startupId);
      return startupId;
    }).filter(Boolean);
    
    console.log('Assigned startup IDs:', assignedStartupIds);
    
    const filteredSubmissions = submissions.filter(submission => {
      console.log('Checking submission:', submission.id, 'startupId:', submission.startupId, 'userId:', submission.userId);
      // Check if submission belongs to an assigned startup (check both startupId and userId fields)
      const belongsViaStartupId = assignedStartupIds.includes(submission.startupId);
      const belongsViaUserId = assignedStartupIds.includes(submission.userId);
      const belongs = belongsViaStartupId || belongsViaUserId;
      console.log('Submission belongs to assigned startup:', belongs, '(via startupId:', belongsViaStartupId, ', via userId:', belongsViaUserId, ')');
      return belongs;
    });
    
    console.log('Filtered submissions:', filteredSubmissions.length);
    return filteredSubmissions;
  };

  const getFileUrl = (submission) => {
    console.log('Checking file URL for submission:', submission.id);
    console.log('Submission file URL:', submission.submissionFileUrl);
    
    // First check if submission has a direct file URL
    if (submission.submissionFileUrl) {
      // If it's already a full URL, return it
      if (submission.submissionFileUrl.startsWith('http')) {
        console.log('Full URL found:', submission.submissionFileUrl);
        return submission.submissionFileUrl;
      }
      // Otherwise, construct the full URL
      const fullUrl = `http://localhost:8081${submission.submissionFileUrl}`;
      console.log('Constructed full URL:', fullUrl);
      return fullUrl;
    }
    
    // If no direct URL, check submission files
    const submissionFile = submissionFiles.find(sf => sf.submission?.id === submission.id);
    if (submissionFile && submissionFile.fileUrl) {
      console.log('Found submission file:', submissionFile);
      if (submissionFile.fileUrl.startsWith('http')) {
        console.log('Full URL found in submission file:', submissionFile.fileUrl);
        return submissionFile.fileUrl;
      }
      const fullUrl = `http://localhost:8081${submissionFile.fileUrl}`;
      console.log('Constructed full URL from submission file:', fullUrl);
      return fullUrl;
    }
    
    console.log('No file URL found for submission:', submission.id);
    return null;
  };

  const handleReviewSubmission = (submission) => {
    console.log('Opening review for submission:', submission);
    setSelectedSubmission(submission);
    setFeedback(submission.mentorFeedback || '');
    setScore(submission.score?.toString() || '');
    setStatus(submission.status || 'PENDING');
  };

  const handleSubmitReview = async () => {
    if (!selectedSubmission) return;
    
    setLoading(true);
    try {
      console.log('Updating submission:', selectedSubmission.id);
      console.log('Update data:', { mentorFeedback: feedback, score: parseInt(score) || 0, status: status });
      
      await updateSubmission(selectedSubmission.id, {
        mentorFeedback: feedback,
        score: parseInt(score) || 0,
        status: status
      }, token);
      
      console.log('Submission updated successfully');
      
      // Refresh data
      await fetchData();
      setSelectedSubmission(null);
      setFeedback('');
      setScore('');
      setStatus('PENDING');
    } catch (e) {
      console.error('Failed to update submission:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (submissionId, newStatus) => {
    setLoading(true);
    try {
      console.log('Updating submission status:', submissionId, 'to', newStatus);
      
      const updateData = {
        status: newStatus,
        feedbackDate: new Date().toISOString()
      };
      
      // Add default feedback for quick updates
      if (newStatus === 'APPROVED') {
        updateData.mentorFeedback = updateData.mentorFeedback || 'Approved by mentor';
        updateData.score = updateData.score || 8;
      } else if (newStatus === 'NEEDS_REVISION') {
        updateData.mentorFeedback = updateData.mentorFeedback || 'Needs revision - please review and resubmit';
      } else if (newStatus === 'REJECTED') {
        updateData.mentorFeedback = updateData.mentorFeedback || 'Rejected - does not meet requirements';
      }
      
      await updateSubmission(submissionId, updateData, token);
      
      console.log('Submission updated successfully');
      
      // Refresh data to show updated status
      await fetchData();
      
      // Show success notification
      alert(`Submission ${newStatus.toLowerCase()} successfully!`);
    } catch (e) {
      console.error('Failed to update submission:', e);
      alert('Failed to update submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this submission? This will also delete all associated files. This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      console.log('Deleting submission:', submissionId);
      await deleteSubmission(submissionId, token);
      console.log('Submission deleted successfully');
      
      // Refresh data to remove deleted submission
      await fetchData();
      
      alert('Submission deleted successfully!');
    } catch (e) {
      console.error('Failed to delete submission:', e);
      
      // Provide more specific error messages
      if (e.message.includes('foreign key constraint') || e.message.includes('DataIntegrityViolationException')) {
        alert('Cannot delete submission: This submission has associated files that must be removed first. Please contact your system administrator to resolve this database constraint issue.');
      } else if (e.message.includes('500')) {
        alert('Server error occurred while deleting submission. The submission may have associated files that prevent deletion. Please try again later or contact support.');
      } else {
        alert('Failed to delete submission. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
      case 'OVERDUE':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
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
      case 'OVERDUE':
        return 'bg-red-200 text-red-900 border-red-300';
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

  const togglePhaseExpansion = (phaseId) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const handleFeedbackModal = (submission) => {
    setFeedbackSubmission(submission);
    setFeedback(submission.mentorFeedback || '');
    setScore(submission.score || '');
    setStatus(submission.status || 'PENDING');
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackSubmission) return;
    
    try {
      setLoading(true);
      const updateData = {
        status,
        mentorFeedback: feedback,
        score: score ? parseInt(score) : null
      };
      
      await updateSubmission(feedbackSubmission.id, updateData, token);
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === feedbackSubmission.id 
          ? { ...sub, ...updateData }
          : sub
      ));
      
      setShowFeedbackModal(false);
      setFeedbackSubmission(null);
      setFeedback('');
      setScore('');
      setStatus('PENDING');
      
      // Add success notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'Feedback submitted successfully!'
      }]);
      
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to submit feedback. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Get available templates for mentor
  const getAvailableTemplates = () => {
    const templateIds = [...new Set(filteredSubmissions.map(sub => {
      const task = getTaskById(sub.taskId);
      if (!task) return null;
      const phase = getPhaseById(task.phaseId);
      return phase ? phase.templateId : null;
    }).filter(Boolean))];
    
    return templates.filter(template => templateIds.includes(template.id));
  };

  // Filter submissions based on mentor's assigned startups
  const filteredSubmissions = getMentorSubmissions().filter(submission => {
    const matchesStatus = filterStatus === 'ALL' || submission.status === filterStatus;
    const task = getTaskById(submission.taskId);
    const matchesSearch = !searchTerm || 
      (task && task.taskName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (submission.description && submission.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Get structured data for phase-based view
  const getStructuredData = () => {
    if (!selectedTemplate) return { phases: [], tasks: [] };
    
    const templatePhases = phases.filter(phase => phase.templateId === selectedTemplate.id);
    const templateTasks = tasks.filter(task => 
      templatePhases.some(phase => phase.id === task.phaseId)
    );
    
    return {
      phases: templatePhases,
      tasks: templateTasks
    };
  };

  const getTaskSubmissions = (taskId) => {
    return filteredSubmissions.filter(sub => sub.taskId === taskId);
  };

  // Group submissions by template and phase (legacy function for backward compatibility)
  const groupedSubmissions = () => {
    const groups = {};
    
    filteredSubmissions.forEach(submission => {
      const task = getTaskById(submission.taskId);
      if (!task) return;
      
      const phase = getPhaseById(task.phaseId);
      if (!phase) return;
      
      const template = getTemplateById(phase.templateId);
      if (!template) return;
      
      const templateKey = template.id;
      const phaseKey = phase.id;
      
      if (!groups[templateKey]) {
        groups[templateKey] = {
          template,
          phases: {}
        };
      }
      
      if (!groups[templateKey].phases[phaseKey]) {
        groups[templateKey].phases[phaseKey] = {
          phase,
          tasks: {}
        };
      }
      
      const taskKey = task.id;
      if (!groups[templateKey].phases[phaseKey].tasks[taskKey]) {
        groups[templateKey].phases[phaseKey].tasks[taskKey] = {
          task,
          submissions: []
        };
      }
      
      groups[templateKey].phases[phaseKey].tasks[taskKey].submissions.push(submission);
    });
    
    return groups;
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Progress Review</h2>
            <p className="text-gray-600">Review and provide feedback on startup submissions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Total Submissions: {submissions.length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="NEEDS_REVISION">Needs Revision</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Template Selection */}
      {getAvailableTemplates().length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Available Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAvailableTemplates().map(template => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setExpandedPhases([]);
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

      {/* Auto-select first template if only one available */}
      {getAvailableTemplates().length === 1 && !selectedTemplate && (
        <div style={{ display: 'none' }}>
          {(() => {
            const firstTemplate = getAvailableTemplates()[0];
            if (firstTemplate && !selectedTemplate) {
              setSelectedTemplate(firstTemplate);
            }
            return null;
          })()}
        </div>
      )}

      {/* Selected Template Progress Review */}
      {selectedTemplate && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h2>
            <p className="text-gray-600">{selectedTemplate.description}</p>
          </div>

          {/* Progress Overview */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 Review Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Total Phases:</span>
                <span className="ml-2 text-blue-700">{getStructuredData().phases.length}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Total Tasks:</span>
                <span className="ml-2 text-blue-700">{getStructuredData().tasks.length}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Pending Reviews:</span>
                <span className="ml-2 text-blue-700">
                  {filteredSubmissions.filter(sub => sub.status === 'SUBMITTED' || sub.status === 'PENDING').length}
                </span>
              </div>
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-4">
            {getStructuredData().phases.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Phases Found</h3>
                <p className="text-gray-600">This template doesn't have any phases configured.</p>
              </div>
            ) : (
              getStructuredData().phases.map(phase => {
                const phaseTasks = getStructuredData().tasks.filter(task => task.phaseId === phase.id);
                const isExpanded = expandedPhases.includes(phase.id);
                const phaseSubmissions = phaseTasks.reduce((acc, task) => acc + getTaskSubmissions(task.id).length, 0);
                
                return (
                  <div key={phase.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Phase Header */}
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-teal-600 text-white p-4 cursor-pointer hover:from-blue-600 hover:to-teal-700 transition-all"
                      onClick={() => togglePhaseExpansion(phase.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{phase.name}</h3>
                            <p className="text-blue-100 text-sm">{phase.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                            {phaseSubmissions} submission{phaseSubmissions !== 1 ? 's' : ''}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Phase Tasks */}
                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        {phaseTasks.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No tasks in this phase</p>
                        ) : (
                          phaseTasks.map(task => {
                            const taskSubmissions = getTaskSubmissions(task.id);
                            
                            return (
                              <div key={task.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                {/* Task Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <h4 className="font-medium text-gray-900">{task.name}</h4>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                      {taskSubmissions.length} submission{taskSubmissions.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                                
                                {task.description && (
                                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                )}

                                {/* Task Submissions */}
                                {taskSubmissions.length === 0 ? (
                                  <p className="text-gray-500 text-sm">No submissions for this task</p>
                                ) : (
                                  <div className="space-y-3">
                                    {taskSubmissions.map(submission => {
                                      const fileUrl = getFileUrl(submission);
                                      
                                      return (
                                        <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                          {/* Submission Header */}
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                              <User className="w-4 h-4 text-gray-500" />
                                              <span className="text-sm font-medium text-gray-700">
                                                Startup ID: {submission.startupId || submission.userId || 'Unknown'}
                                              </span>
                                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                                                {getStatusText(submission.status)}
                                              </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {submission.submissionDate ? new Date(submission.submissionDate).toLocaleDateString() : 'Unknown date'}
                                            </div>
                                          </div>

                                          {/* Submission Description */}
                                          {submission.description && (
                                            <div className="mb-3">
                                              <p className="text-sm text-gray-700">
                                                <span className="font-medium">Description:</span> {submission.description}
                                              </p>
                                            </div>
                                          )}

                                          {/* File Download */}
                                          {fileUrl && (
                                            <div className="mb-3">
                                              <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                              >
                                                <Download className="w-4 h-4" />
                                                Download Submitted File
                                              </a>
                                            </div>
                                          )}

                                          {/* Mentor Feedback Display */}
                                          {submission.mentorFeedback && (
                                            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                              <div className="flex items-center gap-2 mb-1">
                                                <MessageCircle className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-900">Your Feedback:</span>
                                              </div>
                                              <p className="text-sm text-blue-800">{submission.mentorFeedback}</p>
                                              {submission.score && (
                                                <div className="flex items-center gap-2 mt-2">
                                                  <Star className="w-4 h-4 text-yellow-500" />
                                                  <span className="text-sm font-medium text-blue-900">Score: {submission.score}/10</span>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Action Buttons */}
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                              onClick={() => handleQuickStatusUpdate(submission.id, 'APPROVED')}
                                              disabled={loading || submission.status === 'APPROVED'}
                                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                            >
                                              <ThumbsUp className="w-3 h-3 inline mr-1" />
                                              Approve
                                            </button>
                                            <button
                                              onClick={() => handleQuickStatusUpdate(submission.id, 'NEEDS_REVISION')}
                                              disabled={loading || submission.status === 'NEEDS_REVISION'}
                                              className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                            >
                                              <Edit className="w-3 h-3 inline mr-1" />
                                              Revision
                                            </button>
                                            <button
                                              onClick={() => handleQuickStatusUpdate(submission.id, 'REJECTED')}
                                              disabled={loading || submission.status === 'REJECTED'}
                                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                            >
                                              <ThumbsDown className="w-3 h-3 inline mr-1" />
                                              Reject
                                            </button>
                                            <button
                                              onClick={() => handleFeedbackModal(submission)}
                                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors"
                                            >
                                              <MessageCircle className="w-3 h-3 inline mr-1" />
                                              Feedback
                                            </button>
                                            <button
                                              onClick={() => handleDeleteSubmission(submission.id)}
                                              disabled={loading}
                                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                            >
                                              <X className="w-3 h-3 inline mr-1" />
                                              Delete
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* No Template Selected */}
      {!selectedTemplate && getAvailableTemplates().length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions to Review</h3>
            <p className="text-gray-600 mb-4">
              No startup submissions are available for review at this time.
            </p>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Review Submission</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Task Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {getTaskById(selectedSubmission.taskId)?.taskName}
                </h4>
                <p className="text-gray-600">
                  {getTaskById(selectedSubmission.taskId)?.description}
                </p>
              </div>

              {/* File Download */}
              {getFileUrl(selectedSubmission) && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Submitted File</span>
                  </div>
                  <a
                    href={getFileUrl(selectedSubmission)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4" />
                    Download and Review
                  </a>
                </div>
              )}

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="NEEDS_REVISION">Needs Revision</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter score (1-10)"
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide detailed feedback..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && feedbackSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Provide Feedback</h3>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Task Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">
                  {getTaskById(feedbackSubmission.taskId)?.name}
                </h4>
                <p className="text-gray-600 text-sm">
                  Startup ID: {feedbackSubmission.startupId || feedbackSubmission.userId || 'Unknown'}
                </p>
                <p className="text-gray-600 text-sm">
                  Submitted: {feedbackSubmission.submissionDate ? new Date(feedbackSubmission.submissionDate).toLocaleDateString() : 'Unknown date'}
                </p>
              </div>

              {/* File Download */}
              {getFileUrl(feedbackSubmission) && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Submitted File</span>
                  </div>
                  <a
                    href={getFileUrl(feedbackSubmission)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4" />
                    Download and Review
                  </a>
                </div>
              )}

              {/* Status Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="NEEDS_REVISION">Needs Revision</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Score */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter score (1-10)"
                />
              </div>

              {/* Feedback */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide detailed feedback..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
