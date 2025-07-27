import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getPendingTenants,
  getAllTenants,
  approveTenant,
  rejectTenant,
  suspendTenant,
  activateTenant,
} from "../api/tenants";
import TenantTable from "../components/TenantTable";
import ApproveTenantModal from "../components/ApproveTenantModal";
import RejectTenantModal from "../components/RejectTenantModal";

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState([]);
  const [pendingTenants, setPendingTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "all"
  const { token, logout, user } = useAuth();

  // Modal states
  const [approveModal, setApproveModal] = useState({ isOpen: false, tenant: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, tenant: null });

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const [allTenants, pending] = await Promise.all([
        getAllTenants(token),
        getPendingTenants(token)
      ]);
      setTenants(allTenants);
      setPendingTenants(pending);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      setError("Failed to load tenants");
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
      fetchTenants();
    }
  }, [token]);

  const handleApprove = (tenant) => {
    setApproveModal({ isOpen: true, tenant });
  };

  const handleApproveConfirm = async () => {
    try {
      const result = await approveTenant(token, approveModal.tenant.id, user.id);
      await fetchTenants();
      showSuccessMessage(`Tenant approved successfully! Tenant ID: ${result.tenantId}`);
      return result;
    } catch (err) {
      throw new Error("Failed to approve tenant: " + err.message);
    }
  };

  const handleReject = (tenant) => {
    setRejectModal({ isOpen: true, tenant });
  };

  const handleRejectConfirm = async (reason) => {
    try {
      await rejectTenant(token, rejectModal.tenant.id, user.id, reason);
      await fetchTenants();
      showSuccessMessage("Tenant rejected successfully!");
    } catch (err) {
      throw new Error("Failed to reject tenant: " + err.message);
    }
  };

  const handleSuspend = async (tenant) => {
    try {
      await suspendTenant(token, tenant.id);
      await fetchTenants();
      showSuccessMessage("Tenant suspended successfully!");
    } catch (err) {
      alert("Failed to suspend tenant: " + err.message);
    }
  };

  const handleActivate = async (tenant) => {
    try {
      await activateTenant(token, tenant.id);
      await fetchTenants();
      showSuccessMessage("Tenant activated successfully!");
    } catch (err) {
      alert("Failed to activate tenant: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentTenants = activeTab === "pending" ? pendingTenants : tenants;

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <header className="bg-brand-primary shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Tenant Management</h1>
              <p className="text-sm text-brand-dark">
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
              <div className="border-b border-brand-primary mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "pending"
                        ? "border-brand-primary text-brand-primary"
                        : "border-transparent text-brand-dark hover:text-brand-primary hover:border-brand-primary"
                    }`}
                  >
                    Pending Requests ({pendingTenants.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "all"
                        ? "border-brand-primary text-brand-primary"
                        : "border-transparent text-brand-dark hover:text-brand-primary hover:border-brand-primary"
                    }`}
                  >
                    All Tenants ({tenants.length})
                  </button>
                </nav>
              </div>

              <h2 className="text-lg font-medium text-brand-primary mb-4">
                {activeTab === "pending" ? "Pending Tenant Requests" : "All Tenants"}
              </h2>
              
              <TenantTable 
                tenants={currentTenants}
                onApprove={handleApprove}
                onReject={handleReject}
                onSuspend={handleSuspend}
                onActivate={handleActivate}
                showActions={true}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ApproveTenantModal
        isOpen={approveModal.isOpen}
        onClose={() => setApproveModal({ isOpen: false, tenant: null })}
        tenant={approveModal.tenant}
        onConfirm={handleApproveConfirm}
      />

      <RejectTenantModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, tenant: null })}
        tenant={rejectModal.tenant}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
} 