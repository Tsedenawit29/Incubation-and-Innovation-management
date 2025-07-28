import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
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
    setEditModal({ isOpen: true, user });
  };

  const handleEditSave = async (formData) => {
    try {
      // Only send the fields that are actually provided
      const profileData = {};
      if (formData.fullName !== undefined && formData.fullName !== '') {
        profileData.fullName = formData.fullName;
      }
      if (formData.email !== undefined && formData.email !== '') {
        profileData.email = formData.email;
      }
      
      await updateUserProfile(token, editModal.user.id, profileData);
      await fetchUsers();
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
      await fetchUsers();
      showSuccessMessage("User deleted successfully!");
    } catch (err) {
      throw new Error("Failed to delete user: " + err.message);
    }
  };

  const handleStatus = async (user) => {
    try {
      await updateUserStatus(token, user.id, !user.active);
      await fetchUsers();
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
      await fetchUsers();
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
      showSuccessMessage("Password updated successfully!");
    } catch (err) {
      throw new Error("Failed to update password: " + err.message);
    }
  };

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
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <header className="bg-brand-primary shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">IIMS Dashboard</h1>
              <p className="text-sm text-brand-dark">
                Welcome, {getDisplayName()} ({user?.role || 'Unknown Role'})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Navigation Links for Super Admin */}
              {user?.role === 'SUPER_ADMIN' && (
                <div className="flex space-x-2">
                  <Link
                    to="/tenant-management"
                    className="bg-brand-primary hover:bg-brand-dark text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Tenant Management
                  </Link>
                  <Link
                    to="/admin-requests"
                    className="bg-brand-dark hover:bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Admin Requests
                  </Link>
                </div>
              )}
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
              <h2 className="text-lg font-medium text-brand-primary mb-4">User Management</h2>
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