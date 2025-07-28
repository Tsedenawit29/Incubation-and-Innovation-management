import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getPendingAdminRequests,
  getAllAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
} from "../api/adminRequests";
import AdminRequestTable from "../components/AdminRequestTable";
import ApproveAdminModal from "../components/ApproveAdminModal";
import RejectAdminModal from "../components/RejectAdminModal";

export default function AdminRequestManagementPage() {
  const [adminRequests, setAdminRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "all"
  const { token, logout, user } = useAuth();

  // Modal states
  const [approveModal, setApproveModal] = useState({ isOpen: false, request: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, request: null });

  const fetchAdminRequests = async () => {
    try {
      setLoading(true);
      const [allRequests, pending] = await Promise.all([
        getAllAdminRequests(token),
        getPendingAdminRequests(token)
      ]);
      setAdminRequests(allRequests);
      setPendingRequests(pending);
    } catch (error) {
      console.error("Error fetching admin requests:", error);
      setError("Failed to load admin requests");
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
      fetchAdminRequests();
    }
  }, [token]);

  const handleApprove = (request) => {
    setApproveModal({ isOpen: true, request });
  };

  const handleApproveConfirm = async () => {
    try {
      await approveAdminRequest(token, approveModal.request.id, user.id);
      await fetchAdminRequests();
      showSuccessMessage("Admin request approved successfully! Credentials have been sent.");
    } catch (err) {
      throw new Error("Failed to approve admin request: " + err.message);
    }
  };

  const handleReject = (request) => {
    setRejectModal({ isOpen: true, request });
  };

  const handleRejectConfirm = async (reason) => {
    try {
      await rejectAdminRequest(token, rejectModal.request.id, user.id, reason);
      await fetchAdminRequests();
      showSuccessMessage("Admin request rejected successfully!");
    } catch (err) {
      throw new Error("Failed to reject admin request: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentRequests = activeTab === "pending" ? pendingRequests : adminRequests;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Request Management</h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.fullName || user?.email} ({user?.role})
              </p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
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
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "pending"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Pending Requests ({pendingRequests.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "all"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    All Requests ({adminRequests.length})
                  </button>
                </nav>
              </div>

              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {activeTab === "pending" ? "Pending Admin Requests" : "All Admin Requests"}
              </h2>
              
              <AdminRequestTable 
                requests={currentRequests}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={true}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ApproveAdminModal
        isOpen={approveModal.isOpen}
        onClose={() => setApproveModal({ isOpen: false, request: null })}
        request={approveModal.request}
        onConfirm={handleApproveConfirm}
      />

      <RejectAdminModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, request: null })}
        request={rejectModal.request}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
} 