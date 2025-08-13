import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  CalendarIcon, 
  PlusIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  getMyMeetings, 
  deleteMeeting,
  getGoogleAuthUrl,
  getOAuthStatus,
  getGoogleCalendarEvents,
  getSystemUsers
} from '../api/meetings';
import { useAuth } from '../hooks/useAuth';
import MeetingSchedulerModal from '../components/MeetingSchedulerModal';

const CalendarManagement = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // State management
  const [meetings, setMeetings] = useState([]);
  const [googleEvents, setGoogleEvents] = useState([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alert, setAlert] = useState(null);

  // Calendar view state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day

  useEffect(() => {
    loadData();
    
    // Handle OAuth success/error from redirect
    if (location.state?.oauthSuccess) {
      showAlert('✅ Google Calendar connected successfully!', 'success');
    } else if (location.state?.oauthError) {
      showAlert(`❌ Google OAuth failed: ${location.state.oauthError}`, 'error');
    }
  }, [location.state]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [meetingsData, oauthStatus] = await Promise.all([
        getMyMeetings(),
        getOAuthStatus()
      ]);
      
      setMeetings(meetingsData || []);
      setIsGoogleConnected(oauthStatus?.connected || false);
      
      // Load Google events if connected
      if (oauthStatus?.connected) {
        try {
          const googleEventsData = await getGoogleCalendarEvents();
          const eventsArray = googleEventsData?.items || googleEventsData || [];
          setGoogleEvents(Array.isArray(eventsArray) ? eventsArray : []);
        } catch (error) {
          console.error('Error loading Google events:', error);
          setGoogleEvents([]); // Set empty array on error
        }
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
      showAlert('❌ Error loading calendar data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleGoogleConnect = async () => {
    try {
      if (!user || !user.id) {
        showAlert('❌ User not authenticated', 'error');
        return;
      }
      
      const response = await getGoogleAuthUrl('user', user.id);
      if (response) {
        window.location.href = response;
      }
    } catch (error) {
      console.error('Error getting Google OAuth URL:', error);
      showAlert('❌ Error connecting to Google Calendar', 'error');
    }
  };

  const handleGoogleDisconnect = async () => {
    // Note: Disconnect endpoint not available in current API
    showAlert('❌ Disconnect feature not yet implemented', 'error');
  };

  const handleMeetingCreated = () => {
    loadData(); // Refresh data after meeting is created
    showAlert('✅ Meeting created successfully!', 'success');
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      await deleteMeeting(meetingId);
      await loadData();
      showAlert('✅ Meeting deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      showAlert('❌ Error deleting meeting', 'error');
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  // Calendar navigation functions
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar grid data
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Get events for a specific day
  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const allEvents = getAllEvents();
    
    return allEvents.filter(event => {
      const eventDate = new Date(event.startTime || event.start?.dateTime || event.start?.date);
      return eventDate.toISOString().split('T')[0] === dateStr;
    });
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return meetings
      .filter(meeting => new Date(meeting.startTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 5);
  };

  const getAllEvents = () => {
    // Safely handle meetings array
    const localMeetings = Array.isArray(meetings) ? meetings.map(meeting => ({
      ...meeting,
      type: 'local',
      color: 'bg-blue-500'
    })) : [];
    
    // Safely handle googleEvents array
    const googleEventsFormatted = Array.isArray(googleEvents) ? googleEvents.map(event => ({
      ...event,
      type: 'google',
      color: 'bg-green-500'
    })) : [];
    
    return [...localMeetings, ...googleEventsFormatted];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          alert.type === 'success' ? 'bg-green-100 text-green-800' :
          alert.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {alert.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <CalendarIcon className="h-8 w-8 mr-3 text-blue-600" />
                Calendar Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your meetings and integrate with Google Calendar
              </p>
            </div>
            
            <div className="flex space-x-4">
              {/* Google Calendar Integration */}
              {isGoogleConnected ? (
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Google Connected</span>
                  <button
                    onClick={handleGoogleDisconnect}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleConnect}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Connect Google Calendar
                </button>
              )}
              
              {/* Create Meeting Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Meeting
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Meetings</span>
                  <span className="text-sm font-medium text-gray-900">{meetings.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Google Events</span>
                  <span className="text-sm font-medium text-gray-900">{googleEvents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Google Status</span>
                  <span className={`text-sm font-medium ${isGoogleConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isGoogleConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Meetings
              </h3>
              <div className="space-y-3">
                {getUpcomingMeetings().length > 0 ? (
                  getUpcomingMeetings().map((meeting) => (
                    <div key={meeting.id} className="border-l-4 border-blue-500 pl-3">
                      <h4 className="text-sm font-medium text-gray-900">{meeting.title}</h4>
                      <p className="text-xs text-gray-600">{formatDateTime(meeting.startTime)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No upcoming meetings</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Calendar Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={navigateToToday}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getCalendarDays().map((date, index) => {
                    const dayEvents = getEventsForDay(date);
                    const isCurrentMonthDay = isCurrentMonth(date);
                    const isTodayDate = isToday(date);
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] p-2 border border-gray-200 rounded-lg ${
                          isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'
                        } ${
                          isTodayDate ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        } hover:bg-gray-50 transition-colors cursor-pointer`}
                      >
                        {/* Day Number */}
                        <div className={`text-sm font-medium mb-1 ${
                          isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                        } ${
                          isTodayDate ? 'text-blue-600 font-bold' : ''
                        }`}>
                          {date.getDate()}
                        </div>
                        
                        {/* Events for this day */}
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event, eventIndex) => (
                            <div
                              key={`${event.type}-${event.id || eventIndex}`}
                              className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                                event.type === 'google' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}
                              title={`${event.title || event.summary} - ${formatDateTime(event.startTime || event.start?.dateTime)}${
                                event.meetLink || event.hangoutLink ? ' (Click to join)' : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (event.meetLink || event.hangoutLink) {
                                  window.open(event.meetLink || event.hangoutLink, '_blank');
                                }
                              }}
                            >
                              {event.meetLink || event.hangoutLink ? '🔗 ' : ''}
                              {(event.title || event.summary || 'Untitled').substring(0, 15)}
                              {(event.title || event.summary || '').length > 15 ? '...' : ''}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 font-medium">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-100 rounded"></div>
                    <span className="text-gray-600">Local Meetings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 rounded"></div>
                    <span className="text-gray-600">Google Calendar</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 font-medium">🔗</span>
                    <span className="text-gray-600">Clickable Link</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Scheduler Modal */}
      <MeetingSchedulerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onMeetingCreated={handleMeetingCreated}
      />
    </div>
  );
};

export default CalendarManagement;
