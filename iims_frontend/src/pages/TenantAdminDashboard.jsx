import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { 
  getTenantUsersByRole, 
  getTenantUsers,
  createTenantUser,
  updateUserProfile,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  updateUserPassword
} from "../api/users";
import UserTable from "../components/UserTable";
import TenantAdminSidebar from "../components/TenantAdminSidebar";
import EditUserModal from '../components/EditUserModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ChangeRoleModal from '../components/ChangeRoleModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { 
  Users,
  Download,
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  FileText,
  Target,
  Activity,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  ArrowLeft,
  LineChart
} from 'lucide-react';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

const ROLES = [
  "STARTUP",
  "MENTOR",
  "COACH",
  "FACILITATOR",
  "INVESTOR",
  "ALUMNI"
];

const TABS = [...ROLES, "APPLICATIONS", "APPLICATION_FORMS", "ANALYTICS"];

export default function TenantAdminDashboard() {
  const { user, token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", role: ROLES[0] });
  const [activeTab, setActiveTab] = useState("ANALYTICS");

  // Modal states
  const [editModal, setEditModal] = useState({ isOpen: false, user: null });
  const [roleModal, setRoleModal] = useState({ isOpen: false, user: null });
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  // Analytics states
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    usersByRole: {},
    growthRate: 0,
    engagementRate: 0,
    completionRate: 0
  });

  const fetchUsers = async (role = activeTab) => {
    setLoading(true);
    setError("");
    try {
      let userData;
      if (role === 'ALL') {
        // Fetch all users for the tenant
        userData = await getTenantUsers(token);
      } else {
        // Fetch users by specific role
        userData = await getTenantUsersByRole(token, role);
      }
      setUsers(userData);
      calculateAnalytics(userData);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  const calculateAnalytics = (userData) => {
    const totalUsers = userData.length;
    const activeUsers = userData.filter(user => user.status === 'ACTIVE').length;
    
    // Count users by role
    const usersByRole = userData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Mock calculations for demonstration (in real app, these would come from actual data)
    const growthRate = Math.floor(Math.random() * 20) + 5; // 5-25%
    const engagementRate = Math.floor(Math.random() * 30) + 60; // 60-90%
    const completionRate = Math.floor(Math.random() * 25) + 70; // 70-95%

    setAnalyticsData({
      totalUsers,
      activeUsers,
      usersByRole,
      growthRate,
      engagementRate,
      completionRate
    });
  };

  // CSV Download functionality
  const downloadCSV = () => {
    const csvData = users.map(user => ({
      'Full Name': user.fullName || 'N/A',
      'Email': user.email,
      'Role': user.role,
      'Status': user.status,
      'Created Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
      'Tenant ID': user.tenantId || 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tenant_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download analytics report
  const downloadAnalyticsCSV = () => {
    const analyticsCSV = [
      ['Metric', 'Value'],
      ['Total Users', analyticsData.totalUsers],
      ['Active Users', analyticsData.activeUsers],
      ['Inactive Users', analyticsData.totalUsers - analyticsData.activeUsers],
      ['Growth Rate (%)', analyticsData.growthRate],
      ['Engagement Rate (%)', analyticsData.engagementRate],
      ['Completion Rate (%)', analyticsData.completionRate],
      [''],
      ['Users by Role', ''],
      ...Object.entries(analyticsData.usersByRole).map(([role, count]) => [role, count])
    ];

    const csvContent = analyticsCSV.map(row => row.map(val => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tenant_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Only fetch users for real roles
  useEffect(() => {
    if (token) fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchUsers(tab);
  };

  // Remove Application Forms fetching logic and UI

  const openModal = () => {
    setForm({ fullName: "", email: "", role: activeTab === 'ALL' ? ROLES[0] : activeTab });
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ fullName: "", email: "", role: activeTab === 'ALL' ? ROLES[0] : activeTab });
    setError("");
    setSuccess("");
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createTenantUser(token, form);
      setSuccess("User created and credentials sent by email!");
      fetchUsers(activeTab);
      setTimeout(closeModal, 1500);
    } catch (err) {
      setError(err.message || "Failed to create user");
    }
  };

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEdit = (user) => {
    setEditModal({ isOpen: true, user });
  };

  const handleEditSave = async (formData) => {
    try {
      const profileData = {};
      if (formData.fullName !== undefined && formData.fullName !== '') {
        profileData.fullName = formData.fullName;
      }
      if (formData.email !== undefined && formData.email !== '') {
        profileData.email = formData.email;
      }
      
      await updateUserProfile(token, editModal.user.id, profileData);
      fetchUsers(activeTab);
      setEditModal({ isOpen: false, user: null });
      showSuccessMessage("User updated successfully!");
    } catch (err) {
      throw new Error("Failed to update user: " + err.message);
    }
  };

  const handleDelete = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(token, deleteModal.user.id);
      fetchUsers(activeTab);
      setDeleteModal({ isOpen: false, user: null });
      showSuccessMessage("User deleted successfully!");
    } catch (err) {
      throw new Error("Failed to delete user: " + err.message);
    }
  };

  const handleStatus = async (user) => {
    try {
      await updateUserStatus(token, user.id, !user.active);
      fetchUsers(activeTab);
      const action = user.active ? "deactivated" : "activated";
      showSuccessMessage(`User ${action} successfully!`);
    } catch (err) {
      alert("Failed to update user status: " + err.message);
    }
  };

  const handleRole = (user) => {
    setRoleModal({ isOpen: true, user });
  };

  const handleRoleSave = async (newRole) => {
    try {
      await updateUserRole(token, roleModal.user.id, newRole);
      fetchUsers(activeTab);
      setRoleModal({ isOpen: false, user: null });
      showSuccessMessage("User role updated successfully!");
    } catch (err) {
      throw new Error("Failed to update user role: " + err.message);
    }
  };

  const handleChangePassword = (user) => {
    setPasswordModal({ isOpen: true, user });
  };

  const handlePasswordSave = async (currentPassword, newPassword) => {
    try {
      await updateUserPassword(token, passwordModal.user.id, currentPassword, newPassword);
      setPasswordModal({ isOpen: false, user: null });
      showSuccessMessage("Password updated successfully!");
    } catch (err) {
      throw new Error("Failed to update password: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#299DFF]/5 to-[#0A2D5C]/5">
      {/* Artistic floating shapes */}
      <div className="pointer-events-none select-none fixed inset-0">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#299DFF] rounded-full opacity-10 blur-2xl animate-float-slow z-0" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#0A2D5C] rounded-full opacity-10 blur-2xl animate-float-slower z-0" />
      </div>
      
      {/* Sidebar */}
      <TenantAdminSidebar user={user} onLogout={logout} />
      
      {/* Main Content */}
      <div className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Header with Back to Home */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link 
                to="/" 
                className="flex items-center text-[#0A2D5C] hover:text-[#299DFF] transition-colors duration-200 mr-4 group"
              >
                <ArrowLeft size={24} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Home</span>
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#0A2D5C] to-[#299DFF] text-transparent bg-clip-text mb-2">Dashboard Overview</h1>
            <p className="text-[#0A2D5C]/70 text-lg">Welcome back, {user?.fullName || 'Admin'}! Manage your tenant users and analytics.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#299DFF]/10 to-[#0A2D5C]/5 rounded-2xl shadow-xl p-6 border border-[#299DFF]/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#299DFF] rounded-full opacity-10 blur-xl" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-[#0A2D5C]/70">Total Users</p>
                  <p className="text-3xl font-bold text-[#0A2D5C]">{users.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#299DFF] to-[#0A2D5C] rounded-full shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0A2D5C]/10 to-[#299DFF]/5 rounded-2xl shadow-xl p-6 border border-[#0A2D5C]/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#0A2D5C] rounded-full opacity-10 blur-xl" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-[#0A2D5C]/70">Active Users</p>
                  <p className="text-3xl font-bold text-[#0A2D5C]">{users.filter(u => u.status === 'ACTIVE').length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#0A2D5C] to-[#299DFF] rounded-full shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#299DFF]/10 to-[#0A2D5C]/5 rounded-2xl shadow-xl p-6 border border-[#299DFF]/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#299DFF] rounded-full opacity-10 blur-xl" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-[#0A2D5C]/70">Startups</p>
                  <p className="text-3xl font-bold text-[#0A2D5C]">{users.filter(u => u.role === 'STARTUP').length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#299DFF] to-[#0A2D5C] rounded-full shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0A2D5C]/10 to-[#299DFF]/5 rounded-2xl shadow-xl p-6 border border-[#0A2D5C]/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#0A2D5C] rounded-full opacity-10 blur-xl" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-[#0A2D5C]/70">Mentors</p>
                  <p className="text-3xl font-bold text-[#0A2D5C]">{users.filter(u => u.role === 'MENTOR').length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#0A2D5C] to-[#299DFF] rounded-full shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-gradient-to-br from-white to-[#299DFF]/5 rounded-2xl shadow-xl p-8 border border-[#299DFF]/20 mb-8 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#299DFF] rounded-full opacity-10 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#0A2D5C] rounded-full opacity-10 blur-xl" />
            
            {/* Analytics Toggle */}
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0A2D5C] to-[#299DFF] text-transparent bg-clip-text">Data Analytics & Reports</h2>
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    showAnalytics 
                      ? 'bg-gradient-to-r from-[#299DFF] to-[#0A2D5C] text-white shadow-xl' 
                      : 'bg-gradient-to-r from-[#299DFF]/10 to-[#0A2D5C]/10 text-[#0A2D5C] hover:from-[#299DFF]/20 hover:to-[#0A2D5C]/20 border border-[#299DFF]/30'
                  }`}
                >
                  <BarChart3 size={20} className="mr-2" />
                  {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadCSV}
                  className="flex items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Download size={18} className="mr-2" />
                  Export Users CSV
                </button>
                <button
                  onClick={downloadAnalyticsCSV}
                  className="flex items-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <FileText size={18} className="mr-2" />
                  Export Analytics
                </button>
              </div>
            </div>

            {/* Analytics Content */}
            {showAnalytics && (
              <div className="space-y-8">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Users Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium mb-1">Total Users</p>
                        <p className="text-3xl font-bold text-blue-800">{analyticsData.totalUsers}</p>
                        <div className="flex items-center mt-2">
                          <ArrowUp size={16} className="text-green-500 mr-1" />
                          <span className="text-green-600 text-sm font-medium">{analyticsData.growthRate}% growth</span>
                        </div>
                      </div>
                      <div className="bg-blue-200 p-3 rounded-full">
                        <Users size={24} className="text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* Active Users Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium mb-1">Active Users</p>
                        <p className="text-3xl font-bold text-green-800">{analyticsData.activeUsers}</p>
                        <div className="flex items-center mt-2">
                          <Activity size={16} className="text-green-500 mr-1" />
                          <span className="text-green-600 text-sm font-medium">
                            {analyticsData.totalUsers > 0 ? Math.round((analyticsData.activeUsers / analyticsData.totalUsers) * 100) : 0}% active
                          </span>
                        </div>
                      </div>
                      <div className="bg-green-200 p-3 rounded-full">
                        <Activity size={24} className="text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Engagement Rate Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium mb-1">Engagement Rate</p>
                        <p className="text-3xl font-bold text-purple-800">{analyticsData.engagementRate}%</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp size={16} className="text-purple-500 mr-1" />
                          <span className="text-purple-600 text-sm font-medium">Above average</span>
                        </div>
                      </div>
                      <div className="bg-purple-200 p-3 rounded-full">
                        <TrendingUp size={24} className="text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Completion Rate Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 text-sm font-medium mb-1">Task Completion</p>
                        <p className="text-3xl font-bold text-orange-800">{analyticsData.completionRate}%</p>
                        <div className="flex items-center mt-2">
                          <Target size={16} className="text-orange-500 mr-1" />
                          <span className="text-orange-600 text-sm font-medium">High performance</span>
                        </div>
                      </div>
                      <div className="bg-orange-200 p-3 rounded-full">
                        <Award size={24} className="text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users by Role Chart */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <PieChart size={24} className="mr-3 text-blue-600" />
                      Users by Role Distribution
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(analyticsData.usersByRole).map(([role, count]) => {
                      const percentage = analyticsData.totalUsers > 0 ? Math.round((count / analyticsData.totalUsers) * 100) : 0;
                      const colors = {
                        STARTUP: 'bg-blue-500',
                        MENTOR: 'bg-green-500',
                        COACH: 'bg-purple-500',
                        FACILITATOR: 'bg-yellow-500',
                        INVESTOR: 'bg-red-500',
                        ALUMNI: 'bg-gray-500'
                      };
                      return (
                        <div key={role} className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className={`w-12 h-12 ${colors[role] || 'bg-gray-400'} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                            <Users size={20} className="text-white" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">{role}</p>
                          <p className="text-2xl font-bold text-gray-800">{count}</p>
                          <p className="text-xs text-gray-500">{percentage}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <Calendar size={20} className="mr-2 text-blue-600" />
                      Monthly Activity
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">New Registrations</span>
                        <span className="font-bold text-blue-600">{Math.floor(analyticsData.totalUsers * 0.15)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Sessions</span>
                        <span className="font-bold text-green-600">{Math.floor(analyticsData.activeUsers * 1.3)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tasks Completed</span>
                        <span className="font-bold text-purple-600">{Math.floor(analyticsData.totalUsers * 2.1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <Award size={20} className="mr-2 text-yellow-600" />
                      Achievement Metrics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Milestones Reached</span>
                        <span className="font-bold text-yellow-600">{Math.floor(analyticsData.totalUsers * 0.8)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Certifications</span>
                        <span className="font-bold text-green-600">{Math.floor(analyticsData.totalUsers * 0.4)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-bold text-blue-600">{analyticsData.completionRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <TrendingUp size={20} className="mr-2 text-green-600" />
                      Growth Trends
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">User Growth</span>
                        <div className="flex items-center">
                          <ArrowUp size={16} className="text-green-500 mr-1" />
                          <span className="font-bold text-green-600">{analyticsData.growthRate}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Retention Rate</span>
                        <div className="flex items-center">
                          <ArrowUp size={16} className="text-blue-500 mr-1" />
                          <span className="font-bold text-blue-600">{Math.floor(analyticsData.engagementRate * 0.9)}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Satisfaction</span>
                        <div className="flex items-center">
                          <Minus size={16} className="text-yellow-500 mr-1" />
                          <span className="font-bold text-yellow-600">{Math.floor(analyticsData.completionRate * 0.95)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
              <button
                onClick={openModal}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                + Create User
              </button>
            </div>
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleTabChange('ALL')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ALL'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  All Users
                </button>
                {ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleTabChange(role)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === role
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {role.charAt(0) + role.slice(1).toLowerCase()}
                  </button>
                ))}
              </nav>
            </div>

            {/* Current Tab Display */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {activeTab === 'ALL' ? 'All Users' : `${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} Users`}
              </h3>
              <p className="text-sm text-gray-600">
                {activeTab === 'ALL' 
                  ? 'Showing all users in your organization' 
                  : `Showing ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} users only`
                }
              </p>
            </div>

            {loading && <div className="text-center py-8 text-gray-500">Loading users...</div>}
            {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
            {success && <div className="text-green-600 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">{success}</div>}
            
            <UserTable 
              users={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatus={handleStatus}
              onRole={handleRole}
              onChangePassword={handleChangePassword}
            />
          </div>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-blue-600">Create User</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role.charAt(0) + role.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {success && <div className="text-green-600 mb-2">{success}</div>}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-2 rounded transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, user: null })}
        user={editModal.user}
        onSave={handleEditSave}
      />

      <ChangeRoleModal
        isOpen={roleModal.isOpen}
        onClose={() => setRoleModal({ isOpen: false, user: null })}
        user={roleModal.user}
        onSave={handleRoleSave}
        roles={ROLES} 
      />

      <ChangePasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ isOpen: false, user: null })}
        user={passwordModal.user}
        onSave={handlePasswordSave}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        user={deleteModal.user}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
} 