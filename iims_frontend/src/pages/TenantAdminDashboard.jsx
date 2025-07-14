import { useAuth } from "../hooks/useAuth";

export default function TenantAdminDashboard({ token, tenantId }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tenant Admin Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.fullName || user?.email} (Tenant Admin)
              </p>
              <p className="text-xs text-gray-500">Tenant ID: {tenantId}</p>
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Center Management</h2>
            <p className="text-gray-700">This is your center's dashboard. Here you will manage your center's users, startups, and activities.</p>
            {/* Add tenant-specific features here */}
          </div>
        </div>
      </main>
    </div>
  );
} 