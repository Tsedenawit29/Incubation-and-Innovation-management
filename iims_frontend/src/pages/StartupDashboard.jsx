import React, { useEffect, useState, useRef } from "react";
// Assuming these are correctly configured and imported from your project
import { useAuth } from "../hooks/useAuth"; // THIS IS YOUR ACTUAL useAuth HOOK
import {
  getStartupProfile,
  updateStartupProfile,
  createStartupProfile
} from "../api/users"; // or from startupProfile.js
import { getMentorsForStartup } from '../api/mentorAssignment';
import { getAssignedTemplatesForStartup, getPhases, getTasks, uploadSubmissionFile, createSubmission } from '../api/progresstracking';
import StartupProgressTracking from '../components/StartupProgressTracking';

// Import Lucide React icons
import {
  Globe,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Building,
  Save,
  Edit,
  Loader2,
  XCircle,
  CheckCircle,
  Info,
  ExternalLink,
  Eye, // For view mode toggle
  Image, // For logo URL input
  Share2, // For social presence section
  BookOpenText, // For description/about us section
  LogOut, // For logout button
  Zap, // New icon for a "feature" or "vision" section
  Lightbulb, // Another new icon for ideas
  Rocket, // For a launch/growth feel
  TrendingUp, // For growth/metrics
  Users, // For team/community
  Award, // For achievements
  Star, // For general emphasis
  Mail, // For messages
  Bell, // For notifications
  ChevronDown, // For dropdowns
  Plus, // For "Create New Pitch"
  Trash2, // For delete button in pitch list
  Target, // For mission
  EyeIcon, // For vision
  Home, // For Dashboard
  User, // For My Profile
  CheckCircle2, // For Incubation Progress
  GraduationCap, // For My Mentor
  Briefcase, // For Opportunities
  BellRing, // For Notifications (using BellRing for sidebar)
  Calendar, // For Upcoming Task
  Quote, // For motivational quote
  Upload, // For upload button
  FileText, // For documents
  File, // Generic file icon
  Filter, // For filter dropdown
  CalendarDays // For apply by date
} from 'lucide-react';

