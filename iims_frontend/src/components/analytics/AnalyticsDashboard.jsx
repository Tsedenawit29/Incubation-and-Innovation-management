import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, BarChart, Download, ArrowUp, ArrowDown, Target, TrendingUp, Activity, PieChart, User, Briefcase, GraduationCap, Building2, UserCog } from 'lucide-react';
import format from 'date-fns/format';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '../ui/date-range-picker';
import { useToast } from '../ui/use-toast';
import * as analyticsService from '../../api/analyticsService';
import { InsightModal } from './InsightModal';

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [insightModal, setInsightModal] = useState({
    isOpen: false,
    type: null,
    title: '',
    data: null,
    details: null,
    loading: false
  });
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    growthRate: 0,
    totalStartups: 0,
    activeStartups: 0,
    startupGrowth: 0,
    usersByRole: {},
    stageDistribution: {},
    engagementRate: 0,
    completionRate: 0,
    monthlyActivity: [],
    achievementMetrics: {},
    growthTrends: {}
  });
  const { toast } = useToast();

  const openInsight = useCallback(async (type, title) => {
    setInsightModal({
      isOpen: true,
      type,
      title,
      data: metrics,
      details: null,
      loading: true
    });

    try {
      let details = null;
      const params = {
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd')
      };

      // Fetch detailed data based on insight type
      switch (type) {
        case 'users':
          details = await analyticsService.getUserAnalytics(params);
          break;
        case 'startups':
          details = await analyticsService.getStartupAnalytics(params);
          break;
        case 'mentors':
          details = await analyticsService.getMentorAnalytics(params);
          break;
        default:
          details = null;
      }

      setInsightModal(prev => ({
        ...prev,
        details,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching insight details:', error);
      setInsightModal(prev => ({
        ...prev,
        loading: false
      }));
      
      toast({
        title: 'Error',
        description: 'Failed to load detailed data',
        variant: 'destructive',
      });
    }
  }, [metrics, dateRange, toast]);

  const closeInsight = useCallback(() => {
    setInsightModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleExport = useCallback(async (type, options = {}) => {
    const { role, format = 'csv' } = options;
    try {
      const params = {
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
        format,
        ...(role && { role }) // Add role to params if provided
      };
      
      let exportData;
      switch (type) {
        case 'users':
          exportData = await analyticsService.exportUserAnalytics(params);
          break;
        case 'startups':
          exportData = await analyticsService.exportStartupAnalytics(params);
          break;
        case 'mentors':
          exportData = await analyticsService.exportMentorUsers(params);
          break;
        case 'alumni':
          exportData = await analyticsService.exportAlumniUsers(params);
          break;
        case 'investors':
          exportData = await analyticsService.exportInvestorUsers(params);
          break;
        case 'admins':
          exportData = await analyticsService.exportAdminUsers(params);
          break;
        case 'engagement':
          exportData = await analyticsService.exportEngagementAnalytics(params);
          break;
        default:
          exportData = await analyticsService.exportDashboardAnalytics(params);
      }
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([exportData]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = role ? `${type}_${role}_analytics` : `${type}_analytics`;
      link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: 'Export successful',
        description: `Your ${role ? role + ' ' : ''}${type} data has been exported as ${format.toUpperCase()}`,
      });
      
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error.message || 'Failed to export data',
        variant: 'destructive',
      });
    }
  }, [dateRange, toast]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
      };

      // Fetch all analytics data in parallel
      const [dashboardData, userData, startupData, engagementData] = await Promise.all([
        analyticsService.getDashboardAnalytics(params),
        analyticsService.getUserAnalytics(params),
        analyticsService.getStartupAnalytics(params),
        analyticsService.getEngagementAnalytics(params).catch(() => ({})) // Graceful fallback
      ]);

      setMetrics(prev => ({
        ...prev,
        ...dashboardData,
        ...userData,
        ...startupData,
        ...engagementData,
        // Ensure arrays and objects are properly initialized
        usersByRole: userData?.usersByRole || {},
        stageDistribution: startupData?.stageDistribution || {},
        monthlyActivity: engagementData?.monthlyActivity || [],
        achievementMetrics: engagementData?.achievementMetrics || {},
        growthTrends: engagementData?.growthTrends || {}
      }));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMetricCard = (title, value, icon, change = 0, isCurrency = false) => {
    const isPositive = change >= 0;
    const formattedValue = isCurrency 
      ? `$${value.toLocaleString()}` 
      : value.toLocaleString();

    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedValue}</div>
          {change !== 0 && (
            <p className={`text-xs mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />}
              {` ${Math.abs(change)}% ${isPositive ? 'increase' : 'decrease'} from last period`}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InsightModal 
        isOpen={insightModal.isOpen} 
        onClose={closeInsight} 
        title={insightModal.title}
        type={insightModal.type}
        data={insightModal.data}
        details={insightModal.details}
        loading={insightModal.loading}
        dateRange={dateRange}
        onExport={handleExport}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0A2D5C]">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DatePickerWithRange
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            className="h-10 border-[#0A2D5C]/20 hover:border-[#0A2D5C]/40"
          />
          <div className="relative group">
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={() => handleExport('users', { role: 'all' })}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  role="menuitem"
                >
                  <Users className="h-4 w-4 mr-2" />
                  All Users
                </button>
                <button
                  onClick={() => handleExport('users', { role: 'startup' })}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  role="menuitem"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Startups
                </button>
                <button
                  onClick={() => handleExport('users', { role: 'mentor' })}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  role="menuitem"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Mentors
                </button>
                <button
                  onClick={() => handleExport('users', { role: 'alumni' })}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  role="menuitem"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Alumni
                </button>
                <button
                  onClick={() => handleExport('users', { role: 'investor' })}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  role="menuitem"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Investors
                </button>
                <button
                  onClick={() => handleExport('users', { role: 'admin' })}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  role="menuitem"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Admins
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#0A2D5C]/5">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:text-[#0A2D5C] data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="users"
            className="data-[state=active]:bg-white data-[state=active]:text-[#0A2D5C] data-[state=active]:shadow-sm"
            onClick={() => openInsight('users', 'User Analytics')}
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="startups"
            className="data-[state=active]:bg-white data-[state=active]:text-[#0A2D5C] data-[state=active]:shadow-sm"
            onClick={() => openInsight('startups', 'Startup Analytics')}
          >
            Startups
          </TabsTrigger>
          <TabsTrigger 
            value="engagement"
            className="data-[state=active]:bg-white data-[state=active]:text-[#0A2D5C] data-[state=active]:shadow-sm"
            onClick={() => openInsight('engagement', 'Engagement Analytics')}
          >
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {renderMetricCard('Total Users', metrics.totalUsers, <Users className="h-4 w-4 text-muted-foreground" />, metrics.growthRate)}
            {renderMetricCard('Active Users', metrics.activeUsers, <Users className="h-4 w-4 text-muted-foreground" />)}
            {renderMetricCard('Total Startups', metrics.totalStartups, <BarChart className="h-4 w-4 text-muted-foreground" />, metrics.startupGrowth)}
            {renderMetricCard('Active Startups', metrics.activeStartups, <BarChart className="h-4 w-4 text-muted-foreground" />)}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">User growth chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.usersByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{role}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">User analytics will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="startups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Startup Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Startup analytics will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AnalyticsDashboard;
