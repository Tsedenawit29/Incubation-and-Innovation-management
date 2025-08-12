import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
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


const ROLES = [
  "STARTUP",
  "MENTOR",
  "COACH",
  "FACILITATOR",
  "INVESTOR",
  "ALUMNI"
];

const TABS = [...ROLES, "APPLICATIONS", "APPLICATION_FORMS"];

export default function TenantAdminDashboard() {
  const { user, token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", role: ROLES[0] });
  const [activeTab, setActiveTab] = useState('ALL');

  // Modal states
  const [editModal, setEditModal] = useState({ isOpen: false, user: null });
  const [roleModal, setRoleModal] = useState({ isOpen: false, user: null });
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

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
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
    }
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <TenantAdminSidebar user={user} onLogout={logout} />
      
      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-blue-600">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.fullName || 'Admin'}!</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-blue-700">{users.filter(u => u.status === 'ACTIVE').length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Startups</p>
                  <p className="text-2xl font-bold text-blue-800">{users.filter(u => u.role === 'STARTUP').length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mentors</p>
                  <p className="text-2xl font-bold text-blue-900">{users.filter(u => u.role === 'MENTOR').length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-600">User Management</h2>
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                onClick={openModal}
              >
                + Create User
              </button>
            </div>

            {/* Role Tabs */}
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