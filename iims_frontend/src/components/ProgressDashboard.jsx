import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

export default function ProgressDashboard() {
  // Mock data for demonstration
  const progressData = [
    { name: 'Completed', value: 15, color: '#00C49F' },
    { name: 'In Progress', value: 8, color: '#FFBB28' },
    { name: 'Pending', value: 12, color: '#FF8042' }
  ];

  const phaseData = [
    { name: 'Ideation', completed: 5, total: 8 },
    { name: 'Validation', completed: 3, total: 6 },
    { name: 'Development', completed: 7, total: 10 },
    { name: 'Launch', completed: 0, total: 4 }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Progress Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={progressData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {progressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Phase Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={phaseData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#00C49F" name="Completed" />
              <Bar dataKey="total" fill="#8884d8" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-600">Total Tasks</h4>
          <p className="text-2xl font-bold text-blue-900">35</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-600">Completed</h4>
          <p className="text-2xl font-bold text-green-900">15</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-600">In Progress</h4>
          <p className="text-2xl font-bold text-yellow-900">8</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-red-600">Pending</h4>
          <p className="text-2xl font-bold text-red-900">12</p>
        </div>
      </div>
    </div>
  );
} 