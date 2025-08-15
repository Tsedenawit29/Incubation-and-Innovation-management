import axiosConfig from './axiosConfig';

// Base notification API functions
export const getNotifications = async (token, userRole, userId) => {
  try {
    const response = await axiosConfig.get(`/api/notifications/${userRole}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    // Return mock data as fallback
    return getMockNotifications(userRole);
  }
};

export const markNotificationAsRead = async (token, notificationId) => {
  try {
    const response = await axiosConfig.put(`/api/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

export const getUpcomingMeetings = async (token, userId) => {
  try {
    const response = await axiosConfig.get(`/api/meetings/upcoming/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch upcoming meetings:', error);
    return [];
  }
};

export const getRecentFeedbacks = async (token, userId, userRole) => {
  try {
    const endpoint = userRole === 'STARTUP' 
      ? `/api/feedback/received/${userId}` 
      : `/api/feedback/pending/${userId}`;
    const response = await axiosConfig.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch feedbacks:', error);
    return [];
  }
};

export const getUnreadMessages = async (token, userId) => {
  try {
    const response = await axiosConfig.get(`/api/chat/unread/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch unread messages:', error);
    return [];
  }
};

export const getTaskDeadlines = async (token, userId) => {
  try {
    const response = await axiosConfig.get(`/api/tasks/deadlines/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task deadlines:', error);
    return [];
  }
};

export const getSystemNotifications = async (token, tenantId) => {
  try {
    const response = await axiosConfig.get(`/api/notifications/system/${tenantId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system notifications:', error);
    return [];
  }
};

// Mock data fallback functions
export const getMockNotifications = (userRole) => {
  if (userRole === 'STARTUP') {
    return [
      {
        id: 1,
        type: "meeting",
        priority: "high",
        title: "Upcoming Meeting Reminder",
        message: "Meeting with Dr. Sarah Chen starts in 30 minutes - MVP Review Session",
        time: "30 minutes",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        actionUrl: "/calendar",
        actionText: "Join Meeting",
        read: false,
        source: "meetings"
      },
      {
        id: 2,
        type: "mentor_feedback",
        priority: "high",
        title: "New Mentor Feedback",
        message: "Dr. Chen provided detailed feedback on your MVP pitch deck with 8 actionable suggestions",
        time: "2 hours ago",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        actionUrl: "/progress",
        actionText: "View Feedback",
        read: false,
        source: "feedback"
      },
      {
        id: 3,
        type: "task_due",
        priority: "urgent",
        title: "Task Deadline Approaching",
        message: "Q2 Progress Report submission is due in 2 days. Complete your milestone documentation.",
        time: "4 hours ago",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        actionUrl: "/progress",
        actionText: "Submit Report",
        read: false,
        source: "tasks"
      }
    ];
  } else if (userRole === 'MENTOR') {
    return [
      {
        id: 1,
        type: "meeting",
        priority: "high",
        title: "Upcoming Mentorship Session",
        message: "Meeting with TechInnovators team starts in 45 minutes - MVP Review & Strategy Discussion",
        time: "45 minutes",
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        actionUrl: "/calendar",
        actionText: "Join Meeting",
        read: false,
        source: "meetings"
      },
      {
        id: 2,
        type: "submission",
        priority: "high",
        title: "New Progress Submission",
        message: "GreenTech Solutions submitted their Q2 progress report and milestone documentation for review",
        time: "3 hours ago",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        actionUrl: "/review",
        actionText: "Review Submission",
        read: false,
        source: "submissions"
      },
      {
        id: 3,
        type: "startup_question",
        priority: "medium",
        title: "Startup Question",
        message: "TechInnovators asked for guidance on customer acquisition strategy and pricing models",
        time: "5 hours ago",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        actionUrl: "/messages",
        actionText: "Respond",
        read: false,
        source: "messages"
      }
    ];
  }
  return [];
};

// Aggregate notifications from multiple sources
export const fetchAllNotifications = async (token, userRole, userId, tenantId) => {
  try {
    const [
      meetings,
      feedbacks,
      messages,
      tasks,
      systemNotifs
    ] = await Promise.allSettled([
      getUpcomingMeetings(token, userId),
      getRecentFeedbacks(token, userId, userRole),
      getUnreadMessages(token, userId),
      getTaskDeadlines(token, userId),
      getSystemNotifications(token, tenantId)
    ]);

    const notifications = [];

    // Process meetings
    if (meetings.status === 'fulfilled' && meetings.value.length > 0) {
      meetings.value.forEach(meeting => {
        const meetingTime = new Date(meeting.startTime);
        const now = new Date();
        const timeDiff = meetingTime - now;
        const hoursUntil = Math.ceil(timeDiff / (1000 * 60 * 60));

        if (hoursUntil <= 24 && hoursUntil > 0) {
          notifications.push({
            id: `meeting_${meeting.id}`,
            type: "meeting",
            priority: hoursUntil <= 1 ? "urgent" : "high",
            title: "Upcoming Meeting",
            message: `Meeting "${meeting.title}" starts in ${hoursUntil <= 1 ? Math.ceil(timeDiff / (1000 * 60)) + ' minutes' : hoursUntil + ' hours'}`,
            time: hoursUntil <= 1 ? Math.ceil(timeDiff / (1000 * 60)) + ' minutes' : hoursUntil + ' hours',
            timestamp: new Date(meeting.startTime),
            actionUrl: "/calendar",
            actionText: "Join Meeting",
            read: false,
            source: "meetings"
          });
        }
      });
    }

    // Process feedbacks
    if (feedbacks.status === 'fulfilled' && feedbacks.value.length > 0) {
      feedbacks.value.forEach(feedback => {
        notifications.push({
          id: `feedback_${feedback.id}`,
          type: userRole === 'STARTUP' ? "mentor_feedback" : "feedback_request",
          priority: "high",
          title: userRole === 'STARTUP' ? "New Mentor Feedback" : "Feedback Request",
          message: userRole === 'STARTUP' 
            ? `New feedback received: ${feedback.content?.substring(0, 80)}...`
            : `Feedback requested for: ${feedback.title}`,
          time: getRelativeTime(feedback.createdAt),
          timestamp: new Date(feedback.createdAt),
          actionUrl: "/feedback",
          actionText: userRole === 'STARTUP' ? "View Feedback" : "Provide Feedback",
          read: false,
          source: "feedback"
        });
      });
    }

    // Process messages
    if (messages.status === 'fulfilled' && messages.value.length > 0) {
      messages.value.forEach(message => {
        notifications.push({
          id: `message_${message.id}`,
          type: "message",
          priority: "medium",
          title: "New Message",
          message: `New message from ${message.senderName}: ${message.content?.substring(0, 60)}...`,
          time: getRelativeTime(message.createdAt),
          timestamp: new Date(message.createdAt),
          actionUrl: "/chat",
          actionText: "View Message",
          read: false,
          source: "messages"
        });
      });
    }

    // Process tasks
    if (tasks.status === 'fulfilled' && tasks.value.length > 0) {
      tasks.value.forEach(task => {
        const deadline = new Date(task.deadline);
        const now = new Date();
        const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        if (daysUntil <= 7 && daysUntil > 0) {
          notifications.push({
            id: `task_${task.id}`,
            type: "task_due",
            priority: daysUntil <= 2 ? "urgent" : "medium",
            title: "Task Deadline Approaching",
            message: `Task "${task.title}" is due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
            time: `${daysUntil} day${daysUntil > 1 ? 's' : ''} left`,
            timestamp: new Date(task.deadline),
            actionUrl: "/tasks",
            actionText: "Complete Task",
            read: false,
            source: "tasks"
          });
        }
      });
    }

    // Process system notifications
    if (systemNotifs.status === 'fulfilled' && systemNotifs.value.length > 0) {
      systemNotifs.value.forEach(notif => {
        notifications.push({
          id: `system_${notif.id}`,
          type: "system",
          priority: notif.priority || "low",
          title: notif.title,
          message: notif.message,
          time: getRelativeTime(notif.createdAt),
          timestamp: new Date(notif.createdAt),
          actionUrl: notif.actionUrl || "/dashboard",
          actionText: notif.actionText || "View Details",
          read: notif.read || false,
          source: "system"
        });
      });
    }

    // Sort by timestamp (newest first) and limit to most recent
    const sortedNotifications = notifications
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // If no real notifications, return mock data
    if (sortedNotifications.length === 0) {
      return getMockNotifications(userRole);
    }

    return sortedNotifications;

  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return mock data as fallback
    return getMockNotifications(userRole);
  }
};

// Helper function to get relative time
const getRelativeTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return time.toLocaleDateString();
  }
};
