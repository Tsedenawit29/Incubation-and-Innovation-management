import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ChatOverview from '../components/ChatOverview';
import TenantAdminSidebar from '../components/TenantAdminSidebar';
import { 
  MessageSquare, 
  Users, 
  Eye, 
  Filter,
  Search,
  Bell
} from 'lucide-react';

export default function TenantAdminChatPage() {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data for chat statistics
  const chatStats = {
    totalChats: 24,
    activeChats: 8,
    pendingMessages: 12,
    totalUsers: 156
  };

  const chatFilters = [
    { id: 'all', label: 'All Chats', count: chatStats.totalChats },
    { id: 'active', label: 'Active', count: chatStats.activeChats },
    { id: 'pending', label: 'Pending', count: chatStats.pendingMessages },
    { id: 'startup', label: 'Startup', count: 18 },
    { id: 'mentor', label: 'Mentor', count: 6 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TenantAdminSidebar user={user} onLogout={logout} />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Management</h1>
          <p className="text-gray-600">Monitor and manage chat conversations across your organization</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Chats</p>
                <p className="text-2xl font-bold text-gray-900">{chatStats.totalChats}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900">{chatStats.activeChats}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Messages</p>
                <p className="text-2xl font-bold text-gray-900">{chatStats.pendingMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{chatStats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {chatFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === filter.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 px-2 py-1 bg-white rounded-full text-xs">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Chat Overview Component */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Chat Conversations</h2>
            <p className="text-sm text-gray-600 mt-1">Monitor and manage ongoing conversations</p>
          </div>
          <div className="p-6">
            <ChatOverview token={token} currentUser={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
