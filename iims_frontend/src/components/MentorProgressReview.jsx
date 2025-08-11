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
  X
} from 'lucide-react';
import { getSubmissions, updateSubmission, getTasks, getPhases, getTemplates, getStartupsForMentor, getSubmissionFiles } from '../api/progresstracking';

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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'startups'
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchData();
  }, [mentorId]);

  const fetchData = async () => {
    if (!mentorId || !token) return;
    
    setLoading(true);
    try {
      console.log('Fetching data for mentor:', mentorId);
      const [submissionsData, tasksData, phasesData, templatesData, assignedStartupsData, submissionFilesData] = await Promise.all([
        getSubmissions(),
        getTasks(),
        getPhases(),
        getTemplates(),
        getStartupsForMentor(mentorId),
        getSubmissionFiles()
      ]);
      
      console.log('Fetched data:', {
        submissions: submissionsData.length,
        tasks: tasksData.length,
        phases: phasesData.length,
        templates: templatesData.length,
        assignedStartups: assignedStartupsData.length,
        submissionFiles: submissionFilesData.length
      });
      
      setSubmissions(submissionsData);
      setTasks(tasksData);
      setPhases(phasesData);
      setTemplates(templatesData);
      setAssignedStartups(assignedStartupsData);
      setSubmissionFiles(submissionFilesData);
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
    // For now, show all submissions to mentors
    // In the future, this could be filtered by mentor assignment
    return submissions;
  };

  const getSubmissionsForStartup = (startupId) => {
    return submissions.filter(submission => {
      const task = getTaskById(submission.taskId);
      const phase = task ? getPhaseById(task.phaseId) : null;
      const template = phase ? getTemplateById(phase.templateId) : null;
      
      // Check if this submission belongs to the selected startup
      // This would need to be enhanced based on your data structure
      return true; // For now, show all submissions
    });
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

  const generateNotifications = () => {
    const notifications = [];
    
    // Check for new submissions
    const newSubmissions = submissions.filter(s => s.status === 'PENDING');
    if (newSubmissions.length > 0) {
      notifications.push({
        id: 'new-submissions',
        type: 'info',
        title: 'New Submissions',
        message: `${newSubmissions.length} new submission(s) waiting for review`,
        icon: 'FileText'
      });
    }
    
    // Check for overdue submissions
    const overdueSubmissions = submissions.filter(s => s.status === 'OVERDUE');
    if (overdueSubmissions.length > 0) {
      notifications.push({
        id: 'overdue-submissions',
        type: 'warning',
        title: 'Overdue Submissions',
        message: `${overdueSubmissions.length} submission(s) are overdue`,
        icon: 'AlertCircle'
      });
    }
    
    // Check for completed submissions
    const completedSubmissions = submissions.filter(s => s.status === 'COMPLETED');
    if (completedSubmissions.length > 0) {
      notifications.push({
        id: 'completed-submissions',
        type: 'success',
        title: 'Completed Submissions',
        message: `${completedSubmissions.length} submission(s) have been completed`,
        icon: 'CheckCircle'
      });
    }
    
    return notifications;
  };

  const handleReviewSubmission = (submission) => {
    console.log('Opening review for submission:', submission);
    console.log('Current submission status:', submission.status);
    console.log('Current submission feedback:', submission.mentorFeedback);
    console.log('Current submission score:', submission.score);
    
    setSelectedSubmission(submission);
    setFeedback(submission.mentorFeedback || '');
    setScore(submission.score?.toString() || '');
    setStatus(submission.status || 'PENDING');
    
    console.log('Set form values:', {
      feedback: submission.mentorFeedback || '',
      score: submission.score?.toString() || '',
      status: submission.status || 'PENDING'
    });
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
      case 'OVERDUE':
        return '⚠️ Overdue';
      default:
        return '⏳ Not Started';
    }
  };

  // Quick status update function for checkbox-style interactions
  const handleQuickStatusUpdate = async (submissionId, newStatus) => {
    setLoading(true);
    try {
      await updateSubmission(submissionId, {
        status: newStatus,
        feedbackDate: new Date().toISOString()
      }, token);
      
      // Refresh data to show updated status
      await fetchData();
    } catch (e) {
      console.error('Failed to update submission status:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = getMentorSubmissions().filter(submission => {
    const task = getTaskById(submission.taskId);
    const phase = task ? getPhaseById(task.phaseId) : null;
    const template = phase ? getTemplateById(phase.templateId) : null;
    
    const matchesStatus = filterStatus === 'ALL' || submission.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      task?.taskName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStats = () => {
    const mentorSubmissions = getMentorSubmissions();
    return {
      total: mentorSubmissions.length,
      completed: mentorSubmissions.filter(s => s.status === 'COMPLETED').length,
      pending: mentorSubmissions.filter(s => s.status === 'PENDING').length,
      overdue: mentorSubmissions.filter(s => s.status === 'OVERDUE').length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}, 100`}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{stats.overdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Assigned Startups</p>
                <p className="text-2xl font-bold text-purple-900">{assignedStartups.length}</p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-2 mb-6">
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp className="w-4 h-4" />
            Overview
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'startups' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('startups')}
          >
            <User className="w-4 h-4" />
            My Startups
          </button>
        </div>

        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
            
            {/* Notifications */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Notifications</h4>
              <div className="space-y-3">
                {generateNotifications().map(notification => (
                  <div key={notification.id} className={`p-4 rounded-lg border-l-4 ${
                    notification.type === 'info' ? 'bg-blue-50 border-blue-400' :
                    notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    notification.type === 'success' ? 'bg-green-50 border-green-400' :
                    'bg-gray-50 border-gray-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      {notification.icon === 'FileText' && <FileText className="w-5 h-5 text-blue-600" />}
                      {notification.icon === 'AlertCircle' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                      {notification.icon === 'CheckCircle' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      <div>
                        <h5 className="font-medium text-gray-900">{notification.title}</h5>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {generateNotifications().length === 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-600" />
                      <div>
                        <h5 className="font-medium text-gray-900">All Caught Up!</h5>
                        <p className="text-sm text-gray-600">No new notifications at this time.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Assigned Startups */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Your Assigned Startups</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedStartups.map(assignment => (
                  <div key={assignment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {assignment.startup?.fullName || assignment.startup?.email || 'Unknown Startup'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'startups' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Startups & Submissions</h3>
            
            {/* Startup Selection */}
            {!selectedStartup ? (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Select a Startup to Review</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedStartups.map(assignment => (
                    <div 
                      key={assignment.id} 
                      className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => setSelectedStartup(assignment)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {assignment.startup?.fullName || assignment.startup?.email || 'Unknown Startup'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          View Submissions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Selected Startup Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedStartup(null)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      ← Back to Startups
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {selectedStartup.startup?.fullName || selectedStartup.startup?.email || 'Unknown Startup'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Assigned: {new Date(selectedStartup.assignedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search tasks or templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </div>
                </div>

                {/* Submissions List */}
                <div className="space-y-4">
                  {filteredSubmissions.map(submission => {
                    const task = getTaskById(submission.taskId);
                    const phase = task ? getPhaseById(task.phaseId) : null;
                    const template = phase ? getTemplateById(phase.templateId) : null;
                    
                    return (
                      <div key={submission.id} className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(submission.status)}
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {task?.taskName || 'Unknown Task'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {template?.name} • {phase?.name}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{task?.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                <span>Score: {submission.score || 'Not scored'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                              {getStatusText(submission.status)}
                            </span>
                            
                            {/* Quick Status Update Checkboxes */}
                            <div className="flex items-center gap-2 ml-4">
                              <div className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  id={`approve-${submission.id}`}
                                  checked={submission.status === 'APPROVED' || submission.status === 'COMPLETED'}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleQuickStatusUpdate(submission.id, 'APPROVED');
                                    }
                                  }}
                                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                />
                                <label htmlFor={`approve-${submission.id}`} className="text-sm text-green-600 font-medium">
                                  Approve
                                </label>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  id={`revision-${submission.id}`}
                                  checked={submission.status === 'NEEDS_REVISION'}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleQuickStatusUpdate(submission.id, 'NEEDS_REVISION');
                                    }
                                  }}
                                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <label htmlFor={`revision-${submission.id}`} className="text-sm text-orange-600 font-medium">
                                  Needs Revision
                                </label>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  id={`reject-${submission.id}`}
                                  checked={submission.status === 'REJECTED'}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleQuickStatusUpdate(submission.id, 'REJECTED');
                                    }
                                  }}
                                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                />
                                <label htmlFor={`reject-${submission.id}`} className="text-sm text-red-600 font-medium">
                                  Reject
                                </label>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleReviewSubmission(submission)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ml-4"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Add Feedback
                            </button>
                          </div>
                        </div>

                        {/* Submission File */}
                        {getFileUrl(submission) && (
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">Submitted File:</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => window.open(getFileUrl(submission), '_blank')}
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  Preview
                                </button>
                                <span className="text-gray-400">|</span>
                                <a
                                  href={getFileUrl(submission)}
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Mentor Feedback */}
                        {submission.mentorFeedback && (
                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">Your Feedback:</span>
                            </div>
                            <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{submission.mentorFeedback}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredSubmissions.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Found</h3>
                      <p className="text-gray-600">No submissions match your current filters.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}


      </div>



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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Submitted File</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(getFileUrl(selectedSubmission), '_blank')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <a
                        href={getFileUrl(selectedSubmission)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PENDING">Pending Review</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter score..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide detailed feedback..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
} 