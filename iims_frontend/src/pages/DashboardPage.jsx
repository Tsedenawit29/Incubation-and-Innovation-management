import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import {
  getUsers,
  updateUser,
  updateUserProfile,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  updateUserPassword,
} from "../api/users";
import UserTable from "../components/UserTable";
import EditUserModal from "../components/EditUserModal";
import ChangeRoleModal from "../components/ChangeRoleModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const API_URL = "http://localhost:8081/api";

export default function DashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { token, logout, user } = useAuth();

  // Debug user data
  console.log("Dashboard - Current user data:", user);

  // Modal states
  const [editModal, setEditModal] = useState({ isOpen: false, user: null });
  const [roleModal, setRoleModal] = useState({ isOpen: false, user: null });
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await getUsers(token);
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [token]);

  const handleEdit = (user) => {
    console.log("Edit button clicked for user:", user);
    setEditModal({ isOpen: true, user });
  };

  const handleEditSave = async (formData) => {
    try {
      console.log("handleEditSave called with formData:", formData);
      console.log("Current user being edited:", editModal.user);
      console.log("Token present:", !!token);
      
      // Only send the fields that are actually provided
      const profileData = {};
      if (formData.fullName !== undefined && formData.fullName !== '') {
        profileData.fullName = formData.fullName;
      }
      if (formData.email !== undefined && formData.email !== '') {
        profileData.email = formData.email;
      }
      
      console.log("Profile data to send:", profileData);
      
      await updateUserProfile(token, editModal.user.id, profileData);
      await fetchUsers();
      showSuccessMessage("User updated successfully!");
    } catch (err) {
      console.error("Error in handleEditSave:", err);
      alert("Failed to update user: " + err.message);
    }
  };

  const handleDelete = (user) => {
    console.log("Delete button clicked for user:", user);
    setDeleteModal({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log("handleDeleteConfirm called for user:", deleteModal.user);
      console.log("Token present:", !!token);
      
      await deleteUser(token, deleteModal.user.id);
      await fetchUsers();
      showSuccessMessage("User deleted successfully!");
    } catch (err) {
      console.error("Error in handleDeleteConfirm:", err);
      alert("Failed to delete user: " + err.message);
    }
  };

  const handleStatus = async (user) => {
    try {
      console.log("handleStatus called for user:", user);
      console.log("Token present:", !!token);
      console.log("New status will be:", !user.active);
      
      await updateUserStatus(token, user.id, !user.active);
      await fetchUsers();
      const action = user.active ? "deactivated" : "activated";
      showSuccessMessage(`User ${action} successfully!`);
    } catch (err) {
      console.error("Error in handleStatus:", err);
      alert("Failed to update user status: " + err.message);
    }
  };

  const handleRole = (user) => {
    console.log("Change Role button clicked for user:", user);
    setRoleModal({ isOpen: true, user });
  };

  const handleRoleSave = async (newRole) => {
    try {
      console.log("handleRoleSave called with newRole:", newRole);
      console.log("Current user:", roleModal.user);
      console.log("Token present:", !!token);
      
      await updateUserRole(token, roleModal.user.id, newRole);
      await fetchUsers();
      showSuccessMessage("User role updated successfully!");
    } catch (err) {
      console.error("Error in handleRoleSave:", err);
      alert("Failed to update user role: " + err.message);
    }
  };

  const handleChangePassword = (user) => {
    console.log("Change Password button clicked for user:", user);
    setPasswordModal({ isOpen: true, user });
  };

  const handlePasswordSave = async (currentPassword, newPassword) => {
    try {
      console.log("handlePasswordSave called for user:", passwordModal.user);
      console.log("Token present:", !!token);
      
      await updateUserPassword(token, passwordModal.user.id, currentPassword, newPassword);
      showSuccessMessage("Password updated successfully!");
    } catch (err) {
      console.error("Error in handlePasswordSave:", err);
      alert("Failed to update password: " + err.message);
    }
  };

  // Move the following console.log below all function definitions to avoid ReferenceError
  console.log("DashboardPage render - Functions defined:", {
    handleEdit: typeof handleEdit,
    handleDelete: typeof handleDelete,
    handleStatus: typeof handleStatus,
    handleRole: typeof handleRole,
    handleChangePassword: typeof handleChangePassword
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get display name for welcome message
  const getDisplayName = () => {
    if (user?.fullName && user.fullName.trim() !== '') {
      return user.fullName;
    } else if (user?.email) {
      return user.email;
    } else {
      return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#299DFF]/5 to-[#0A2D5C]/5">
      {/* Artistic floating shapes */}
      <div className="pointer-events-none select-none fixed inset-0">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#299DFF] rounded-full opacity-10 blur-2xl animate-float-slow z-0" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#0A2D5C] rounded-full opacity-10 blur-2xl animate-float-slower z-0" />
      </div>
      
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-[#299DFF]/5 shadow-xl border-b border-[#299DFF]/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              {/* Back to Home */}
              <div className="flex items-center mb-4">
                <Link 
                  to="/" 
                  className="flex items-center text-[#0A2D5C] hover:text-[#299DFF] transition-colors duration-200 mr-4 group"
                >
                  <ArrowLeft size={24} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="font-medium">Back to Home</span>
                </Link>
              </div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#0A2D5C] to-[#299DFF] text-transparent bg-clip-text mb-2">IIMS Dashboard</h1>
              <p className="text-[#0A2D5C]/70 text-lg">
                Welcome, {getDisplayName()} ({user?.role || 'Unknown Role'})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Navigation Links for Super Admin */}
              {user?.role === 'SUPER_ADMIN' && (
                <div className="flex space-x-3">
                  <Link
                    to="/tenant-management"
                    className="bg-gradient-to-r from-[#299DFF] to-[#0A2D5C] hover:from-[#0A2D5C] hover:to-[#299DFF] text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Tenant Management
                  </Link>
                  <Link
                    to="/admin-requests"
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Admin Requests
                  </Link>
                  <Link
                    to="/super-admin/chats"
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Chat Management
                  </Link>
                </div>
              )}
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">✅ {successMessage}</div>
            </div>
          )}
          
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">User Management</h2>
                <button
                  onClick={async () => {
                    try {
                      console.log("Testing backend connection...");
                      const response = await fetch(`${API_URL}/users`, {
                        headers: { 
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json"
                        },
                      });
                      console.log("Test response status:", response.status);
                      if (response.ok) {
                        alert("✅ Backend connection successful!");
                      } else {
                        alert(`❌ Backend connection failed: ${response.status}`);
                      }
                    } catch (error) {
                      console.error("Backend test error:", error);
                      alert(`❌ Backend connection error: ${error.message}`);
                    }
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Test Backend
                </button>
              </div>
              <UserTable 
                users={users} 
                onEdit={(user) => {
                  console.log("onEdit called with user:", user);
                  console.log("handleEdit function:", typeof handleEdit);
                  handleEdit(user);
                }}
                onDelete={(user) => {
                  console.log("onDelete called with user:", user);
                  console.log("handleDelete function:", typeof handleDelete);
                  handleDelete(user);
                }}
                onStatus={(user) => {
                  console.log("onStatus called with user:", user);
                  console.log("handleStatus function:", typeof handleStatus);
                  handleStatus(user);
                }}
                onRole={(user) => {
                  console.log("onRole called with user:", user);
                  console.log("handleRole function:", typeof handleRole);
                  handleRole(user);
                }}
                onChangePassword={(user) => {
                  console.log("onChangePassword called with user:", user);
                  console.log("handleChangePassword function:", typeof handleChangePassword);
                  handleChangePassword(user);
                }}
              />
            </div>
          </div>
        </div>
      </main>

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