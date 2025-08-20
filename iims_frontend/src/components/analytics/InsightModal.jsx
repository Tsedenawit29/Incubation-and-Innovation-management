import React, { useState } from 'react';
import { X, Download, BarChart2, Users, Target, TrendingUp, Loader2, FileText } from 'lucide-react';
import { Button } from '../ui/button';

export function InsightModal({ isOpen, onClose, title, data, details, loading, dateRange, onExport, type = 'default' }) {
  const [exporting, setExporting] = useState(false);


  const renderContent = () => {
    switch (type) {
      case 'users':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Users className="h-5 w-5" />
                  <h4 className="font-medium">Total Users</h4>
                </div>
                <p className="text-2xl font-bold mt-2">{data.totalUsers}</p>
                <p className="text-sm text-gray-500">Across all roles</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                  <h4 className="font-medium">Growth Rate</h4>
                </div>
                <p className="text-2xl font-bold mt-2">{data.growthRate}%</p>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">Users by Role</h4>
              <div className="space-y-2">
                {Object.entries(data.usersByRole || {}).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{role}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'startups':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-purple-700">
                  <Target className="h-5 w-5" />
                  <h4 className="font-medium">Total Startups</h4>
                </div>
                <p className="text-2xl font-bold mt-2">{data.totalStartups}</p>
                <p className="text-sm text-gray-500">Active: {data.activeStartups}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-amber-700">
                  <TrendingUp className="h-5 w-5" />
                  <h4 className="font-medium">Growth Rate</h4>
                </div>
                <p className="text-2xl font-bold mt-2">{data.startupGrowth}%</p>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </div>
            </div>
            
            {data.stageDistribution && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Startups by Stage</h4>
                <div className="space-y-2">
                  {Object.entries(data.stageDistribution).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{stage}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Detailed View</h4>
            {details ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs overflow-auto max-h-96">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-500">No detailed data available.</p>
            )}
          </div>
        );
    }
  };

  const handleExport = async (format) => {
    if (!onExport) return;
    
    setExporting(true);
    try {
      await onExport(type, { format });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };
  
  if (!isOpen) return null;
  
  // Show loading state if data is being fetched
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p>Loading detailed data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b p-4 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-xl font-semibold">{title} Insights</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {renderContent()}
        </div>
        
        <div className="border-t p-4 flex justify-end space-x-3 sticky bottom-0 bg-white">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport('csv')}
              className="flex items-center"
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport('pdf')}
              className="flex items-center"
              disabled={exporting}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightModal;
