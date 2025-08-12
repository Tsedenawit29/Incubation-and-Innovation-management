import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaChartLine, 
  FaCogs, 
  FaPalette, 
  FaUserPlus, 
  FaSignOutAlt,
  FaBuilding,
  FaClipboardList,
  FaBell,
  FaWpforms,
  FaFileAlt
} from 'react-icons/fa';

export default function TenantAdminSidebar({ user, onLogout }) {
  const location = useLocation();

  const menuItems = [
    {
      path: '/tenant-admin/dashboard',
      icon: <FaHome />,
      label: 'Dashboard',
      description: 'Overview and analytics'
    },
    {
      path: '/tenant-admin/dashboard',
      icon: <FaUsers />,
      label: 'User Management',
      description: 'Manage users and roles'
    },
    {
      path: `/tenant-admin/${user?.tenantId}/progress-tracking-management`,
      icon: <FaChartLine />,
      label: 'Progress Tracking',
      description: 'Templates and assignments'
    },
    {
      path: `/tenant-admin/${user?.tenantId}/landing-page-management`,
      icon: <FaPalette />,
      label: 'Landing Page',
      description: 'Customize your landing page'
    },
    {
      path: '/tenant-admin/startup-management',
      icon: <FaUserPlus />,
      label: 'Mentor Assignment',
      description: 'Assign mentors to startups'
    },
    {
      path: '/application-forms',
      icon: <FaWpforms />,
      label: 'Application Forms',
      description: 'Create and manage forms'
    },
    {
      path: '/applications',
      icon: <FaFileAlt />,
      label: 'Applications',
      description: 'Review submitted applications'
    },
    {
      path: '/tenant-admin/chats',
      icon: <FaUsers />,
      label: 'Chats',
      description: 'Manage and monitor chat conversations'
    }
  ];

  const isActive = (path) => {
    if (path === '/tenant-admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FaBuilding className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tenant Admin</h2>
            <p className="text-sm text-gray-600">{user?.tenantName || 'Organization'}</p>
          </div>
        </div>
        
        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {user?.fullName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`text-lg transition-colors ${
                isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${
                  isActive(item.path) ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {item.label}
                </p>
                <p className={`text-xs ${
                  isActive(item.path) ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <FaClipboardList className="text-gray-400" />
            <span>View Reports</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <FaBell className="text-gray-400" />
            <span>Notifications</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FaSignOutAlt />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}