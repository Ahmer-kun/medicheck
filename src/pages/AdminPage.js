import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import ProtectedRoute from "../components/ProtectedRoute";
import Card from "../components/Card";
import { api } from "../utils/api";

function AdminPage({ metamask, user, theme }) {
  const [users, setUsers] = useState([]);
  const [recallList, setRecallList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "viewer", password: "" });
  const [pendingBatches, setPendingBatches] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch system data
  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Use Promise.allSettled to handle failed requests gracefully
      const [statsResponse, batchesResponse, allBatchesResponse, usersResponse, recallResponse, logsResponse] = await Promise.allSettled([
        api.get("/admin/stats"),
        api.get("/admin/pending-batches"), // For pending approvals
        api.get("/admin/batches"),         // For ALL batches display
        api.get("/admin/users"),
        api.get("/admin/recalls"),
        api.get("/admin/logs")
      ]);

      // Handle each response
      if (statsResponse.status === 'fulfilled' && statsResponse.value?.success) {
        setSystemStats(statsResponse.value.data);
      }

      // Use ALL batches for display in batches tab
      if (allBatchesResponse.status === 'fulfilled' && allBatchesResponse.value?.success) {
        setPendingBatches(allBatchesResponse.value.data);
        console.log("📦 All batches loaded:", allBatchesResponse.value.data.length);
      } else if (batchesResponse.status === 'fulfilled' && batchesResponse.value?.success) {
        // Fallback to pending batches if all batches fails
        setPendingBatches(batchesResponse.value.data);
      }

      if (usersResponse.status === 'fulfilled' && usersResponse.value?.success) {
        setUsers(usersResponse.value.data);
      }

      if (recallResponse.status === 'fulfilled' && recallResponse.value?.success) {
        setRecallList(recallResponse.value.data);
      }

      if (logsResponse.status === 'fulfilled' && logsResponse.value?.success) {
        setLogs(logsResponse.value.data);
      }

      // Log any failed requests
      const failedRequests = [statsResponse, batchesResponse, allBatchesResponse, usersResponse, recallResponse, logsResponse]
        .filter(r => r.status === 'rejected')
        .map(r => r.reason?.message || 'Unknown error');
      
      if (failedRequests.length > 0) {
        console.warn("Some requests failed:", failedRequests);
      }

    } catch (error) {
      console.error("Error in fetchSystemData:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecallRemove = async (id) => {
    try {
      const response = await api.delete(`/admin/recalls/${id}`);
      if (response.success) {
        setRecallList(recallList.filter((r) => r.id !== id));
        addLog(`Batch ${id} recall entry removed${metamask.isConnected ? ' on blockchain' : ''}`, "recall");
      }
    } catch (error) {
      console.error("Error removing recall:", error);
      alert(`Failed to remove recall: ${error.message}`);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const response = await api.put(`/admin/users/${id}`, { role: newRole });
      if (response.success) {
        const updated = users.map((u) =>
          u.id === id ? { ...u, role: newRole } : u
        );
        setUsers(updated);
        addLog(`User ${id} role updated to ${newRole}${metamask.isConnected ? ' on blockchain' : ''}`, "user");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert(`Failed to update user role: ${error.message}`);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/admin/users", {
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
        name: newUser.username, // Use username as name
        email: newUser.email
      });
      
      if (response.success) {
        // Refresh users list from server to get the complete user object
        const usersResponse = await api.get("/admin/users");
        if (usersResponse.success) {
          setUsers(usersResponse.data);
        }
        setNewUser({ username: "", email: "", role: "viewer", password: "" });
        addLog(`New user ${newUser.username} added with role ${newUser.role}`, "user");
        alert("User created successfully!");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert(`Failed to add user: ${error.message}`);
    }
  };

  const handleBatchAction = async (batchId, action) => {
    try {
      const response = await api.put(`/admin/batches/${batchId}`, { action });
      if (response.success) {
        setPendingBatches(pendingBatches.filter(b => b.id !== batchId));
        addLog(`Batch ${batchId} ${action}ed by admin`, "batch");
      }
    } catch (error) {
      console.error("Error processing batch:", error);
      alert(`Failed to process batch: ${error.message}`);
    }
  };

  const addLog = (message, type) => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      time: new Date().toLocaleTimeString(),
      type
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const handleUserStatusToggle = async (id) => {
    try {
      const user = users.find(u => u.id === id);
      const response = await api.put(`/admin/users/${id}`, { isActive: !user.isActive });
      if (response.success) {
        const updated = users.map((u) =>
          u.id === id ? { ...u, isActive: !u.isActive } : u
        );
        setUsers(updated);
        addLog(`User ${user.username} ${user.isActive ? 'deactivated' : 'activated'}`, "user");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert(`Failed to toggle user status: ${error.message}`);
    }
  };

  // Calculate statistics with fallbacks
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalRecalls: recallList.length,
    highPriorityRecalls: recallList.filter(r => r.severity === "High").length,
    pendingApprovals: pendingBatches.filter(b => !b.blockchainVerified).length,
    todayLogs: logs.filter(log => {
      const today = new Date().toLocaleDateString();
      return log.time.includes('AM') || log.time.includes('PM');
    }).length,
    blockchainTransactions: logs.filter(log => log.message.includes('blockchain')).length,
    ...systemStats.overview,
    systemHealth: systemStats.systemHealth || {
      database: 'Unknown',
      uptime: 0,
      memoryUsage: '0MB',
      nodeVersion: 'Unknown'
    },
    recentActivity: systemStats.recentActivity || []
  };

  // Generate unique keys for all list items
  const generateKey = (prefix, item) => {
    return `${prefix}-${item.id || item._id || item.batchNo || item.username || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  return (
    <ProtectedRoute user={user} requiredRole="admin">
      <BackgroundFix theme={theme}>
        <div className="p-6 min-h-screen">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">
              Manage system users, batches, and blockchain network
            </p>
            {loading && (
              <div className="flex items-center gap-2 mt-2 text-blue-600">
                <div className="loading-spinner-small"></div>
                <span className="text-sm">Loading system data...</span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {["overview", "users", "batches", "recalls", "logs"].map(tab => (
              <button
                key={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize rounded-t-lg transition-colors ${
                  activeTab === tab 
                    ? "bg-white border-t border-l border-r border-gray-200 text-blue-600" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card 
                  title="Total Users" 
                  value={stats.totalUsers} 
                  gradient="bg-gradient-to-br from-blue-50 to-blue-100"
                  icon="👥"
                  compact={true}
                />
                <Card 
                  title="Active Recalls" 
                  value={stats.totalRecalls} 
                  gradient="bg-gradient-to-br from-red-50 to-red-100"
                  icon="⚠️"
                  compact={true}
                />
                <Card 
                  title="Pending Approvals" 
                  value={stats.pendingApprovals} 
                  gradient="bg-gradient-to-br from-yellow-50 to-yellow-100"
                  icon="⏳"
                  compact={true}
                />
                <Card 
                  title="Today's Logs" 
                  value={stats.todayLogs} 
                  gradient="bg-gradient-to-br from-green-50 to-green-100"
                  icon="📊"
                  compact={true}
                />
              </div>

              {/* Blockchain Network Visualization */}
              <div className="mb-6">
                <BlockchainVisualization />
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Database</span>
                      <span className={`font-semibold ${
                        stats.systemHealth.database === 'Connected' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stats.systemHealth.database}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-semibold text-blue-600">
                        {Math.floor(stats.systemHealth.uptime / 60)}m {stats.systemHealth.uptime % 60}s
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Memory Usage</span>
                      <span className="font-semibold text-purple-600">{stats.systemHealth.memoryUsage}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Users</span>
                      <span className="font-semibold text-green-600">{stats.activeUsers}/{stats.totalUsers}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(stats.recentActivity.length > 0 ? stats.recentActivity.slice(0, 3) : logs.slice(0, 3)).map((log, index) => (
                      <div 
                        key={generateKey('recent-activity', log)}
                        className="flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded"
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          log.type === 'user' ? 'bg-blue-500' : 
                          log.type === 'batch' ? 'bg-green-500' : 
                          log.type === 'recall' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></span>
                        <span className="flex-1 text-gray-700">{log.message || log.action}</span>
                        <span className="text-gray-500 text-xs">{log.time}</span>
                      </div>
                    ))}
                    {stats.recentActivity.length === 0 && logs.length === 0 && (
                      <div className="text-center text-gray-500 text-sm py-4">
                        No recent activity
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Add User Form */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New User</h3>
                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength="6"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="analytics">Analytics</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Add User
                  </button>
                </form>
              </section>

              {/* User Management Table */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200 text-gray-700">
                        <th className="py-4 font-semibold text-left">User</th>
                        <th className="py-4 font-semibold text-left">Email</th>
                        <th className="py-4 font-semibold text-left">Current Role</th>
                        <th className="py-4 font-semibold text-left">Status</th>
                        <th className="py-4 font-semibold text-left">Change Role</th>
                        <th className="py-4 font-semibold text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr 
                          key={generateKey('user', u)}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 font-medium text-gray-800">{u.username}</td>
                          <td className="py-4 text-gray-600">{u.email}</td>
                          <td className="py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              u.role === 'pharmacy' ? 'bg-blue-100 text-blue-800' :
                              u.role === 'manufacturer' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
                            >
                              <option value="admin">Administrator</option>
                              <option value="pharmacy">Pharmacy</option>
                              <option value="manufacturer">Manufacturer</option>
                              <option value="analytics">Analytics</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => handleUserStatusToggle(u.id)}
                              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                                u.isActive 
                                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* Batches Tab */}
          {activeTab === "batches" && (
            <div className="space-y-6">
              {/* Batch Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card 
                  title="Total Batches" 
                  value={systemStats.overview?.totalBatches || 0} 
                  gradient="bg-gradient-to-br from-blue-50 to-blue-100"
                  icon="📦"
                  compact={true}
                />
                <Card 
                  title="Active Batches" 
                  value={systemStats.overview?.activeBatches || 0} 
                  gradient="bg-gradient-to-br from-green-50 to-green-100"
                  icon="✅"
                  compact={true}
                />
                <Card 
                  title="Expired Batches" 
                  value={systemStats.overview?.expiredBatches || 0} 
                  gradient="bg-gradient-to-br from-red-50 to-red-100"
                  icon="❌"
                  compact={true}
                />
                <Card 
                  title="Verified Batches" 
                  value={systemStats.overview?.verifiedBatches || 0} 
                  gradient="bg-gradient-to-br from-purple-50 to-purple-100"
                  icon="🔒"
                  compact={true}
                />
              </div>

              {/* All Batches Table */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">All Batches & Medicines</h3>
                  <button
                    onClick={fetchSystemData}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    🔄 Refresh
                  </button>
                </div>

                {pendingBatches.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📦</div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No Batches Found</h4>
                    <p className="text-gray-500">There are no batches in the system yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Manufacturers and pharmacies can add batches which will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-200 text-gray-700">
                          <th className="py-4 font-semibold text-left">Batch No</th>
                          <th className="py-4 font-semibold text-left">Name</th>
                          <th className="py-4 font-semibold text-left">Type</th>
                          <th className="py-4 font-semibold text-left">Manufacturer</th>
                          <th className="py-4 font-semibold text-left">Pharmacy</th>
                          <th className="py-4 font-semibold text-left">Expiry</th>
                          <th className="py-4 font-semibold text-left">Status</th>
                          <th className="py-4 font-semibold text-left">Blockchain</th>
                          <th className="py-4 font-semibold text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingBatches.map((batch) => {
                          const isExpired = new Date(batch.expiry || batch.expiryDate) < new Date();
                          const statusColor = isExpired ? 'bg-red-100 text-red-800' :
                            batch.status === 'Active' || batch.status === 'active' ? 'bg-green-100 text-green-800' :
                            batch.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800';
                          
                          const blockchainColor = batch.blockchainVerified ? 
                            'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

                          return (
                            <tr key={generateKey('batch', batch)} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 font-medium text-gray-800 font-mono text-xs">
                                {batch.batchNo}
                              </td>
                              <td className="py-4">
                                <div className="font-medium text-gray-800">{batch.name}</div>
                                <div className="text-gray-500 text-xs">{batch.medicineName || batch.formulation}</div>
                              </td>
                              <td className="py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  batch.type === 'pharmacy_medicine' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {batch.type === 'pharmacy_medicine' ? 'Pharmacy' : 'Manufacturer'}
                                </span>
                              </td>
                              <td className="py-4 text-gray-600 text-sm">{batch.manufacturer}</td>
                              <td className="py-4 text-gray-600 text-sm">
                                {batch.pharmacy || batch.pharmacyCompany?.name || 'N/A'}
                              </td>
                              <td className="py-4">
                                <div className={`font-medium text-sm ${
                                  isExpired ? 'text-red-600' : 'text-gray-900'
                                }`}>
                                  {new Date(batch.expiry || batch.expiryDate).toLocaleDateString()}
                                  {isExpired && <div className="text-red-500 text-xs">Expired</div>}
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                                  {batch.status}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${blockchainColor}`}>
                                  {batch.blockchainVerified ? 'Verified' : 'Not Verified'}
                                </span>
                              </td>
                              <td className="py-4">
                                <div className="flex gap-2">
                                  {!batch.blockchainVerified && (
                                    <button
                                      onClick={() => handleBatchAction(batch.id || batch._id, 'approve')}
                                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleBatchAction(batch.id || batch._id, 'reject')}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Pending Approvals Section */}
              {pendingBatches.filter(b => !b.blockchainVerified).length > 0 && (
                <section className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-800">Pending Approvals</h3>
                      <p className="text-yellow-700">Batches waiting for blockchain verification</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingBatches.filter(b => !b.blockchainVerified).slice(0, 6).map((batch) => (
                      <div key={generateKey('pending-batch', batch)} className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800">{batch.name}</h4>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            {batch.type === 'pharmacy_medicine' ? 'Pharmacy' : 'Manufacturer'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-mono mb-2">{batch.batchNo}</p>
                        <p className="text-sm text-gray-600 mb-3">{batch.manufacturer}</p>
                        <button
                          onClick={() => handleBatchAction(batch.id || batch._id, 'approve')}
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded text-sm font-semibold transition-colors"
                        >
                          Approve on Blockchain
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Recalls Tab */}
          {activeTab === "recalls" && (
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Recall Management</h3>
                <button 
                  onClick={() => fetchSystemData()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Refresh Recalls
                </button>
              </div>
              
              {recallList.length === 0 ? (
                <p className="text-gray-500 italic py-8 text-center">No recalls pending.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200 text-gray-700">
                        <th className="py-4 font-semibold text-left">Batch No</th>
                        <th className="py-4 font-semibold text-left">Medicine</th>
                        <th className="py-4 font-semibold text-left">Reason</th>
                        <th className="py-4 font-semibold text-left">Severity</th>
                        <th className="py-4 font-semibold text-left">Date</th>
                        <th className="py-4 font-semibold text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recallList.map((r) => (
                        <tr 
                          key={generateKey('recall', r)}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 font-medium text-gray-800">{r.batchNo}</td>
                          <td className="py-4 text-gray-600">{r.name || 'Unknown Medicine'}</td>
                          <td className="py-4 text-gray-600">{r.reason}</td>
                          <td className="py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              r.severity === 'High' ? 'bg-red-100 text-red-800' :
                              r.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {r.severity}
                            </span>
                          </td>
                          <td className="py-4 text-gray-600">{r.date}</td>
                          <td className="py-4">
                            <button
                              onClick={() => handleRecallRemove(r.id)}
                              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all transform hover:scale-105 shadow border border-red-500"
                            >
                              Remove{metamask.isConnected ? ' from Chain' : ''}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">System Activity Logs</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fetchSystemData()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                  >
                    Refresh Logs
                  </button>
                  <button 
                    onClick={() => setLogs([])}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                  >
                    Clear Local Logs
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {logs.map((log) => (
                  <div
                    key={generateKey('log', log)}
                    className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        log.type === 'user' ? 'bg-blue-500' : 
                        log.type === 'batch' ? 'bg-green-500' : 
                        log.type === 'recall' ? 'bg-red-500' : 
                        log.type === 'verification' ? 'bg-purple-500' : 'bg-gray-500'
                      }`}></span>
                      <span className="text-gray-700 font-medium">{log.message}</span>
                    </div>
                    <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full border border-gray-200">
                      {log.time}
                    </span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No logs available
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </BackgroundFix>
    </ProtectedRoute>
  );
}

export default AdminPage;


//      This is back *frontend


// import React, { useState, useEffect } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import BlockchainVisualization from "../components/BlockchainVisualization";
// import ProtectedRoute from "../components/ProtectedRoute";
// import Card from "../components/Card";
// import { api } from "../utils/api";

// function AdminPage({ metamask, user, theme }) {
//   const [users, setUsers] = useState([]);
//   const [recallList, setRecallList] = useState([]);
//   const [logs, setLogs] = useState([]);
//   const [newUser, setNewUser] = useState({ username: "", email: "", role: "viewer", password: "" });
//   const [pendingBatches, setPendingBatches] = useState([]);
//   const [systemStats, setSystemStats] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("overview");

//   // Fetch system data
//   useEffect(() => {
//     fetchSystemData();
//   }, []);

//   const fetchSystemData = async () => {
//     try {
//       setLoading(true);
      
//       // Use Promise.allSettled to handle failed requests gracefully
//       const [statsResponse, batchesResponse, allBatchesResponse, usersResponse, recallResponse, logsResponse] = await Promise.allSettled([
//         api.get("/admin/stats"),
//         api.get("/admin/pending-batches"), // For pending approvals
//         api.get("/admin/batches"),         // For ALL batches display
//         api.get("/admin/users"),
//         api.get("/admin/recalls"),
//         api.get("/admin/logs")
//       ]);

//       // Handle each response
//       if (statsResponse.status === 'fulfilled' && statsResponse.value?.success) {
//         setSystemStats(statsResponse.value.data);
//       }

//       // Use ALL batches for display in batches tab
//       if (allBatchesResponse.status === 'fulfilled' && allBatchesResponse.value?.success) {
//         setPendingBatches(allBatchesResponse.value.data);
//         console.log("📦 All batches loaded:", allBatchesResponse.value.data.length);
//       } else if (batchesResponse.status === 'fulfilled' && batchesResponse.value?.success) {
//         // Fallback to pending batches if all batches fails
//         setPendingBatches(batchesResponse.value.data);
//       }

//       if (usersResponse.status === 'fulfilled' && usersResponse.value?.success) {
//         setUsers(usersResponse.value.data);
//       }

//       if (recallResponse.status === 'fulfilled' && recallResponse.value?.success) {
//         setRecallList(recallResponse.value.data);
//       }

//       if (logsResponse.status === 'fulfilled' && logsResponse.value?.success) {
//         setLogs(logsResponse.value.data);
//       }

//       // Log any failed requests
//       const failedRequests = [statsResponse, batchesResponse, allBatchesResponse, usersResponse, recallResponse, logsResponse]
//         .filter(r => r.status === 'rejected')
//         .map(r => r.reason?.message || 'Unknown error');
      
//       if (failedRequests.length > 0) {
//         console.warn("Some requests failed:", failedRequests);
//       }

//     } catch (error) {
//       console.error("Error in fetchSystemData:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRecallRemove = async (id) => {
//     try {
//       const response = await api.delete(`/admin/recalls/${id}`);
//       if (response.success) {
//         setRecallList(recallList.filter((r) => r.id !== id));
//         addLog(`Batch ${id} recall entry removed${metamask.isConnected ? ' on blockchain' : ''}`, "recall");
//       }
//     } catch (error) {
//       console.error("Error removing recall:", error);
//       alert(`Failed to remove recall: ${error.message}`);
//     }
//   };

//   const handleRoleChange = async (id, newRole) => {
//     try {
//       const response = await api.put(`/admin/users/${id}`, { role: newRole });
//       if (response.success) {
//         const updated = users.map((u) =>
//           u.id === id ? { ...u, role: newRole } : u
//         );
//         setUsers(updated);
//         addLog(`User ${id} role updated to ${newRole}${metamask.isConnected ? ' on blockchain' : ''}`, "user");
//       }
//     } catch (error) {
//       console.error("Error updating user role:", error);
//       alert(`Failed to update user role: ${error.message}`);
//     }
//   };

//   const handleAddUser = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.post("/admin/users", {
//         username: newUser.username,
//         password: newUser.password,
//         role: newUser.role,
//         name: newUser.username, // Use username as name
//         email: newUser.email
//       });
      
//       if (response.success) {
//         // Refresh users list from server to get the complete user object
//         const usersResponse = await api.get("/admin/users");
//         if (usersResponse.success) {
//           setUsers(usersResponse.data);
//         }
//         setNewUser({ username: "", email: "", role: "viewer", password: "" });
//         addLog(`New user ${newUser.username} added with role ${newUser.role}`, "user");
//         alert("User created successfully!");
//       }
//     } catch (error) {
//       console.error("Error adding user:", error);
//       alert(`Failed to add user: ${error.message}`);
//     }
//   };

//   const handleBatchAction = async (batchId, action) => {
//     try {
//       const response = await api.put(`/admin/batches/${batchId}`, { action });
//       if (response.success) {
//         setPendingBatches(pendingBatches.filter(b => b.id !== batchId));
//         addLog(`Batch ${batchId} ${action}ed by admin`, "batch");
//       }
//     } catch (error) {
//       console.error("Error processing batch:", error);
//       alert(`Failed to process batch: ${error.message}`);
//     }
//   };

//   const addLog = (message, type) => {
//     const newLog = {
//       id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//       message,
//       time: new Date().toLocaleTimeString(),
//       type
//     };
//     setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
//   };

//   const handleUserStatusToggle = async (id) => {
//     try {
//       const user = users.find(u => u.id === id);
//       const response = await api.put(`/admin/users/${id}`, { isActive: !user.isActive });
//       if (response.success) {
//         const updated = users.map((u) =>
//           u.id === id ? { ...u, isActive: !u.isActive } : u
//         );
//         setUsers(updated);
//         addLog(`User ${user.username} ${user.isActive ? 'deactivated' : 'activated'}`, "user");
//       }
//     } catch (error) {
//       console.error("Error toggling user status:", error);
//       alert(`Failed to toggle user status: ${error.message}`);
//     }
//   };

//   // Calculate statistics with fallbacks
//   const stats = {
//     totalUsers: users.length,
//     activeUsers: users.filter(u => u.isActive).length,
//     totalRecalls: recallList.length,
//     highPriorityRecalls: recallList.filter(r => r.severity === "High").length,
//     pendingApprovals: pendingBatches.filter(b => !b.blockchainVerified).length,
//     todayLogs: logs.filter(log => {
//       const today = new Date().toLocaleDateString();
//       return log.time.includes('AM') || log.time.includes('PM');
//     }).length,
//     blockchainTransactions: logs.filter(log => log.message.includes('blockchain')).length,
//     ...systemStats.overview,
//     systemHealth: systemStats.systemHealth || {
//       database: 'Unknown',
//       uptime: 0,
//       memoryUsage: '0MB',
//       nodeVersion: 'Unknown'
//     },
//     recentActivity: systemStats.recentActivity || []
//   };

//   // Generate unique keys for all list items
//   const generateKey = (prefix, item) => {
//     return `${prefix}-${item.id || item._id || item.batchNo || item.username || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//   };

//   return (
//     <ProtectedRoute user={user} requiredRole="admin">
//       <BackgroundFix theme={theme}>
//         <div className="p-6 min-h-screen">
//           {/* Header */}
//           <div className="mb-6">
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">
//               Admin Panel
//             </h1>
//             <p className="text-gray-600">
//               Manage system users, batches, and blockchain network
//             </p>
//             {loading && (
//               <div className="flex items-center gap-2 mt-2 text-blue-600">
//                 <div className="loading-spinner-small"></div>
//                 <span className="text-sm">Loading system data...</span>
//               </div>
//             )}
//           </div>

//           {/* Tab Navigation */}
//           <div className="flex gap-2 mb-6 border-b border-gray-200">
//             {["overview", "users", "batches", "recalls", "logs"].map(tab => (
//               <button
//                 key={`tab-${tab}`}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 font-medium capitalize rounded-t-lg transition-colors ${
//                   activeTab === tab 
//                     ? "bg-white border-t border-l border-r border-gray-200 text-blue-600" 
//                     : "text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>

//           {/* Overview Tab */}
//           {activeTab === "overview" && (
//             <>
//               {/* Statistics Cards */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                 <Card 
//                   title="Total Users" 
//                   value={stats.totalUsers} 
//                   gradient="bg-gradient-to-br from-blue-50 to-blue-100"
//                   icon="👥"
//                   compact={true}
//                 />
//                 <Card 
//                   title="Active Recalls" 
//                   value={stats.totalRecalls} 
//                   gradient="bg-gradient-to-br from-red-50 to-red-100"
//                   icon="⚠️"
//                   compact={true}
//                 />
//                 <Card 
//                   title="Pending Approvals" 
//                   value={stats.pendingApprovals} 
//                   gradient="bg-gradient-to-br from-yellow-50 to-yellow-100"
//                   icon="⏳"
//                   compact={true}
//                 />
//                 <Card 
//                   title="Today's Logs" 
//                   value={stats.todayLogs} 
//                   gradient="bg-gradient-to-br from-green-50 to-green-100"
//                   icon="📊"
//                   compact={true}
//                 />
//               </div>

//               {/* Blockchain Network Visualization */}
//               <div className="mb-6">
//                 <BlockchainVisualization />
//               </div>

//               {/* Quick Stats Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//                   <h3 className="text-xl font-bold text-gray-800 mb-4">System Health</h3>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Database</span>
//                       <span className={`font-semibold ${
//                         stats.systemHealth.database === 'Connected' ? 'text-green-600' : 'text-red-600'
//                       }`}>
//                         {stats.systemHealth.database}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Uptime</span>
//                       <span className="font-semibold text-blue-600">
//                         {Math.floor(stats.systemHealth.uptime / 60)}m {stats.systemHealth.uptime % 60}s
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Memory Usage</span>
//                       <span className="font-semibold text-purple-600">{stats.systemHealth.memoryUsage}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Active Users</span>
//                       <span className="font-semibold text-green-600">{stats.activeUsers}/{stats.totalUsers}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//                   <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
//                   <div className="space-y-2 max-h-40 overflow-y-auto">
//                     {(stats.recentActivity.length > 0 ? stats.recentActivity.slice(0, 3) : logs.slice(0, 3)).map((log, index) => (
//                       <div 
//                         key={generateKey('recent-activity', log)}
//                         className="flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded"
//                       >
//                         <span className={`w-2 h-2 rounded-full ${
//                           log.type === 'user' ? 'bg-blue-500' : 
//                           log.type === 'batch' ? 'bg-green-500' : 
//                           log.type === 'recall' ? 'bg-red-500' : 'bg-gray-500'
//                         }`}></span>
//                         <span className="flex-1 text-gray-700">{log.message || log.action}</span>
//                         <span className="text-gray-500 text-xs">{log.time}</span>
//                       </div>
//                     ))}
//                     {stats.recentActivity.length === 0 && logs.length === 0 && (
//                       <div className="text-center text-gray-500 text-sm py-4">
//                         No recent activity
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}

//           {/* Users Tab */}
//           {activeTab === "users" && (
//             <div className="space-y-6">
//               {/* Add User Form */}
//               <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//                 <h3 className="text-xl font-bold text-gray-800 mb-4">Add New User</h3>
//                 <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                   <input
//                     type="text"
//                     placeholder="Username"
//                     value={newUser.username}
//                     onChange={(e) => setNewUser({...newUser, username: e.target.value})}
//                     className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                   <input
//                     type="email"
//                     placeholder="Email"
//                     value={newUser.email}
//                     onChange={(e) => setNewUser({...newUser, email: e.target.value})}
//                     className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                   <input
//                     type="password"
//                     placeholder="Password"
//                     value={newUser.password}
//                     onChange={(e) => setNewUser({...newUser, password: e.target.value})}
//                     className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                     minLength="6"
//                   />
//                   <select
//                     value={newUser.role}
//                     onChange={(e) => setNewUser({...newUser, role: e.target.value})}
//                     className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="viewer">Viewer</option>
//                     <option value="pharmacy">Pharmacy</option>
//                     <option value="manufacturer">Manufacturer</option>
//                     <option value="analytics">Analytics</option>
//                     <option value="admin">Admin</option>
//                   </select>
//                   <button
//                     type="submit"
//                     className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
//                   >
//                     Add User
//                   </button>
//                 </form>
//               </section>

//               {/* User Management Table */}
//               <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//                 <h3 className="text-xl font-bold text-gray-800 mb-4">User Management</h3>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-sm">
//                     <thead>
//                       <tr className="border-b-2 border-gray-200 text-gray-700">
//                         <th className="py-4 font-semibold text-left">User</th>
//                         <th className="py-4 font-semibold text-left">Email</th>
//                         <th className="py-4 font-semibold text-left">Current Role</th>
//                         <th className="py-4 font-semibold text-left">Status</th>
//                         <th className="py-4 font-semibold text-left">Change Role</th>
//                         <th className="py-4 font-semibold text-left">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {users.map((u) => (
//                         <tr 
//                           key={generateKey('user', u)}
//                           className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                         >
//                           <td className="py-4 font-medium text-gray-800">{u.username}</td>
//                           <td className="py-4 text-gray-600">{u.email}</td>
//                           <td className="py-4">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                               u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
//                               u.role === 'pharmacy' ? 'bg-blue-100 text-blue-800' :
//                               u.role === 'manufacturer' ? 'bg-green-100 text-green-800' :
//                               'bg-gray-100 text-gray-800'
//                             }`}>
//                               {u.role}
//                             </span>
//                           </td>
//                           <td className="py-4">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                               u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                             }`}>
//                               {u.isActive ? 'Active' : 'Inactive'}
//                             </span>
//                           </td>
//                           <td className="py-4">
//                             <select
//                               value={u.role}
//                               onChange={(e) => handleRoleChange(u.id, e.target.value)}
//                               className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
//                             >
//                               <option value="admin">Administrator</option>
//                               <option value="pharmacy">Pharmacy</option>
//                               <option value="manufacturer">Manufacturer</option>
//                               <option value="analytics">Analytics</option>
//                               <option value="viewer">Viewer</option>
//                             </select>
//                           </td>
//                           <td className="py-4">
//                             <button
//                               onClick={() => handleUserStatusToggle(u.id)}
//                               className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
//                                 u.isActive 
//                                   ? 'bg-red-500 hover:bg-red-600 text-white' 
//                                   : 'bg-green-500 hover:bg-green-600 text-white'
//                               }`}
//                             >
//                               {u.isActive ? 'Deactivate' : 'Activate'}
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                       {users.length === 0 && (
//                         <tr>
//                           <td colSpan="6" className="py-8 text-center text-gray-500">
//                             No users found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </section>
//             </div>
//           )}

//           {/* Batches Tab */}
//           {activeTab === "batches" && (
//             <div className="space-y-6">
//               {/* Batch Statistics */}
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <Card 
//                   title="Total Batches" 
//                   value={systemStats.overview?.totalBatches || 0} 
//                   gradient="bg-gradient-to-br from-blue-50 to-blue-100"
//                   icon="📦"
//                   compact={true}
//                 />
//                 <Card 
//                   title="Active Batches" 
//                   value={systemStats.overview?.activeBatches || 0} 
//                   gradient="bg-gradient-to-br from-green-50 to-green-100"
//                   icon="✅"
//                   compact={true}
//                 />
//                 <Card 
//                   title="Expired Batches" 
//                   value={systemStats.overview?.expiredBatches || 0} 
//                   gradient="bg-gradient-to-br from-red-50 to-red-100"
//                   icon="❌"
//                   compact={true}
//                 />
//                 <Card 
//                   title="Verified Batches" 
//                   value={systemStats.overview?.verifiedBatches || 0} 
//                   gradient="bg-gradient-to-br from-purple-50 to-purple-100"
//                   icon="🔒"
//                   compact={true}
//                 />
//               </div>

//               {/* All Batches Table */}
//               <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-xl font-bold text-gray-800">All Batches & Medicines</h3>
//                   <button
//                     onClick={fetchSystemData}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
//                   >
//                     🔄 Refresh
//                   </button>
//                 </div>

//                 {pendingBatches.length === 0 ? (
//                   <div className="text-center py-8">
//                     <div className="text-4xl mb-4">📦</div>
//                     <h4 className="text-lg font-semibold text-gray-700 mb-2">No Batches Found</h4>
//                     <p className="text-gray-500">There are no batches in the system yet.</p>
//                     <p className="text-gray-500 text-sm mt-2">Manufacturers and pharmacies can add batches which will appear here.</p>
//                   </div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full text-sm">
//                       <thead>
//                         <tr className="border-b-2 border-gray-200 text-gray-700">
//                           <th className="py-4 font-semibold text-left">Batch No</th>
//                           <th className="py-4 font-semibold text-left">Name</th>
//                           <th className="py-4 font-semibold text-left">Type</th>
//                           <th className="py-4 font-semibold text-left">Manufacturer</th>
//                           <th className="py-4 font-semibold text-left">Pharmacy</th>
//                           <th className="py-4 font-semibold text-left">Expiry</th>
//                           <th className="py-4 font-semibold text-left">Status</th>
//                           <th className="py-4 font-semibold text-left">Blockchain</th>
//                           <th className="py-4 font-semibold text-left">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {pendingBatches.map((batch) => {
//                           const isExpired = new Date(batch.expiry || batch.expiryDate) < new Date();
//                           const statusColor = isExpired ? 'bg-red-100 text-red-800' :
//                             batch.status === 'Active' || batch.status === 'active' ? 'bg-green-100 text-green-800' :
//                             batch.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
//                             'bg-blue-100 text-blue-800';
                          
//                           const blockchainColor = batch.blockchainVerified ? 
//                             'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

//                           return (
//                             <tr key={generateKey('batch', batch)} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                               <td className="py-4 font-medium text-gray-800 font-mono text-xs">
//                                 {batch.batchNo}
//                               </td>
//                               <td className="py-4">
//                                 <div className="font-medium text-gray-800">{batch.name}</div>
//                                 <div className="text-gray-500 text-xs">{batch.medicineName || batch.formulation}</div>
//                               </td>
//                               <td className="py-4">
//                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                                   batch.type === 'pharmacy_medicine' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
//                                 }`}>
//                                   {batch.type === 'pharmacy_medicine' ? 'Pharmacy' : 'Manufacturer'}
//                                 </span>
//                               </td>
//                               <td className="py-4 text-gray-600 text-sm">{batch.manufacturer}</td>
//                               <td className="py-4 text-gray-600 text-sm">
//                                 {batch.pharmacy || batch.pharmacyCompany?.name || 'N/A'}
//                               </td>
//                               <td className="py-4">
//                                 <div className={`font-medium text-sm ${
//                                   isExpired ? 'text-red-600' : 'text-gray-900'
//                                 }`}>
//                                   {new Date(batch.expiry || batch.expiryDate).toLocaleDateString()}
//                                   {isExpired && <div className="text-red-500 text-xs">Expired</div>}
//                                 </div>
//                               </td>
//                               <td className="py-4">
//                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
//                                   {batch.status}
//                                 </span>
//                               </td>
//                               <td className="py-4">
//                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${blockchainColor}`}>
//                                   {batch.blockchainVerified ? 'Verified' : 'Not Verified'}
//                                 </span>
//                               </td>
//                               <td className="py-4">
//                                 <div className="flex gap-2">
//                                   {!batch.blockchainVerified && (
//                                     <button
//                                       onClick={() => handleBatchAction(batch.id || batch._id, 'approve')}
//                                       className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors"
//                                     >
//                                       Approve
//                                     </button>
//                                   )}
//                                   <button
//                                     onClick={() => handleBatchAction(batch.id || batch._id, 'reject')}
//                                     className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors"
//                                   >
//                                     Reject
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </section>

//               {/* Pending Approvals Section */}
//               {pendingBatches.filter(b => !b.blockchainVerified).length > 0 && (
//                 <section className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
//                   <div className="flex items-center gap-3 mb-4">
//                     <span className="text-2xl">⏳</span>
//                     <div>
//                       <h3 className="text-xl font-bold text-yellow-800">Pending Approvals</h3>
//                       <p className="text-yellow-700">Batches waiting for blockchain verification</p>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {pendingBatches.filter(b => !b.blockchainVerified).slice(0, 6).map((batch) => (
//                       <div key={generateKey('pending-batch', batch)} className="bg-white p-4 rounded-lg border border-yellow-200">
//                         <div className="flex justify-between items-start mb-2">
//                           <h4 className="font-semibold text-gray-800">{batch.name}</h4>
//                           <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
//                             {batch.type === 'pharmacy_medicine' ? 'Pharmacy' : 'Manufacturer'}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-600 font-mono mb-2">{batch.batchNo}</p>
//                         <p className="text-sm text-gray-600 mb-3">{batch.manufacturer}</p>
//                         <button
//                           onClick={() => handleBatchAction(batch.id || batch._id, 'approve')}
//                           className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded text-sm font-semibold transition-colors"
//                         >
//                           Approve on Blockchain
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </section>
//               )}
//             </div>
//           )}

//           {/* Recalls Tab */}
//           {activeTab === "recalls" && (
//             <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-bold text-gray-800">Recall Management</h3>
//                 <button 
//                   onClick={() => fetchSystemData()}
//                   className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
//                 >
//                   Refresh Recalls
//                 </button>
//               </div>
              
//               {recallList.length === 0 ? (
//                 <p className="text-gray-500 italic py-8 text-center">No recalls pending.</p>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-sm">
//                     <thead>
//                       <tr className="border-b-2 border-gray-200 text-gray-700">
//                         <th className="py-4 font-semibold text-left">Batch No</th>
//                         <th className="py-4 font-semibold text-left">Medicine</th>
//                         <th className="py-4 font-semibold text-left">Reason</th>
//                         <th className="py-4 font-semibold text-left">Severity</th>
//                         <th className="py-4 font-semibold text-left">Date</th>
//                         <th className="py-4 font-semibold text-left">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {recallList.map((r) => (
//                         <tr 
//                           key={generateKey('recall', r)}
//                           className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                         >
//                           <td className="py-4 font-medium text-gray-800">{r.batchNo}</td>
//                           <td className="py-4 text-gray-600">{r.name || 'Unknown Medicine'}</td>
//                           <td className="py-4 text-gray-600">{r.reason}</td>
//                           <td className="py-4">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                               r.severity === 'High' ? 'bg-red-100 text-red-800' :
//                               r.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
//                               'bg-green-100 text-green-800'
//                             }`}>
//                               {r.severity}
//                             </span>
//                           </td>
//                           <td className="py-4 text-gray-600">{r.date}</td>
//                           <td className="py-4">
//                             <button
//                               onClick={() => handleRecallRemove(r.id)}
//                               className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all transform hover:scale-105 shadow border border-red-500"
//                             >
//                               Remove{metamask.isConnected ? ' from Chain' : ''}
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </section>
//           )}

//           {/* Logs Tab */}
//           {activeTab === "logs" && (
//             <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-bold text-gray-800">System Activity Logs</h3>
//                 <div className="flex gap-2">
//                   <button 
//                     onClick={() => fetchSystemData()}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
//                   >
//                     Refresh Logs
//                   </button>
//                   <button 
//                     onClick={() => setLogs([])}
//                     className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
//                   >
//                     Clear Local Logs
//                   </button>
//                 </div>
//               </div>
//               <div className="max-h-96 overflow-y-auto space-y-3">
//                 {logs.map((log) => (
//                   <div
//                     key={generateKey('log', log)}
//                     className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
//                   >
//                     <div className="flex items-center gap-3">
//                       <span className={`w-2 h-2 rounded-full ${
//                         log.type === 'user' ? 'bg-blue-500' : 
//                         log.type === 'batch' ? 'bg-green-500' : 
//                         log.type === 'recall' ? 'bg-red-500' : 
//                         log.type === 'verification' ? 'bg-purple-500' : 'bg-gray-500'
//                       }`}></span>
//                       <span className="text-gray-700 font-medium">{log.message}</span>
//                     </div>
//                     <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full border border-gray-200">
//                       {log.time}
//                     </span>
//                   </div>
//                 ))}
//                 {logs.length === 0 && (
//                   <div className="text-center text-gray-500 py-8">
//                     No logs available
//                   </div>
//                 )}
//               </div>
//             </section>
//           )}
//         </div>
//       </BackgroundFix>
//     </ProtectedRoute>
//   );
// }

// export default AdminPage;

// //    Admin Page works but Lacks BAtches

// import React, { useState, useEffect } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import BlockchainVisualization from "../components/BlockchainVisualization";
// import ProtectedRoute from "../components/ProtectedRoute";
// import Card from "../components/Card";
// import { api } from "../utils/api";

// function AdminPage({ metamask, user, theme }) {
//   const [users, setUsers] = useState([]);
//   const [recallList, setRecallList] = useState([]);
//   const [logs, setLogs] = useState([]);
//   const [newUser, setNewUser] = useState({ username: "", email: "", role: "viewer", password: "" });
//   const [pendingBatches, setPendingBatches] = useState([]);
//   const [systemStats, setSystemStats] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("overview");

//   // Fetch system data
//   useEffect(() => {
//     fetchSystemData();
//   }, []);

//   const fetchSystemData = async () => {
//     try {
//       setLoading(true);
      
//       // Use Promise.allSettled to handle failed requests gracefully
//       const [statsResponse, batchesResponse, usersResponse, recallResponse, logsResponse] = await Promise.allSettled([
//         api.get("/admin/stats"),
//         api.get("/admin/pending-batches"),
//         api.get("/admin/users"),
//         api.get("/admin/recalls"),
//         api.get("/admin/logs")
//       ]);

//       // Handle each response
//       if (statsResponse.status === 'fulfilled' && statsResponse.value?.success) {
//         setSystemStats(statsResponse.value.data);
//       }

//       if (batchesResponse.status === 'fulfilled' && batchesResponse.value?.success) {
//         setPendingBatches(batchesResponse.value.data);
//       }

//       if (usersResponse.status === 'fulfilled' && usersResponse.value?.success) {
//         setUsers(usersResponse.value.data);
//       }

//       if (recallResponse.status === 'fulfilled' && recallResponse.value?.success) {
//         setRecallList(recallResponse.value.data);
//       }

//       if (logsResponse.status === 'fulfilled' && logsResponse.value?.success) {
//         setLogs(logsResponse.value.data);
//       }

//       // Log any failed requests
//       const failedRequests = [statsResponse, batchesResponse, usersResponse, recallResponse, logsResponse]
//         .filter(r => r.status === 'rejected')
//         .map(r => r.reason?.message || 'Unknown error');
      
//       if (failedRequests.length > 0) {
//         console.warn("Some requests failed:", failedRequests);
//       }

//     } catch (error) {
//       console.error("Error in fetchSystemData:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRecallRemove = async (id) => {
//     try {
//       const response = await api.delete(`/admin/recalls/${id}`);
//       if (response.success) {
//         setRecallList(recallList.filter((r) => r.id !== id));
//         addLog(`Batch ${id} recall entry removed${metamask.isConnected ? ' on blockchain' : ''}`, "recall");
//       }
//     } catch (error) {
//       console.error("Error removing recall:", error);
//       alert(`Failed to remove recall: ${error.message}`);
//     }
//   };

//   const handleRoleChange = async (id, newRole) => {
//     try {
//       const response = await api.put(`/admin/users/${id}`, { role: newRole });
//       if (response.success) {
//         const updated = users.map((u) =>
//           u.id === id ? { ...u, role: newRole } : u
//         );
//         setUsers(updated);
//         addLog(`User ${id} role updated to ${newRole}${metamask.isConnected ? ' on blockchain' : ''}`, "user");
//       }
//     } catch (error) {
//       console.error("Error updating user role:", error);
//       alert(`Failed to update user role: ${error.message}`);
//     }
//   };

//   const handleAddUser = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.post("/admin/users", {
//         username: newUser.username,
//         password: newUser.password,
//         role: newUser.role,
//         name: newUser.username, // Use username as name
//         email: newUser.email
//       });
      
//       if (response.success) {
//         // Refresh users list from server to get the complete user object
//         const usersResponse = await api.get("/admin/users");
//         if (usersResponse.success) {
//           setUsers(usersResponse.data);
//         }
//         setNewUser({ username: "", email: "", role: "viewer", password: "" });
//         addLog(`New user ${newUser.username} added with role ${newUser.role}`, "user");
//         alert("User created successfully!");
//       }
//     } catch (error) {
//       console.error("Error adding user:", error);
//       alert(`Failed to add user: ${error.message}`);
//     }
//   };

//   const handleBatchAction = async (batchId, action) => {
//     try {
//       const response = await api.put(`/admin/batches/${batchId}`, { action });
//       if (response.success) {
//         setPendingBatches(pendingBatches.filter(b => b.id !== batchId));
//         addLog(`Batch ${batchId} ${action}ed by admin`, "batch");
//       }
//     } catch (error) {
//       console.error("Error processing batch:", error);
//       alert(`Failed to process batch: ${error.message}`);
//     }
//   };

//   const addLog = (message, type) => {
//     const newLog = {
//       id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//       message,
//       time: new Date().toLocaleTimeString(),
//       type
//     };
//     setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
//   };

//   const handleUserStatusToggle = async (id) => {
//     try {
//       const user = users.find(u => u.id === id);
//       const response = await api.put(`/admin/users/${id}`, { isActive: !user.isActive });
//       if (response.success) {
//         const updated = users.map((u) =>
//           u.id === id ? { ...u, isActive: !u.isActive } : u
//         );
//         setUsers(updated);
//         addLog(`User ${user.username} ${user.isActive ? 'deactivated' : 'activated'}`, "user");
//       }
//     } catch (error) {
//       console.error("Error toggling user status:", error);
//       alert(`Failed to toggle user status: ${error.message}`);
//     }
//   };

//   // Calculate statistics with fallbacks
//   const stats = {
//     totalUsers: users.length,
//     activeUsers: users.filter(u => u.isActive).length,
//     totalRecalls: recallList.length,
//     highPriorityRecalls: recallList.filter(r => r.severity === "High").length,
//     pendingApprovals: pendingBatches.length,
//     todayLogs: logs.filter(log => {
//       const today = new Date().toLocaleDateString();
//       return log.time.includes('AM') || log.time.includes('PM');
//     }).length,
//     blockchainTransactions: logs.filter(log => log.message.includes('blockchain')).length,
//     ...systemStats.overview,
//     systemHealth: systemStats.systemHealth || {
//       database: 'Unknown',
//       uptime: 0,
//       memoryUsage: '0MB',
//       nodeVersion: 'Unknown'
//     },
//     recentActivity: systemStats.recentActivity || []
//   };

//   // Generate unique keys for all list items
//   const generateKey = (prefix, item) => {
//     return `${prefix}-${item.id || item._id || item.batchNo || item.username || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//   };

//   return (
//     <ProtectedRoute user={user} requiredRole="admin">
//       <BackgroundFix theme={theme}>
//         <div className="p-6 min-h-screen">
//           {/* Header */}
//           <div className="mb-6">
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">
//               Admin Panel
//             </h1>
//             <p className="text-gray-600">
//               Manage system users, batches, and blockchain network
//             </p>
//             {loading && (
//               <div className="flex items-center gap-2 mt-2 text-blue-600">
//                 <div className="loading-spinner-small"></div>
//                 <span className="text-sm">Loading system data...</span>
//               </div>
//             )}
//           </div>

//           {/* Tab Navigation */}
//           <div className="flex gap-2 mb-6 border-b border-gray-200">
//             {["overview", "users", "batches", "recalls", "logs"].map(tab => (
//               <button
//                 key={`tab-${tab}`}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 font-medium capitalize rounded-t-lg transition-colors ${
//                   activeTab === tab 
//                     ? "bg-white border-t border-l border-r border-gray-200 text-blue-600" 
//                     : "text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>

//           {/* Overview Tab */}
//           {activeTab === "overview" && (
//             <>
//               {/* Statistics Cards */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                 <Card 
//                   title="Total Users" 
//                   value={stats.totalUsers} 
//                   gradient="bg-gradient-to-br from-blue-50 to-blue-100"
//                   icon="👥"
//                   compact={true}
//                 />
//                 <Card 
//                   title="Active Recalls" 
//                   value={stats.totalRecalls} 
//                   gradient="bg-gradient-to-br from-red-50 to-red-100"
//                   icon="⚠️"
//                   compact={true}
//                 />
//                 <Card 
//                   title="Pending Approvals" 
//                   value={stats.pendingApprovals} 
//                   gradient="bg-gradient-to-br from-yellow-50 to-yellow-100"
//                   icon="⏳"
//                   compact={true}
//                 />
//                 <Card 
//                   title="Today's Logs" 
//                   value={stats.todayLogs} 
//                   gradient="bg-gradient-to-br from-green-50 to-green-100"
//                   icon="📊"
//                   compact={true}
//                 />
//               </div>

//               {/* Blockchain Network Visualization */}
//               <div className="mb-6">
//                 <BlockchainVisualization />
//               </div>

//               {/* Quick Stats Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//                   <h3 className="text-xl font-bold text-gray-800 mb-4">System Health</h3>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Database</span>
//                       <span className={`font-semibold ${
//                         stats.systemHealth.database === 'Connected' ? 'text-green-600' : 'text-red-600'
//                       }`}>
//                         {stats.systemHealth.database}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Uptime</span>
//                       <span className="font-semibold text-blue-600">
//                         {Math.floor(stats.systemHealth.uptime / 60)}m {stats.systemHealth.uptime % 60}s
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Memory Usage</span>
//                       <span className="font-semibold text-purple-600">{stats.systemHealth.memoryUsage}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Active Users</span>
//                       <span className="font-semibold text-green-600">{stats.activeUsers}/{stats.totalUsers}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//                   <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
//                   <div className="space-y-2 max-h-40 overflow-y-auto">
//                     {(stats.recentActivity.length > 0 ? stats.recentActivity.slice(0, 3) : logs.slice(0, 3)).map((log, index) => (
//                       <div 
//                         key={generateKey('recent-activity', log)}
//                         className="flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded"
//                       >
//                         <span className={`w-2 h-2 rounded-full ${
//                           log.type === 'user' ? 'bg-blue-500' : 
//                           log.type === 'batch' ? 'bg-green-500' : 
//                           log.type === 'recall' ? 'bg-red-500' : 'bg-gray-500'
//                         }`}></span>
//                         <span className="flex-1 text-gray-700">{log.message || log.action}</span>
//                         <span className="text-gray-500 text-xs">{log.time}</span>
//                       </div>
//                     ))}
//                     {stats.recentActivity.length === 0 && logs.length === 0 && (
//                       <div className="text-center text-gray-500 text-sm py-4">
//                         No recent activity
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}

//           {/* Users Tab */}
//           {activeTab === "users" && (
//             <div className="space-y-6">
//               {/* Add User Form */}
//               <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//                 <h3 className="text-xl font-bold text-gray-800 mb-4">Add New User</h3>
//                 <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                   <input
//                     type="text"
//                     placeholder="Username"
//                     value={newUser.username}
//                     onChange={(e) => setNewUser({...newUser, username: e.target.value})}
//                     className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                   <input
//                     type="email"
//                     placeholder="Email"
//                     value={newUser.email}
//                     onChange={(e) => setNewUser({...newUser, email: e.target.value})}
//                     className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                   <input
//                     type="password"
//                     placeholder="Password"
//                     value={newUser.password}
//                     onChange={(e) => setNewUser({...newUser, password: e.target.value})}
//                     className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                     minLength="6"
//                   />
//                   <select
//                     value={newUser.role}
//                     onChange={(e) => setNewUser({...newUser, role: e.target.value})}
//                     className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="viewer">Viewer</option>
//                     <option value="pharmacy">Pharmacy</option>
//                     <option value="manufacturer">Manufacturer</option>
//                     <option value="analytics">Analytics</option>
//                     <option value="admin">Admin</option>
//                   </select>
//                   <button
//                     type="submit"
//                     className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
//                   >
//                     Add User
//                   </button>
//                 </form>
//               </section>

//               {/* User Management Table */}
//               <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//                 <h3 className="text-xl font-bold text-gray-800 mb-4">User Management</h3>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-sm">
//                     <thead>
//                       <tr className="border-b-2 border-gray-200 text-gray-700">
//                         <th className="py-4 font-semibold text-left">User</th>
//                         <th className="py-4 font-semibold text-left">Email</th>
//                         <th className="py-4 font-semibold text-left">Current Role</th>
//                         <th className="py-4 font-semibold text-left">Status</th>
//                         <th className="py-4 font-semibold text-left">Change Role</th>
//                         <th className="py-4 font-semibold text-left">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {users.map((u) => (
//                         <tr 
//                           key={generateKey('user', u)}
//                           className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                         >
//                           <td className="py-4 font-medium text-gray-800">{u.username}</td>
//                           <td className="py-4 text-gray-600">{u.email}</td>
//                           <td className="py-4">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                               u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
//                               u.role === 'pharmacy' ? 'bg-blue-100 text-blue-800' :
//                               u.role === 'manufacturer' ? 'bg-green-100 text-green-800' :
//                               'bg-gray-100 text-gray-800'
//                             }`}>
//                               {u.role}
//                             </span>
//                           </td>
//                           <td className="py-4">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                               u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                             }`}>
//                               {u.isActive ? 'Active' : 'Inactive'}
//                             </span>
//                           </td>
//                           <td className="py-4">
//                             <select
//                               value={u.role}
//                               onChange={(e) => handleRoleChange(u.id, e.target.value)}
//                               className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
//                             >
//                               <option value="admin">Administrator</option>
//                               <option value="pharmacy">Pharmacy</option>
//                               <option value="manufacturer">Manufacturer</option>
//                               <option value="analytics">Analytics</option>
//                               <option value="viewer">Viewer</option>
//                             </select>
//                           </td>
//                           <td className="py-4">
//                             <button
//                               onClick={() => handleUserStatusToggle(u.id)}
//                               className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
//                                 u.isActive 
//                                   ? 'bg-red-500 hover:bg-red-600 text-white' 
//                                   : 'bg-green-500 hover:bg-green-600 text-white'
//                               }`}
//                             >
//                               {u.isActive ? 'Deactivate' : 'Activate'}
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                       {users.length === 0 && (
//                         <tr>
//                           <td colSpan="6" className="py-8 text-center text-gray-500">
//                             No users found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </section>
//             </div>
//           )}

//           {/* Recalls Tab */}
//           {activeTab === "recalls" && (
//             <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-bold text-gray-800">Recall Management</h3>
//                 <button 
//                   onClick={() => fetchSystemData()}
//                   className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
//                 >
//                   Refresh Recalls
//                 </button>
//               </div>
              
//               {recallList.length === 0 ? (
//                 <p className="text-gray-500 italic py-8 text-center">No recalls pending.</p>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-sm">
//                     <thead>
//                       <tr className="border-b-2 border-gray-200 text-gray-700">
//                         <th className="py-4 font-semibold text-left">Batch No</th>
//                         <th className="py-4 font-semibold text-left">Medicine</th>
//                         <th className="py-4 font-semibold text-left">Reason</th>
//                         <th className="py-4 font-semibold text-left">Severity</th>
//                         <th className="py-4 font-semibold text-left">Date</th>
//                         <th className="py-4 font-semibold text-left">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {recallList.map((r) => (
//                         <tr 
//                           key={generateKey('recall', r)}
//                           className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                         >
//                           <td className="py-4 font-medium text-gray-800">{r.batchNo}</td>
//                           <td className="py-4 text-gray-600">{r.name || 'Unknown Medicine'}</td>
//                           <td className="py-4 text-gray-600">{r.reason}</td>
//                           <td className="py-4">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                               r.severity === 'High' ? 'bg-red-100 text-red-800' :
//                               r.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
//                               'bg-green-100 text-green-800'
//                             }`}>
//                               {r.severity}
//                             </span>
//                           </td>
//                           <td className="py-4 text-gray-600">{r.date}</td>
//                           <td className="py-4">
//                             <button
//                               onClick={() => handleRecallRemove(r.id)}
//                               className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all transform hover:scale-105 shadow border border-red-500"
//                             >
//                               Remove{metamask.isConnected ? ' from Chain' : ''}
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </section>
//           )}

//           {/* Logs Tab */}
//           {activeTab === "logs" && (
//             <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-bold text-gray-800">System Activity Logs</h3>
//                 <div className="flex gap-2">
//                   <button 
//                     onClick={() => fetchSystemData()}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
//                   >
//                     Refresh Logs
//                   </button>
//                   <button 
//                     onClick={() => setLogs([])}
//                     className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
//                   >
//                     Clear Local Logs
//                   </button>
//                 </div>
//               </div>
//               <div className="max-h-96 overflow-y-auto space-y-3">
//                 {logs.map((log) => (
//                   <div
//                     key={generateKey('log', log)}
//                     className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
//                   >
//                     <div className="flex items-center gap-3">
//                       <span className={`w-2 h-2 rounded-full ${
//                         log.type === 'user' ? 'bg-blue-500' : 
//                         log.type === 'batch' ? 'bg-green-500' : 
//                         log.type === 'recall' ? 'bg-red-500' : 
//                         log.type === 'verification' ? 'bg-purple-500' : 'bg-gray-500'
//                       }`}></span>
//                       <span className="text-gray-700 font-medium">{log.message}</span>
//                     </div>
//                     <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full border border-gray-200">
//                       {log.time}
//                     </span>
//                   </div>
//                 ))}
//                 {logs.length === 0 && (
//                   <div className="text-center text-gray-500 py-8">
//                     No logs available
//                   </div>
//                 )}
//               </div>
//             </section>
//           )}
//         </div>
//       </BackgroundFix>
//     </ProtectedRoute>
//   );
// }

// export default AdminPage;


