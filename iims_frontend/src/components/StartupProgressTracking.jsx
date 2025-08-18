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
  MessageSquare,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { getAssignedTemplatesForStartup, getPhases, getTasks, uploadSubmissionFile, createSubmission, getSubmissions, updateSubmission } from '../api/progresstracking';

function StartupProgressTracking({ userId, token }) {
  console.log('🔥 COMPONENT RENDER - StartupProgressTracking props:', { userId, tokenExists: !!token });
  console.log('🔥 COMPONENT RENDER - This log should appear if component renders');
  
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [expandedPhases, setExpandedPhases] = useState([]);
  const [loading, setLoading] = useState(false);

  // BYPASS useEffect - Direct initialization call
  console.log('🔥 DIRECT INIT CHECK:', {
    userId: !!userId,
    token: !!token,
    templatesLength: templates.length,
    submissionsLength: submissions.length,
    loading: loading,
    shouldInit: userId && token && templates.length === 0 && !loading
  });
  
  // FORCE SUBMISSION FETCH - Since templates are loaded but submissions are empty
  // Ensure tasks are loaded to allow taskId-based matching fallback
  if (userId && token && templates.length > 0 && tasks.length > 0 && submissions.length === 0 && !loading) {
    console.log('🔥 FORCE SUBMISSION FETCH - Templates loaded but submissions empty');
    // Don't set loading to true here - keep the UI visible while fetching submissions
    getSubmissions(token)
      .then(submissionsData => {
        console.log('🔥 FORCE SUBMISSION SUCCESS:', submissionsData.length);
        console.log('🔥 RAW SUBMISSIONS DATA:', submissionsData);
        
        // Show detailed raw data for debugging
        submissionsData.forEach((sub, index) => {
          console.log(`🔍 RAW SUBMISSION ${index + 1}:`, {
            id: sub.id,
            startupId: sub.startupId,
            userId: sub.userId,
            taskId: sub.taskId,
            status: sub.status,
            submittedAt: sub.submittedAt
          });
        });
        
        console.log('🔍 CURRENT USER ID FOR COMPARISON:', userId);
        
        // TEMPORARY FIX: Since startupId/userId may be null, match by taskId against current user's tasks
        console.log('🔧 APPLYING TEMPORARY FIX: Matching submissions by taskId since startupId/userId may be null');

        // Get all task IDs for the current user (from the tasks state)
        const currentUserTaskIds = tasks.map(task => task.id);
        console.log('🔧 CURRENT USER TASK IDS:', currentUserTaskIds);
        
        let startupSubmissions = submissionsData.filter(sub => {
          if (!sub) {
            console.log('❌ SKIP: Null submission');
            return false;
          }
          
          // Since startupId/userId are null, match by taskId
          const taskMatch = currentUserTaskIds.includes(sub.taskId);
          
          console.log(`🔍 CHECKING SUBMISSION ${sub.id?.substring(0, 8)}:`, {
            submissionTaskId: sub.taskId?.substring(0, 8) + '...',
            taskMatch: taskMatch,
            status: sub.status
          });
          
          if (taskMatch) {
            console.log('✅ TASK MATCH FOUND:', {
              submissionId: sub.id?.substring(0, 8) + '...',
              taskId: sub.taskId?.substring(0, 8) + '...',
              status: sub.status,
              matchType: 'taskId'
            });
          } else {
            console.log('❌ NO TASK MATCH:', {
              submissionId: sub.id?.substring(0, 8) + '...',
              taskId: sub.taskId?.substring(0, 8) + '...',
              reason: 'TaskId not in current user tasks'
            });
          }
          
          return taskMatch;
        });
        
        console.log('🔥 FILTERED SUBMISSIONS:', startupSubmissions.length);
        
        // Fallback: if no matches by startupId/userId, try matching by taskId against tasks we just fetched
        if (startupSubmissions.length === 0) {
          console.warn('⚠️ No submissions matched by startupId/userId. Falling back to taskId-based matching.');
          const taskIds = (Array.isArray(tasks) ? tasks : []).map(t => t.id);
          startupSubmissions = submissionsData.filter(sub => sub && sub.taskId && taskIds.includes(sub.taskId));
          console.log('✅ TASK-ID FALLBACK RESULT:', startupSubmissions.length, 'submissions found by task match');
        }
        
        if (startupSubmissions.length > 0) {
          startupSubmissions.forEach((sub, index) => {
            console.log(`✅ Match ${index + 1}:`, {
              id: sub.id?.substring(0, 8) + '...',
              taskId: sub.taskId?.substring(0, 8) + '...',
              status: sub.status
            });
          });
          
          // FETCH FILES FOR EACH SUBMISSION
          console.log('🔍 FETCHING FILES for', startupSubmissions.length, 'submissions...');
          Promise.all(
            startupSubmissions.map(async (submission) => {
              try {
                console.log(`🔍 Fetching files for submission: ${submission.id?.substring(0, 8)}...`);
                
                // Fetch files for this submission using the submission-files API
                const response = await fetch(`/api/progresstracking/submission-files`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (response.ok) {
                  const allFiles = await response.json();
                  // Filter files for this specific submission
                  const submissionFiles = allFiles.filter(file => file.submission?.id === submission.id);
                  
                  console.log(`✅ Found ${submissionFiles.length} files for submission ${submission.id?.substring(0, 8)}`);
                  
                  return {
                    ...submission,
                    files: submissionFiles
                  };
                } else {
                  console.warn(`❌ Failed to fetch files for submission ${submission.id}: ${response.status}`);
                  return submission;
                }
              } catch (error) {
                console.error(`❌ Error fetching files for submission ${submission.id}:`, error);
                return submission;
              }
            })
          ).then(submissionsWithFiles => {
            console.log('🎉 SUBMISSIONS WITH FILES LOADED:', submissionsWithFiles.length);
            setSubmissions(submissionsWithFiles);
            setLoading(false);
          }).catch(error => {
            console.error('❌ FILE FETCH ERROR:', error);
            setSubmissions(startupSubmissions);
            setLoading(false);
          });
        } else {
          setSubmissions(startupSubmissions);
          // Don't set loading to false here - let the main loading logic handle it
        }
      })
      .catch(error => {
        console.error('🔥 FORCE SUBMISSION ERROR:', error);
        // Don't set loading to false here - let the main loading logic handle it
      });
  }
  
  if (userId && token && templates.length === 0 && !loading) {
    console.log('🔥 DIRECT INIT - Bypassing useEffect, calling data fetch directly');
    setLoading(true);
    getAssignedTemplatesForStartup(userId, token)
      .then(data => {
        console.log('🔥 DIRECT INIT SUCCESS:', data.length);
        setTemplates(data);
        if (data && data.length > 0) {
          setSelectedTemplate(data[0]);
          fetchPhases(data[0].id);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('🔥 DIRECT INIT ERROR:', error);
        setTemplates([]);
        setLoading(false);
      });
  }
  const [uploadStatus, setUploadStatus] = useState({});
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
    if (!templateId || !token) {
      console.log('❌ Missing templateId or token, cannot fetch phases');
      return;
    }
    
    setLoading(true);
    try {
      console.log('=== STARTING PHASES FETCH ===');
      console.log('Template ID:', templateId);
      console.log('Token exists:', !!token);
      
      const phasesData = await getPhases(token, templateId);
      console.log('✅ Phases fetched successfully:', phasesData.length);
      setPhases(phasesData);
      setExpandedPhases(phasesData.map(phase => phase.id));
      
      console.log('=== STARTING TASKS FETCH ===');
      const allTasks = [];
      for (const phase of phasesData) {
        try {
          console.log(`Fetching tasks for phase: ${phase.id}`);
          const phaseTasks = await getTasks(token, phase.id);
          console.log(`✅ Tasks fetched for phase ${phase.id}:`, phaseTasks.length);
          const tasksWithPhaseId = phaseTasks.map(task => ({ ...task, phaseId: phase.id }));
          allTasks.push(...tasksWithPhaseId);
        } catch (error) {
          console.error(`❌ Failed to fetch tasks for phase ${phase.id}:`, error);
        }
      }
      console.log('✅ All tasks fetched successfully:', allTasks.length);
      setTasks(allTasks);
      
      try {
        console.log('=== STARTING SUBMISSION FETCH ===');
        console.log('Fetching submissions for startup:', userId);
        console.log('Token exists:', !!token);
        console.log('Token preview:', token ? `${token.substring(0, 10)}...` : 'MISSING');
        console.log('API call details:', {
          endpoint: '/api/progresstracking/submissions',
          method: 'GET',
          headers: { Authorization: `Bearer ${token ? 'EXISTS' : 'MISSING'}` }
        });
        
        if (!token) {
          console.error('❌ NO TOKEN AVAILABLE - Cannot fetch submissions');
          setSubmissions([]);
          return;
        }
        
        console.log('Making API call to fetch submissions...');
        const submissionsData = await getSubmissions(token);
        console.log('=== SUBMISSION FETCH COMPLETED ===');
        console.log('Raw API response - submissions count:', submissionsData?.length || 0);
        console.log('Raw API response - full data:', submissionsData);
        
        // Check if we got any data at all
        if (!submissionsData) {
          console.error('No submissions data received (null/undefined)');
          setSubmissions([]);
          return;
        }
        
        if (!Array.isArray(submissionsData)) {
          console.error('Invalid submissions data received (not array):', typeof submissionsData, submissionsData);
          setSubmissions([]);
          return;
        }
        
        if (submissionsData.length === 0) {
          console.warn('⚠️ API returned empty submissions array');
          console.warn('This could mean:');
          console.warn('1. No submissions exist in database');
          console.warn('2. Backend filtering is excluding this user');
          console.warn('3. Authentication/authorization issue');
        }
        
        // Filter submissions for this startup only
        console.log('🔍 FILTERING', submissionsData.length, 'submissions for userId:', userId);
        
        // Show ALL submissions for debugging
        if (submissionsData.length > 0) {
          console.log('📋 ALL SUBMISSIONS:');
          submissionsData.forEach((sub, index) => {
            console.log(`${index + 1}:`, {
              id: sub.id?.substring(0, 8) + '...',
              startupId: sub.startupId,
              userId: sub.userId,
              taskId: sub.taskId?.substring(0, 8) + '...',
              status: sub.status
            });
          });
        }
        
        let startupSubmissions = submissionsData.filter(sub => {
          if (!sub) {
            console.warn('Null/undefined submission found, skipping');
            return false;
          }
          
          // Convert both to strings for comparison
          const userIdStr = String(userId).trim();
          const startupIdStr = String(sub.startupId || '').trim();
          const submissionUserIdStr = String(sub.userId || '').trim();
          
          const startupMatch = startupIdStr === userIdStr;
          const userMatch = submissionUserIdStr === userIdStr;
          const matches = startupMatch || userMatch;
          
          if (matches) {
            console.log('✅ MATCH FOUND:', {
              submissionId: sub.id,
              taskId: sub.taskId,
              status: sub.status,
              matchType: startupMatch ? 'startupId' : 'userId'
            });
          }
          
          return matches;
        });
        
        console.log('✅ FILTERED RESULT:', startupSubmissions.length, 'submissions found');

        // Fallback: if no matches by startupId/userId, try matching by taskId against tasks we just fetched
        if (startupSubmissions.length === 0) {
          console.warn('⚠️ No submissions matched by startupId/userId. Falling back to taskId-based matching.');
          const taskIds = (Array.isArray(allTasks) ? allTasks : tasks).map(t => t.id);
          startupSubmissions = submissionsData.filter(sub => sub && sub.taskId && taskIds.includes(sub.taskId));
          console.log('✅ TASK-ID FALLBACK RESULT:', startupSubmissions.length, 'submissions found by task match');
        }
        
        if (startupSubmissions.length > 0) {
          startupSubmissions.forEach((sub, index) => {
            console.log(`✅ Match ${index + 1}:`, {
              id: sub.id?.substring(0, 8) + '...',
              taskId: sub.taskId?.substring(0, 8) + '...',
              status: sub.status
            });
          });

          // FETCH FILES FOR EACH SUBMISSION
          console.log('🔍 FETCHING FILES for', startupSubmissions.length, 'submissions...');
          const submissionsWithFiles = await Promise.all(
            startupSubmissions.map(async (submission) => {
              try {
                console.log(`🔍 Fetching files for submission: ${submission.id?.substring(0, 8)}...`);
                
                // Fetch files for this submission using the submission-files API
                const response = await fetch(`/api/progresstracking/submission-files`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (response.ok) {
                  const allFiles = await response.json();
                  // Filter files for this specific submission
                  const submissionFiles = allFiles.filter(file => file.submission?.id === submission.id);
                  
                  console.log(`✅ Found ${submissionFiles.length} files for submission ${submission.id?.substring(0, 8)}`);
                  
                  return {
                    ...submission,
                    files: submissionFiles
                  };
                } else {
                  console.warn(`❌ Failed to fetch files for submission ${submission.id}: ${response.status}`);
                  return submission;
                }
              } catch (error) {
                console.error(`❌ Error fetching files for submission ${submission.id}:`, error);
                return submission;
              }
            })
          );
          
          console.log('🎉 SUBMISSIONS WITH FILES LOADED:', submissionsWithFiles.length);
          setSubmissions(submissionsWithFiles);
        } else {
          console.log('❌ NO MATCHES FOUND - Check if submissions have correct startupId/userId');
          setSubmissions(startupSubmissions);
        }  
        
        if (submissionsData.length > 0) {
          console.warn('- Sample submission startupIds:', submissionsData.slice(0, 5).map(s => ({ id: s.id, startupId: s.startupId, userId: s.userId })));
        }
        console.log('Submissions state updated with', startupSubmissions.length, 'items');
      } catch (error) {
        console.error('=== SUBMISSION FETCH ERROR ===');
        console.error('Failed to fetch submissions:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          stack: error.stack
        });
        
        if (error.response?.status === 403) {
          console.error('❌ 403 FORBIDDEN - Authentication issue');
          console.error('This usually means:');
          console.error('1. Token is invalid or expired');
          console.error('2. User lacks permission to access submissions');
          console.error('3. Backend authentication is not working properly');
        } else {
          console.error('❌ SUBMISSION FETCH ERROR:', error);
          console.error('Error details:', error.message);
          console.error('Full error:', error);
        }
        setSubmissions([]);
      }
    } catch (error) {
      console.error('❌ PHASES FETCH ERROR:', error);
      console.error('Error details:', error.message);
      console.error('Full error:', error);
      setPhases([]);
      setTasks([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
      console.log('=== FETCH PHASES COMPLETED ===');
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
        console.log(`🔥 UPLOADING FILE ${i + 1}/${files.length}:`, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          submissionId: submission.id
        });
        setUploadStatus(prev => ({ ...prev, [taskId]: `Uploading file ${i + 1}/${files.length}: ${file.name}` }));
        
        try {
          const uploadResult = await uploadSubmissionFile(file, submission.id, token);
          console.log(`✅ FILE UPLOAD SUCCESS:`, uploadResult);
        } catch (uploadError) {
          console.error(`❌ FILE UPLOAD FAILED:`, uploadError);
          throw uploadError; // Re-throw to stop the process
        }
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

  // Effects - FORCED: Adding immediate execution to bypass useEffect issue
  useEffect(() => {
    console.log('🔍 USEEFFECT TRIGGERED - userId:', userId, 'token exists:', !!token);
    
    if (!userId || !token) {
      console.log('❌ MISSING DATA - userId:', userId, 'token exists:', !!token);
      return;
    }
    
    console.log('🚀 INITIALIZING StartupProgressTracking');
    getAssignedTemplatesForStartup(userId, token)
      .then(data => {
        setTemplates(data);
        if (data && data.length > 0) {
          setSelectedTemplate(data[0]);
          fetchPhases(data[0].id);
        }
      })
      .catch(error => {
        console.error('❌ TEMPLATE FETCH ERROR:', error);
        setTemplates([]);
      });
  }, [userId, token]);

  // EMERGENCY FIX: Force data fetching if useEffect doesn't work
  useEffect(() => {
    console.log('🚨 EMERGENCY USEEFFECT - Force triggering data fetch');
    if (userId && token && templates.length === 0) {
      console.log('🚨 FORCING DATA FETCH');
      getAssignedTemplatesForStartup(userId, token)
        .then(data => {
          console.log('🚨 EMERGENCY FETCH SUCCESS:', data.length);
          setTemplates(data);
          if (data && data.length > 0) {
            setSelectedTemplate(data[0]);
            fetchPhases(data[0].id);
          }
          setLoading(false); // Fix: Set loading to false after template fetch
        })
        .catch(error => {
          console.error('🚨 EMERGENCY FETCH ERROR:', error);
          setLoading(false); // Fix: Set loading to false on error too
        });
    }
  }); // No dependency array - runs every render until data is loaded

  // Manual refresh button is available if needed
  
  // REMOVED: Debug useEffect that was causing constant logging
  // The issue is likely in parent component or state management

  // Ensure submissions are fetched once tasks are available (race-resistant)
  useEffect(() => {
    if (!userId || !token) return;
    if (tasks.length === 0) return;
    if (submissions.length > 0) return;

    console.log('🧩 TASKS-READY EFFECT: fetching submissions with taskId fallback');
    getSubmissions(token)
      .then(async (submissionsData) => {
        console.log('🧩 Submissions fetched in tasks-ready effect:', submissionsData?.length || 0);
        const taskIds = tasks.map(t => t.id);
        let startupSubmissions = (submissionsData || []).filter(sub => {
          if (!sub) return false;
          const userIdStr = String(userId).trim();
          const startupIdStr = String(sub.startupId || '').trim();
          const submissionUserIdStr = String(sub.userId || '').trim();
          return startupIdStr === userIdStr || submissionUserIdStr === userIdStr;
        });

        if (startupSubmissions.length === 0) {
          console.warn('🧩 No submissions matched by user/startup. Falling back to taskId match.');
          startupSubmissions = (submissionsData || []).filter(sub => sub && sub.taskId && taskIds.includes(sub.taskId));
        }

        if (startupSubmissions.length === 0) {
          setSubmissions([]);
          return;
        }

        // Attach files
        try {
          const submissionsWithFiles = await Promise.all(
            startupSubmissions.map(async (submission) => {
              try {
                const response = await fetch(`/api/progresstracking/submission-files`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                if (!response.ok) return submission;
                const allFiles = await response.json();
                const submissionFiles = allFiles.filter(f => f.submission?.id === submission.id);
                return { ...submission, files: submissionFiles };
              } catch {
                return submission;
              }
            })
          );
          setSubmissions(submissionsWithFiles);
        } catch (e) {
          console.error('🧩 Error enriching submissions with files:', e);
          setSubmissions(startupSubmissions);
        }
      })
      .catch(err => {
        console.error('🧩 Submissions fetch failed in tasks-ready effect:', err);
      });
  }, [tasks, userId, token]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md mx-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full bg-blue-50 opacity-20 animate-pulse"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Progress</h3>
          <p className="text-gray-600">Fetching your latest achievements...</p>
        </div>
      </div>
    );
  }

  // No templates state
  if (templates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-lg">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4 w-20 h-20 mx-auto mb-6">
            <TrendingUp size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            No progress tracking templates have been assigned to you yet. 
            Your mentor will assign templates to help guide your startup journey.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-blue-800 text-sm font-medium">💡 Contact your mentor for template assignment</p>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl mb-6 shadow-2xl">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">Progress Journey</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">Transform your startup vision into reality with structured milestones and expert guidance</p>
        </div>

        {/* Template Selection */}
        {templates.length > 1 && (
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-indigo-100 p-8 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Your Learning Path</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    fetchPhases(template.id);
                  }}
                  className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-105 ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl'
                  }`}
                >
                  <div className="absolute top-4 right-4">
                    {selectedTemplate?.id === template.id ? (
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-400 transition-colors" />
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2 pr-8">{template.name}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{template.description}</p>
                  <div className="mt-4 flex items-center text-xs text-blue-600 font-medium">
                    <span>Select Template</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Template Details */}
        {selectedTemplate && (
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden">
            {/* Template Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold mb-2">{selectedTemplate.name}</h2>
                  <p className="text-indigo-100 text-lg leading-relaxed">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">

              {/* Progress Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">Total Phases</p>
                      <p className="text-3xl font-bold">{phases.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium mb-1">Total Tasks</p>
                      <p className="text-3xl font-bold">{tasks.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium mb-1">Completed</p>
                      <p className="text-3xl font-bold">
                        {tasks.filter(task => 
                          submissions.some(sub => sub.taskId === task.id && (sub.status === 'APPROVED' || sub.status === 'COMPLETED'))
                        ).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium mb-1">In Progress</p>
                      <p className="text-3xl font-bold">
                        {tasks.filter(task => 
                          submissions.some(sub => sub.taskId === task.id && ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION'].includes(sub.status))
                        ).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Refresh Button */}
              <div className="flex justify-end mb-8">
                <button
                  onClick={handleManualRefresh}
                  className="group px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="Refresh to see latest feedback"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh Progress</span>
                  </div>
                </button>
              </div>

              {/* Phases and Tasks */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 mx-auto mb-6"></div>
                  <p className="text-gray-600 text-lg">Loading your journey...</p>
                </div>
              ) : phases.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <AlertCircle size={64} className="mx-auto text-gray-400 mb-6" />
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">No Phases Found</h4>
                  <p className="text-gray-600 text-lg">This template doesn't have any phases configured yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">🚀</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Your Milestones</h3>
                  </div>
                  {phases
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((phase, phaseIndex) => {
                    const phaseTasks = tasks.filter(task => task.phaseId === phase.id);
                    const completedTasks = phaseTasks.filter(task => 
                      submissions.some(sub => sub.taskId === task.id && (sub.status === 'APPROVED' || sub.status === 'COMPLETED'))
                    );
                    const inProgressTasks = phaseTasks.filter(task => 
                      submissions.some(sub => sub.taskId === task.id && ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION'].includes(sub.status))
                    );
                    const isExpanded = expandedPhases.includes(phase.id);
                    const progressPercentage = phaseTasks.length > 0 ? (completedTasks.length / phaseTasks.length) * 100 : 0;
                    
                    return (
                      <div key={phase.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        {/* Phase Header */}
                        <div 
                          className="p-8 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300"
                          onClick={() => togglePhaseExpansion(phase.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              {/* Phase Number Circle */}
                              <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                                completedTasks.length === phaseTasks.length && phaseTasks.length > 0
                                  ? 'bg-gradient-to-br from-green-500 to-green-600'
                                  : inProgressTasks.length > 0
                                  ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                                  : completedTasks.length > 0
                                  ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
                              }`}>
                                {phaseIndex + 1}
                                {completedTasks.length === phaseTasks.length && phaseTasks.length > 0 && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Phase Info */}
                              <div className="flex-1">
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">{phase.name}</h4>
                                <p className="text-gray-600 text-base leading-relaxed mb-4">{phase.description}</p>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                                  <div 
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                      progressPercentage === 100 
                                        ? 'bg-gradient-to-r from-green-400 to-green-500'
                                        : progressPercentage > 0
                                        ? 'bg-gradient-to-r from-blue-400 to-purple-500'
                                        : 'bg-gray-300'
                                    }`}
                                    style={{ width: `${progressPercentage}%` }}
                                  ></div>
                                </div>
                                
                                {/* Task Stats */}
                                <div className="flex items-center gap-6 text-sm">
                                  <span className="flex items-center gap-2 text-gray-600">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    {completedTasks.length} Completed
                                  </span>
                                  <span className="flex items-center gap-2 text-gray-600">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    {inProgressTasks.length} In Progress
                                  </span>
                                  <span className="flex items-center gap-2 text-gray-600">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                    {phaseTasks.length - completedTasks.length - inProgressTasks.length} Pending
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Expand Arrow */}
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{Math.round(progressPercentage)}% Complete</p>
                                <p className="text-xs text-gray-500">{completedTasks.length} of {phaseTasks.length} tasks</p>
                              </div>
                              <div className={`w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Phase Tasks */}
                        {isExpanded && (
                          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8">
                            {phaseTasks.length === 0 ? (
                              <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                  <AlertCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg">No tasks in this phase</p>
                              </div>
                            ) : (
                              <div className="grid gap-6">
                                {phaseTasks.map((task, taskIndex) => {
                                  const taskSubmission = submissions.find(sub => sub.taskId === task.id);
                                  const hasSubmitted = taskSubmission && (['SUBMITTED', 'COMPLETED', 'APPROVED', 'REJECTED', 'NEEDS_REVISION', 'UNDER_REVIEW', 'PENDING'].includes(taskSubmission.status));
                                  const needsAction = taskSubmission && (['NEEDS_REVISION'].includes(taskSubmission.status));
                                  const isCompleted = taskSubmission && ['APPROVED', 'COMPLETED'].includes(taskSubmission.status);
                                  const isRejected = taskSubmission && ['REJECTED'].includes(taskSubmission.status);
                                  const isUnderReview = taskSubmission && ['SUBMITTED', 'UNDER_REVIEW'].includes(taskSubmission.status);
                                
                                  return (
                                    <div key={task.id} className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                                      isCompleted ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' :
                                      isRejected ? 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50' :
                                      isUnderReview ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50' :
                                      needsAction ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50' :
                                      'border-gray-200 hover:border-indigo-300'
                                    }`}>
                                      {/* Task Status Badge */}
                                      <div className="absolute top-4 right-4">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                          isCompleted ? 'bg-green-500 text-white' :
                                          isRejected ? 'bg-red-500 text-white' :
                                          isUnderReview ? 'bg-blue-500 text-white' :
                                          needsAction ? 'bg-orange-500 text-white' :
                                          'bg-gray-300 text-gray-700'
                                        }`}>
                                          {isCompleted ? '✅ APPROVED' :
                                           isRejected ? '❌ REJECTED' :
                                           isUnderReview ? '⏳ UNDER REVIEW' :
                                           needsAction ? '🔄 NEEDS REVISION' :
                                           '⭕ NOT STARTED'}
                                        </div>
                                      </div>
                                      
                                      <div className="p-8">
                                        {/* Task Header */}
                                        <div className="flex items-start gap-6 mb-6">
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                                            isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                            isRejected ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                            isUnderReview ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                            needsAction ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                                            'bg-gradient-to-br from-gray-400 to-gray-500'
                                          }`}>
                                            {taskIndex + 1}
                                          </div>
                                          
                                          <div className="flex-1">
                                            <h5 className="text-2xl font-bold text-gray-900 mb-3">{task.taskName || task.name || 'Untitled Task'}</h5>
                                            <p className="text-gray-600 text-base leading-relaxed mb-4">{task.description}</p>
                                            
                                            {/* Task Meta Info */}
                                            <div className="flex flex-wrap gap-4 mb-4">
                                              {task.dueDate && (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-lg">
                                                  <Calendar className="w-4 h-4 text-blue-600" />
                                                  <span className="text-sm font-medium text-blue-800">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                </div>
                                              )}
                                              {task.priority && (
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                                                  task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                  task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-green-100 text-green-800'
                                                }`}>
                                                  <span className="text-sm font-medium">{task.priority} Priority</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Requirements & Deliverables */}
                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                          {task.requirements && (
                                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                              <h6 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                Requirements
                                              </h6>
                                              <p className="text-blue-800 text-sm leading-relaxed">{task.requirements}</p>
                                            </div>
                                          )}
                                          
                                          {task.deliverables && (
                                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                              <h6 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Deliverables
                                              </h6>
                                              <p className="text-purple-800 text-sm leading-relaxed">{task.deliverables}</p>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {/* Action Button */}
                                        <div className="flex justify-center mb-6">
                                          {hasSubmitted ? (
                                            <div className="flex items-center gap-4">
                                              <div className={`px-6 py-3 rounded-2xl font-bold text-white shadow-lg ${
                                                isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                                isRejected ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                isUnderReview ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                                'bg-gradient-to-r from-orange-500 to-orange-600'
                                              }`}>
                                                {getStatusText(taskSubmission.status)}
                                              </div>
                                              {needsAction && (
                                                <button
                                                  onClick={() => {
                                                    setSelectedTask(task);
                                                    setShowSubmissionModal(true);
                                                  }}
                                                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                >
                                                  🔄 Resubmit Work
                                                </button>
                                              )}
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setSelectedTask(task);
                                                setShowSubmissionModal(true);
                                              }}
                                              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                              🚀 Submit Your Work
                                            </button>
                                          )}
                                        </div>
                                        
                                        {/* Mentor Feedback Section */}
                                        {(taskSubmission?.mentorFeedback || taskSubmission?.feedback || taskSubmission?.score !== undefined) && (
                                          <div className={`rounded-2xl p-6 border-2 ${
                                            isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' :
                                            isRejected ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200' :
                                            'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                                          }`}>
                                            <div className="flex items-center gap-3 mb-4">
                                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                isCompleted ? 'bg-green-500' :
                                                isRejected ? 'bg-red-500' :
                                                'bg-blue-500'
                                              }`}>
                                                <MessageCircle className="w-5 h-5 text-white" />
                                              </div>
                                              <div className="flex-1">
                                                <h6 className="font-bold text-gray-900 text-lg">Mentor Feedback</h6>
                                                {taskSubmission?.score !== undefined && (
                                                  <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm text-gray-600">Score:</span>
                                                    <span className={`font-bold text-lg ${
                                                      taskSubmission.score >= 80 ? 'text-green-600' :
                                                      taskSubmission.score >= 60 ? 'text-yellow-600' :
                                                      'text-red-600'
                                                    }`}>
                                                      {taskSubmission.score}/100
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            {(taskSubmission?.mentorFeedback || taskSubmission?.feedback) ? (
                                              <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                                                <p className="text-gray-800 leading-relaxed">{taskSubmission.mentorFeedback || taskSubmission.feedback}</p>
                                              </div>
                                            ) : (
                                              <div className="bg-white/50 rounded-xl p-4 border border-white/30">
                                                <p className="text-gray-500 italic">No feedback provided yet</p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* Submitted Files Display */}
                                        {taskSubmission?.files && taskSubmission.files.length > 0 && (
                                          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <h6 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                              <Upload className="w-4 h-4" />
                                              Submitted Files
                                            </h6>
                                            <div className="grid gap-2">
                                              {taskSubmission.files.map((file, fileIndex) => (
                                                <div key={fileIndex} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                                  <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                      <FileText className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                      <p className="font-medium text-gray-900 text-sm">{file.originalName}</p>
                                                      <p className="text-xs text-gray-500">{(file.fileSize / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                  </div>
                                                  <button
                                                    onClick={() => window.open(`/api/progresstracking/submission-files/${file.id}/download`, '_blank')}
                                                    className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                                  >
                                                    Download
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
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
          </div>
        )}

        {/* Submission Modal */}
        {showSubmissionModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Submit Work: {selectedTask.taskName || selectedTask.name || 'Task'}</h3>
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
    </div>
  );
}

export default StartupProgressTracking;
