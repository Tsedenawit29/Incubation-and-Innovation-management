import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getMentorProfile,
  updateMentorProfile,
  createMentorProfile
} from "../api/users"; 
import { getStartupsForMentor } from '../api/mentorAssignment';
import { 
  getTemplates as getAssignedTemplates,
  getPhases, 
  getTasks 
} from '../api/progresstracking';
import { getNewsPostsByTenant } from '../api/news';

// Import Lucide React icons
import {
  Globe,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  User as UserIcon,
  Save,
  Edit,
  Loader2,
  XCircle,
  CheckCircle,
  Info,
  ExternalLink,
  Eye,
  Image,
  Share2,
  BookOpenText,
  LogOut,
  Zap,
  Lightbulb,
  Rocket,
  TrendingUp,
  Users,
  Award,
  Star,
  Mail,
  Bell,
  ChevronDown,
  Plus,
  Trash2,
  Target,
  Eye as EyeIcon,
  Home,
  User,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Bell as BellRing,
  Calendar,
  Quote,
  Upload,
  FileText,
  File,
  Filter,
  CalendarDays,
  Bookmark,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Clock,
  HelpCircle,
  Building
} from 'lucide-react';

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
        stroke="#4CAF50"
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
        className="transform rotate-90"
        fill="#4CAF50"
        fontSize="20"
        fontWeight="bold"
      >
        {progress}%
      </text>
    </svg>
  );
};

