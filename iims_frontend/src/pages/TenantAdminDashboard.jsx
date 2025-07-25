import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { 
  getTenantUsersByRole, 
  createTenantUser,
  updateUserProfile,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  updateUserPassword
} from "../api/users";
import UserTable from "../components/UserTable";
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

export default function TenantAdminDashboard() {
  const { user, token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", role: ROLES[0] });
  const [activeTab, setActiveTab] = useState(ROLES[0]);

  // Modal states
  const [editModal, setEditModal] = useState({ isOpen: false, user: null });
  const [roleModal, setRoleModal] = useState({ isOpen: false, user: null });
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  const fetchUsers = async (role) => {
    setLoading(true);
    setError("");
    try {
      const usersByRole = await getTenantUsersByRole(token, role);
      setUsers(usersByRole);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers(activeTab);
    // eslint-disable-next-line
  }, [token, activeTab]);

  const openModal = () => {
    setForm({ fullName: "", email: "", role: activeTab });
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ fullName: "", email: "", role: activeTab });
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header/Profile */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-400 shadow-lg p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-blue-700 font-bold text-2xl border-4 border-blue-300">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.fullName || user?.email}</h1>
            <p className="text-blue-100 text-sm">Tenant Admin</p>
            <p className="text-blue-200 text-xs">Tenant ID: <span className="font-mono">{user?.tenantId}</span></p>
          </div>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium shadow"
        >
          Logout
        </button>
      </header>
      {/* Tabs for roles */}
      <div className="flex-1 max-w-5xl mx-auto w-full mt-8">
        <div className="flex space-x-2 mb-6 border-b">
          {ROLES.map((role) => (
            <button
              key={role}
              className={`px-4 py-2 font-semibold rounded-t-md focus:outline-none transition-colors duration-200 ${activeTab === role ? 'bg-white border-l border-t border-r border-blue-400 text-blue-700 -mb-px' : 'bg-blue-100 text-blue-600 hover:bg-white'}`}
              onClick={() => setActiveTab(role)}
            >
              {role.charAt(0) + role.slice(1).toLowerCase()}s
            </button>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-blue-700">{activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}s</h2>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
              onClick={openModal}
            >
              + Create {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}
            </button>
          </div>
          {loading && <div>Loading users...</div>}
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">{success}</div>}
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
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create User</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleFormChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                  className="w-full border rounded px-3 py-2"
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
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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