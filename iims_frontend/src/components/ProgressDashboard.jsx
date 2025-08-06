import React from 'react';
import { FaUsers, FaTasks, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

export default function ProgressDashboard({ trackings, submissions }) {
  console.log('ProgressDashboard received trackings:', trackings);
  console.log('ProgressDashboard received submissions:', submissions);
  
  const totalUsers = trackings?.length || 0;
  const totalTasks = submissions?.length || 0;
  const completedTasks = submissions?.filter(s => s.status === 'COMPLETED').length || 0;
  const pendingTasks = submissions?.filter(s => s.status === 'PENDING').length || 0;
  const overdueTasks = submissions?.filter(s => s.status === 'OVERDUE').length || 0;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaTasks className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingTasks}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Completion Rate</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
        <div className="space-y-4">
          {submissions?.slice(0, 5).map((submission, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  submission.status === 'COMPLETED' ? 'bg-green-500' :
                  submission.status === 'PENDING' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">{submission.taskName || 'Task'}</p>
                  <p className="text-sm text-gray-600">{submission.userName || 'User'}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  submission.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  submission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {submission.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          ))}
          {(!submissions || submissions.length === 0) && (
            <div className="text-center text-gray-500 py-8">
              No submissions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 