// Expertise Input Component
const ExpertiseSection = ({ expertise, setExpertise }) => {
  const handleAddExpertise = () => {
    setExpertise([...expertise, {
      id: crypto.randomUUID(),
      expertiseName: '',
      description: ''
    }]);
  };

  const handleRemoveExpertise = (index) => {
    setExpertise(expertise.filter((_, i) => i !== index));
  };

  const handleExpertiseChange = (index, field, value) => {
    const updatedExpertise = [...expertise];
    updatedExpertise[index][field] = value;
    setExpertise(updatedExpertise);
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
        <Award size={16} className="mr-2 text-brand-primary" />
        Areas of Expertise
      </label>

      {expertise.map((exp, index) => (
        <div key={exp.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Expertise Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={exp.expertiseName}
                onChange={(e) => handleExpertiseChange(index, 'expertiseName', e.target.value)}
                placeholder="e.g., Digital Marketing"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description (Optional)</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={exp.description}
                onChange={(e) => handleExpertiseChange(index, 'description', e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleRemoveExpertise(index)}
            className="text-red-500 text-sm flex items-center"
          >
            <Trash2 size={14} className="mr-1" /> Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddExpertise}
        className="text-blue-500 text-sm flex items-center"
      >
        <Plus size={14} className="mr-1" /> Add Expertise Area
      </button>
    </div>
  );
};

export default function MentorDashboard() {
  const { user, token, logout, loading: authLoading, authError } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    bio: '',
    expertise: [],
    website: '',
    phone: '',
    address: '',
    linkedin: '',
    twitter: '',
    photoUrl: '',
    yearsOfExperience: 0,
    industrySpecialization: '',
    availableFor: '',
    preferredContactMethod: ''
  });
  const [loading, setLoading] = useState(true);
  const [editMsg, setEditMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Mentor-specific states
  const [assignedStartups, setAssignedStartups] = useState([]);
  const [startupsLoading, setStartupsLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [phases, setPhases] = useState([]);
  const [tasksByPhase, setTasksByPhase] = useState({});
  const [expandedPhases, setExpandedPhases] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState('');

  // --- NEWS/RESOURCES STATES ---
  const [mentorResources, setMentorResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [selectedResourceCategory, setSelectedResourceCategory] = useState('all');
  // --- END NEWS STATES ---

  // Mock data for dashboard
  const mockNotifications = [
    { id: 1, type: "system", icon: <Info size={16} />, message: "New startup assigned to you: TechInnovators", time: "2 hours ago" },
    { id: 2, type: "startup", icon: <Rocket size={16} />, message: "GreenTech submitted their Q2 progress report", time: "Yesterday" },
    { id: 3, type: "admin", icon: <Building size={16} />, message: "New mentorship guidelines available", time: "3 days ago" },
  ];

  const mockUpcomingTask = {
    title: "Review TechInnovators' MVP Submission",
    deadline: "2025-08-15",
    description: "Provide feedback on their minimum viable product.",
    link: "#"
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch assigned startups for the mentor
  const fetchAssignedStartups = async () => {
    if (!user?.id || !token) {
      console.log('fetchAssignedStartups: Missing user.id or token');
      return;
    }
    
    console.log('fetchAssignedStartups: Starting to fetch startups for mentor:', user.id);
    setStartupsLoading(true);
    try {
      const data = await getStartupsForMentor(token, user.id);
      console.log('fetchAssignedStartups: Data received:', data);
      setAssignedStartups(data.map(a => a.startup));
    } catch (e) {
      console.error("fetchAssignedStartups: Failed to fetch startups:", e);
      setAssignedStartups([]);
    } finally {
      setStartupsLoading(false);
    }
  };

  // Fetch mentor resources from news - using same pattern as NewsManagement
  const fetchMentorResources = async () => {
    // Use user.tenantId first as it's more reliable, fallback to profile.tenantId
    const tenantId = user?.tenantId || profile?.tenantId;
    if (!tenantId || !token) {
      console.log('fetchMentorResources: Missing tenantId or token', { 
        profileTenantId: profile?.tenantId, 
        userTenantId: user?.tenantId, 
        hasToken: !!token,
        finalTenantId: tenantId 
      });
      return;
    }
    
    setResourcesLoading(true);
    try {
      console.log('fetchMentorResources: Using tenantId:', tenantId);
      const posts = await getNewsPostsByTenant(token, tenantId);
      console.log('fetchMentorResources: Fetched posts:', posts);
      
      // Filter for mentor-relevant categories
      const mentorCategories = [
        'MENTOR_RESOURCES',
        'UPCOMING_EVENTS',
        'SUCCESS_STORIES',
        'MARKET_INSIGHTS',
        'GENERAL_ANNOUNCEMENT',
        'INCUBATION_PROGRAM_NEWS',
        'ALUMNI_HIGHLIGHTS'
      ];
      
      const filteredPosts = posts.filter(post => 
        mentorCategories.includes(post.category)
      );
      
      console.log('fetchMentorResources: Filtered posts for mentors:', filteredPosts);
      setMentorResources(filteredPosts);
    } catch (err) {
      console.error('fetchMentorResources: Error:', err);
      setMentorResources([]);
    } finally {
      setResourcesLoading(false);
    }
  };

  // Progress tracking functions
  const fetchTemplates = async () => {
    if (!user?.id || !token) return;
    
    setProgressLoading(true); 
    setProgressError('');
    try {
      const data = await getAssignedTemplates(user.tenantId);
      setTemplates(data);
      setSelectedTemplate(null);
      setPhases([]);
      setTasksByPhase({});
    } catch (e) {
      setProgressError('Failed to load templates');
    } finally {
      setProgressLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setPhases([]);
    setTasksByPhase({});
    if (template) fetchPhases(template.id);
  };

  const fetchPhases = async (templateId) => {
    setProgressLoading(true); 
    setProgressError('');
    try {
      const data = await getPhases(templateId);
      setPhases(data);
      setTasksByPhase({});
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

  // Get progress stats for dashboard display
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

  // Fetch or create profile on mount
  useEffect(() => {
    async function fetchOrCreateProfile() {
      if (authLoading) {
        console.log("MentorDashboard: Auth still loading, waiting...");
        return;
      }

      if (authError) {
        setLoading(false);
        setError(authError);
        console.error("MentorDashboard: Auth error detected:", authError);
        return;
      }

      if (!user || !user.id || !token) {
        setLoading(false);
        setError("Authentication required. Please ensure you are logged in.");
        console.warn("MentorDashboard: User or token missing after auth load.");
        return;
      }

      console.log("MentorDashboard: Attempting to fetch profile with User ID:", user.id);

      setLoading(true);
      setError("");
      setEditMsg("");
      try {
        let prof = await getMentorProfile(token, user.id);
        // Ensure expertise is always an array
        prof.expertise = prof.expertise || [];
        setProfile(prof);
        setIsEditing(false);
        setPhotoPreview(prof?.photoUrl || null);
        console.log("MentorDashboard: Profile fetched successfully.");
        
        // Fetch assigned startups after profile is loaded
        await fetchAssignedStartups();
        
        // Fetch progress templates
        await fetchTemplates();
        
        // Fetch mentor resources
        await fetchMentorResources();
      } catch (err) {
        console.error("MentorDashboard: Error fetching profile:", err);
        const errorMessage = err.message ? err.message.toLowerCase() : '';
        if (errorMessage.includes("404") || errorMessage.includes("not found") || errorMessage.includes("profile not found") || errorMessage.includes("403")) {
          try {
            console.log("MentorDashboard: Profile not found, attempting to create new profile...");
            let prof = await createMentorProfile(token, user.id);
            prof.expertise = prof.expertise || [];
            setProfile(prof);
            setEditMsg("New profile created successfully. Please fill in details!");
            setCurrentPage('myProfile');
            setIsEditing(true);
            setPhotoPreview(prof?.photoUrl || null);
            console.log("MentorDashboard: New profile created successfully.");
          } catch (e) {
            console.error("MentorDashboard: Error creating profile:", e);
            setError("Could not load or create profile: " + e.message);
          }
        } else {
          setError(`Failed to load profile: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && !authError) {
      fetchOrCreateProfile();
    }
  }, [user, token, authLoading, authError, logout]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setProfile(prevProfile => ({ ...prevProfile, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
      setProfile(prevProfile => ({ ...prevProfile, photoUrl: '' }));
    }
  };

  // Helper function to generate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'MN'; // Mentor Name fallback
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditMsg("");
    setError("");

    if (!user || !user.id || !token) {
      setError('User not authenticated or ID/token missing. Cannot save profile.');
      setSaving(false);
      console.error("MentorDashboard: Save failed - User or token missing.");
      return;
    }

    console.log("MentorDashboard: Attempting to save profile with User ID:", user.id);
    
    try {
      // Filter out empty expertise items
      const filteredExpertise = profile.expertise
        .filter(exp => exp.expertiseName.trim())
        .map(exp => ({
          id: exp.id,
          expertiseName: exp.expertiseName.trim(),
          description: exp.description?.trim() || null
        }));

      const payload = {
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        expertise: filteredExpertise,
        website: profile.website || '',
        phone: profile.phone || '',
        address: profile.address || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        photoUrl: photoPreview || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        industrySpecialization: profile.industrySpecialization || '',
        availableFor: profile.availableFor || '',
        preferredContactMethod: profile.preferredContactMethod || '',
      };
      
      console.log("MentorDashboard: Payload being sent:", payload);
      
      const updated = await updateMentorProfile(token, user.id, payload);
      // Ensure expertise is always an array
      updated.expertise = updated.expertise || [];
      setProfile(updated);
      setEditMsg("Profile updated successfully!");
      setIsEditing(false);
      console.log("MentorDashboard: Profile saved successfully.");
    } catch (err) {
      console.error("MentorDashboard: Failed to update profile:", err);
      setError(`Failed to update profile: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => {
        setEditMsg("");
        setError("");
      }, 5000);
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

  // Placeholder for the default photo if photoUrl is empty or invalid
  const defaultPhoto = "https://placehold.co/100x100/E0E7FF/0A2D5C?text=Mentor";

  // Render loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex items-center justify-center font-inter relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slower"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
        <div className="absolute top-1/10 right-1/10 w-24 h-24 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slow delay-1000"></div>
        <div className="absolute bottom-1/5 left-1/5 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slower delay-2000"></div>

        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl shadow-2xl border border-blue-200 z-10 animate-fade-in transform scale-105">
          <Loader2 className="animate-spin-slow text-brand-primary mb-8" size={80} />
          <p className="text-3xl font-extrabold text-brand-dark text-center">Loading your mentor dashboard...</p>
          <p className="text-lg text-gray-600 mt-2">Preparing your mentorship tools.</p>
        </div>
      </div>
    );
  }

  // Render error state if profile is null and there's an error
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
    { name: 'Assigned Startups', icon: Users, page: 'assignedStartups' },
    { name: 'Progress Tracking', icon: CheckCircle2, page: 'progressTracking' },
    { name: 'Resources', icon: BookOpen, page: 'resources' },
    { name: 'Chats', icon: Users, page: 'teamMembers' }
  ];

  // Main component rendering
  return (
    <div className="min-h-screen bg-gray-100 font-inter flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background animated shapes */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slower"></div>
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
      <div className="absolute top-1/10 right-1/10 w-24 h-24 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slow delay-1000"></div>
      <div className="absolute bottom-1/5 left-1/5 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-slower delay-2000"></div>
      <div className="absolute top-3/4 left-1/10 w-56 h-56 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float delay-500"></div>

      {/* Main Dashboard Container */}
      <div className="flex w-full min-h-screen bg-white overflow-hidden">
        {/* Custom CSS for animations and variables */}
        <style>
          {`
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
            .custom-shadow {
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
            }

            .save-button:disabled {
              background-color: #93c5fd;
              color: #ffffff;
              opacity: 0.8;
              cursor: not-allowed;
              box-shadow: none;
            }
          `}
        </style>

        {/* Left Sidebar */}
        <div className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 shadow-inner h-screen sticky top-0 overflow-y-auto">
          <div>
            <nav className="space-y-4 pt-10">
              {navItems.map((item) => (
                <a
                  key={item.page}
                  href="#"
                  onClick={() => {
                    setCurrentPage(item.page);
                    setIsEditing(false);
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
        <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
          {/* Top Header Bar */}
          <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <div className="text-gray-600 font-medium">
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
                <div className="w-8 h-8 bg-blue-200 text-brand-dark font-bold rounded-full flex items-center justify-center text-sm mr-2">
                  {profile?.fullName ? profile.fullName.substring(0, 2).toUpperCase() : 'MN'}
                </div>
                <span className="text-gray-700 font-medium">{profile?.fullName || 'Mentor Name'}</span>
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
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-8 rounded-2xl shadow-lg mb-8 flex flex-col sm:flex-row items-center justify-between animate-fade-in">
                <div className="text-center sm:text-left mb-6 sm:mb-0">
                  <h1 className="text-4xl font-extrabold text-brand-dark mb-2">Welcome, {profile?.fullName || 'Mentor'}!</h1>
                  <p className="text-lg text-gray-700">Ready to guide your startups to success today?</p>
                </div>
                <div className="relative w-36 h-36">
                  <img
                    src={photoPreview || defaultPhoto}
                    alt="Mentor Photo"
                    className="w-full h-full object-cover rounded-full shadow-md animate-float-image z-10"
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultPhoto; }}
                  />
                  <Quote size={40} className="absolute bottom-0 right-0 text-gray-600 opacity-70 transform rotate-12" />
                </div>
              </div>

              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assigned Startups Card */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
                  <h3 className="text-xl font-bold text-brand-dark mb-5 flex items-center">
                    <Users size={24} className="mr-3 text-blue-600" /> Assigned Startups
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-800 mb-2">
                        {assignedStartups.length} Startup{assignedStartups.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {startupsLoading ? 'Loading...' : assignedStartups.length > 0 ? 
                          `You're mentoring ${assignedStartups.length} startup${assignedStartups.length !== 1 ? 's' : ''}` : 
                          'No startups assigned yet'}
                      </p>
                      <button
                        onClick={() => setCurrentPage('assignedStartups')}
                        className="mt-4 px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-full shadow-md hover:bg-blue-600 transition duration-200"
                      >
                        View All
                      </button>
                    </div>
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <Users size={40} />
                    </div>
                  </div>
                </div>

                {/* Recent Feedback Card */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
                  <h3 className="text-xl font-bold text-brand-dark mb-5 flex items-center">
                    <MessageSquare size={24} className="mr-3 text-green-600" /> Recent Feedback
                  </h3>
                  <div className="space-y-3">
                    {assignedStartups.slice(0, 2).map((startup, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-200 text-brand-dark font-bold flex items-center justify-center text-sm mr-3">
                          {startup.startupName ? startup.startupName.substring(0, 2).toUpperCase() : 'SN'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{startup.startupName || 'Startup'}</p>
                          <p className="text-xs text-gray-500">Last feedback: 2 days ago</p>
                        </div>
                      </div>
                    ))}
                    {assignedStartups.length === 0 && (
                      <p className="text-gray-600 text-sm italic">No recent feedback given yet.</p>
                    )}
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
                    <Calendar size={24} className="mr-3 text-brand-dark" /> Upcoming Task
                  </h3>
                  <p className="text-lg font-semibold text-gray-800 mb-2">{mockUpcomingTask.title}</p>
                  <p className="text-sm text-gray-600 mb-3">{mockUpcomingTask.description}</p>
                  <div className="flex items-center text-red-500 text-sm font-medium mb-4">
                    <CalendarDays size={16} className="mr-2" /> Deadline: {mockUpcomingTask.deadline}
                  </div>
                  <a href={mockUpcomingTask.link} className="px-5 py-2 bg-brand-primary text-white text-sm font-semibold rounded-full shadow-md hover:bg-blue-600 transition duration-200">
                    Go to Task
                  </a>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'myProfile' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-brand-dark flex items-center">
                  <UserIcon size={28} className="mr-3 text-brand-primary" /> My Mentor Profile
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
                    {renderInputField('fullName', 'Full Name', 'text', 'fullName', profile?.fullName || "", 'Your full name', UserIcon)}

                    {/* Photo Upload Field */}
                    <div className="mb-5">
                      <label htmlFor="photoUpload" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                        <Image size={16} className="mr-2 text-brand-primary" />
                        Upload Profile Photo
                      </label>
                      <input
                        type="file"
                        id="photoUpload"
                        name="photoUpload"
                        accept="image/*"
                        className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition duration-200 ease-in-out bg-white/90 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-primary hover:file:bg-blue-100"
                        onChange={handlePhotoChange}
                        disabled={saving}
                      />
                      {photoPreview && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Photo Preview:</p>
                          <img src={photoPreview} alt="Photo Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
                        </div>
                      )}
                    </div>

                    {/* Expertise Section */}
                    <ExpertiseSection 
                      expertise={profile.expertise || []}
                      setExpertise={(expertise) => setProfile({...profile, expertise})}
                    />

                    {renderInputField('yearsOfExperience', 'Years of Experience', 'number', 'yearsOfExperience', profile?.yearsOfExperience || "", 'e.g., 5', Clock)}
                    {renderInputField('industrySpecialization', 'Industry Specialization', 'text', 'industrySpecialization', profile?.industrySpecialization || "", 'e.g., Tech, Healthcare, Finance', Briefcase)}
                    {renderInputField('website', 'Personal Website URL', 'url', 'website', profile?.website || "", 'https://yourwebsite.com', Globe)}
                    {renderInputField('phone', 'Contact Phone Number', 'tel', 'phone', profile?.phone || "", '+1 (555) 123-4567', Phone)}
                    {renderInputField('address', 'Street Address', 'text', 'address', profile?.address || "", '123 Main Street', MapPin)}
                    {renderInputField('linkedin', 'LinkedIn Profile URL', 'url', 'linkedin', profile?.linkedin || "", 'https://linkedin.com/in/yourprofile', Linkedin)}
                    {renderInputField('twitter', 'Twitter Handle URL', 'url', 'twitter', profile?.twitter || "", 'https://twitter.com/yourhandle', Twitter)}
                    {renderInputField('availableFor', 'Available For', 'text', 'availableFor', profile?.availableFor || "", 'e.g., Weekly meetings, Email support', HelpCircle)}
                    {renderInputField('preferredContactMethod', 'Preferred Contact Method', 'text', 'preferredContactMethod', profile?.preferredContactMethod || "", 'e.g., Email, Phone, Video Call', Mail)}
                  </div>
                  
                  <h4 className="text-xl font-bold text-brand-dark mt-8 mb-4">About You</h4>
                  {renderTextareaField('bio', 'Professional Bio', 'bio', profile?.bio || "", 'Tell us about your background, experience, and mentorship approach', BookOpenText)}

                  <div className="flex justify-center mt-8">
                    <button
                      type="submit"
                      className="flex items-center px-8 py-4 bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 text-base"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="animate-spin mr-3" size={24} /> Saving Profile...
                        </>
                      ) : (
                        <>
                          <Save className="mr-3" size={24} /> Save Profile
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
                      src={photoPreview || defaultPhoto}
                      alt="Mentor Photo"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-md border-4 border-brand-primary p-0.5 bg-white mb-4 sm:mb-0 sm:mr-6 transition-transform duration-300 hover:scale-105"
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultPhoto; }}
                    />
                    <div className="text-center sm:text-left flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-2 leading-tight">
                        {profile?.fullName || 'Mentor Name'}
                      </h2>
                      <p className="text-lg text-gray-700 font-medium mb-1">
                        {profile?.expertise?.length > 0 ? profile.expertise.map(e => e.expertiseName).join(', ') : 'Mentor'}
                      </p>
                      <p className="text-base text-gray-600">
                        {profile?.yearsOfExperience ? `${profile.yearsOfExperience} years of experience` : ''}
                        {profile?.industrySpecialization ? ` | ${profile.industrySpecialization}` : ''}
                      </p>
                      <p className="text-base text-gray-700 font-normal leading-relaxed mt-2">
                        {profile?.bio || 'No bio provided yet. Tell us about your mentorship approach!'}
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

                  {/* Expertise Display */}
                  {profile?.expertise?.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold mb-4 flex items-center">
                        <Award size={20} className="mr-3 text-brand-primary" />
                        Areas of Expertise
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.expertise.map((exp, index) => (
                          <div key={index} className="bg-blue-50 p-4 rounded-lg">
                            <h5 className="font-medium text-gray-800">{exp.expertiseName}</h5>
                            {exp.description && (
                              <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Basic Information and Social Presence Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mt-8">
                    {/* Basic Information Card */}
                    <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border border-blue-200 transform hover:scale-[1.01] transition-transform duration-300">
                      <h3 className="text-xl font-extrabold text-brand-dark mb-4 flex items-center pb-2 border-b border-blue-100">
                        <div className="p-2 bg-brand-primary rounded-full text-white mr-3 shadow-md">
                          <Info size={20} />
                        </div>
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        {renderDisplayItem('Phone', profile?.phone, Phone)}
                        {renderDisplayItem('Address', profile?.address, MapPin)}
                        {renderDisplayItem('Available For', profile?.availableFor, HelpCircle)}
                        {renderDisplayItem('Preferred Contact', profile?.preferredContactMethod, Mail)}
                      </div>
                    </div>

                    {/* Social Presence Card */}
                    <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border border-blue-200 transform hover:scale-[1.01] transition-transform duration-300">
                      <h3 className="text-xl font-extrabold text-brand-dark mb-4 flex items-center pb-2 border-b border-blue-100">
                        <div className="p-2 bg-brand-dark rounded-full text-white mr-3 shadow-md">
                          <Share2 size={20} />
                        </div>
                        Social & Professional
                      </h3>
                      <div className="space-y-3">
                        {renderDisplayItem('Website', profile?.website, Globe, true)}
                        {renderDisplayItem('LinkedIn', profile?.linkedin, Linkedin, true)}
                        {renderDisplayItem('Twitter', profile?.twitter, Twitter, true)}
                        {renderDisplayItem('Industry Specialization', profile?.industrySpecialization, Briefcase)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentPage === 'assignedStartups' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-brand-dark mb-6 flex items-center">
                <Users size={28} className="mr-3 text-brand-primary" /> Your Assigned Startups
              </h3>

              {startupsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin text-brand-primary" size={48} />
                </div>
              ) : assignedStartups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignedStartups.map((startup, index) => (
                    <div key={startup.id || index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white font-bold flex items-center justify-center text-xl mr-4 shadow-lg">
                          {startup.startupName ? startup.startupName.substring(0, 2).toUpperCase() : 'SN'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg">{startup.startupName || 'Startup'}</h4>
                          <p className="text-sm text-gray-600">{startup.industry || 'No industry specified'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {startup.description && (
                          <p className="text-sm text-gray-700 line-clamp-3">"{startup.description}"</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <CalendarDays size={14} className="mr-2" /> 
                          Joined: {new Date(startup.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <a 
                          href={`mailto:${startup.email || ''}`} 
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
                          disabled={!startup.email}
                        >
                          <Mail size={14} className="mr-1" /> Email
                        </a>
                        
                        <button 
                          onClick={() => { /* Navigate to startup details */ }}
                          className="flex-1 bg-brand-primary text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                          <ClipboardList size={14} className="mr-1" /> Progress
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No Startups Assigned Yet</h4>
                  <p className="text-gray-600 mb-4">You haven't been assigned any startups yet. Please contact your tenant admin to get assigned startups.</p>
                </div>
              )}
            </div>
          )}

          {currentPage === 'progressTracking' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-brand-dark mb-6 flex items-center">
                <CheckCircle2 size={28} className="mr-3 text-brand-primary" /> Progress Tracking
              </h3>

              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Select a Startup</h4>
                    <div className="relative mt-2">
                      <select 
                        className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-brand-primary transition duration-200 text-sm"
                        onChange={(e) => console.log("Selected startup:", e.target.value)}
                      >
                        <option value="">All Startups</option>
                        {assignedStartups.map(startup => (
                          <option key={startup.id} value={startup.id}>{startup.startupName}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <h4 className="text-lg font-semibold text-gray-800">Select a Template</h4>
                    <div className="relative mt-2">
                      <select 
                        className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-brand-primary transition duration-200 text-sm"
                        onChange={(e) => handleSelectTemplate(templates.find(t => t.id === e.target.value))}
                        value={selectedTemplate?.id || ''}
                      >
                        <option value="">Select Template</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                {selectedTemplate && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xl font-bold text-brand-dark">{selectedTemplate.name}</h4>
                      <div className="flex items-center">
                        <CircularProgressBar progress={getProgressStats().percentage} size={80} strokeWidth={8} />
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">{getProgressStats().completed} of {getProgressStats().total} tasks completed</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {phases.map(phase => (
                        <div key={phase.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => togglePhase(phase.id)}
                            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center">
                              <h5 className="font-semibold text-gray-800">{phase.name}</h5>
                              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {phase.sequenceNumber}
                              </span>
                            </div>
                            <ChevronDown 
                              size={20} 
                              className={`text-gray-500 transition-transform ${expandedPhases.includes(phase.id) ? 'transform rotate-180' : ''}`}
                            />
                          </button>

                          {expandedPhases.includes(phase.id) && (
                            <div className="p-4 bg-white border-t border-gray-200">
                              {!tasksByPhase[phase.id] ? (
                                <div className="text-center py-4">
                                  <button 
                                    onClick={() => fetchTasks(phase.id)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                                  >
                                    Load Tasks
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {tasksByPhase[phase.id].map(task => (
                                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg flex items-start">
                                      <div className="flex-1">
                                        <h6 className="font-medium text-gray-800">{task.name}</h6>
                                        <p className="text-sm text-gray-600">{task.description}</p>
                                        <div className="flex items-center mt-2 text-xs text-gray-500">
                                          <span className={`px-2 py-1 rounded-full ${
                                            task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {task.status.replace('_', ' ')}
                                          </span>
                                          {task.dueDate && (
                                            <span className="ml-2 flex items-center">
                                              <CalendarDays size={12} className="mr-1" />
                                              {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentPage === 'resources' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-brand-dark mb-6 flex items-center">
                <BookOpen size={28} className="mr-3 text-brand-primary" /> Mentor Resources
              </h3>

              {/* Category Filter Dropdown */}
              <div className="mb-6 flex justify-end">
                <div className="relative inline-block text-left">
                  <select 
                    value={selectedResourceCategory}
                    onChange={(e) => setSelectedResourceCategory(e.target.value)}
                    className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-brand-primary transition duration-200 text-sm"
                  >
                    <option value="all">All Mentor Categories</option>
                    <option value="MENTOR_RESOURCES">Mentor Resources</option>
                    <option value="UPCOMING_EVENTS">Upcoming Events</option>
                    <option value="SUCCESS_STORIES">Success Stories</option>
                    <option value="MARKET_INSIGHTS">Market Insights</option>
                    <option value="GENERAL_ANNOUNCEMENT">General Announcements</option>
                    <option value="INCUBATION_PROGRAM_NEWS">Incubation Program News</option>
                    <option value="ALUMNI_HIGHLIGHTS">Alumni Highlights</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {resourcesLoading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-brand-primary" size={32} />
                  <span className="ml-3 text-gray-600">Loading mentor resources...</span>
                </div>
              )}

              {/* Mentor Resources List */}
              {!resourcesLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentorResources
                    .filter(resource => selectedResourceCategory === 'all' || resource.category === selectedResourceCategory)
                    .map(resource => {
                      const getCategoryIcon = (category) => {
                        switch(category) {
                          case 'MENTOR_RESOURCES': return <BookOpen size={20} className="mr-2 text-blue-600" />;
                          case 'UPCOMING_EVENTS': return <Calendar size={20} className="mr-2 text-green-600" />;
                          case 'SUCCESS_STORIES': return <Award size={20} className="mr-2 text-yellow-600" />;
                          case 'MARKET_INSIGHTS': return <TrendingUp size={20} className="mr-2 text-indigo-600" />;
                          case 'INCUBATION_PROGRAM_NEWS': return <GraduationCap size={20} className="mr-2 text-brand-primary" />;
                          case 'ALUMNI_HIGHLIGHTS': return <Star size={20} className="mr-2 text-purple-600" />;
                          default: return <Info size={20} className="mr-2 text-gray-600" />;
                        }
                      };

                      const formatCategory = (category) => {
                        return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                      };

                      const formatDate = (dateString) => {
                        return new Date(dateString).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });
                      };

                      return (
                        <div key={resource.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                          {/* Full-width image header */}
                          {resource.imageUrl && (
                            <div className="relative h-48 w-full">
                              <img 
                                src={resource.imageUrl} 
                                alt={resource.title}
                                className="w-full h-full object-cover"
                              />

                            </div>
                          )}
                          
                          <div className="p-6">
                            {/* Title with category icon */}
                            <div className="flex items-start mb-3">
                              <h4 className="text-xl font-bold text-brand-dark flex items-center flex-1">
                                {getCategoryIcon(resource.category)}
                                {resource.title}
                              </h4>
                            </div>
                            

                            
                            {/* Content */}
                            <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">{resource.content}</p>
                            
                            {/* Meta information */}
                            <div className="flex items-center justify-between text-sm mb-4 text-gray-600">
                              <div className="flex items-center">
                                <CalendarDays size={14} className="mr-2" /> 
                                {resource.publishedAt ? formatDate(resource.publishedAt) : 'No date'}
                              </div>
                              {resource.authorName && (
                                <span className="text-xs">By {resource.authorName}</span>
                              )}
                            </div>
                            
                            {/* Action buttons and attachments */}
                            <div className="flex flex-col gap-3">
                              {/* Reference file and link buttons */}
                              <div className="flex flex-wrap gap-2">
                                {resource.referenceFileUrl && (
                                  <a 
                                    href={resource.referenceFileUrl.startsWith('http') ? resource.referenceFileUrl : `http://localhost:8081${resource.referenceFileUrl}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition duration-200"
                                  >
                                    <FileText size={16} className="mr-2" />
                                    Download Resource
                                  </a>
                                )}
                                {(resource.linkUrl || resource.link) && (
                                  <a 
                                    href={resource.linkUrl || resource.link}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition duration-200"
                                  >
                                    <ExternalLink size={16} className="mr-2" />
                                    Learn More
                                  </a>
                                )}
                              </div>
                              
                              {/* Default read more if no links */}
                              {!resource.linkUrl && !resource.link && !resource.referenceFileUrl && (
                                <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg cursor-default">
                                  <Info size={16} className="mr-2" />
                                  Read More
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              )}

              {/* Empty State */}
              {!resourcesLoading && mentorResources.filter(resource => selectedResourceCategory === 'all' || resource.category === selectedResourceCategory).length === 0 && (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No Mentor Resources Available</h4>
                  <p className="text-gray-500">Check back later for new mentor resources, events, and insights.</p>
                </div>
              )}
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
                    <option>Startup</option>
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