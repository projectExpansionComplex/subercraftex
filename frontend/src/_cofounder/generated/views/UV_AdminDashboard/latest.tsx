import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { debounce } from 'lodash';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Users, FileText, Settings, BarChart2, Activity, AlertTriangle, Briefcase, BookOpen } from 'lucide-react';

const UV_AdminDashboard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { auth_token, current_user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.ui);

  const [activeSection, setActiveSection] = useState<string>('overview');
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsersThisWeek: 0,
    usersByRole: { customers: 0, designers: 0, admins: 0 }
  });
  const [contentModeration, setContentModeration] = useState({
    flaggedProducts: 0,
    flaggedComments: 0,
    flaggedProfiles: 0,
    pendingReviews: []
  });
  const [salesMetrics, setSalesMetrics] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    topSellingProducts: [],
    salesByCategory: []
  });
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    defaultCurrency: 'USD',
    allowedCountries: [],
    featuredCategories: [],
    maxUploadSize: 5
  });
  const [userList, setUserList] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!auth_token) return;

    setLoading(true);
    setError(null);

    try {
      const [userStatsRes, contentModRes, salesMetricsRes] = await Promise.all([
        axios.get('http://localhost:1337/api/admin/user-stats', {
          headers: { Authorization: `Bearer ${auth_token}` }
        }),
        axios.get('http://localhost:1337/api/admin/content-moderation', {
          headers: { Authorization: `Bearer ${auth_token}` }
        }),
        axios.get('http://localhost:1337/api/admin/sales-metrics', {
          headers: { Authorization: `Bearer ${auth_token}` }
        })
      ]);

      setUserStats(userStatsRes.data);
      setContentModeration(contentModRes.data);
      setSalesMetrics(salesMetricsRes.data);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to fetch dashboard data.'
      }));
    } finally {
      setLoading(false);
    }
  }, [auth_token, dispatch]);

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  const handleContentModeration = async (contentId: string, action: string) => {
    try {
      await axios.post(`http://localhost:1337/api/admin/moderate-content`, 
        { contentId, action },
        { headers: { Authorization: `Bearer ${auth_token}` } }
      );
      fetchDashboardData(); // Refresh data after moderation
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Content moderated successfully.'
      }));
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to moderate content.'
      }));
    }
  };

  const handleUpdateSystemSettings = async (newSettings: typeof systemSettings) => {
    try {
      const response = await axios.put(
        'http://localhost:1337/api/admin/system-settings',
        newSettings,
        { headers: { Authorization: `Bearer ${auth_token}` } }
      );
      setSystemSettings(response.data);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'System settings updated successfully.'
      }));
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to update system settings.'
      }));
    }
  };

  const handleUserSearch = debounce(async (searchTerm: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/admin/users?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setUserList(response.data);
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to search users.'
      }));
    }
  }, 300);

  const handleGenerateReport = async (reportType: string) => {
    try {
      const response = await axios.post(
        'http://localhost:1337/api/admin/reports',
        { reportType },
        { 
          headers: { Authorization: `Bearer ${auth_token}` },
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to generate report.'
      }));
    }
  };

  if (!auth_token || current_user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 ${theme === 'dark' ? 'dark:bg-gray-900 dark:text-white' : ''}`}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white shadow-md dark:bg-gray-800">
          <div className="p-4">
            <img src="https://picsum.photos/seed/logo/200/80" alt="Logo" className="w-full mb-6" />
            <NavigationMenu>
              <NavigationMenuList className="flex flex-col space-y-2">
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={`flex items-center p-2 rounded-lg ${activeSection === 'overview' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => setActiveSection('overview')}
                  >
                    <Activity className="mr-2" />
                    Overview
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={`flex items-center p-2 rounded-lg ${activeSection === 'users' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => setActiveSection('users')}
                  >
                    <Users className="mr-2" />
                    Users
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={`flex items-center p-2 rounded-lg ${activeSection === 'content' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => setActiveSection('content')}
                  >
                    <FileText className="mr-2" />
                    Content
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={`flex items-center p-2 rounded-lg ${activeSection === 'settings' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => setActiveSection('settings')}
                  >
                    <Settings className="mr-2" />
                    Settings
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={`flex items-center p-2 rounded-lg ${activeSection === 'reports' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => setActiveSection('reports')}
                  >
                    <BarChart2 className="mr-2" />
                    Reports
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <div className="flex items-center">
              <span className="mr-2">{current_user?.first_name} {current_user?.last_name}</span>
              <Avatar>
                <AvatarImage src={current_user?.profile_picture || `https://picsum.photos/seed/${current_user?.uid}/32/32`} />
                <AvatarFallback>{current_user?.first_name?.[0]}{current_user?.last_name?.[0]}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-4 bg-red-100 rounded-lg">
              <p>{error}</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {activeSection === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Users className="mr-2" />
                      User Statistics
                    </h2>
                    <p className="text-3xl font-bold mb-2">{userStats.totalUsers}</p>
                    <p className="text-gray-600 dark:text-gray-400">Total Users</p>
                    <div className="mt-4">
                      <p className="text-sm">New Users Today: <span className="font-semibold">{userStats.newUsersToday}</span></p>
                      <p className="text-sm">Active This Week: <span className="font-semibold">{userStats.activeUsersThisWeek}</span></p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <AlertTriangle className="mr-2" />
                      Content Moderation
                    </h2>
                    <p className="text-3xl font-bold mb-2">{contentModeration.flaggedProducts + contentModeration.flaggedComments + contentModeration.flaggedProfiles}</p>
                    <p className="text-gray-600 dark:text-gray-400">Total Flagged Items</p>
                    <div className="mt-4">
                      <p className="text-sm">Flagged Products: <span className="font-semibold">{contentModeration.flaggedProducts}</span></p>
                      <p className="text-sm">Flagged Comments: <span className="font-semibold">{contentModeration.flaggedComments}</span></p>
                      <p className="text-sm">Flagged Profiles: <span className="font-semibold">{contentModeration.flaggedProfiles}</span></p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Briefcase className="mr-2" />
                      Sales Metrics
                    </h2>
                    <p className="text-3xl font-bold mb-2">${salesMetrics.totalRevenue.toFixed(2)}</p>
                    <p className="text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <div className="mt-4">
                      <p className="text-sm">Avg. Order Value: <span className="font-semibold">${salesMetrics.averageOrderValue.toFixed(2)}</span></p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <BookOpen className="mr-2" />
                      Learning Center
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Access admin resources and guides</p>
                    <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                      View Resources
                    </button>
                  </div>
                  <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesMetrics.salesByCategory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeSection === 'users' && (
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                  <h2 className="text-xl font-semibold mb-4">User Management</h2>
                  <input
                    type="text"
                    placeholder="Search users..."
                    onChange={(e) => handleUserSearch(e.target.value)}
                    className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Role</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userList.map((user: any) => (
                          <tr key={user.uid} className="border-b dark:border-gray-700">
                            <td className="p-2">{user.first_name} {user.last_name}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.user_type}</td>
                            <td className="p-2">
                              <button className="text-blue-500 hover:underline mr-2">Edit</button>
                              <button className="text-red-500 hover:underline">Suspend</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'content' && (
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                  <h2 className="text-xl font-semibold mb-4">Content Moderation</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Reported By</th>
                          <th className="text-left p-2">Reason</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contentModeration.pendingReviews.map((item: any) => (
                          <tr key={item.id} className="border-b dark:border-gray-700">
                            <td className="p-2">{item.type}</td>
                            <td className="p-2">{item.reportedBy}</td>
                            <td className="p-2">{item.reason}</td>
                            <td className="p-2">
                              <button 
                                onClick={() => handleContentModeration(item.id, 'approve')}
                                className="text-green-500 hover:underline mr-2"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleContentModeration(item.id, 'remove')}
                                className="text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'settings' && (
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                  <h2 className="text-xl font-semibold mb-4">System Settings</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateSystemSettings(systemSettings);
                  }}>
                    <div className="mb-4">
                      <label className="block mb-2">
                        <input
                          type="checkbox"
                          checked={systemSettings.maintenanceMode}
                          onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                          className="mr-2"
                        />
                        Maintenance Mode
                      </label>
                    </div>
                    <div className="mb-4">
                      <label className="block mb-2">Default Currency</label>
                      <input
                        type="text"
                        value={systemSettings.defaultCurrency}
                        onChange={(e) => setSystemSettings({...systemSettings, defaultCurrency: e.target.value})}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-2">Max Upload Size (MB)</label>
                      <input
                        type="number"
                        value={systemSettings.maxUploadSize}
                        onChange={(e) => setSystemSettings({...systemSettings, maxUploadSize: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                      Save Settings
                    </button>
                  </form>
                </div>
              )}

              {activeSection === 'reports' && (
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                  <h2 className="text-xl font-semibold mb-4">Generate Reports</h2>
                  <div className="space-y-4">
                    <button 
                      onClick={() => handleGenerateReport('user_activity')}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center justify-center"
                    >
                      <Users className="mr-2" />
                      User Activity Report
                    </button>
                    <button 
                      onClick={() => handleGenerateReport('sales')}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center"
                    >
                      <BarChart2 className="mr-2" />
                      Sales Report
                    </button>
                    <button 
                      onClick={() => handleGenerateReport('content_moderation')}
                      className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition flex items-center justify-center"
                    >
                      <AlertTriangle className="mr-2" />
                      Content Moderation Report
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default UV_AdminDashboard;