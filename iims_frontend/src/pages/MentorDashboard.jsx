import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MentorProgressReview from "../components/MentorProgressReview";
import ProgressVisualization from "../components/ProgressVisualization";
import { getStartupsForMentor } from "../api/progresstracking";
import { 
  Home, 
  Eye, 
  TrendingUp, 
  LogOut, 
  User,
  FileText,
  MessageCircle,
  Star,
  Users,
  Mail,
  Linkedin,
  Twitter,
  Globe,
  Building2,
  GraduationCap
} from 'lucide-react';

export default function MentorDashboard() {
  const { id } = useParams();
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('overview');
  const [assignedStartups, setAssignedStartups] = useState([]);
  const [startupsLoading, setStartupsLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch assigned startups
  useEffect(() => {
    const fetchAssignedStartups = async () => {
      try {
        setStartupsLoading(true);
        const startups = await getStartupsForMentor(id, token);
        setAssignedStartups(startups);
      } catch (error) {
        console.error('Error fetching assigned startups:', error);
      } finally {
        setStartupsLoading(false);
      }
    };

    if (id && token) {
      fetchAssignedStartups();
    }
  }, [id, token]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                ID: {id}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setCurrentTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Progress Reviews
              </div>
            </button>
            <button
              onClick={() => setCurrentTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome, Mentor!</h2>
                  <p className="text-gray-600">Review startup progress and provide valuable feedback</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                    <p className="text-2xl font-bold text-yellow-600">12</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Eye className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Reviews</p>
                    <p className="text-2xl font-bold text-green-600">45</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-blue-600">85%</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Assigned Startups Section */}
            {assignedStartups.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-xl border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-brand-dark flex items-center">
                    <Building2 size={28} className="mr-3 text-blue-600" />
                    My Assigned Startups
                  </h3>
                  <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    {assignedStartups.length} Startup{assignedStartups.length > 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignedStartups.map((assignment, index) => (
                    <div key={assignment.id || index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 text-white font-bold flex items-center justify-center text-xl mr-4 shadow-lg">
                          {assignment.startup?.fullName ? assignment.startup.fullName.substring(0, 2).toUpperCase() : 
                           (assignment.startup?.email ? assignment.startup.email.substring(0, 2).toUpperCase() : 'ST')}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {assignment.startup?.fullName || assignment.startup?.email || 'Unknown Startup'}
                          </h4>
                          <p className="text-sm text-gray-600">{assignment.startup?.email || 'No Email'}</p>
                          <p className="text-xs text-blue-600 font-medium mt-1">Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {/* Startup Bio/Description */}
                      {assignment.startup?.bio && (
                        <p className="text-sm text-gray-700 mb-4 italic">"{assignment.startup.bio}"</p>
                      )}
                      
                      {/* Contact & Social Links */}
                      <div className="space-y-3">
                        {assignment.startup?.email && (
                          <a 
                            href={`mailto:${assignment.startup.email}`} 
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md"
                          >
                            <Mail size={16} className="mr-2" /> Contact Startup
                          </a>
                        )}
                        
                        <div className="flex gap-2">
                          {assignment.startup?.linkedin && (
                            <a 
                              href={assignment.startup.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
                            >
                              <Linkedin size={14} className="mr-1" /> LinkedIn
                            </a>
                          )}
                          
                          {assignment.startup?.twitter && (
                            <a 
                              href={assignment.startup.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-blue-400 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-blue-500 transition-colors"
                            >
                              <Twitter size={14} className="mr-1" /> Twitter
                            </a>
                          )}
                          
                          {assignment.startup?.website && (
                            <a 
                              href={assignment.startup.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-gray-700 transition-colors"
                            >
                              <Globe size={14} className="mr-1" /> Website
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* Startup Progress */}
                      {assignment.startup?.progress && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <p className="text-xs text-blue-800 font-medium mb-1">Current Progress</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-400 to-indigo-600 h-2 rounded-full"
                                style={{ width: `${assignment.startup.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-blue-600">{assignment.startup.progress}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {startupsLoading && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <p className="text-gray-600 font-medium">Loading your startups...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Startups Assigned Section */}
            {!startupsLoading && assignedStartups.length === 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-brand-dark mb-5 flex items-center">
                  <GraduationCap size={24} className="mr-3 text-gray-600" />
                  Startup Assignments
                </h3>
                <div className="text-center py-8">
                  <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No Startups Assigned Yet</h4>
                  <p className="text-gray-600 mb-4">
                    You haven't been assigned any startups yet. Startups will be assigned by your tenant administrator.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>What to expect:</strong> Once assigned, you'll be able to review startup progress,
                      provide feedback on submissions, and guide their incubation journey.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Reviewed Business Plan for Startup ABC</p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                  <span className="text-sm font-medium text-green-600">Score: 92%</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Pending review for Financial Model</p>
                    <p className="text-xs text-gray-600">1 day ago</p>
                  </div>
                  <span className="text-sm font-medium text-yellow-600">Pending</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Provided feedback on Pitch Deck</p>
                    <p className="text-xs text-gray-600">3 days ago</p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">Score: 78%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'reviews' && (
          <MentorProgressReview mentorId={id} token={token} />
        )}

        {currentTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Analytics</h3>
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 