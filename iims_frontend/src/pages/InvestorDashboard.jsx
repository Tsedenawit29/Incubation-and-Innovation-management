import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  getInvestorProfile, 
  createOrUpdateInvestorProfile, 
  getAllInvestors, 
  getInvestorCount 
} from '../api/investor';
import CalendarManagement from './CalendarManagement';
import ChatOverview from '../components/ChatOverview';
import {
  LayoutDashboard,
  User,
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  Bell,
  LogOut,
  Edit3,
  Save,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Award,
  ChevronDown,
  XCircle,
  CheckCircle,
  Search,
  Filter,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  Wallet,
  MessageCircle,
  UserPlus,
  Building2,
  Clock,
  Plus,
  Eye,
  FileText,
  Heart,
  Bookmark,
  Settings
} from 'lucide-react';

export default function InvestorDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMsg, setEditMsg] = useState('');
  const [allInvestors, setAllInvestors] = useState([]);
  const [investorCount, setInvestorCount] = useState(0);

  // Navigation items for investor dashboard
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
    { name: 'My Profile', icon: User, page: 'myProfile' },
    { name: 'Investor Network', icon: Users, page: 'investorNetwork' },
    { name: 'Portfolio Hub', icon: PieChart, page: 'portfolioHub' },
    { name: 'Calendar', icon: Calendar, page: 'calendar' },
    { name: 'Opportunities', icon: TrendingUp, page: 'opportunities' },
    { name: 'Notifications', icon: Bell, page: 'notifications' },
    { name: 'Chats', icon: MessageSquare, page: 'chats' },
  ];

  // Check authentication and role
  useEffect(() => {
    if (!user || user.role !== 'INVESTOR') {
      navigate('/login');
      return;
    }
    fetchInvestorProfile();
    fetchInvestorData();
  }, [user, navigate]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Clear message after 3 seconds
  useEffect(() => {
    if (editMsg) {
      const timer = setTimeout(() => {
        setEditMsg('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [editMsg]);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchInvestorProfile = async () => {
    if (!user?.id) return;
    try {
      const profileData = await getInvestorProfile(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching investor profile:', error);
      setError('Failed to load profile data');
    }
  };

  const fetchInvestorData = async () => {
    try {
      const [investors, count] = await Promise.all([
        getAllInvestors(),
        getInvestorCount()
      ]);
      setAllInvestors(investors || []);
      setInvestorCount(count || 0);
    } catch (error) {
      console.error('Error fetching investor data:', error);
      setError('Failed to load investor data');
    }
  };

  const handleSave = async () => {
    if (!user?.id || !profile) return;
    setLoading(true);
    try {
      const updatedProfile = await createOrUpdateInvestorProfile(user.id, profile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setEditMsg('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}
      </style>
      
      <div className="min-h-screen bg-gray-50 flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white p-6 flex flex-col justify-between border-r border-gray-100 shadow-inner sticky top-0 h-screen overflow-y-auto">
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
                    (user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'IN')}
                </div>
                <div className="text-left">
                  <span className="text-gray-700 font-medium block">
                    {profile?.firstName && profile?.lastName ? 
                      `${profile.firstName} ${profile.lastName}` : 
                      (user?.fullName || 'Investor User')}
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

          {/* Messages */}
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

          {/* Dashboard Content */}
          {currentPage === 'dashboard' && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-gray-800 mb-8 shadow-lg border border-blue-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl font-bold text-blue-700">
                          {profile?.firstName && profile?.lastName ? 
                            (profile.firstName[0] + profile.lastName[0]).toUpperCase() : 
                            (user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'IN')}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold mb-1">
                          Welcome back, {profile?.firstName || user?.fullName?.split(' ')[0] || 'Investor'}! 👋
                        </h2>
                        <p className="text-blue-600 text-lg">
                          {profile?.currentPosition && profile?.currentCompany ? 
                            `${profile.currentPosition} at ${profile.currentCompany}` : 
                            'Ready to discover and invest in promising startups?'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-5xl">💼</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      Investor Network
                    </h3>
                    <span className="text-2xl font-bold text-blue-600">{investorCount || 50}</span>
                  </div>
                  <p className="text-gray-600 mb-4">Connect with fellow investors and expand your investment network</p>
                  <button 
                    onClick={() => setCurrentPage('investorNetwork')}
                    className="w-full bg-blue-100 text-blue-700 py-3 rounded-xl hover:bg-blue-200 transition-colors font-medium border border-blue-200"
                  >
                    Browse Network
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <PieChart className="w-6 h-6 text-blue-600" />
                      </div>
                      Portfolio Hub
                    </h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Active</span>
                  </div>
                  <p className="text-gray-600 mb-4">Manage your portfolio and track investment performance</p>
                  <button 
                    onClick={() => setCurrentPage('portfolioHub')}
                    className="w-full bg-blue-100 text-blue-700 py-3 rounded-xl hover:bg-blue-200 transition-colors font-medium border border-blue-200"
                  >
                    View Portfolio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Page */}
          {currentPage === 'calendar' && (
            <div className="animate-fade-in">
              <CalendarManagement />
            </div>
          )}

          {/* Chats Page */}
          {currentPage === 'chats' && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Messages & Chats</h2>
                    <p className="text-lg text-gray-600">Connect and communicate with your network</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                      <span className="text-2xl font-bold text-blue-600">8</span>
                      <p className="text-sm text-gray-500">Active Chats</p>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                      <span className="text-2xl font-bold text-green-600">3</span>
                      <p className="text-sm text-gray-500">Unread</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Component - Same as other dashboards */}
              <ChatOverview token={token} currentUser={user} />
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
                              (user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'IN')}
                          </span>
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {profile?.firstName && profile?.lastName ? 
                              `${profile.firstName} ${profile.lastName}` : 
                              (user?.fullName || 'Investor User')}
                          </h1>
                          <p className="text-xl text-blue-700 font-medium">
                            {profile?.currentPosition || 'Position not specified'}
                          </p>
                          <p className="text-lg text-gray-600">
                            {profile?.currentCompany || profile?.firmName || 'Company not specified'}
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

                    {/* Investment Information */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <DollarSign className="w-6 h-6 mr-3 text-blue-500" />
                        Investment Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Target className="w-5 h-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Investment Focus</p>
                            <p className="font-medium text-gray-900">{profile?.investmentFocus || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Wallet className="w-5 h-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Ticket Size</p>
                            <p className="font-medium text-gray-900">{profile?.ticketSize || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="w-5 h-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Investment Stage</p>
                            <p className="font-medium text-gray-900">{profile?.investmentStage || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio and Investment Philosophy */}
                  {(profile?.bio || profile?.investmentPhilosophy) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {profile?.bio && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">About Me</h3>
                          <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                        </div>
                      )}
                      {profile?.investmentPhilosophy && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Investment Philosophy</h3>
                          <p className="text-gray-700 leading-relaxed">{profile.investmentPhilosophy}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Investment Criteria and Portfolio */}
                  {(profile?.investmentCriteria || profile?.portfolioCompanies) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {profile?.investmentCriteria && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Investment Criteria</h3>
                          <p className="text-gray-700 leading-relaxed">{profile.investmentCriteria}</p>
                        </div>
                      )}
                      {profile?.portfolioCompanies && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Companies</h3>
                          <p className="text-gray-700 leading-relaxed">{profile.portfolioCompanies}</p>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Firm Name</label>
                          <input
                            type="text"
                            value={profile?.firmName || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, firmName: e.target.value }))}
                            placeholder="Enter your firm name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                          <input
                            type="text"
                            value={profile?.yearsOfExperience || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                            placeholder="Enter years of experience"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Investment Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Investment Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Investment Focus</label>
                          <input
                            type="text"
                            value={profile?.investmentFocus || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, investmentFocus: e.target.value }))}
                            placeholder="e.g., FinTech, HealthTech, AI/ML"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Investment Stage</label>
                          <input
                            type="text"
                            value={profile?.investmentStage || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, investmentStage: e.target.value }))}
                            placeholder="e.g., Seed, Series A, Series B"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Size</label>
                          <input
                            type="text"
                            value={profile?.ticketSize || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, ticketSize: e.target.value }))}
                            placeholder="e.g., $100K - $1M"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mentorship Areas</label>
                          <input
                            type="text"
                            value={profile?.mentorshipAreas || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, mentorshipAreas: e.target.value }))}
                            placeholder="Areas you can mentor startups"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Investment Philosophy</label>
                          <textarea
                            value={profile?.investmentPhilosophy || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, investmentPhilosophy: e.target.value }))}
                            placeholder="Share your investment philosophy..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Investment Criteria</label>
                            <textarea
                              value={profile?.investmentCriteria || ''}
                              onChange={(e) => setProfile(prev => ({ ...prev, investmentCriteria: e.target.value }))}
                              placeholder="What do you look for in investments..."
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Companies</label>
                            <textarea
                              value={profile?.portfolioCompanies || ''}
                              onChange={(e) => setProfile(prev => ({ ...prev, portfolioCompanies: e.target.value }))}
                              placeholder="List your portfolio companies..."
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

          {/* Investor Network Page */}
          {currentPage === 'investorNetwork' && (
            <div className="animate-fade-in space-y-6">
              {/* Network Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Investor Network</h2>
                    <p className="text-lg text-gray-600">Connect with fellow investors and expand your network</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                      <span className="text-2xl font-bold text-blue-600">47</span>
                      <p className="text-sm text-gray-500">Total Investors</p>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                      <span className="text-2xl font-bold text-green-600">12</span>
                      <p className="text-sm text-gray-500">Active This Week</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search investors by name, firm, or focus..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Focus Areas</option>
                    <option value="fintech">FinTech</option>
                    <option value="healthtech">HealthTech</option>
                    <option value="ai">AI/ML</option>
                    <option value="saas">SaaS</option>
                    <option value="ecommerce">E-commerce</option>
                  </select>
                  <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Stages</option>
                    <option value="pre-seed">Pre-Seed</option>
                    <option value="seed">Seed</option>
                    <option value="series-a">Series A</option>
                    <option value="series-b">Series B+</option>
                  </select>
                  <button className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Investor Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Ethiopian Investor Cards */}
                {[
                  {
                    name: "Meron Tadesse",
                    position: "Managing Partner",
                    firm: "Addis Ventures",
                    focus: "FinTech, AgriTech",
                    stage: "Series A-B",
                    ticketSize: "$1M - $5M",
                    portfolio: "18 companies",
                    location: "Addis Ababa, Ethiopia",
                    experience: "12 years",
                    initials: "MT",
                    color: "bg-blue-500"
                  },
                  {
                    name: "Dawit Hailu",
                    position: "Investment Director",
                    firm: "Blue Nile Capital",
                    focus: "HealthTech, EdTech",
                    stage: "Seed, Series A",
                    ticketSize: "$500K - $2M",
                    portfolio: "15 companies",
                    location: "Addis Ababa, Ethiopia",
                    experience: "8 years",
                    initials: "DH",
                    color: "bg-green-500"
                  },
                  {
                    name: "Hanan Mohammed",
                    position: "Principal",
                    firm: "Horn Ventures",
                    focus: "Mobile Tech, E-commerce",
                    stage: "Pre-Seed, Seed",
                    ticketSize: "$100K - $1M",
                    portfolio: "22 companies",
                    location: "Dire Dawa, Ethiopia",
                    experience: "6 years",
                    initials: "HM",
                    color: "bg-purple-500"
                  }
                ].map((investor, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                    {/* Investor Header */}
                    <div className="flex items-center mb-4">
                      <div className={`w-16 h-16 ${investor.color} rounded-full flex items-center justify-center mr-4`}>
                        <span className="text-xl font-bold text-white">{investor.initials}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{investor.name}</h3>
                        <p className="text-blue-600 font-medium">{investor.position}</p>
                        <p className="text-gray-600 text-sm">{investor.firm}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                          <UserPlus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Investment Details */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Focus:</span>
                        <span className="text-sm font-medium text-gray-900 ml-1">{investor.focus}</span>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Stage:</span>
                        <span className="text-sm font-medium text-gray-900 ml-1">{investor.stage}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Ticket Size:</span>
                        <span className="text-sm font-medium text-gray-900 ml-1">{investor.ticketSize}</span>
                      </div>
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Portfolio:</span>
                        <span className="text-sm font-medium text-gray-900 ml-1">{investor.portfolio}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="text-sm font-medium text-gray-900 ml-1">{investor.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Experience:</span>
                        <span className="text-sm font-medium text-gray-900 ml-1">{investor.experience}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex space-x-3">
                      <button className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </button>
                      <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center">
                <button className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Load More Investors
                </button>
              </div>
            </div>
          )}

          {/* Portfolio Hub Page */}
          {currentPage === 'portfolioHub' && (
            <div className="animate-fade-in space-y-6">
              {/* Portfolio Header */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Hub</h2>
                    <p className="text-lg text-gray-600">Manage and track your investment portfolio</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                      <span className="text-2xl font-bold text-green-600">$12.5M</span>
                      <p className="text-sm text-gray-500">Total Invested</p>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                      <span className="text-2xl font-bold text-blue-600">23</span>
                      <p className="text-sm text-gray-500">Portfolio Companies</p>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                      <span className="text-2xl font-bold text-purple-600">3.2x</span>
                      <p className="text-sm text-gray-500">Avg. Multiple</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Metrics */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">IRR</span>
                      <span className="font-bold text-green-600">24.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">TVPI</span>
                      <span className="font-bold text-blue-600">2.8x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">DPI</span>
                      <span className="font-bold text-purple-600">1.4x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Investments</span>
                      <span className="font-bold text-gray-900">18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Exits</span>
                      <span className="font-bold text-orange-600">5</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">TechFlow raised Series B</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">DataCorp quarterly report</p>
                        <p className="text-xs text-gray-500">1 week ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">FinanceAI acquired by BigTech</p>
                        <p className="text-xs text-gray-500">2 weeks ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">HealthStart IPO filing</p>
                        <p className="text-xs text-gray-500">3 weeks ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performers</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">TechFlow</p>
                        <p className="text-sm text-gray-500">Series B</p>
                      </div>
                      <span className="text-green-600 font-bold">+340%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">DataCorp</p>
                        <p className="text-sm text-gray-500">Series A</p>
                      </div>
                      <span className="text-green-600 font-bold">+280%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">FinanceAI</p>
                        <p className="text-sm text-gray-500">Exited</p>
                      </div>
                      <span className="text-green-600 font-bold">+520%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">HealthStart</p>
                        <p className="text-sm text-gray-500">Pre-IPO</p>
                      </div>
                      <span className="text-green-600 font-bold">+450%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Companies Table */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Portfolio Companies</h3>
                  <button className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Investment
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Stage</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Investment</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Valuation</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Multiple</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "TechFlow", stage: "Series B", investment: "$500K", valuation: "$50M", multiple: "3.4x", status: "Active", statusColor: "green" },
                        { name: "DataCorp", stage: "Series A", investment: "$250K", valuation: "$25M", multiple: "2.8x", status: "Active", statusColor: "green" },
                        { name: "FinanceAI", stage: "Exited", investment: "$100K", valuation: "$15M", multiple: "5.2x", status: "Exited", statusColor: "blue" },
                        { name: "HealthStart", stage: "Pre-IPO", investment: "$750K", valuation: "$100M", multiple: "4.5x", status: "Pre-IPO", statusColor: "purple" },
                        { name: "EduTech", stage: "Series A", investment: "$300K", valuation: "$20M", multiple: "2.1x", status: "Active", statusColor: "green" }
                      ].map((company, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{company.name}</td>
                          <td className="py-3 px-4 text-gray-600">{company.stage}</td>
                          <td className="py-3 px-4 text-gray-600">{company.investment}</td>
                          <td className="py-3 px-4 text-gray-600">{company.valuation}</td>
                          <td className="py-3 px-4 font-medium text-green-600">{company.multiple}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              company.statusColor === 'green' ? 'bg-green-100 text-green-800' :
                              company.statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {company.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Opportunities Page */}
          {currentPage === 'opportunities' && (
            <div className="animate-fade-in space-y-6">
              {/* Opportunities Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Investment Opportunities</h2>
                    <p className="text-lg text-gray-600">Discover and evaluate new investment opportunities</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                      <span className="text-2xl font-bold text-blue-600">15</span>
                      <p className="text-sm text-gray-500">Active Deals</p>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                      <span className="text-2xl font-bold text-blue-600">4</span>
                      <p className="text-sm text-gray-500">New This Week</p>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                      <span className="text-2xl font-bold text-blue-600">3</span>
                      <p className="text-sm text-gray-500">Matched</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search opportunities by company, industry, or keywords..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Industries</option>
                    <option value="fintech">FinTech</option>
                    <option value="healthtech">HealthTech</option>
                    <option value="ai">AI/ML</option>
                    <option value="saas">SaaS</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="biotech">BioTech</option>
                  </select>
                  <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Stages</option>
                    <option value="pre-seed">Pre-Seed</option>
                    <option value="seed">Seed</option>
                    <option value="series-a">Series A</option>
                    <option value="series-b">Series B</option>
                    <option value="series-c">Series C+</option>
                  </select>
                  <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Sizes</option>
                    <option value="small">$100K - $1M</option>
                    <option value="medium">$1M - $10M</option>
                    <option value="large">$10M+</option>
                  </select>
                </div>
                
                {/* Quick Filter Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 mr-2">Quick Filters:</span>
                  {['Hot Deals', 'Closing Soon', 'Matched Criteria', 'AI/ML', 'HealthTech', 'Series A'].map((tag, index) => (
                    <button key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opportunity Cards */}
              <div className="space-y-6">
                {[
                  {
                    company: "HealthFlow AI",
                    industry: "HealthTech",
                    stage: "Series A",
                    raising: "$5M",
                    valuation: "$25M",
                    description: "AI-powered healthcare workflow optimization platform helping hospitals reduce costs by 30% and improve patient outcomes.",
                    highlights: ["Growing 200% YoY", "Fortune 500 clients", "FDA approved"],
                    team: "Ex-Google, Stanford MDs",
                    traction: "$2M ARR, 50+ hospitals",
                    closingDate: "Dec 15, 2024",
                    matched: true,
                    hot: true,
                    logo: "HF"
                  },
                  {
                    company: "EduTech Ethiopia",
                    industry: "EdTech",
                    stage: "Seed",
                    raising: "$1.5M",
                    valuation: "$8M",
                    description: "Digital learning platform for Ethiopian students with localized content and offline capabilities for rural areas.",
                    highlights: ["50K+ students", "Government partnership", "Local language support"],
                    team: "Ex-Microsoft, Addis Ababa University",
                    traction: "$300K ARR, 80% retention",
                    closingDate: "Jan 30, 2025",
                    matched: true,
                    hot: false,
                    logo: "EE"
                  }
                ].map((opportunity, index) => (
                  <div key={index} className={`bg-white rounded-2xl shadow-lg border ${opportunity.matched ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} p-6 hover:shadow-xl transition-all`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-xl font-bold text-white">{opportunity.logo}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{opportunity.company}</h3>
                            {opportunity.hot && (
                              <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">🔥 Hot</span>
                            )}
                            {opportunity.matched && (
                              <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">✓ Matched</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <Building2 className="w-4 h-4 mr-1" />
                              {opportunity.industry}
                            </span>
                            <span className="flex items-center">
                              <BarChart3 className="w-4 h-4 mr-1" />
                              {opportunity.stage}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              Raising {opportunity.raising}
                            </span>
                            <span className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              {opportunity.valuation} valuation
                            </span>
                          </div>
                          <p className="text-gray-700 mb-4">{opportunity.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Closing</p>
                        <p className="font-medium text-gray-900">{opportunity.closingDate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Key Highlights</h4>
                        <ul className="space-y-1">
                          {opportunity.highlights.map((highlight, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Team</h4>
                        <p className="text-sm text-gray-600">{opportunity.team}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Traction</h4>
                        <p className="text-sm text-gray-600">{opportunity.traction}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-3">
                        <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                        <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          <FileText className="w-4 h-4 mr-2" />
                          Pitch Deck
                        </button>
                        <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center">
                <button className="px-8 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                  Load More Opportunities
                </button>
              </div>
            </div>
          )}

          {/* Notifications Page */}
          {currentPage === 'notifications' && (
            <div className="animate-fade-in space-y-6">
              {/* Notifications Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h2>
                    <p className="text-lg text-gray-600">Stay updated with your investments and opportunities</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark All Read
                    </button>
                    <button className="flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Categories */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm text-gray-600 mr-2">Filter by:</span>
                  {[
                    { name: 'All', count: 12, active: true },
                    { name: 'Portfolio Updates', count: 4, active: false },
                    { name: 'New Opportunities', count: 3, active: false },
                    { name: 'Meeting Reminders', count: 2, active: false },
                    { name: 'System', count: 3, active: false }
                  ].map((category, index) => (
                    <button key={index} className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      category.active 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-4">
                {[
                  {
                    type: 'portfolio',
                    icon: TrendingUp,
                    iconColor: 'text-green-500',
                    iconBg: 'bg-green-100',
                    title: 'HealthFlow AI raised Series A funding',
                    message: 'Your portfolio company HealthFlow AI successfully closed their $5M Series A round.',
                    time: '2 hours ago',
                    unread: true,
                    action: 'View Update'
                  },
                  {
                    type: 'opportunity',
                    icon: Target,
                    iconColor: 'text-blue-500',
                    iconBg: 'bg-blue-100',
                    title: 'New matched opportunity: EduTech Ethiopia',
                    message: 'A new Seed opportunity in EdTech matches your investment criteria. Raising $1.5M at $8M valuation.',
                    time: '4 hours ago',
                    unread: true,
                    action: 'View Deal'
                  },
                  {
                    type: 'meeting',
                    icon: Calendar,
                    iconColor: 'text-blue-500',
                    iconBg: 'bg-blue-100',
                    title: 'Upcoming meeting reminder',
                    message: 'You have a pitch meeting with EduTech Ethiopia team scheduled for tomorrow at 2:00 PM.',
                    time: '6 hours ago',
                    unread: false,
                    action: 'View Calendar'
                  }
                ].map((notification, index) => (
                  <div key={index} className={`bg-white rounded-2xl shadow-lg border ${notification.unread ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'} p-6 hover:shadow-xl transition-all`}>
                    <div className="flex items-start">
                      <div className={`w-12 h-12 ${notification.iconBg} rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                        <notification.icon className={`w-6 h-6 ${notification.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-lg font-semibold ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                            {notification.unread && <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 inline-block"></span>}
                          </h3>
                          <span className="text-sm text-gray-500">{notification.time}</span>
                        </div>
                        <p className="text-gray-600 mb-4">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                            {notification.action}
                          </button>
                          {notification.unread && (
                            <button className="text-sm text-gray-500 hover:text-gray-700">
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center">
                <button className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Load Older Notifications
                </button>
              </div>
            </div>
          )}

          {/* Other pages placeholder */}
          {!['dashboard', 'calendar', 'chats', 'myProfile', 'investorNetwork', 'portfolioHub', 'opportunities', 'notifications'].includes(currentPage) && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {currentPage.replace(/([A-Z])/g, ' $1')} Page
                </h3>
                <p className="text-gray-600">This section is under development and will be available soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}