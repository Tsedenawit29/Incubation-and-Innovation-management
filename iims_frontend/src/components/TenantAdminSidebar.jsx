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
  FaFileAlt,
  FaCalendarAlt,
  FaNewspaper
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
      path: '/tenant-admin/user-management',
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
      path: '/tenant-admin/calendar',
      icon: <FaCalendarAlt />,
      label: 'Calendar & Meetings',
      description: 'Schedule and manage meetings'
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
    },
    {
      path: '/tenant-admin/news',
      icon: <FaNewspaper />,
      label: 'News & Updates',
      description: 'Manage news posts and announcements'
    }
  ];

  const isActive = (path) => {
    if (path === '/tenant-admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };


  return (
    <div className="w-64 bg-gradient-to-b from-[#0A2D5C] to-[#299DFF] shadow-2xl border-r border-[#299DFF]/30 min-h-screen relative overflow-hidden">
      {/* Artistic floating shapes */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#299DFF] rounded-full opacity-20 blur-2xl animate-float-slow" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full opacity-10 blur-xl animate-float-slower" />
      
      {/* Header */}
      <div className="p-6 border-b border-white/20 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-white to-[#299DFF]/20 rounded-xl flex items-center justify-center shadow-lg border border-white/30">
            <FaBuilding className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white drop-shadow-lg">Tenant Admin</h2>
            <p className="text-sm text-white/80">{user?.tenantName || 'Organization'}</p>
          </div>
        </div>
        
        {/* User Info */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[#0A2D5C] font-bold text-sm">
                {user?.fullName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.fullName || 'Admin User'}
              </p>
              <p className="text-xs text-white/70 truncate">
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Updated with white text */}
      <nav className="p-4 relative z-10">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={`menu-${index}-${item.path}`}
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isActive(item.path)
                  ? 'bg-white text-[#0A2D5C] shadow-lg border-l-4 border-[#299DFF]'
                  : 'text-white hover:bg-white/10 backdrop-blur-sm border border-[#299DFF]/20'
              }`}
            >
              <div className={`text-lg transition-colors ${
                isActive(item.path) ? 'text-[#299DFF]' : 'text-white'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${
                  isActive(item.path) ? 'text-[#0A2D5C]' : 'text-white'
                }`}>
                  {item.label}
                </p>
                <p className={`text-xs ${
                  isActive(item.path) ? 'text-[#0A2D5C]/70' : 'text-white/70'
                }`}>
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </nav>


      {/* Quick Actions - Updated with white text */}
      <div className="p-4 border-t border-white/20 relative z-10">
        <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors border border-white/20">
            <FaClipboardList className="text-white" />
            <span>View Reports</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors border border-white/20">
            <FaBell className="text-white" />
            <span>Notifications</span>
          </button>
        </div>
      </div>

      {/* Footer - Updated with white text */}
      <div className="mt-auto p-4 border-t border-white/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <FaSignOutAlt className="text-white" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