// Animated Counter Component (kept for potential future use, though not used in current dashboard view)
const AnimatedCounter = ({ targetValue, duration = 2000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the component is visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = targetValue;
    const increment = end / (duration / 16); // ~60 frames per second

    const animate = () => {
      start += increment;
      if (start < end) {
        setCount(Math.ceil(start));
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration, isVisible]);

  return <p ref={ref} className="text-4xl font-extrabold text-green-800">{prefix}{count.toLocaleString()}{suffix}</p>;
};

// Circular Progress Bar Component
const CircularProgressBar = ({ progress, size = 150, strokeWidth = 15 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        stroke="#e6e6e6"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="#4CAF50" // Green color for progress
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference + ' ' + circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        className="transition-all duration-1000 ease-out"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="transform rotate-90" // Rotate text back
        fill="#4CAF50"
        fontSize="20"
        fontWeight="bold"
      >
        {progress}%
      </text>
    </svg>
  );
};


export default function StartupDashboard() {
  const { user, token, logout, loading: authLoading, authError } = useAuth(); // Get authError from useAuth
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Combined loading for profile and auth
  const [editMsg, setEditMsg] = useState(""); // General error messages
  const [error, setError] = useState(""); // General error messages
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // State for current date and time
  const [logoPreview, setLogoPreview] = useState(null); // State for logo preview (Base64)

  // --- NEW STATES FOR TEAM MEMBERS AND DOCUMENTS ---
  const [teamMembers, setTeamMembers] = useState([]);
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', linkedin: '' }); // Removed avatarUrl
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({ name: '', url: '', fileType: '' });
  // --- END NEW STATES ---

  // --- NEW STATES FOR MENTORS ---
  const [mentors, setMentors] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  // --- END NEW STATES ---

  // --- NEW STATES FOR PROGRESS TRACKING ---
  const [templates, setTemplates] = useState([]);
  const [phases, setPhases] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState([]);
  const [tasksByPhase, setTasksByPhase] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState('');
  // --- END NEW STATES ---

  // Move getProgressStats definition here to ensure it is defined before use
  const getProgressStats = () => {
    if (!selectedTemplate || phases.length === 0) return { completed: 0, total: 0, percentage: 0 };
    let completed = 0;
    let total = 0;
    phases.forEach(phase => {
      const phaseTasks = tasksByPhase[phase.id] || [];
      phaseTasks.forEach(task => {
        total++;
        if (task.status === 'COMPLETED') completed++;
      });
    });
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  // Mock data for dashboard elements not directly from profile
  const dashboardMetrics = {
    incubationProgress: getProgressStats().percentage, // Use real progress data
    // Removed other metrics as per request
  };

  // Get the first assigned mentor or use mock data as fallback
  const currentMentor = mentors.length > 0 ? mentors[0] : {
    fullName: 'No Mentor Assigned',
    role: 'Mentor',
    email: '',
    linkedin: '',
    photo: '',
    latestAdvice: 'No mentor has been assigned yet. Please contact your tenant admin.'
  };

  console.log('StartupDashboard: Current mentors state:', mentors);
  console.log('StartupDashboard: Mentors loading:', mentorsLoading);
  console.log('StartupDashboard: Current mentor:', currentMentor);

  const mockNotifications = [
    { id: 1, type: "system", icon: <Info size={16} />, message: "Your Q2 progress report is due next week.", time: "2 hours ago" },
    { id: 2, type: "mentor", icon: <GraduationCap size={16} />, message: "Dr. Chen left feedback on your MVP pitch deck.", time: "Yesterday" },
    { id: 3, type: "admin", icon: <Building size={16} />, message: "New grant opportunity: 'Innovate Fund 2025' is open!", time: "3 days ago" },
  ];

  const mockUpcomingTask = {
    title: "Submit Q2 Progress Report",
    deadline: "2025-08-01",
    description: "Ensure all metrics and activities are updated for the second quarter.",
    link: "#"
  };

  const mockIncubationPhases = [
    { id: 1, title: "Idea Validation", description: "Confirm market need and problem-solution fit.", status: "Approved", feedback: "Excellent market research!", files: [{ name: "Market Research.pdf", type: "pdf" }] },
    { id: 2, title: "Prototype Development", description: "Build a basic working model of your solution.", status: "Submitted", feedback: "Awaiting review.", files: [{ name: "Prototype Plan.docx", type: "docx" }] },
    { id: 3, title: "MVP Launch", description: "Release your Minimum Viable Product to early users.", status: "Pending", feedback: null, files: [] },
    { id: 4, title: "Market Entry Strategy", description: "Plan your go-to-market and initial customer acquisition.", status: "Pending", feedback: null, files: [] },
  ];

  const mockOpportunities = [
    { id: 1, name: "Innovate Fund 2025", description: "Seed funding for disruptive tech startups.", applyBy: "2025-09-15", status: "Open" },
    { id: 2, name: "Growth Accelerator Program", description: "Mentorship and capital for scaling businesses.", applyBy: "2025-08-30", status: "Open" },
    { id: 3, name: "Green Tech Grant", description: "Funding for sustainable technology solutions.", applyBy: "2025-07-20", status: "Closed" },
  ];

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch mentors for the startup
  const fetchMentors = async () => {
    if (!user?.id || !token) {
      console.log('fetchMentors: Missing user.id or token');
      return;
    }
    
    console.log('fetchMentors: Starting to fetch mentors for startup:', user.id);
    setMentorsLoading(true);
    try {
      const data = await getMentorsForStartup(token, user.id);
      console.log('fetchMentors: Raw data received:', data);
      const mentors = data.map(a => a.mentor);
      console.log('fetchMentors: Processed mentors:', mentors);
      setMentors(mentors);
    } catch (e) {
      console.error("fetchMentors: Failed to fetch mentors:", e);
      setMentors([]);
    } finally {
      setMentorsLoading(false);
    }
  };

  // Progress tracking functions
  const fetchTemplates = async () => {
    if (!user?.id || !token) return;
    
    setProgressLoading(true); 
    setProgressError('');
    try {
      const data = await getAssignedTemplatesForStartup(user.id);
      // Filter templates by current user's tenantId
      const filtered = user?.tenantId ? data.filter(t => t.tenantId === user.tenantId) : data;
      setTemplates(filtered);
      setSelectedTemplate(null);
      setPhases([]); // Clear phases
      setTasksByPhase({});  // Clear tasks
    } catch (e) {
      setProgressError('Failed to load templates');
    } finally {
      setProgressLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setPhases([]); // Clear old phases
    setTasksByPhase({});  // Clear old tasks
    if (template) fetchPhases(template.id);
  };

  const fetchPhases = async (templateId) => {
    setProgressLoading(true); 
    setProgressError('');
    try {
      const data = await getPhases(templateId);
      setPhases(data);
      setTasksByPhase({}); // Clear tasks for new phases
    } catch (e) {
      setProgressError('Failed to load phases');
    } finally {
      setProgressLoading(false);
    }
  };

  const fetchTasks = async (phaseId) => {
    setProgressLoading(true); 
    setProgressError('');
    try {
      const data = await getTasks(phaseId);
      setTasksByPhase(prev => ({ ...prev, [phaseId]: data }));
    } catch (e) {
      setProgressError('Failed to load tasks');
    } finally {
      setProgressLoading(false);
    }
  };

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const handleFileUpload = async (file, phaseId, taskId) => {
    setUploadStatus(prev => ({ ...prev, [`${phaseId}-${taskId}`]: 'Uploading...' }));
    try {
      // Create submission first
      const submission = await createSubmission(null, taskId, token);
      // Then upload file
      await uploadSubmissionFile(file, submission.id, token);
      setUploadStatus(prev => ({ ...prev, [`${phaseId}-${taskId}`]: 'Uploaded!' }));
      // Refresh tasks to show updated status
      fetchTasks(phaseId);
    } catch (e) {
      setUploadStatus(prev => ({ ...prev, [`${phaseId}-${taskId}`]: 'Upload failed' }));
      setProgressError('Failed to upload file');
    }
  };

  // Fetch or create profile on mount
  useEffect(() => {
    async function fetchOrCreateProfile() {
      // Wait for authentication to complete
      if (authLoading) {
        console.log("StartupDashboard: Auth still loading, waiting...");
        return;
      }

      // If there's an authentication error, display it and stop loading
      if (authError) {
        setLoading(false);
        setError(authError);
        console.error("StartupDashboard: Auth error detected:", authError);
        return;
      }

      // If authLoading is false and no user/token, it means login failed or no session
      if (!user || !user.id || !token) {
        setLoading(false);
        setError("Authentication required. Please ensure you are logged in.");
        console.warn("StartupDashboard: User or token missing after auth load. Redirect to login expected.");
        return;
      }

      console.log("StartupDashboard: Attempting to fetch profile with User ID:", user.id, "and Token (first 10 chars):", token ? token.substring(0,10) + '...' : 'N/A');

      setLoading(true); // Start loading for profile data
      setError(""); // Clear previous errors
      setEditMsg(""); // Clear previous messages
      try {
        let prof = await getStartupProfile(token, user.id);
        setProfile(prof);
        setIsEditing(false); // Set to view mode if profile exists
        setLogoPreview(prof?.logoUrl || null); // Initialize logo preview with fetched URL
        // Ensure that fetched team members and documents have an 'id' for frontend tracking
        setTeamMembers(prof?.teamMembers?.map(tm => ({...tm, id: tm.id})) || []);
        setDocuments(prof?.documents?.map(doc => ({...doc, id: doc.id})) || []);
        console.log("StartupDashboard: Profile fetched successfully.");
        
        // Fetch mentors after profile is loaded
        await fetchMentors();
        
        // Fetch progress templates after profile is loaded
        await fetchTemplates();
      } catch (err) {
        console.error("StartupDashboard: Error fetching profile:", err);
        // Check if the error indicates profile not found or forbidden (due to backend mapping)
        const errorMessage = err.message ? err.message.toLowerCase() : '';
        if (errorMessage.includes("404") || errorMessage.includes("not found") || errorMessage.includes("profile not found") || errorMessage.includes("403")) {
          try {
            console.log("StartupDashboard: Profile not found (or forbidden), attempting to create new profile...");
            let prof = await createStartupProfile(token, user.id);
            setProfile(prof);
            setEditMsg("New profile created successfully. Please fill in details!");
            setCurrentPage('myProfile'); // Navigate to profile to fill details
            setIsEditing(true); // Automatically go to edit mode for new profile
            setLogoPreview(prof?.logoUrl || null); // Initialize logo preview for new profile
            setTeamMembers(prof?.teamMembers?.map(tm => ({...tm, id: tm.id})) || []);
            setDocuments(prof?.documents?.map(doc => ({...doc, id: doc.id})) || []);
            console.log("StartupDashboard: New profile created successfully.");
          } catch (e) {
            console.error("StartupDashboard: Error creating profile:", e);
            setError("Could not load or create profile: " + e.message);
          }
        } else {
          // For other errors (e.g., actual 403 from backend due to invalid token), just show the error message
          setError(`Failed to load profile: ${err.message}`);
        }
      } finally {
        setLoading(false); // End loading for profile data
      }
    }
    // Only attempt to fetch/create profile if auth is not loading and no authError
    // and user/token are available
    if (!authLoading && !authError) {
      fetchOrCreateProfile();
    }
  }, [user, token, authLoading, authError, logout]); // Depend on user, token, authLoading, authError, and logout


  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result); // Set Base64 string for preview
        setProfile(prevProfile => ({ ...prevProfile, logoUrl: reader.result })); // Update profile state with Base64
      };
      reader.readAsDataURL(file); // Read file as Base64
    } else {
      setLogoPreview(null);
      setProfile(prevProfile => ({ ...prevProfile, logoUrl: '' }));
    }
  };

  // Helper function to generate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'SN'; // Startup Name fallback
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // --- NEW HANDLERS FOR TEAM MEMBERS ---
  const handleTeamMemberChange = (index, e) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [e.target.name]: e.target.value };
    setTeamMembers(updatedMembers);
  };

  const handleNewTeamMemberChange = (e) => {
    setNewTeamMember({ ...newTeamMember, [e.target.name]: e.target.value });
  };

  const addTeamMember = () => {
    if (newTeamMember.name && newTeamMember.role) {
      // For new members, generate a temporary client-side ID (e.g., timestamp)
      // The backend will assign a real UUID upon save.
      setTeamMembers([...teamMembers, { ...newTeamMember, id: `temp-${Date.now()}` }]);
      setNewTeamMember({ name: '', role: '', linkedin: '' }); // Clear form
    } else {
      setError("Team member name and role are required.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const removeTeamMember = (idToRemove) => {
    setTeamMembers(teamMembers.filter(member => member.id !== idToRemove));
  };
  // --- END NEW HANDLERS FOR TEAM MEMBERS ---

  // --- NEW HANDLERS FOR DOCUMENTS ---
  const handleDocumentFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedDocs = [...documents];
        updatedDocs[index] = {
          ...updatedDocs[index],
          url: reader.result, // Store Base64 string
          name: file.name, // Use file name as document name
          fileType: file.type // Store file MIME type
        };
        setDocuments(updatedDocs);
      };
      reader.readAsDataURL(file); // Read file as Base64
    }
  };

  const handleNewDocumentFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDocument({
          name: file.name, // Use file name as document name
          url: reader.result, // Store Base64 string
          fileType: file.type // Store file MIME type
        });
      };
      reader.readAsDataURL(file); // Read file as Base64
    }
  };

  const handleDocumentNameChange = (index, e) => {
    const updatedDocs = [...documents];
    updatedDocs[index] = { ...updatedDocs[index], name: e.target.value };
    setDocuments(updatedDocs);
  };

  const handleNewDocumentNameChange = (e) => {
    setNewDocument(prev => ({ ...prev, name: e.target.value }));
  };

  const addDocument = () => {
    if (newDocument.name && newDocument.url) {
      // For new documents, generate a temporary client-side ID (e.g., timestamp)
      // The backend will assign a real UUID upon save.
      setDocuments([...documents, { ...newDocument, id: `temp-${Date.now()}` }]);
      setNewDocument({ name: '', url: '', fileType: '' }); // Clear form
    } else {
      setError("Document name and a file are required.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const removeDocument = (idToRemove) => {
    setDocuments(documents.filter(doc => doc.id !== idToRemove));
  };
  // --- END NEW HANDLERS FOR DOCUMENTS ---


  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditMsg("");
    setError("");

    if (!user || !user.id || !token) { // Check for user and token
      setError('User not authenticated or ID/token missing. Cannot save profile.');
      setSaving(false);
      console.error("StartupDashboard: Save failed - User or token missing.");
      return;
    }

    console.log("StartupDashboard: Attempting to save profile with User ID:", user.id, "and Token (first 10 chars):", token ? token.substring(0,10) + '...' : 'N/A');
    console.log("StartupDashboard: Payload being sent:", { ...profile, teamMembers, documents });


    try {
      const payload = {
        startupName: profile?.startupName || '',
        description: profile?.description || '',
        website: profile?.website || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        linkedin: profile?.linkedin || '',
        twitter: profile?.twitter || '',
        logoUrl: logoPreview || '', // Use logoPreview (Base64) for saving
        mission: profile?.mission || '',
        vision: profile?.vision || '',
        industry: profile?.industry || '', // New field
        country: profile?.country || '',   // New field
        city: profile?.city || '',         // New field
        // CORRECTED: Send 'id' for existing members (UUIDs) and 'null' for new ones (temp IDs)
        teamMembers: teamMembers.map(member => ({
          id: (typeof member.id === 'string' && member.id.length === 36) ? member.id : null, // Check if it's a UUID
          name: member.name,
          role: member.role,
          linkedin: member.linkedin,
          avatarUrl: member.avatarUrl || null // Ensure avatarUrl is sent if DTO expects it, even if null
        })),
        // CORRECTED: Send 'id' for existing documents (UUIDs) and 'null' for new ones (temp IDs)
        documents: documents.map(doc => ({
          id: (typeof doc.id === 'string' && doc.id.length === 36) ? doc.id : null, // Check if it's a UUID
          name: doc.name,
          url: doc.url,
          fileType: doc.fileType
        })),
      };
      const updated = await updateStartupProfile(token, user.id, payload); // Use user.id from useAuth
      setProfile(updated);
      setEditMsg("Profile updated successfully!");
      setIsEditing(false); // Switch to view mode after saving
      // Re-initialize teamMembers and documents from the saved profile to get backend IDs
      // Ensure that fetched team members and documents have an 'id' for frontend tracking
      setTeamMembers(updated?.teamMembers?.map(tm => ({...tm, id: tm.id})) || []);
      setDocuments(updated?.documents?.map(doc => ({...doc, id: doc.id})) || []);
      console.log("StartupDashboard: Profile saved successfully.");
    } catch (err) {
      console.error("StartupDashboard: Failed to update profile:", err);
      setError(`Failed to update profile: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => {
        setEditMsg("");
        setError("");
      }, 5000); // Message disappears after 5 seconds
    }
  };

  // Helper function to render an input field with consistent styling
  const renderInputField = (id, label, type, name, value, placeholder, Icon) => (
    <div className="mb-5">
      <label htmlFor={id} className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
        {Icon && <Icon size={16} className="mr-2 text-brand-primary" />}
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition duration-200 ease-in-out bg-white/90 text-sm"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={saving}
      />
    </div>
  );

  // Helper function to render a textarea field with consistent styling
  const renderTextareaField = (id, label, name, value, placeholder, Icon) => (
    <div className="mb-5">
      <label htmlFor={id} className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
        {Icon && <Icon size={16} className="mr-2 text-brand-primary" />}
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows="4"
        className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition duration-200 ease-in-out bg-white/90 text-sm"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={saving}
      ></textarea>
    </div>
  );

  // Helper function to render a display item with an icon and link support
  const renderDisplayItem = (label, value, Icon, isLink = false) => {
    if (!value) return null;
    return (
      <div className="flex items-start text-gray-700 mb-3">
        <Icon size={18} className="mr-3 text-brand-primary flex-shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="font-medium text-xs text-gray-500">{label}:</span>
          {isLink ? (
            <a
              href={value.startsWith('http') ? value : `https://${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline flex items-center break-all text-sm font-semibold"
            >
              {value} <ExternalLink size={12} className="ml-1" />
            </a>
          ) : (
            <span className="break-all text-sm font-semibold">{value}</span>
          )}
        </div>
      </div>
    );
  };

  // Placeholder for the default logo if logoUrl is empty or invalid
  const defaultLogo = "https://placehold.co/100x100/E0E7FF/0A2D5C?text=Logo";

  // Render loading state
  if (loading || authLoading) { // Check both authLoading and profile loading
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex items-center justify-center font-inter relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slower"></div> {/* Changed from purple-300 */}
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div> {/* Changed from pink-300 */}
        <div className="absolute top-1/10 right-1/10 w-24 h-24 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slow delay-1000"></div>
        <div className="absolute bottom-1/5 left-1/5 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slower delay-2000"></div>

        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl shadow-2xl border border-blue-200 z-10 animate-fade-in transform scale-105">
          <Loader2 className="animate-spin-slow text-brand-primary mb-8" size={80} />
          <p className="text-3xl font-extrabold text-brand-dark text-center">Loading your amazing dashboard...</p>
          <p className="text-lg text-gray-600 mt-2">Preparing the investor-ready view.</p>
        </div>
      </div>
    );
  }

  // Render error state if profile is null and there's an error (including authError)
  if (!profile && error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex items-center justify-center font-inter relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slower"></div>

        <div className="flex flex-col items-center p-16 bg-white rounded-3xl shadow-2xl border border-red-200 z-10 animate-fade-in transform scale-105">
          <XCircle className="mb-8 text-red-600" size={80} />
          <p className="text-3xl font-extrabold mb-4 text-red-800 text-center">Error Loading Profile</p>
          <p className="text-center text-lg text-gray-700 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center px-10 py-5 bg-red-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-xl"
          >
            <Loader2 className="animate-spin mr-3" size={24} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Helper for sidebar navigation items
  const navItems = [
    { name: 'Dashboard', icon: Home, page: 'dashboard' },
    { name: 'My Profile', icon: User, page: 'myProfile' },
    { name: 'Incubation Progress', icon: CheckCircle2, page: 'incubationProgress' },
    { name: 'My Mentor', icon: GraduationCap, page: 'myMentor' },
    { name: 'Opportunities', icon: Briefcase, page: 'opportunities' },
    { name: 'Notifications', icon: BellRing, page: 'notifications' },
  ];

  // Main component rendering
  return (
    <div className="min-h-screen bg-gray-100 font-inter flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background animated shapes */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slower"></div> {/* Changed from purple-300 */}
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div> {/* Changed from pink-300 */}
      <div className="absolute top-1/10 right-1/10 w-24 h-24 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slow delay-1000"></div>
      <div className="absolute bottom-1/5 left-1/5 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slower delay-2000"></div>
      <div className="absolute top-3/4 left-1/10 w-56 h-56 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float delay-500"></div>

      {/* Main Dashboard Container */}
<div className="flex w-full h-screen bg-white overflow-hidden">        {/* Custom CSS for animations and variables */}
        <style>
          {`
            @tailwind base;
            @tailwind components;
            @tailwind utilities;

            @keyframes float {
              0% { transform: translateY(0); }
              50% { transform: translateY(-16px); }
              100% { transform: translateY(0); }
            }
            @keyframes float-slow {
              0% { transform: translateY(0); }
              50% { transform: translateY(-32px); }
              100% { transform: translateY(0); }
            }
            @keyframes float-slower {
              0% { transform: translateY(0); }
              50% { transform: translateY(-48px); }
              100% { transform: translateY(0); }
            }
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes float-image {
              0% { transform: translate(-50%, -50%) scale(1) rotate(-2deg); }
              25% { transform: translate(-48%, -52%) scale(1.04) rotate(2deg); }
              50% { transform: translate(-50%, -50%) scale(1.08) rotate(-1deg); }
              75% { transform: translate(-52%, -48%) scale(1.04) rotate(2deg); }
              100% { transform: translate(-50%, -50%) scale(1) rotate(-2deg); }
            }

            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
            .animate-float-slow {
              animation: float-slow 6s ease-in-out infinite;
            }
            .animate-float-slower {
              animation: float-slower 10s ease-in-out infinite;
            }
            .animate-fade-in {
              animation: fade-in 1.2s ease-out forwards;
            }
            .animate-spin-slow {
              animation: spin-slow 30s linear infinite;
            }
            .animate-float-image {
              animation: float-image 12s ease-in-out infinite;
            }

            :root {
              --brand-primary: #299DFF;
              --brand-dark: #0A2D5C;
            }

            .bg-brand-primary {
              background-color: var(--brand-primary) !important;
            }
            .bg-brand-dark {
              background-color: var(--brand-dark) !important;
            }
            .text-brand-primary {
              color: var(--brand-primary) !important;
            }
            .text-brand-dark {
              color: var(--brand-dark) !important;
            }
            /* Custom shadow for a more premium feel */
            .custom-shadow {
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
            }

            /* Ensure disabled button retains its background color */
            /* Removed previous gradient and used a solid color for disabled state */
            .save-button:disabled {
              background-color: #93c5fd; /* A light blue, like Tailwind's blue-300 */
              color: #ffffff; /* Ensure text color remains white */
              opacity: 0.8; /* Slightly less opaque */
              cursor: not-allowed;
              box-shadow: none; /* Remove shadow when disabled */
            }
          `}
        </style>

        {/* Left Sidebar */}
        <div className="w-64 bg-white p-6 flex flex-col justify-between border-r border-gray-100 shadow-inner">
          <div>
            {/* Removed Logo and Brand Name (Pitch.io) */}
            {/* Removed Create New Pitch Button */}

            {/* Navigation Links */}
            <nav className="space-y-4 pt-10"> {/* Added pt-10 for spacing after removing header */}
              {navItems.map((item) => (
                <a
                  key={item.page}
                  href="#"
                  onClick={() => {
                    setCurrentPage(item.page);
                    setIsEditing(false); // Always switch to view mode when changing pages
                    setActiveTab('basicInfo'); // Reset profile tab
                  }}
                  className={`flex items-center p-3 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-brand-primary transition duration-200
                    ${currentPage === item.page ? 'bg-blue-50 text-brand-primary font-semibold' : ''}`}
                >
                  <item.icon size={20} className="mr-3" />
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Logout Section */}
          <div className="mt-10">
            <button
  onClick={logout}
  className="flex items-center px-4 py-2 text-red-600 font-bold rounded-full hover:bg-red-50 hover:text-red-800 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-base"
>
  <LogOut className="mr-2" size={20} /> Logout
</button>
          </div>
        </div>

        {/* Right Main Content Area */}
<div className="flex-1 p-8 bg-gray-50">          {/* Top Header Bar */}
          <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <div className="text-gray-600 font-medium">
              {/* Display current date and time */}
              <h2 className="text-2xl font-bold text-brand-dark capitalize">{currentPage.replace(/([A-Z])/g, ' $1')}</h2>
              <p className="text-sm">
                {currentDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {" at "}
                {currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Mail size={24} className="text-gray-500 cursor-pointer hover:text-brand-primary transition-colors" />
              <Bell size={24} className="text-gray-500 cursor-pointer hover:text-brand-primary transition-colors" />
              <div className="flex items-center bg-gray-100 rounded-full p-2 cursor-pointer hover:bg-gray-200 transition-colors">
                {/* Display first two letters of startup name or 'SN' if not available */}
                <div className="w-8 h-8 bg-blue-200 text-brand-dark font-bold rounded-full flex items-center justify-center text-sm mr-2">
                  {profile?.startupName ? profile.startupName.substring(0, 2).toUpperCase() : 'SN'}
                </div>
                {/* Display full startup name */}
                <span className="text-gray-700 font-medium">{profile?.startupName || 'Startup Name'}</span>
                <ChevronDown size={18} className="ml-2 text-gray-500" />
              </div>
            </div>
          </header>

          {/* Messages: Error, Success */}
          {error && (
            <div className="flex items-center p-4 mb-6 bg-red-100/80 text-red-700 rounded-xl shadow-md border border-red-300 animate-fade-in">
              <XCircle className="mr-3 text-red-600" size={20} /> <span className="font-medium text-base">{error}</span>
            </div>
          )}

          {editMsg && (
            <div className="flex items-center p-4 mb-6 bg-green-100/80 text-green-700 rounded-xl shadow-md border border-green-300 animate-fade-in">
              <CheckCircle className="mr-3 text-green-600" size={20} /> <span className="font-medium text-base">{editMsg}</span>
            </div>
          )}

          {/* --- Page Content Rendering --- */}
          {currentPage === 'dashboard' && (
            <div className="animate-fade-in">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-8 rounded-2xl shadow-lg mb-8 flex flex-col sm:flex-row items-center justify-between animate-fade-in"> {/* Changed to-purple-100 to to-blue-200 */}
                <div className="text-center sm:text-left mb-6 sm:mb-0">
                  <h1 className="text-4xl font-extrabold text-brand-dark mb-2">Welcome, {profile?.startupName || 'Startup Name'}!</h1>
                  <p className="text-lg text-gray-700">Ready to conquer the day with your groundbreaking ideas?</p>
                </div>
                <div className="relative w-36 h-36">
                    {/* Display user's uploaded logo or a default placeholder */}
                    <img
                      src={logoPreview || "https://placehold.co/150x150/E0E7FF/0A2D5C?text=Logo"}
                      alt="Startup Logo"
                      className="w-full h-full object-cover rounded-full shadow-md animate-float-image z-10"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/E0E7FF/0A2D5C?text=Logo"; }}
                    />
                    <Quote size={40} className="absolute bottom-0 right-0 text-gray-600 opacity-70 transform rotate-12" />
                </div>
              </div>

              {/* Removed Overview Cards as per request */}
              {/* <h3 className="text-xl font-bold text-brand-dark mb-4">Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 rounded-xl shadow-md bg-yellow-100 text-yellow-800 flex flex-col items-center justify-center animate-fade-in hover:scale-105 transition-transform duration-300">
                  <Lightbulb size={36} className="mb-2 text-yellow-600" />
                  <AnimatedCounter targetValue={dashboardMetrics.openRate} suffix="%" />
                  <p className="text-sm font-medium">Open Rate</p>
                </div>
                <div className="p-6 rounded-xl shadow-md bg-blue-100 text-blue-800 flex flex-col items-center justify-center animate-fade-in delay-100 hover:scale-105 transition-transform duration-300">
                  <CheckCircle size={36} className="mb-2 text-blue-600" />
                  <AnimatedCounter targetValue={dashboardMetrics.complete} suffix="%" />
                  <p className="text-sm font-medium">Profile Complete</p>
                </div>
                <div className="p-6 rounded-xl shadow-md bg-blue-100 text-blue-800 flex flex-col items-center justify-center animate-fade-in delay-200 hover:scale-105 transition-transform duration-300">
                  <Star size={36} className="mb-2 text-blue-600" />
                  <AnimatedCounter targetValue={dashboardMetrics.uniqueViews} />
                  <p className="text-sm font-medium">Unique Views</p>
                </div>
                <div className="p-6 rounded-xl shadow-md bg-purple-100 text-purple-800 flex flex-col items-center justify-center animate-fade-in delay-300 hover:scale-105 transition-transform duration-300">
                  <Eye size={36} className="mb-2 text-purple-600" />
                  <AnimatedCounter targetValue={dashboardMetrics.totalViews} />
                  <p className="text-sm font-medium">Total Views</p>
                </div>
              </div> */}

              {/* Dashboard Specific Cards (remaining) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Incubation Progress Card */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
                  <h3 className="text-xl font-bold text-brand-dark mb-5 flex items-center">
                    <CheckCircle2 size={24} className="mr-3 text-green-600" /> Incubation Progress
                  </h3>
                  <div className="flex items-center justify-between"> {/* Changed to flex-row for better control */}
                    <CircularProgressBar progress={getProgressStats().percentage} size={100} strokeWidth={10} /> {/* Use real progress data */}
                    <div className="flex-1 text-left ml-4"> {/* Added flex-1 and ml-4 */}
                      <p className="text-lg font-semibold text-gray-800 mb-2">
                        {selectedTemplate ? selectedTemplate.name : 'No Template Selected'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getProgressStats().completed} of {getProgressStats().total} tasks completed
                      </p>
                      <button
                        onClick={() => setCurrentPage('incubationProgress')}
                        className="mt-4 px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-full shadow-md hover:bg-blue-600 transition duration-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Assigned Mentor Card */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
                  <h3 className="text-xl font-bold text-brand-dark mb-5 flex items-center">
                    <GraduationCap size={24} className="mr-3 text-brand-primary" /> {/* Changed from text-purple-600 */}
                    Assigned Mentor
                  </h3>
                  <div className="flex items-center mb-4">
                    <img src={currentMentor.photo} alt={currentMentor.fullName || 'Mentor'} className="w-20 h-20 rounded-full object-cover mr-4 shadow-md" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{currentMentor.fullName || 'No Name'}</h4>
                      <p className="text-sm text-gray-600">{currentMentor.role || ''}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 italic">"{currentMentor.latestAdvice || ''}"</p>
                  <div className="flex space-x-3">
                    <a href={currentMentor && currentMentor.email ? `mailto:${currentMentor.email}` : undefined} className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center hover:bg-green-200 transition-colors" disabled={!(currentMentor && currentMentor.email)}>
                      <Mail size={16} className="mr-2" /> Message
                    </a>
                    <a href={currentMentor && currentMentor.linkedin ? currentMentor.linkedin : undefined} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center hover:bg-blue-200 transition-colors" disabled={!(currentMentor && currentMentor.linkedin)}>
                      <Linkedin size={16} className="mr-2" /> LinkedIn
                    </a>
                  </div>
                </div>

                {/* Recent Notifications Card */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
                  <h3 className="text-xl font-bold text-brand-dark mb-5 flex items-center">
                    <BellRing size={24} className="mr-3 text-orange-600" /> Recent Notifications
                  </h3>
                  <ul className="space-y-4">
                    {mockNotifications.slice(0, 3).map(notif => (
                      <li key={notif.id} className="flex items-start">
                        <div className="flex-shrink-0 mt-1 mr-3 text-gray-500">{notif.icon}</div>
                        <div>
                          <p className="text-sm text-gray-700 font-medium mb-1">{notif.message}</p>
                          <p className="text-xs text-gray-500">{notif.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setCurrentPage('notifications')}
                    className="mt-6 px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full shadow-sm hover:bg-gray-200 transition duration-200"
                  >
                    View All Notifications
                  </button>
                </div>

                {/* Upcoming Task Card */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
                  <h3 className="text-xl font-bold text-brand-dark mb-5 flex items-center">
                    <Calendar size={24} className="mr-3 text-brand-dark" /> {/* Changed from text-indigo-600 */}
                    Upcoming Task
                  </h3>
                  <p className="text-lg font-semibold text-gray-800 mb-2">{mockUpcomingTask.title}</p>
                  <p className="text-sm text-gray-600 mb-3">{mockUpcomingTask.description}</p>
                  <div className="flex items-center text-red-500 text-sm font-medium mb-4">
                    <CalendarDays size={16} className="mr-2" /> Deadline: {mockUpcomingTask.deadline}
                  </div>
                  <a href={mockUpcomingTask.link} className="px-5 py-2 bg-brand-primary text-white text-sm font-semibold rounded-full shadow-md hover:bg-blue-600 transition duration-200"> {/* Changed from bg-indigo-500 */}
                    Go to Task
                  </a>
                </div>
              </div>

              {/* Enhanced Assigned Mentors Section - Only in Dashboard */}
              {mentors.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-xl border border-blue-100 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-brand-dark flex items-center">
                      <Users size={28} className="mr-3 text-purple-600" />
                      Your Assigned Mentors
                    </h3>
                    <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                      {mentors.filter(Boolean).length} Mentor{mentors.filter(Boolean).length > 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.filter(Boolean).map((mentor, index) => (
                      <div key={(mentor && mentor.id) || index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white font-bold flex items-center justify-center text-xl mr-4 shadow-lg">
                            {mentor && mentor.fullName ? mentor.fullName.substring(0, 2).toUpperCase() : (mentor && mentor.email ? mentor.email.substring(0, 2).toUpperCase() : 'MN')}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{mentor && mentor.fullName ? mentor.fullName : (mentor && mentor.email ? mentor.email : "No Name")}</h4>
                            <p className="text-sm text-gray-600">{mentor && mentor.email ? mentor.email : "No Email"}</p>
                            {mentor && mentor.role && (
                              <p className="text-xs text-blue-600 font-medium mt-1">{mentor.role}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Mentor Bio/Description */}
                        {mentor && mentor.bio && (
                          <p className="text-sm text-gray-700 mb-4 italic">"{mentor.bio}"</p>
                        )}
                        
                        {/* Contact & Social Links */}
                        <div className="space-y-3">
                          {mentor && mentor.email && (
                            <a 
                              href={`mailto:${mentor.email}`} 
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
                            >
                              <Mail size={16} className="mr-2" /> Email Mentor
                            </a>
                          )}
                          
                          <div className="flex gap-2">
                            {mentor && mentor.linkedin && (
                              <a 
                                href={mentor.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
                              >
                                <Linkedin size={14} className="mr-1" /> LinkedIn
                              </a>
                            )}
                            
                            {mentor && mentor.twitter && (
                              <a 
                                href={mentor.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-blue-400 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-blue-500 transition-colors"
                              >
                                <Twitter size={14} className="mr-1" /> Twitter
                              </a>
                            )}
                            
                            {mentor && mentor.website && (
                              <a 
                                href={mentor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-gray-700 transition-colors"
                              >
                                <Globe size={14} className="mr-1" /> Website
                              </a>
                            )}
                          </div>
                        </div>
                        
                        {/* Latest Advice */}
                        {mentor && mentor.latestAdvice && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <p className="text-xs text-blue-800 font-medium mb-1">Latest Advice</p>
                            <p className="text-sm text-gray-700 italic">"{mentor.latestAdvice}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {mentorsLoading && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-3">
                        <Loader2 className="animate-spin text-purple-600" size={24} />
                        <p className="text-gray-600 font-medium">Loading your mentors...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No Mentors Assigned Section - Only in Dashboard */}
              {!mentorsLoading && mentors.length === 0 && (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
                  <h3 className="text-xl font-bold text-brand-dark mb-5 flex items-center">
                    <GraduationCap size={24} className="mr-3 text-gray-600" />
                    Mentor Assignment
                  </h3>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap size={32} className="text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No Mentors Assigned Yet</h4>
                    <p className="text-gray-600 mb-4">You haven't been assigned any mentors yet. Please contact your tenant admin to get assigned a mentor.</p>
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => setCurrentPage('myMentor')} 
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Mentor Page
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentPage === 'myProfile' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-brand-dark flex items-center">
                  <User size={28} className="mr-3 text-brand-primary" /> My Startup Profile
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center px-5 py-2 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 border border-blue-700 transform hover:scale-105 hover:-translate-y-0.5 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
                >
                  {isEditing ? (
                    <>
                      <Eye className="mr-2" size={18} /> View Profile
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2" size={18} /> Edit Profile
                    </>
                  )}
                </button>
              </div>

              {isEditing ? (
                // Profile Edit Form
                <form onSubmit={handleSave} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                  <h4 className="text-xl font-bold text-brand-dark mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField('startupName', 'Startup Name', 'text', 'startupName', profile?.startupName || "", 'e.g., InnovateTech Solutions', Building)}

                    {/* Logo Upload Field */}
                    <div className="mb-5">
                      <label htmlFor="logoUpload" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                        <Image size={16} className="mr-2 text-brand-primary" />
                        Upload Company Logo
                      </label>
                      <input
                        type="file"
                        id="logoUpload"
                        name="logoUpload"
                        accept="image/*"
                        className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition duration-200 ease-in-out bg-white/90 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-primary hover:file:bg-blue-100"
                        onChange={handleLogoChange}
                        disabled={saving}
                      />
                      {logoPreview && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Logo Preview:</p>
                          <img src={logoPreview} alt="Logo Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
                        </div>
                      )}
                    </div>

                    {renderInputField('industry', 'Industry', 'text', 'industry', profile?.industry || "", 'e.g., Software, FinTech, Healthcare', Briefcase)}
                    {renderInputField('website', 'Official Website URL', 'url', 'website', profile?.website || "", 'https://yourstartup.com', Globe)}
                    {renderInputField('phone', 'Contact Phone Number', 'tel', 'phone', profile?.phone || "", '+1 (555) 123-4567', Phone)}
                    {renderInputField('address', 'Street Address', 'text', 'address', profile?.address || "", '123 Innovation Drive', MapPin)}
                    {renderInputField('city', 'City', 'text', 'city', profile?.city || "", 'e.g., San Francisco', MapPin)}
                    {renderInputField('country', 'Country', 'text', 'country', profile?.country || "", 'e.g., USA', MapPin)}
                    {renderInputField('linkedin', 'LinkedIn Company Page URL', 'url', 'linkedin', profile?.linkedin || "", 'https://linkedin.com/company/yourstartup', Linkedin)}
                    {renderInputField('twitter', 'Twitter Handle URL', 'url', 'twitter', profile?.twitter || "", 'https://twitter.com/yourstartup', Twitter)}
                  </div>
                  <h4 className="text-xl font-bold text-brand-dark mt-8 mb-4">About Your Startup</h4>
                  {renderTextareaField('description', 'Short Description', 'description', profile?.description || "", 'A brief overview of your startup and its core offering.', BookOpenText)}
                  {renderTextareaField('mission', 'Mission Statement', 'mission', profile?.mission || "", 'What is your company\'s purpose? What problem do you solve?', Target)}
                  {renderTextareaField('vision', 'Vision Statement', 'vision', profile?.vision || "", 'What future do you envision? What is your long-term aspiration?', EyeIcon)}

                  {/* --- EDITABLE FOUNDERS & TEAM SECTION --- */}
                  <h4 className="text-xl font-bold text-brand-dark mt-8 mb-4 flex items-center">
                                            <Users size={20} className="mr-2 text-blue-600" /> Founders & Team
                  </h4>
                  <div className="space-y-4 mb-6">
                    {teamMembers.map((member, index) => (
                      <div key={member.id || `temp-${index}`} className="flex flex-col sm:flex-row items-center sm:items-end p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                          <label htmlFor={`memberName-${index}`} className="block text-gray-700 text-sm font-semibold mb-2">
                            Avatar
                          </label>
                          <div className="w-16 h-16 rounded-full bg-blue-200 text-brand-dark font-bold flex items-center justify-center text-lg mr-2 border border-gray-300">
                            {getInitials(member.name)}
                          </div>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                          <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            className="shadow-sm border border-gray-200 rounded-lg py-2 px-3 text-sm"
                            value={member.name}
                            onChange={(e) => handleTeamMemberChange(index, e)}
                            disabled={saving}
                          />
                          <input
                            type="text"
                            name="role"
                            placeholder="Role"
                            className="shadow-sm border border-gray-200 rounded-lg py-2 px-3 text-sm"
                            value={member.role}
                            onChange={(e) => handleTeamMemberChange(index, e)}
                            disabled={saving}
                          />
                          <input
                            type="url"
                            name="linkedin"
                            placeholder="LinkedIn URL"
                            className="shadow-sm border border-gray-200 rounded-lg py-2 px-3 text-sm"
                            value={member.linkedin}
                            onChange={(e) => handleTeamMemberChange(index, e)}
                            disabled={saving}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTeamMember(member.id || `temp-${index}`)}
                          className="ml-0 sm:ml-4 mt-4 sm:mt-0 p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          disabled={saving}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex flex-col sm:flex-row items-center gap-4">
                      <input
                        type="text"
                        name="name"
                        placeholder="New Member Name"
                        className="shadow-sm border border-gray-200 rounded-lg py-2 px-3 text-sm flex-1"
                        value={newTeamMember.name}
                        onChange={handleNewTeamMemberChange}
                        disabled={saving}
                      />
                      <input
                        type="text"
                        name="role"
                        placeholder="New Member Role"
                        className="shadow-sm border border-gray-200 rounded-lg py-2 px-3 text-sm flex-1"
                        value={newTeamMember.role}
                        onChange={handleNewTeamMemberChange}
                        disabled={saving}
                      />
                      <input
                        type="url"
                        name="linkedin"
                        placeholder="LinkedIn URL (Optional)"
                        className="shadow-sm border border-gray-200 rounded-lg py-2 px-3 text-sm flex-1"
                        value={newTeamMember.linkedin}
                        onChange={handleNewTeamMemberChange}
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={addTeamMember}
                        className="px-4 py-2 bg-brand-primary text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center"
                        disabled={saving}
                      >
                        <Plus size={16} className="mr-1" /> Add
                      </button>
                    </div>
                  </div>
                  {/* --- END EDITABLE FOUNDERS & TEAM SECTION --- */}

                  {/* --- EDITABLE UPLOADED DOCUMENTS SECTION --- */}
                  <h4 className="text-xl font-bold text-brand-dark mt-8 mb-4 flex items-center">
                    <FileText size={20} className="mr-2 text-teal-600" /> Uploaded Documents
                  </h4>
                  <div className="space-y-4 mb-6">
                    {documents.map((doc, index) => (
                      <div key={doc.id || `temp-${index}`} className="flex flex-col sm:flex-row items-center sm:items-end p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                          <input
                            type="text"
                            name="name"
                            placeholder="Document Title"
                            className="shadow-sm border border-gray-200 rounded-lg py-2 px-3 text-sm"
                            value={doc.name}
                            onChange={(e) => handleDocumentNameChange(index, e)}
                            disabled={saving}
                          />
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" // Specify accepted file types
                            className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition duration-200 ease-in-out bg-white/90 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-primary hover:file:bg-blue-100"
                            onChange={(e) => handleDocumentFileChange(index, e)}
                            disabled={saving}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id || `temp-${index}`)}
                          className="ml-0 sm:ml-4 mt-4 sm:mt-0 p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          disabled={saving}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex flex-col sm:flex-row items-center gap-4">
                      <input
                        type="text"
                        name="name"
                        placeholder="New Document Title"
                        className="shadow-sm border border-gray-200 rounded-lg py-2 px-3 text-sm flex-1"
                        value={newDocument.name}
                        onChange={handleNewDocumentNameChange}
                        disabled={saving}
                      />
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" // Specify accepted file types
                        className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition duration-200 ease-in-out bg-white/90 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-primary hover:file:bg-blue-100"
                        onChange={handleNewDocumentFileChange}
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={addDocument}
                        className="px-4 py-2 bg-brand-primary text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center"
                        disabled={saving}
                      >
                        <Plus size={16} className="mr-1" /> Add
                      </button>
                    </div>
                  </div>
                  {/* --- END EDITABLE UPLOADED DOCUMENTS SECTION --- */}

                  <div className="flex justify-center mt-8">
                    <button
                      type="submit"
                      className="flex items-center px-8 py-4 bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 text-base"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="animate-spin mr-3" size={24} /> Saving Brilliance...
                        </>
                      ) : (
                        <>
                          <Save className="mr-3" size={24} /> Save Your Masterpiece
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // Profile Display View
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8 pb-6 border-b border-dashed border-gray-200">
                    <img
                      src={profile?.logoUrl || defaultLogo}
                      alt="Startup Logo"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-md border-4 border-brand-primary p-0.5 bg-white mb-4 sm:mb-0 sm:mr-6 transition-transform duration-300 hover:scale-105"
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
                    />
                    <div className="text-center sm:text-left flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-2 leading-tight">
                        {profile?.startupName || 'Your Startup Name'}
                      </h2>
                      <p className="text-base text-gray-700 font-normal leading-relaxed">
                        {profile?.description || 'No description provided yet. Tell us about your vision!'}
                      </p>
                      {profile?.website && (
                        <a
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-4 text-sm text-brand-primary hover:underline font-semibold transition-colors duration-200 group"
                        >
                          Visit Website <ExternalLink size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Basic Information and Social Presence Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mt-8">
                    {/* Basic Information Card */}
                    <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border border-blue-200 transform hover:scale-[1.01] transition-transform duration-300"> {/* Changed to-indigo-50 to to-blue-100 */}
                      <h3 className="text-xl font-extrabold text-brand-dark mb-4 flex items-center pb-2 border-b border-blue-100">
                        <div className="p-2 bg-brand-primary rounded-full text-white mr-3 shadow-md">
                          <Info size={20} />
                        </div>
                        Basic Information
                      </h3>
                      <div className="space-y-3"> {/* Added space-y for consistent item spacing */}
                        {renderDisplayItem('Industry', profile?.industry, Briefcase)}
                        {renderDisplayItem('Official Website', profile?.website, Globe, true)}
                        {renderDisplayItem('Direct Phone', profile?.phone, Phone)}
                        {renderDisplayItem('Address', profile?.address, MapPin)}
                        {renderDisplayItem('City', profile?.city, MapPin)}
                        {renderDisplayItem('Country', profile?.country, MapPin)}
                      </div>
                    </div>

                    {/* Social Presence Card */}
                    <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border border-blue-200 transform hover:scale-[1.01] transition-transform duration-300"> {/* Changed from purple-50 to pink-50, and border-purple-200 */}
                      <h3 className="text-xl font-extrabold text-brand-dark mb-4 flex items-center pb-2 border-b border-blue-100"> {/* Changed border-purple-100 */}
                        <div className="p-2 bg-brand-dark rounded-full text-white mr-3 shadow-md"> {/* Changed from bg-purple-600 */}
                          <Share2 size={20} />
                        </div>
                        Social Presence
                      </h3>
                      <div className="space-y-3"> {/* Added space-y for consistent item spacing */}
                        {renderDisplayItem('LinkedIn Profile', profile?.linkedin, Linkedin, true)}
                        {renderDisplayItem('Twitter Handle', profile?.twitter, Twitter, true)}
                      </div>
                    </div>
                  </div>

                  {/* Mission and Vision Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-8">
                    <div className="space-y-4 p-6 bg-green-50/50 rounded-xl shadow-sm border border-green-100/70">
                      <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center">
                        <Target size={24} className="mr-3 text-green-600" /> Our Mission
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {profile?.mission || 'No mission statement provided yet. Define your purpose!'}
                      </p>
                    </div>
                    <div className="space-y-4 p-6 bg-yellow-50/50 rounded-xl shadow-sm border border-yellow-100/70">
                      <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center">
                        <EyeIcon size={24} className="mr-3 text-yellow-600" /> Our Vision
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {profile?.vision || 'No vision statement provided yet. Envision your future!'}
                      </p>
                    </div>
                  </div>

                  {/* --- DISPLAY FOUNDERS & TEAM SECTION --- */}
                  <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                    <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center">
                                              <Users size={24} className="mr-3 text-blue-600" /> Founders & Team
                    </h3>
                    {teamMembers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {teamMembers.map(member => (
                          <div key={member.id} className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-blue-200 text-brand-dark font-bold flex items-center justify-center text-md mr-3">
                              {getInitials(member.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{member.name}</p>
                              <p className="text-xs text-gray-600">{member.role}</p>
                              {member.linkedin && (
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                                  LinkedIn <ExternalLink size={10} className="ml-1" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm italic">No team members added yet.</p>
                    )}
                    <button onClick={() => { setCurrentPage('myProfile'); setIsEditing(true); }} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full shadow-sm hover:bg-gray-200 transition duration-200 flex items-center">
                        <Plus size={16} className="mr-2" /> Add New Member
                    </button>
                  </div>
                  {/* --- END DISPLAY FOUNDERS & TEAM SECTION --- */}

                  {/* --- DISPLAY UPLOADED DOCUMENTS SECTION --- */}
                  <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                    <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center">
                      <FileText size={24} className="mr-3 text-teal-600" /> Uploaded Documents
                    </h3>
                    {documents.length > 0 ? (
                      <div className="space-y-3">
                        {documents.map(doc => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={doc.name} // Suggest download with original name
                            className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                          >
                            <File size={20} className="mr-3 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 flex-1">{doc.name}</span>
                            <ExternalLink size={14} className="text-gray-400" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm italic">No documents uploaded yet.</p>
                    )}
                    <button onClick={() => { setCurrentPage('myProfile'); setIsEditing(true); }} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full shadow-sm hover:bg-gray-200 transition duration-200 flex items-center">
                        <Upload size={16} className="mr-2" /> Add New Document
                    </button>
                  </div>
                  {/* --- END DISPLAY UPLOADED DOCUMENTS SECTION --- */}
                </div>
              )}
            </div>
          )}

          {currentPage === 'incubationProgress' && (
            <div className="animate-fade-in">
              <StartupProgressTracking userId={user?.id} token={token} />
            </div>
          )}

          {currentPage === 'myMentor' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-brand-dark mb-6 flex items-center">
                <GraduationCap size={28} className="mr-3 text-brand-primary" /> My Dedicated Mentor
              </h3>
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                <img src={currentMentor.photo} alt={currentMentor.fullName || 'Mentor'} className="w-32 h-32 rounded-full object-cover mx-auto mb-6 shadow-md border-4 border-brand-primary p-0.5" />
                <h2 className="text-2xl font-bold text-brand-dark mb-2">{currentMentor.fullName || 'No Name'}</h2>
                <p className="text-lg text-gray-700 font-medium mb-4">{currentMentor.role || ''}</p>
                <p className="text-base text-gray-600 leading-relaxed mb-6 italic">"{currentMentor.bio || ''}"</p>

                <div className="p-5 bg-blue-50 rounded-xl mb-6 shadow-inner border border-blue-100">
                  <h4 className="text-md font-semibold text-brand-dark mb-2 flex items-center justify-center">
                    <Lightbulb size={20} className="mr-2 text-blue-600" /> Latest Advice
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {currentMentor.latestAdvice || ''}
                  </p>
                </div>

                <div className="flex justify-center space-x-4">
                  <a href={currentMentor && currentMentor.email ? `mailto:${currentMentor.email}` : undefined} className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-600 transition duration-200 flex items-center" disabled={!(currentMentor && currentMentor.email)}>
                    <Mail size={20} className="mr-2" /> Email Mentor
                  </a>
                  <a href={currentMentor && currentMentor.linkedin ? currentMentor.linkedin : undefined} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-full shadow-lg hover:bg-blue-600 transition duration-200 flex items-center" disabled={!(currentMentor && currentMentor.linkedin)}>
                    <Linkedin size={20} className="mr-2" /> LinkedIn
                  </a>
                </div>
              </div>

              {/* Enhanced All Assigned Mentors Section */}
              {mentors.length > 0 && (
                <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-brand-dark flex items-center">
                      <Users size={28} className="mr-3 text-purple-600" />
                      All Your Assigned Mentors
                    </h3>
                    <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                      {mentors.filter(Boolean).length} Mentor{mentors.filter(Boolean).length > 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.filter(Boolean).map((mentor, index) => (
                      <div key={(mentor && mentor.id) || index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white font-bold flex items-center justify-center text-xl mr-4 shadow-lg">
                            {mentor && mentor.fullName ? mentor.fullName.substring(0, 2).toUpperCase() : (mentor && mentor.email ? mentor.email.substring(0, 2).toUpperCase() : 'MN')}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{mentor && mentor.fullName ? mentor.fullName : (mentor && mentor.email ? mentor.email : "No Name")}</h4>
                            <p className="text-sm text-gray-600">{mentor && mentor.email ? mentor.email : "No Email"}</p>
                            {mentor && mentor.role && (
                              <p className="text-xs text-purple-600 font-medium mt-1">{mentor.role}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Mentor Bio/Description */}
                        {mentor && mentor.bio && (
                          <p className="text-sm text-gray-700 mb-4 italic">"{mentor.bio}"</p>
                        )}
                        
                        {/* Contact & Social Links */}
                        <div className="space-y-3">
                          {mentor && mentor.email && (
                            <a 
                              href={`mailto:${mentor.email}`} 
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
                            >
                              <Mail size={16} className="mr-2" /> Email Mentor
                            </a>
                          )}
                          
                          <div className="flex gap-2">
                            {mentor && mentor.linkedin && (
                              <a 
                                href={mentor.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
                              >
                                <Linkedin size={14} className="mr-1" /> LinkedIn
                              </a>
                            )}
                            
                            {mentor && mentor.twitter && (
                              <a 
                                href={mentor.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-blue-400 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-blue-500 transition-colors"
                              >
                                <Twitter size={14} className="mr-1" /> Twitter
                              </a>
                            )}
                            
                            {mentor && mentor.website && (
                              <a 
                                href={mentor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-gray-700 transition-colors"
                              >
                                <Globe size={14} className="mr-1" /> Website
                              </a>
                            )}
                          </div>
                        </div>
                        
                        {/* Latest Advice */}
                        {mentor && mentor.latestAdvice && (
                          <div className="mt-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                            <p className="text-xs text-purple-800 font-medium mb-1">Latest Advice</p>
                            <p className="text-sm text-gray-700 italic">"{mentor.latestAdvice}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {mentorsLoading && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <p className="text-gray-600 font-medium">Loading your mentors...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No Mentors Assigned Section */}
              {!mentorsLoading && mentors.length === 0 && (
                <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-brand-dark mb-5 flex items-center">
                    <GraduationCap size={24} className="mr-3 text-gray-600" />
                    Mentor Assignments
                  </h3>
                  <div className="text-center py-8">
                    <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No Mentors Assigned Yet</h4>
                    <p className="text-gray-600 mb-4">
                      You haven't been assigned any mentors yet. Mentors will be assigned by your tenant administrator.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>What to expect:</strong> Once assigned, mentors will help guide your startup's progress,
                        provide feedback on your submissions, and offer valuable insights for your growth.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentPage === 'opportunities' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-brand-dark mb-6 flex items-center">
                <Briefcase size={28} className="mr-3 text-brand-primary" /> Opportunities for Your Startup
              </h3>

              {/* Filter Dropdown */}
              <div className="mb-6 flex justify-end">
                <div className="relative inline-block text-left">
                  <select className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-brand-primary transition duration-200 text-sm">
                    <option>All</option>
                    <option>Open</option>
                    <option>Applied</option>
                    <option>Closed</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Opportunities List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockOpportunities.map(opportunity => (
                  <div key={opportunity.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                    <h4 className="text-lg font-bold text-brand-dark mb-2 flex items-center">
                      <Rocket size={20} className="mr-2 text-brand-primary" /> {/* Changed from text-indigo-500 */}
                      {opportunity.name}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">{opportunity.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <CalendarDays size={14} className="mr-2" /> Apply by: {opportunity.applyBy}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        opportunity.status === 'Open' ? 'bg-green-100 text-green-700' :
                        opportunity.status === 'Closed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {opportunity.status}
                      </span>
                    </div>
                    <button className="mt-4 px-5 py-2 bg-brand-primary text-white text-sm font-semibold rounded-full shadow-md hover:bg-blue-600 transition duration-200">
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'notifications' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-brand-dark mb-6 flex items-center">
                <BellRing size={28} className="mr-3 text-brand-primary" /> Your Notifications
              </h3>

              {/* Filter Dropdown */}
              <div className="mb-6 flex justify-end">
                <div className="relative inline-block text-left">
                  <select className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-brand-primary transition duration-200 text-sm">
                    <option>All Types</option>
                    <option>System</option>
                    <option>Mentor</option>
                    <option>Admin</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Notifications List (Timeline Style) */}
              <div className="relative pl-8 border-l-2 border-gray-200 space-y-8">
                {mockNotifications.map((notif, index) => (
                  <div key={notif.id} className="relative">
                    <div className="absolute -left-3.5 -top-1 w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-sm">
                      {notif.icon}
                    </div>
                    <div className="ml-4 p-5 bg-white rounded-2xl shadow-lg border border-gray-100">
                      <p className="text-sm text-gray-700 font-medium mb-1">{notif.message}</p>
                      <p className="text-xs text-gray-500">{notif.time}</p>
                      <div className="flex justify-end mt-3 space-x-2">
                        <button className="text-xs text-blue-500 hover:underline">Mark as Read</button>
                        <button className="text-xs text-red-500 hover:underline">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}