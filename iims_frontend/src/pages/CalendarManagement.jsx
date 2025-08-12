import React, { useState, useEffect } from 'react';
import {
  getMyMeetings,
  createMeeting,
  deleteMeeting,
  getGoogleAuthUrl,
  getOAuthStatus,
  getGoogleCalendarEvents
} from '../api/meetings';
import { getTenantUsers } from '../api/users';

import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  PlusIcon, 
  UserGroupIcon, 
  LinkIcon,
  CheckCircleIcon,
  TrashIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const CalendarManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [meetings, setMeetings] = useState([]);
  const [googleEvents, setGoogleEvents] = useState([]);
  const [oauthStatus, setOauthStatus] = useState({ connected: false });
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // month, week, day
  
  // Modal states
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [systemUsers, setSystemUsers] = useState([]);
  
  // Meeting form state
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    attendeeEmails: [''],
    systemAttendees: []
  });
  
  // User filtering state
  const [userFilter, setUserFilter] = useState({
    role: 'ALL',
    search: ''
  });

  // Initialize data
  useEffect(() => {
    checkOAuthStatus();
    loadMeetings();
    loadSystemUsers();
  }, []);

  // Check for OAuth success/error from URL params and refresh status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const error = urlParams.get('error');
    
    if (status === 'success') {
      // Show success message
      alert('✅ Google Calendar connected successfully!');
      // Refresh OAuth status after successful connection
      setTimeout(() => {
        checkOAuthStatus();
        loadGoogleCalendarEvents();
      }, 1000);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'error' || error) {
      const errorMessage = error ? decodeURIComponent(error) : 'Failed to connect Google Calendar';
      alert(`❌ Connection Failed: ${errorMessage}. Please try again.`);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (oauthStatus.connected) {
      loadGoogleCalendarEvents();
    }
  }, [oauthStatus.connected]);

  // API Functions

  const checkOAuthStatus = async () => {
    try {
      console.log('🔍 Checking OAuth status...');
      const status = await getOAuthStatus();
      console.log('📊 OAuth status response:', status);
      setOauthStatus(status);
      console.log('✅ OAuth status updated:', status);
    } catch (error) {
      console.error('❌ Error checking OAuth status:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setOauthStatus({ connected: false });
    }
  };

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await getMyMeetings();
      setMeetings(data);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleCalendarEvents = async () => {
    try {
      const events = await getGoogleCalendarEvents();
      setGoogleEvents(events.items || []);
    } catch (error) {
      console.error('Error loading Google Calendar events:', error);
    }
  };

  const loadSystemUsers = async () => {
    try {
      const users = await getTenantUsers(token);
      setSystemUsers(users);
    } catch (error) {
      console.error('Error loading system users:', error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      if (!user || !user.id) {
        alert('User information not available');
        return;
      }
      
      const response = await getGoogleAuthUrl('user', user.id);
      window.location.href = response;
    } catch (error) {
      console.error('Error initiating Google auth:', error);
      alert('Failed to initiate Google authentication');
    }
  };

  // Calendar utility functions
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    
    return days;
  };

  const getMeetingsForDate = (date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return meetingDate.toDateString() === date.toDateString();
    });
  };

  const getGoogleEventsForDate = (date) => {
    return googleEvents.filter(event => {
      if (!event.start?.dateTime) return false;
      const eventDate = new Date(event.start.dateTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Meeting form handlers
  const handleFormChange = (field, value) => {
    setMeetingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailChange = (index, value) => {
    const emails = [...meetingForm.attendeeEmails];
    emails[index] = value;
    setMeetingForm(prev => ({
      ...prev,
      attendeeEmails: emails
    }));
  };

  const addEmailField = () => {
    setMeetingForm(prev => ({
      ...prev,
      attendeeEmails: [...prev.attendeeEmails, '']
    }));
  };

  const removeEmailField = (index) => {
    if (meetingForm.attendeeEmails.length === 1) return;
    setMeetingForm(prev => ({
      ...prev,
      attendeeEmails: prev.attendeeEmails.filter((_, i) => i !== index)
    }));
  };

  const handleSystemAttendeeToggle = (userId) => {
    setMeetingForm(prev => ({
      ...prev,
      systemAttendees: prev.systemAttendees.includes(userId)
        ? prev.systemAttendees.filter(id => id !== userId)
        : [...prev.systemAttendees, userId]
    }));
  };

  // Filter users based on role and search
  const getFilteredUsers = () => {
    let filtered = systemUsers;
    
    // Filter by role
    if (userFilter.role !== 'ALL') {
      filtered = filtered.filter(user => user.role === userFilter.role);
    }
    
    // Filter by search term (name or email)
    if (userFilter.search.trim()) {
      const searchTerm = userFilter.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    
    if (!meetingForm.title.trim()) {
      alert('Title is required');
      return;
    }
    
    if (!meetingForm.startTime || !meetingForm.endTime) {
      alert('Start and End time are required');
      return;
    }
    
    if (new Date(meetingForm.startTime) >= new Date(meetingForm.endTime)) {
      alert('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      
      // Combine system user emails with manual emails
      const systemUserEmails = systemUsers
        .filter(user => meetingForm.systemAttendees.includes(user.id))
        .map(user => user.email);
      
      const manualEmails = meetingForm.attendeeEmails.filter(email => email.trim() !== '');
      const allEmails = [...systemUserEmails, ...manualEmails];

      const payload = {
        title: meetingForm.title.trim(),
        description: meetingForm.description.trim(),
        startTime: new Date(meetingForm.startTime).toISOString(),
        endTime: new Date(meetingForm.endTime).toISOString(),
        attendeeEmails: allEmails,
      };

      await createMeeting(payload);
      
      // Reset form and close modal
      setMeetingForm({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        attendeeEmails: [''],
        systemAttendees: []
      });
      setIsSchedulerOpen(false);
      loadMeetings();
      
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    
    try {
      await deleteMeeting(meetingId);
      loadMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Failed to delete meeting');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendar Management</h1>
                <p className="text-sm text-gray-600">Manage your meetings and schedule</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Google Calendar Status */}
              <div className="flex items-center space-x-2">
                {oauthStatus.connected ? (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Google Connected</span>
                    <button
                      onClick={() => {
                        checkOAuthStatus();
                        loadGoogleCalendarEvents();
                      }}
                      className="ml-2 text-xs text-green-600 hover:text-green-800 underline"
                      title="Refresh status"
                    >
                      ↻
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleGoogleAuth}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <LinkIcon className="h-5 w-5" />
                      <span>Connect Google</span>
                    </button>
                    <button
                      onClick={() => {
                        checkOAuthStatus();
                        loadGoogleCalendarEvents();
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                      title="Refresh status"
                    >
                      Check Status
                    </button>
                  </div>
                )}
              </div>
              
              {/* Schedule Meeting Button */}
              <button
                onClick={() => setIsSchedulerOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Schedule Meeting</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {getCalendarDays().map((date, index) => (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                        date && date.toDateString() === new Date().toDateString() 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'bg-white'
                      } ${
                        date && date.getMonth() !== currentDate.getMonth()
                          ? 'text-gray-400'
                          : ''
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      {date && (
                        <>
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {date.getDate()}
                          </div>
                          
                          {/* Local Meetings */}
                          {getMeetingsForDate(date).map((meeting, meetingIndex) => (
                            <div
                              key={`local-${meetingIndex}`}
                              className="text-xs bg-indigo-100 text-indigo-800 p-1 rounded mb-1 truncate cursor-pointer hover:bg-indigo-200"
                              title={`${meeting.title} - ${formatTime(meeting.startTime)}${meeting.meetLink ? ' (Click to join)' : ''}`}
                              onClick={() => meeting.meetLink && window.open(meeting.meetLink, '_blank')}
                            >
                              <div className="font-medium flex items-center">
                                {meeting.title}
                                {meeting.meetLink && (
                                  <span className="ml-1 text-xs">🔗</span>
                                )}
                              </div>
                              <div className="text-xs opacity-75">{formatTime(meeting.startTime)}</div>
                            </div>
                          ))}
                          
                          {/* Google Calendar Events */}
                          {getGoogleEventsForDate(date).map((event, eventIndex) => (
                            <div
                              key={`google-${eventIndex}`}
                              className="text-xs bg-green-100 text-green-800 p-1 rounded mb-1 truncate cursor-pointer hover:bg-green-200"
                              title={`${event.summary} - ${event.start?.dateTime ? formatTime(event.start.dateTime) : 'All day'}`}
                            >
                              <div className="font-medium">{event.summary}</div>
                              {event.start?.dateTime && (
                                <div className="text-xs opacity-75">{formatTime(event.start.dateTime)}</div>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">My Meetings</span>
                  <span className="text-lg font-semibold text-indigo-600">{meetings.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Google Events</span>
                  <span className="text-lg font-semibold text-green-600">{googleEvents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Google Status</span>
                  <span className={`text-sm font-medium ${oauthStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {oauthStatus.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Meetings</h3>
              <div className="space-y-3">
                {meetings
                  .filter(meeting => new Date(meeting.startTime) > new Date())
                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                  .slice(0, 5)
                  .map((meeting) => (
                    <div key={meeting.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{meeting.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {formatDate(meeting.startTime)} at {formatTime(meeting.startTime)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete meeting"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                {meetings.filter(meeting => new Date(meeting.startTime) > new Date()).length === 0 && (
                  <p className="text-sm text-gray-500">No upcoming meetings</p>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                  <span className="text-sm text-gray-600">My Meetings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Google Events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Scheduler Modal */}
      {isSchedulerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Schedule a Meeting</h2>
            </div>
            
            <form onSubmit={handleMeetingSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={meetingForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={meetingForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={meetingForm.startTime}
                    onChange={(e) => handleFormChange('startTime', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={meetingForm.endTime}
                    onChange={(e) => handleFormChange('endTime', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* System Users Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <UserGroupIcon className="h-5 w-5 inline mr-1" />
                  System Users
                </label>
                
                {/* User Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Role</label>
                    <select
                      value={userFilter.role}
                      onChange={(e) => setUserFilter(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="STARTUP">Startups</option>
                      <option value="MENTOR">Mentors</option>
                      <option value="COACH">Coaches</option>
                      <option value="TENANT_ADMIN">Tenant Admins</option>
                      <option value="FACILITATOR">Facilitators</option>
                      <option value="INVESTOR">Investors</option>
                      <option value="ALUMNI">Alumni</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Search by Name/Email</label>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userFilter.search}
                      onChange={(e) => setUserFilter(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                  {getFilteredUsers().length > 0 ? (
                    getFilteredUsers().map((systemUser) => (
                      <div key={systemUser.id} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          id={`user-${systemUser.id}`}
                          checked={meetingForm.systemAttendees.includes(systemUser.id)}
                          onChange={() => handleSystemAttendeeToggle(systemUser.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`user-${systemUser.id}`} className="text-sm text-gray-700 flex-1">
                          <span className="font-medium">{systemUser.fullName}</span>
                          <span className="text-gray-500 ml-2">({systemUser.role})</span>
                          <div className="text-xs text-gray-500">{systemUser.email}</div>
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No users found matching your criteria
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  {getFilteredUsers().length} of {systemUsers.length} users shown
                </div>
              </div>

              {/* Guest Emails */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Guest Emails</label>
                {meetingForm.attendeeEmails.map((email, i) => (
                  <div key={i} className="flex items-center mb-2 space-x-2">
                    <input
                      type="email"
                      placeholder="guest@example.com"
                      className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={email}
                      onChange={(e) => handleEmailChange(i, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeEmailField(i)}
                      className="text-red-600 hover:text-red-800 font-bold px-2 py-1"
                      title="Remove email"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEmailField}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  + Add guest email
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setIsSchedulerOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Scheduling...' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarManagement;
