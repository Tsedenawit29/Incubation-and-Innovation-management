import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getAlumniProfile, 
  createOrUpdateAlumniProfile, 
  getAllAlumni, 
  getAlumniCount,
  searchAlumni
} from '../api/alumni';
import { getMentorsForStartup } from '../api/mentorAssignment';
import CalendarManagement from './CalendarManagement';
import ChatOverview from '../components/ChatOverview';
import { 
  User, 
  Users, 
  Calendar, 
  MessageSquare, 
  Bell, 
  LogOut, 
  Edit3, 
  Save, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Building,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  Home,
  Loader2,
  Search,
  Filter,
  Star,
  ChevronDown,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

// Components are now imported from their respective files

// Enhanced Alumni Network and Mentorship data fetching
const fetchAlumniNetworkData = async () => {
  try {
    const [alumniData, mentorsData] = await Promise.all([
      getAllAlumni(),
      getMentorsForStartup().catch(() => []) // Fallback to empty array if no mentors API
    ]);
    return { alumni: alumniData || [], mentors: mentorsData || [] };
  } catch (error) {
    console.error('Error fetching network data:', error);
    return { alumni: [], mentors: [] };
  }
};

export default function AlumniDashboard() {
  const { user, token, logout, loading: authLoading, authError } = useAuth();
  const [currentPage, setCurrentPage] = useState('myProfile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editMsg, setEditMsg] = useState('');
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [allAlumni, setAllAlumni] = useState([]);
  const [alumniCount, setAlumniCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [availableMentors, setAvailableMentors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [networkData, setNetworkData] = useState({ alumni: [], mentors: [] });

  // Handler for profile field changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle profile save
  const handleSave = async () => {
    if (!profile || !user) return;
    
    try {
      setLoading(true);
      setError('');
      const updatedProfile = await createOrUpdateAlumniProfile(user.id, profile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setEditMsg('Profile updated successfully!');
      setTimeout(() => setEditMsg(''), 5000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(`Failed to save profile: ${err.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (query) => {
    try {
      if (!query.trim()) {
        const alumni = await getAllAlumni();
        setAllAlumni(alumni);
        return;
      }
      
      // For now, just filter the existing alumni data
      const filtered = allAlumni.filter(alumni => 
        alumni.firstName?.toLowerCase().includes(query.toLowerCase()) ||
        alumni.lastName?.toLowerCase().includes(query.toLowerCase()) ||
        alumni.currentCompany?.toLowerCase().includes(query.toLowerCase()) ||
        alumni.currentPosition?.toLowerCase().includes(query.toLowerCase())
      );
      setAllAlumni(filtered);
    } catch (error) {
      console.error('Error searching alumni:', error);
      setError('Search failed. Please try again.');
    }
  };

  // Navigation items matching startup dashboard
  const navItems = [
    { name: 'Dashboard', page: 'dashboard', icon: Home },
    { name: 'My Profile', page: 'myProfile', icon: User },
    { name: 'Alumni Network', page: 'alumniNetwork', icon: Users },
    { name: 'Mentorship Hub', page: 'mentorshipHub', icon: GraduationCap },
    { name: 'Calendar', page: 'calendar', icon: Calendar },
    { name: 'Opportunities', page: 'opportunities', icon: Briefcase },
    { name: 'Notifications', page: 'notifications', icon: Bell },
    { name: 'Chats', page: 'chats', icon: MessageSquare }
  ];

  // Fetch alumni profile and data
  useEffect(() => {
    const fetchAlumniData = async () => {
      if (!user || !token || authLoading || authError) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Fetch or create alumni profile
        try {
          const prof = await getAlumniProfile(user.id);
          setProfile(prof);
          setIsEditing(false);
        } catch (err) {
          if (err.message.includes('404') || err.message.includes('not found')) {
            // Create new profile if not found
            const newProf = await createOrUpdateAlumniProfile(user.id, {
              firstName: user.fullName?.split(' ')[0] || '',
              lastName: user.fullName?.split(' ')[1] || ''
            });
            setProfile(newProf);
            setMessage('New alumni profile created! Please complete your profile.');
            setIsEditing(true);
          } else {
            throw err;
          }
        }

        // Fetch all alumni for network
        const alumni = await getAllAlumni();
        setAllAlumni(alumni);

        // Fetch alumni count
        const count = await getAlumniCount();
        setAlumniCount(count);

        // Fetch network data (alumni and mentors)
        const networkInfo = await fetchAlumniNetworkData();
        setNetworkData(networkInfo);
        setAvailableMentors(networkInfo.mentors);

      } catch (err) {
        console.error('Error fetching alumni data:', err);
        setError(`Failed to load alumni data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniData();
  }, [user, token, authLoading, authError]);



  // Mock data matching startup dashboard pattern
  const mockNotifications = [
    { id: 1, type: "system", icon: <CheckCircle size={16} />, message: "Your alumni profile has been updated successfully.", time: "2 hours ago" },
    { id: 2, type: "network", icon: <Users size={16} />, message: "New alumni member joined your network.", time: "Yesterday" },
    { id: 3, type: "mentorship", icon: <GraduationCap size={16} />, message: "You have a new mentorship request from a startup.", time: "3 days ago" },
    { id: 4, type: "opportunity", icon: <Briefcase size={16} />, message: "New job opportunity matches your expertise.", time: "1 week ago" },
    { id: 5, type: "network", icon: <Users size={16} />, message: "Alumni from your industry wants to connect.", time: "2 weeks ago" }
  ];

  const mockMentorshipRequests = [
    { id: 1, startupName: "TechStart Inc", founderName: "John Doe", industry: "FinTech", stage: "Seed", requestDate: "Aug 10, 2025" },
    { id: 2, startupName: "GreenTech Solutions", founderName: "Jane Smith", industry: "CleanTech", stage: "Pre-Seed", requestDate: "Aug 12, 2025" },
    { id: 3, startupName: "AI Solutions", founderName: "Mike Wilson", industry: "AI/ML", stage: "Series A", requestDate: "Aug 15, 2025" }
  ];

  const mockOpportunities = [
    { id: 1, title: "Senior Product Manager", company: "TechCorp", location: "San Francisco", type: "Full-time", salary: "$150k - $200k", status: "Open" },
    { id: 2, title: "VP of Engineering", company: "StartupXYZ", location: "Remote", type: "Full-time", salary: "$200k - $250k", status: "Open" },
    { id: 3, title: "CTO", company: "Innovation Labs", location: "New York", type: "Full-time", salary: "$250k+", status: "Closed" }
  ];

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (editMsg) {
      const timer = setTimeout(() => setEditMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [editMsg]);

  useEffect(() => {
    // Debug logging to check user authentication and role
    console.log('🔍 ALUMNI DASHBOARD DEBUG:', {
      user: user,
      userRole: user?.role,
      token: token ? 'Present' : 'Missing',
      tokenLength: token?.length || 0
    });
    
    if (!user) {
      console.error('❌ No user found - authentication required');
      setError('Authentication required. Please login to access the alumni dashboard.');
      return;
    }
    
    // Check if user has ALUMNI role before fetching data
    if (!authLoading && user && user.role === 'ALUMNI') {
      fetchAlumniData();
    }
  }, [user, token, authLoading]);

  const fetchAlumniData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch alumni profile
      try {
        const profileData = await getAlumniProfile(user.id);
        setProfile(profileData);
      } catch (err) {
        console.log('No existing profile found, will create one when needed');
        setProfile(null);
      }
      
      // Fetch all alumni for network
      try {
        const alumniData = await getAllAlumni();
        setAllAlumni(alumniData || []);
      } catch (err) {
        console.error('Error fetching alumni:', err);
        // Use mock data as fallback
        setAllAlumni([
          { id: 1, fullName: "John Smith", currentCompany: "Tech Corp", currentPosition: "CEO", industry: "Technology" },
          { id: 2, fullName: "Jane Doe", currentCompany: "StartupXYZ", currentPosition: "CTO", industry: "FinTech" },
          { id: 3, fullName: "Mike Johnson", currentCompany: "Innovation Labs", currentPosition: "VP Product", industry: "AI/ML" }
        ]);
      }
      
      // Fetch alumni count
      try {
        const count = await getAlumniCount();
        setAlumniCount(count || 150);
      } catch (err) {
        console.error('Error fetching alumni count:', err);
        setAlumniCount(150);
      }
      
      // Set mock data for features not yet implemented
      setNotifications(mockNotifications);
      setOpportunities(mockOpportunities);
      
    } catch (error) {
      console.error('Error fetching alumni data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };







  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-primary" />
          <p className="text-gray-600">Loading your alumni dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check if user has ALUMNI role
  if (!authLoading && user && user.role !== 'ALUMNI') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access the alumni dashboard.</p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add the exact same CSS styling as startup dashboard */}
      <style>
        {`
          :root {
            --brand-primary: #299DFF;
            --brand-dark: #0A2D5C;
          }

          .bg-brand-primary {
            background-color: var(--brand-primary) !important;
          }
          .text-brand-primary {
            color: var(--brand-primary) !important;
          }
          .text-brand-dark {
            color: var(--brand-dark) !important;
          }
          .border-brand-primary {
            border-color: var(--brand-primary) !important;
          }
          .hover\:bg-brand-primary:hover {
            background-color: var(--brand-primary) !important;
          }
          .focus\:ring-brand-primary:focus {
            --tw-ring-color: var(--brand-primary) !important;
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      
      <div className="min-h-screen bg-gray-50 flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white p-6 flex flex-col justify-between border-r border-gray-100 shadow-inner sticky top-0 h-screen overflow-y-auto">
          <div>
            {/* Navigation Links */}
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
                <div className="w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center text-sm mr-2">
                  {profile?.firstName && profile?.lastName ? 
                    (profile.firstName[0] + profile.lastName[0]).toUpperCase() : 
                    (user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'AL')}
                </div>
                <div className="text-left">
                  <span className="text-gray-700 font-medium block">
                    {profile?.firstName && profile?.lastName ? 
                      `${profile.firstName} ${profile.lastName}` : 
                      (user?.fullName || 'Alumni User')}
                  </span>
                  {profile?.currentPosition && (
                    <span className="text-xs text-gray-500">
                      {profile.currentPosition}
                    </span>
                  )}
                </div>
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

          {/* Dashboard Content matching startup dashboard */}
          {currentPage === 'dashboard' && (
            <div className="animate-fade-in">
              {/* Enhanced Welcome Section with Profile Info */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-gray-800 mb-8 shadow-lg border border-blue-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Side - Profile Information */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl font-bold text-blue-700">
                          {profile?.firstName && profile?.lastName ? 
                            (profile.firstName[0] + profile.lastName[0]).toUpperCase() : 
                            (user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'AL')}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold mb-1">
                          Welcome back, {profile?.firstName || user?.fullName?.split(' ')[0] || 'Alumni'}! 👋
                        </h2>
                        <p className="text-blue-600 text-lg">
                          {profile?.currentPosition && profile?.currentCompany ? 
                            `${profile.currentPosition} at ${profile.currentCompany}` : 
                            'Ready to connect with fellow alumni and share your success story?'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Profile Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {profile?.industry && (
                        <div className="flex items-center">
                          <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
                          <span className="text-blue-600">{profile.industry} Industry</span>
                        </div>
                      )}
                      {profile?.city && (
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                          <span className="text-blue-600">{profile.city}</span>
                        </div>
                      )}
                      {profile?.graduationYear && (
                        <div className="flex items-center">
                          <GraduationCap className="w-5 h-5 mr-2 text-blue-400" />
                          <span className="text-blue-600">Class of {profile.graduationYear}</span>
                        </div>
                      )}
                      {profile?.degree && (
                        <div className="flex items-center">
                          <Award className="w-5 h-5 mr-2 text-blue-400" />
                          <span className="text-blue-600">{profile.degree}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side - Welcome Animation */}
                  <div className="flex items-center justify-center">
                    <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-5xl">🎓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid matching startup dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alumni Network Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      Alumni Network
                    </h3>
                    <span className="text-2xl font-bold text-blue-600">{alumniCount || 150}</span>
                  </div>
                  <p className="text-gray-600 mb-4">Connect with fellow alumni and expand your professional network</p>
                  <button 
                    onClick={() => setCurrentPage('alumniNetwork')}
                    className="w-full bg-blue-100 text-blue-700 py-3 rounded-xl hover:bg-blue-200 transition-colors font-medium border border-blue-200"
                  >
                    Browse Network
                  </button>
                </div>

                {/* Mentorship Hub Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      Mentorship Hub
                    </h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Available</span>
                  </div>
                  <p className="text-gray-600 mb-4">Share your expertise and mentor current startups in the program</p>
                  <button 
                    onClick={() => setCurrentPage('mentorship')}
                    className="w-full bg-blue-100 text-blue-700 py-3 rounded-xl hover:bg-blue-200 transition-colors font-medium border border-blue-200"
                  >
                    View Requests
                  </button>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Mentorship Requests */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Mentorship Requests</h3>
                  <div className="space-y-3">
                    {mockMentorshipRequests.map((request) => (
                      <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{request.startupName}</h4>
                          <span className="text-xs text-gray-500">{request.requestDate}</span>
                        </div>
                        <p className="text-sm text-gray-600">{request.founderName} • {request.industry}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Alumni */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Alumni</h3>
                  <div className="space-y-3">
                    {allAlumni.slice(0, 3).map((alumni) => (
                      <div key={alumni.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {alumni.firstName && alumni.lastName ? 
                              (alumni.firstName[0] + alumni.lastName[0]) : 
                              (alumni.firstName ? alumni.firstName[0] : 'A')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {alumni.firstName && alumni.lastName ? 
                              `${alumni.firstName} ${alumni.lastName}` : 
                              alumni.firstName || 'Alumni'}
                          </h4>
                          <p className="text-sm text-gray-600">{alumni.currentPosition} at {alumni.currentCompany}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Profile Page with Beautiful Display */}
          {currentPage === 'myProfile' && (
            <div className="animate-fade-in">
              {!isEditing ? (
                <div className="space-y-6">
                  {/* Profile Header Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mr-6">
                          <span className="text-3xl font-bold text-white">
                            {profile?.firstName && profile?.lastName ? 
                              (profile.firstName[0] + profile.lastName[0]).toUpperCase() : 
                              (user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'AL')}
                          </span>
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {profile?.firstName && profile?.lastName ? 
                              `${profile.firstName} ${profile.lastName}` : 
                              (user?.fullName || 'Alumni User')}
                          </h1>
                          <p className="text-xl text-blue-700 font-medium">
                            {profile?.currentPosition || 'Position not specified'}
                          </p>
                          <p className="text-lg text-gray-600">
                            {profile?.currentCompany || 'Company not specified'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
                      >
                        <Edit3 className="w-5 h-5 mr-2" />
                        Edit Profile
                      </button>
                    </div>
                  </div>
                  {/* Profile Information Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <User className="w-6 h-6 mr-3 text-blue-500" />
                        Personal Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{user?.email || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{profile?.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium text-gray-900">{profile?.city || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Briefcase className="w-6 h-6 mr-3 text-blue-500" />
                        Professional Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Building className="w-5 h-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Industry</p>
                            <p className="font-medium text-gray-900">{profile?.industry || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="w-5 h-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Degree</p>
                            <p className="font-medium text-gray-900">{profile?.degree || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Award className="w-5 h-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Graduation Year</p>
                            <p className="font-medium text-gray-900">{profile?.graduationYear || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio and Success Story */}
                  {(profile?.bio || profile?.successStory) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {profile?.bio && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">About Me</h3>
                          <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                        </div>
                      )}
                      {profile?.successStory && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Success Story</h3>
                          <p className="text-gray-700 leading-relaxed">{profile.successStory}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills and Achievements */}
                  {(profile?.skills || profile?.achievements) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {profile?.skills && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
                          <p className="text-gray-700">{profile.skills}</p>
                        </div>
                      )}
                      {profile?.achievements && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Achievements</h3>
                          <p className="text-gray-700">{profile.achievements}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-brand-dark">Edit Profile</h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Enhanced Profile Form */}
                  <div className="space-y-8">
                    {/* Basic Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <input
                            type="text"
                            value={profile?.firstName || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Enter your first name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            value={profile?.lastName || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Enter your last name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={profile?.phone || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter your phone number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <input
                            type="text"
                            value={profile?.city || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Enter your city"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Company</label>
                          <input
                            type="text"
                            value={profile?.currentCompany || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, currentCompany: e.target.value }))}
                            placeholder="Enter your current company"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Position</label>
                          <input
                            type="text"
                            value={profile?.currentPosition || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, currentPosition: e.target.value }))}
                            placeholder="Enter your current position"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                          <input
                            type="text"
                            value={profile?.industry || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                            placeholder="Enter your industry"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                          <input
                            type="number"
                            value={profile?.graduationYear || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, graduationYear: e.target.value }))}
                            placeholder="Enter graduation year"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                          <input
                            type="text"
                            value={profile?.degree || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, degree: e.target.value }))}
                            placeholder="Enter your degree"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                          <textarea
                            value={profile?.bio || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us about yourself..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Success Story</label>
                          <textarea
                            value={profile?.successStory || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, successStory: e.target.value }))}
                            placeholder="Share your success story..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                            <textarea
                              value={profile?.skills || ''}
                              onChange={(e) => setProfile(prev => ({ ...prev, skills: e.target.value }))}
                              placeholder="List your skills..."
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                            <textarea
                              value={profile?.achievements || ''}
                              onChange={(e) => setProfile(prev => ({ ...prev, achievements: e.target.value }))}
                              placeholder="List your achievements..."
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Alumni Network Page */}
          {currentPage === 'alumniNetwork' && (
            <div className="animate-fade-in">
              {/* Search and Filter */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search alumni by name, company, or position..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      <option value="">All Industries</option>
                      <option value="Technology">Technology</option>
                      <option value="FinTech">FinTech</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="AI/ML">AI/ML</option>
                    </select>
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Alumni Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allAlumni.map((alumni) => (
                  <div key={alumni.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center mr-4">
                        <span className="text-lg font-medium text-white">
                          {alumni.fullName ? alumni.fullName.split(' ').map(n => n[0]).join('') : 'AL'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{alumni.fullName || 'Alumni Member'}</h4>
                        <p className="text-sm text-gray-600">{alumni.currentPosition}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-2" />
                        {alumni.currentCompany}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="w-4 h-4 mr-2" />
                        {alumni.industry}
                      </div>
                    </div>
                    <button className="w-full bg-brand-primary text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mentorship Hub Page */}
          {currentPage === 'mentorshipHub' && (
            <div className="animate-fade-in">
              {/* Alumni Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Alumni</p>
                      <p className="text-3xl font-bold text-blue-800">{alumniCount}</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Active Mentors</p>
                      <p className="text-3xl font-bold text-blue-800">{availableMentors.length}</p>
                    </div>
                    <GraduationCap className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Industries</p>
                      <p className="text-3xl font-bold text-blue-800">12+</p>
                    </div>
                    <Building className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Success Rate</p>
                      <p className="text-3xl font-bold text-blue-800">96%</p>
                    </div>
                    <Award className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-brand-dark">Mentorship Hub</h3>
                  <div className="flex space-x-3">
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                      Become a Mentor
                    </button>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Find a Mentor
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Available Mentors */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-green-500" />
                      Available Mentors ({availableMentors.length})
                    </h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {availableMentors.length > 0 ? availableMentors.map((mentor, index) => (
                        <div key={mentor.id || index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">
                                {mentor.fullName?.split(' ').map(n => n[0]).join('') || mentor.name?.split(' ').map(n => n[0]).join('') || 'M'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{mentor.fullName || mentor.name || 'Mentor Name'}</h5>
                              <p className="text-sm text-gray-600">{mentor.expertise || mentor.specialization || 'Business Strategy'}</p>
                              <div className="flex items-center mt-1">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                <span className="text-sm text-gray-600">{mentor.rating || '4.8'} ({mentor.sessions || '12'} sessions)</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {mentor.bio || mentor.description || 'Experienced professional ready to guide and support your entrepreneurial journey with proven strategies and insights.'}
                          </p>
                          <div className="flex items-center mb-3 text-sm text-gray-600">
                            <Building className="w-4 h-4 mr-1" />
                            <span>{mentor.company || mentor.currentCompany || 'Tech Corp'}</span>
                            <span className="mx-2">•</span>
                            <span>{mentor.experience || '10+'} years exp.</span>
                          </div>
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                              Request Mentorship
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              <User className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600">No mentors available at the moment.</p>
                          <p className="text-sm text-gray-500">Check back later or become a mentor yourself!</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mentorship Requests & Sessions */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                      Your Mentorship Activity
                    </h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {mockMentorshipRequests.map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{request.startupName}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.stage === 'Seed' ? 'bg-green-100 text-green-700' :
                              request.stage === 'Series A' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {request.stage}
                            </span>
                          </div>
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-4 h-4 mr-2" />
                              <span>Founder: {request.founderName}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="w-4 h-4 mr-2" />
                              <span>Industry: {request.industry}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Requested: {request.requestDate}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Accept
                            </button>
                            <button className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                              <XCircle className="w-4 h-4 inline mr-1" />
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {mockMentorshipRequests.length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600">No mentorship requests yet.</p>
                          <p className="text-sm text-gray-500">Your requests will appear here when startups reach out.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Page */}
          {currentPage === 'calendar' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-brand-dark mb-6">Calendar Management</h3>
                <CalendarManagement />
              </div>
            </div>
          )}

          {/* Opportunities Page */}
          {currentPage === 'opportunities' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-brand-dark">Career Opportunities</h3>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                      <option>All Status</option>
                      <option>Open</option>
                      <option>Closed</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">{opportunity.title}</h4>
                          <p className="text-gray-600 flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {opportunity.company}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          opportunity.status === 'Open' ? 'bg-green-100 text-green-700' :
                          opportunity.status === 'Closed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {opportunity.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {opportunity.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {opportunity.type}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="w-4 h-4 mr-2" />
                          {opportunity.salary}
                        </div>
                      </div>
                      
                      <button 
                        className="w-full bg-brand-primary text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        disabled={opportunity.status === 'Closed'}
                      >
                        {opportunity.status === 'Open' ? 'Apply Now' : 'Position Closed'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Page */}
          {currentPage === 'notifications' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-brand-dark">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                      <option>All Types</option>
                      <option>System</option>
                      <option>Network</option>
                      <option>Mentorship</option>
                      <option>Opportunities</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {mockNotifications.map((notification) => (
                    <div key={notification.id} className="flex items-start p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="mr-4 mt-1">
                        {notification.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-xs text-brand-primary hover:underline">Mark as Read</button>
                        <button className="text-xs text-red-500 hover:underline">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chats Page */}
          {currentPage === 'chats' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-brand-dark mb-6">Your Chats</h3>
                <ChatOverview token={token} currentUser={user} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
