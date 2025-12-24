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
  const [newUser, setNewUser] = useState({ 
    username: "", 
    email: "", 
    role: "viewer", 
    password: "",
    name: "",
    cnic: "",
    phone: "",
    address: ""
  });
  const [pendingBatches, setPendingBatches] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userFormErrors, setUserFormErrors] = useState({});
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  
  // NEW: User detail modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Fetch system data
  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, batchesResponse, allBatchesResponse, usersResponse, recallResponse, logsResponse] = await Promise.allSettled([
        api.get("/admin/stats"),
        api.get("/admin/pending-batches"),
        api.get("/admin/batches"),
        api.get("/admin/users"),
        api.get("/admin/recalls"),
        api.get("/admin/logs")
      ]);

      if (statsResponse.status === 'fulfilled' && statsResponse.value?.success) {
        setSystemStats(statsResponse.value.data);
      }

      if (allBatchesResponse.status === 'fulfilled' && allBatchesResponse.value?.success) {
        setPendingBatches(allBatchesResponse.value.data);
      } else if (batchesResponse.status === 'fulfilled' && batchesResponse.value?.success) {
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

    } catch (error) {
      console.error("Error in fetchSystemData:", error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Function to open user details modal
  const openUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // NEW: Function to close user details modal
  const closeUserDetails = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  // Enhanced User Validation
  const validateUserForm = (field = null, value = null) => {
    const errors = { ...userFormErrors };
    
    const validateField = (name, val) => {
      switch (name) {
        case 'username':
          if (!val.trim()) {
            errors.username = 'Username is required';
          } else if (val.trim().length < 3) {
            errors.username = 'Username must be at least 3 characters';
          } else if (!/^[a-zA-Z0-9_]+$/.test(val.trim())) {
            errors.username = 'Username can only contain letters, numbers, and underscores';
          } else if (val.trim().length > 20) {
            errors.username = 'Username cannot exceed 20 characters';
          } else {
            delete errors.username;
          }
          break;

        case 'email':
          if (!val.trim()) {
            errors.email = 'Email is required';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
            errors.email = 'Please enter a valid email address';
          } else {
            delete errors.email;
          }
          break;

        case 'password':
          if (!val) {
            errors.password = 'Password is required';
          } else if (val.length < 8) {
            errors.password = 'Password must be at least 8 characters';
          } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val)) {
            errors.password = 'Password must contain uppercase, lowercase letters and numbers';
          } else {
            delete errors.password;
          }
          break;

        case 'name':
          if (!val.trim()) {
            errors.name = 'Full name is required';
          } else if (val.trim().length < 2) {
            errors.name = 'Full name must be at least 2 characters';
          } else if (!/^[a-zA-Z\s]+$/.test(val.trim())) {
            errors.name = 'Full name can only contain letters and spaces';
          } else if (val.trim().length > 50) {
            errors.name = 'Full name cannot exceed 50 characters';
          } else {
            delete errors.name;
          }
          break;

        case 'cnic':
          if (!val.trim()) {
            errors.cnic = 'CNIC is required';
          } else if (!/^\d{5}-\d{7}-\d{1}$/.test(val.trim())) {
            errors.cnic = 'CNIC must be in format: 12345-1234567-1';
          } else {
            // Validate CNIC checksum
            const cnicWithoutDashes = val.replace(/-/g, '');
            if (cnicWithoutDashes.length !== 13) {
              errors.cnic = 'CNIC must be 13 digits';
            } else {
              delete errors.cnic;
            }
          }
          break;

        case 'phone':
          if (!val.trim()) {
            errors.phone = 'Phone number is required';
          } else if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(val.trim())) {
            errors.phone = 'Please enter a valid phone number';
          } else {
            delete errors.phone;
          }
          break;

        case 'address':
          if (!val.trim()) {
            errors.address = 'Address is required';
          } else if (val.trim().length < 10) {
            errors.address = 'Address must be at least 10 characters';
          } else if (val.trim().length > 200) {
            errors.address = 'Address cannot exceed 200 characters';
          } else {
            delete errors.address;
          }
          break;

        default:
          break;
      }
    };

    if (field && value !== null) {
      validateField(field, value);
    } else {
      // Validate all fields
      Object.keys(newUser).forEach(key => {
        if (key !== 'role') { // Role doesn't need validation beyond selection
          validateField(key, newUser[key]);
        }
      });
    }

    setUserFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserInputChange = (field, value) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time validation
    if (field === 'cnic') {
      // Auto-format CNIC
      const formattedValue = formatCNIC(value);
      if (formattedValue !== value) {
        setNewUser(prev => ({
          ...prev,
          cnic: formattedValue
        }));
        validateUserForm(field, formattedValue);
      } else {
        validateUserForm(field, value);
      }
    } else {
      validateUserForm(field, value);
    }
  };

  // CNIC formatting function
  const formatCNIC = (value) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Format as 12345-1234567-1
    if (numbers.length <= 5) {
      return numbers;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = validateUserForm();
    if (!isValid) {
      alert('Please fix all validation errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      
      const userData = {
        username: newUser.username.trim(),
        password: newUser.password,
        role: newUser.role,
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        cnic: newUser.cnic.trim(),
        phone: newUser.phone.trim(),
        address: newUser.address.trim()
      };

      console.log("📤 Adding new user:", userData);

      const response = await api.post("/admin/users", userData);
      
      if (response.success) {
        // Refresh users list
        const usersResponse = await api.get("/admin/users");
        if (usersResponse.success) {
          setUsers(usersResponse.data);
        }
        
        // Reset form
        setNewUser({ 
          username: "", 
          email: "", 
          role: "viewer", 
          password: "",
          name: "",
          cnic: "",
          phone: "",
          address: ""
        });
        setUserFormErrors({});
        setShowAddUserForm(false);
        
        addLog(`New user ${newUser.username} added with role ${newUser.role}`, "user");
        alert(`✅ User created successfully! ${response.emailSent ? '📧 Welcome email sent to user.' : '⚠️ User created but email notification failed.'}`);
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert(`❌ Failed to add user: ${error.message}`);
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

  const handlePasswordReset = async (userId, newPassword) => {
    if (!window.confirm(`Are you sure you want to reset the password for this user?\n\nThey will need to use this temporary password: "${newPassword}"`)) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.put(`/admin/users/${userId}/reset-password`, {
        newPassword: newPassword
      });

      if (response.success) {
        alert(`✅ Password reset successfully! ${response.emailSent ? '📧 Notification email sent to user.' : ''}\n\nTemporary password has been set. User should change it on next login.`);
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error("❌ Error resetting password:", error);
      alert(`❌ Failed to reset password: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add status toggle button to your user table
  const handleUserStatusToggle = async (userId) => {
    try {
      // Use _id since that's what MongoDB uses
      const user = users.find(u => u._id === userId);
      if (!user) {
        alert('User not found');
        return;
      }

      console.log("Toggling user:", user._id, user.username);

      const response = await api.put(`/admin/users/${user._id}`, { 
        isActive: !user.isActive 
      });
      
      if (response.success) {
        const updatedUsers = users.map(u =>
          u._id === user._id ? { ...u, isActive: !u.isActive } : u
        );
        setUsers(updatedUsers);
        
        alert(`User ${user.username} ${!user.isActive ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert(`Failed to update user status: ${error.message}`);
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
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
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
        <div className="p-4 md:p-6 min-h-screen">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Manage system users, batches, and blockchain network
            </p>
            {loading && (
              <div className="flex items-center gap-2 mt-2 text-blue-600">
                <div className="loading-spinner-small"></div>
                <span className="text-sm">Loading system data...</span>
              </div>
            )}
          </div>

          {/* Tab Navigation - Mobile friendly */}
          <div className="flex overflow-x-auto mb-4 md:mb-6 border-b border-gray-200 no-scrollbar">
            {["overview", "users", "batches", "recalls", "logs"].map(tab => (
              <button
                key={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-3 md:px-4 py-2 font-medium capitalize whitespace-nowrap transition-colors text-sm md:text-base ${
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mb-6">
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
              <div className="mb-4 md:mb-6">
                <BlockchainVisualization />
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">System Health</h3>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm md:text-base">Database</span>
                      <span className={`font-semibold text-sm md:text-base ${
                        stats.systemHealth.database === 'Connected' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stats.systemHealth.database}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm md:text-base">Uptime</span>
                      <span className="font-semibold text-blue-600 text-sm md:text-base">
                        {Math.floor(stats.systemHealth.uptime / 60)}m {stats.systemHealth.uptime % 60}s
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm md:text-base">Memory Usage</span>
                      <span className="font-semibold text-purple-600 text-sm md:text-base">{stats.systemHealth.memoryUsage}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm md:text-base">Active Users</span>
                      <span className="font-semibold text-green-600 text-sm md:text-base">{stats.activeUsers}/{stats.totalUsers}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Recent Activity</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(stats.recentActivity.length > 0 ? stats.recentActivity.slice(0, 3) : logs.slice(0, 3)).map((log, index) => (
                      <div 
                        key={generateKey('recent-activity', log)}
                        className="flex items-center gap-2 md:gap-3 text-xs md:text-sm p-2 hover:bg-gray-50 rounded"
                      >
                        <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full flex-shrink-0 ${
                          log.type === 'user' ? 'bg-blue-500' : 
                          log.type === 'batch' ? 'bg-green-500' : 
                          log.type === 'recall' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></span>
                        <span className="flex-1 text-gray-700 truncate">{log.message || log.action}</span>
                        <span className="text-gray-500 text-xs whitespace-nowrap">{log.time}</span>
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
            <div className="space-y-4 md:space-y-6">
              {/* Add User Section */}
              <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800">Add New User</h3>
                  <button
                    onClick={() => setShowAddUserForm(!showAddUserForm)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base"
                  >
                    {showAddUserForm ? 'Cancel' : '➕ Add User'}
                  </button>
                </div>

                {showAddUserForm && (
                  <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg border">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => handleUserInputChange('username', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          userFormErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., john_doe"
                        maxLength={20}
                      />
                      {userFormErrors.username && (
                        <p className="text-red-500 text-xs mt-1">{userFormErrors.username}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => handleUserInputChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          userFormErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., john@example.com"
                      />
                      {userFormErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{userFormErrors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => handleUserInputChange('password', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          userFormErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Minimum 8 characters"
                      />
                      {userFormErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{userFormErrors.password}</p>
                      )}
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => handleUserInputChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          userFormErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., John Doe"
                        maxLength={50}
                      />
                      {userFormErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{userFormErrors.name}</p>
                      )}
                    </div>

                    {/* CNIC */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        CNIC *
                      </label>
                      <input
                        type="text"
                        value={newUser.cnic}
                        onChange={(e) => handleUserInputChange('cnic', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          userFormErrors.cnic ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 12345-1234567-1"
                        maxLength={15}
                      />
                      {userFormErrors.cnic && (
                        <p className="text-red-500 text-xs mt-1">{userFormErrors.cnic}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={newUser.phone}
                        onChange={(e) => handleUserInputChange('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          userFormErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., +92-300-1234567"
                      />
                      {userFormErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">{userFormErrors.phone}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Address *
                      </label>
                      <textarea
                        value={newUser.address}
                        onChange={(e) => handleUserInputChange('address', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          userFormErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter complete address"
                        rows="3"
                        maxLength={200}
                      />
                      {userFormErrors.address && (
                        <p className="text-red-500 text-xs mt-1">{userFormErrors.address}</p>
                      )}
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Role *
                      </label>
                      <select
                        value={newUser.role}
                        onChange={(e) => handleUserInputChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="pharmacy">Pharmacy</option>
                        <option value="manufacturer">Manufacturer</option>
                        <option value="analytics">Analytics</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 flex gap-2 md:gap-3 pt-3 md:pt-4">
                      <button
                        type="submit"
                        disabled={loading || Object.keys(userFormErrors).length > 0}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 md:py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
                      >
                        {loading ? (
                          <>
                            <div className="loading-spinner-small"></div>
                            Adding User...
                          </>
                        ) : (
                          'Add User'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddUserForm(false);
                          setNewUser({ 
                            username: "", 
                            email: "", 
                            role: "viewer", 
                            password: "",
                            name: "",
                            cnic: "",
                            phone: "",
                            address: ""
                          });
                          setUserFormErrors({});
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                )}
              </section>

              {/* User Management Table */}
              <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800">User Management</h3>
                  <button
                    onClick={fetchSystemData}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base"
                  >
                    Refresh
                  </button>
                </div>
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full text-xs md:text-sm">
                        <thead>
                          <tr className="border-b-2 border-gray-200 text-gray-700">
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">User Info</th>
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left hidden md:table-cell">Contact</th>
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Current Role</th>
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Status</th>
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left hidden sm:table-cell">Change Role</th>
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr 
                              key={generateKey('user', u)}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td 
                                className="py-2 md:py-3 px-2 md:px-3 cursor-pointer"
                                onClick={() => openUserDetails(u)}
                              >
                                <div className="font-medium text-gray-800 truncate">{u.username}</div>
                                <div className="text-gray-600 text-xs truncate">{u.name}</div>
                                {u.cnic && (
                                  <div className="text-gray-500 text-xs font-mono truncate">{u.cnic}</div>
                                )}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600 hidden md:table-cell">
                                <div className="truncate">{u.email}</div>
                                {u.phone && (
                                  <div className="text-gray-500 text-xs truncate">{u.phone}</div>
                                )}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                  u.role === 'pharmacy' ? 'bg-blue-100 text-blue-800' :
                                  u.role === 'manufacturer' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              {/* Status Column */}
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {u.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3 hidden sm:table-cell">
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-xs md:text-sm w-full max-w-[120px] md:max-w-[150px]"
                                >
                                  <option value="admin">Administrator</option>
                                  <option value="pharmacy">Pharmacy</option>
                                  <option value="manufacturer">Manufacturer</option>
                                  <option value="analytics">Analytics</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <div className="flex flex-col sm:flex-row gap-1 md:gap-2">
                                  <button
                                    onClick={() => openUserDetails(u)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold transition-colors truncate"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => handleUserStatusToggle(u._id)}
                                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors truncate ${
                                      u.isActive 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                  >
                                    {u.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {users.length === 0 && (
                            <tr>
                              <td colSpan="6" className="py-4 md:py-8 text-center text-gray-500 text-sm md:text-base">
                                No users found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Batches Tab */}
          {activeTab === "batches" && (
            <div className="space-y-4 md:space-y-6">
              {/* Batch Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
              <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800">All Batches & Medicines</h3>
                  <button
                    onClick={fetchSystemData}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm md:text-base"
                  >
                    🔄 Refresh
                  </button>
                </div>

                {pendingBatches.length === 0 ? (
                  <div className="text-center py-6 md:py-8">
                    <div className="text-3xl md:text-4xl mb-3 md:mb-4">📦</div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-700 mb-1 md:mb-2">No Batches Found</h4>
                    <p className="text-gray-500 text-sm md:text-base">There are no batches in the system yet.</p>
                    <p className="text-gray-500 text-xs md:text-sm mt-1 md:mt-2">Manufacturers and pharmacies can add batches which will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <div className="min-w-full inline-block align-middle">
                      <div className="overflow-hidden">
                        <table className="min-w-full text-xs md:text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-200 text-gray-700">
                              <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Batch No</th>
                              <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Name</th>
                              <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left hidden md:table-cell">Type</th>
                              <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left hidden lg:table-cell">Manufacturer</th>
                              <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left hidden lg:table-cell">Pharmacy</th>
                              <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Expiry</th>
                              <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Status</th>
                              <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left hidden sm:table-cell">Blockchain</th>
                              <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Actions</th>
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
                                  <td className="py-2 md:py-3 px-2 md:px-3 font-medium text-gray-800 font-mono text-xs truncate max-w-[80px]">
                                    {batch.batchNo}
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-3">
                                    <div className="font-medium text-gray-800 truncate max-w-[100px] md:max-w-[150px]">{batch.name}</div>
                                    <div className="text-gray-500 text-xs truncate">{batch.medicineName || batch.formulation}</div>
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-3 hidden md:table-cell">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      batch.type === 'pharmacy_medicine' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {batch.type === 'pharmacy_medicine' ? 'Pharmacy' : 'Manufacturer'}
                                    </span>
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600 text-sm hidden lg:table-cell truncate max-w-[120px]">
                                    {batch.manufacturer}
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600 text-sm hidden lg:table-cell truncate max-w-[120px]">
                                    {batch.pharmacy || batch.pharmacyCompany?.name || 'N/A'}
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-3">
                                    <div className={`font-medium text-xs md:text-sm ${
                                      isExpired ? 'text-red-600' : 'text-gray-900'
                                    }`}>
                                      {new Date(batch.expiry || batch.expiryDate).toLocaleDateString()}
                                      {isExpired && <div className="text-red-500 text-xs">Expired</div>}
                                    </div>
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                                      {batch.status}
                                    </span>
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-3 hidden sm:table-cell">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${blockchainColor}`}>
                                      {batch.blockchainVerified ? 'Verified' : 'Not Verified'}
                                    </span>
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-3">
                                    <div className="flex flex-col sm:flex-row gap-1 md:gap-2">
                                      {!batch.blockchainVerified && (
                                        <button
                                          onClick={() => handleBatchAction(batch.id || batch._id, 'approve')}
                                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold transition-colors"
                                        >
                                          Approve
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleBatchAction(batch.id || batch._id, 'reject')}
                                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold transition-colors"
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
                    </div>
                  </div>
                )}

                {/* Pending Approvals Section */}
                {pendingBatches.filter(b => !b.blockchainVerified).length > 0 && (
                  <section className="mt-4 md:mt-6 bg-yellow-50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-yellow-200">
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <span className="text-xl md:text-2xl">⏳</span>
                      <div>
                        <h3 className="text-base md:text-xl font-bold text-yellow-800">Pending Approvals</h3>
                        <p className="text-yellow-700 text-sm">Batches waiting for blockchain verification</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      {pendingBatches.filter(b => !b.blockchainVerified).slice(0, 6).map((batch) => (
                        <div key={generateKey('pending-batch', batch)} className="bg-white p-3 md:p-4 rounded-lg border border-yellow-200">
                          <div className="flex justify-between items-start mb-1 md:mb-2">
                            <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">{batch.name}</h4>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex-shrink-0">
                              {batch.type === 'pharmacy_medicine' ? 'Pharmacy' : 'Manufacturer'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 font-mono mb-1 md:mb-2 truncate">{batch.batchNo}</p>
                          <p className="text-xs text-gray-600 mb-2 md:mb-3 truncate">{batch.manufacturer}</p>
                          <button
                            onClick={() => handleBatchAction(batch.id || batch._id, 'approve')}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-1 md:py-2 rounded text-xs md:text-sm font-semibold transition-colors"
                          >
                            Approve on Blockchain
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </section>
            </div>
          )}

          {/* Recalls Tab */}
          {activeTab === "recalls" && (
            <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Recall Management</h3>
                <button 
                  onClick={() => fetchSystemData()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base"
                >
                  Refresh Recalls
                </button>
              </div>
              
              {recallList.length === 0 ? (
                <p className="text-gray-500 italic py-6 md:py-8 text-center text-sm md:text-base">No recalls pending.</p>
              ) : (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full text-xs md:text-sm">
                        <thead>
                          <tr className="border-b-2 border-gray-200 text-gray-700">
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Batch No</th>
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Medicine</th>
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left hidden sm:table-cell">Reason</th>
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Severity</th>
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left hidden md:table-cell">Date</th>
                            <th className="py-2 md:py-3 px-2 md:px-3 font-semibold text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recallList.map((r) => (
                            <tr 
                              key={generateKey('recall', r)}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-2 md:py-3 px-2 md:px-3 font-medium text-gray-800 text-xs md:text-sm truncate max-w-[100px]">
                                {r.batchNo}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600 truncate max-w-[120px]">
                                {r.name || 'Unknown Medicine'}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600 hidden sm:table-cell truncate max-w-[150px]">
                                {r.reason}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  r.severity === 'High' ? 'bg-red-100 text-red-800' :
                                  r.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {r.severity}
                                </span>
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600 hidden md:table-cell">
                                {r.date}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <button
                                  onClick={() => handleRecallRemove(r.id)}
                                  className="bg-red-600 hover:bg-red-700 px-3 py-1 md:px-4 md:py-2 rounded-lg text-white text-xs md:text-sm font-semibold transition-all transform hover:scale-105 shadow border border-red-500 whitespace-nowrap"
                                >
                                  Remove{metamask.isConnected ? ' from Chain' : ''}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">System Activity Logs</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fetchSystemData()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-xs md:text-sm"
                  >
                    Refresh Logs
                  </button>
                  <button 
                    onClick={() => setLogs([])}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-xs md:text-sm"
                  >
                    Clear Local Logs
                  </button>
                </div>
              </div>
              <div className="max-h-64 md:max-h-96 overflow-y-auto space-y-2 md:space-y-3">
                {logs.map((log) => (
                  <div
                    key={generateKey('log', log)}
                    className="p-3 md:p-4 border-2 border-gray-100 rounded-xl bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className={`w-2 h-2 md:w-2 md:h-2 rounded-full flex-shrink-0 ${
                        log.type === 'user' ? 'bg-blue-500' : 
                        log.type === 'batch' ? 'bg-green-500' : 
                        log.type === 'recall' ? 'bg-red-500' : 
                        log.type === 'verification' ? 'bg-purple-500' : 'bg-gray-500'
                      }`}></span>
                      <span className="text-gray-700 font-medium text-sm md:text-base truncate">{log.message}</span>
                    </div>
                    <span className="text-gray-500 text-xs md:text-sm bg-white px-2 md:px-3 py-1 rounded-full border border-gray-200 whitespace-nowrap self-end sm:self-auto">
                      {log.time}
                    </span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">
                    No logs available
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* NEW: User Details Modal - Responsive */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-2xl font-bold text-gray-800">User Details</h3>
                <button
                  onClick={closeUserDetails}
                  className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold mx-auto mb-3 md:mb-4">
                    {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-gray-800">{selectedUser.name || selectedUser.username}</h4>
                  <p className="text-gray-600 text-sm md:text-base">@{selectedUser.username}</p>
                  <span className={`inline-block mt-1 md:mt-2 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                    selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    selectedUser.role === 'pharmacy' ? 'bg-blue-100 text-blue-800' :
                    selectedUser.role === 'manufacturer' ? 'bg-green-100 text-green-800' :
                    selectedUser.role === 'analytics' ? 'bg-teal-100 text-teal-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>

                {/* User Information Grid */}
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  {/* Password Management Section */}
                  <div className="bg-blue-50 p-3 md:p-4 rounded-xl border border-blue-200">
                    <h5 className="font-semibold text-blue-700 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                      <span>🔐</span> Password Management
                    </h5>
                    <div className="space-y-2 md:space-y-3">
                      <div>
                        <label className="text-xs md:text-sm text-blue-600">Username</label>
                        <p className="font-medium text-blue-800 bg-white px-2 md:px-3 py-1 md:py-2 rounded border border-blue-300 text-sm md:text-base truncate">
                          {selectedUser.username}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-blue-600 mb-1 md:mb-2">Reset User Password</p>
                        <button
                          onClick={() => {
                            const newPassword = prompt(
                              `Reset password for ${selectedUser.username}?\n\nEnter new permanent password:`,
                              'NewPass123!'
                            );
                            if (newPassword && newPassword.trim()) {
                              if (newPassword.length < 6) {
                                alert('❌ Password must be at least 6 characters long');
                                return;
                              }
                              handlePasswordReset(selectedUser._id, newPassword.trim());
                            }
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors w-full flex items-center justify-center gap-2"
                        >
                          <span>🔄</span>
                          Reset Password
                        </button>
                        <p className="text-xs text-blue-600 mt-1 md:mt-2">
                          ⚠️ This will <strong>permanently replace</strong> the user's current password. 
                          User must be informed about the new password.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 p-3 md:p-4 rounded-xl">
                    <h5 className="font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                      <span>📧</span> Contact Information
                    </h5>
                    <div className="space-y-1 md:space-y-2">
                      <div>
                        <label className="text-xs md:text-sm text-gray-500">Email</label>
                        <p className="font-medium text-sm md:text-base truncate">{selectedUser.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm text-gray-500">Phone</label>
                        <p className="font-medium text-sm md:text-base truncate">{selectedUser.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-gray-50 p-3 md:p-4 rounded-xl">
                    <h5 className="font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                      <span>👤</span> Personal Information
                    </h5>
                    <div className="space-y-1 md:space-y-2">
                      <div>
                        <label className="text-xs md:text-sm text-gray-500">Full Name</label>
                        <p className="font-medium text-sm md:text-base truncate">{selectedUser.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm text-gray-500">CNIC</label>
                        <p className="font-medium font-mono text-sm md:text-base truncate">{selectedUser.cnic || 'Not provided'}</p>
                      </div>
                      {selectedUser.address && (
                        <div>
                          <label className="text-xs md:text-sm text-gray-500">Address</label>
                          <p className="font-medium text-xs md:text-sm truncate-2">{selectedUser.address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="bg-gray-50 p-3 md:p-4 rounded-xl">
                    <h5 className="font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                      <span>⚙️</span> Account Status
                    </h5>
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs md:text-sm text-gray-500">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {selectedUser.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-xs md:text-sm text-gray-500">Member Since</span>
                          <span className="text-xs md:text-sm font-medium">
                            {new Date(selectedUser.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <span className="text-yellow-600 text-base md:text-lg">🔒</span>
                    <div>
                      <h6 className="font-semibold text-yellow-800 text-xs md:text-sm">Security Best Practices</h6>
                      <p className="text-yellow-700 text-xs mt-1">
                        • Use strong temporary passwords (min. 6 characters)<br/>
                        • Advise users to change passwords immediately<br/>
                        • Never share passwords via unsecured channels
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleUserStatusToggle(selectedUser._id);
                      closeUserDetails();
                    }}
                    className={`flex-1 py-2 md:py-3 rounded-xl font-semibold transition-colors text-sm md:text-base ${
                      selectedUser.isActive 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                  </button>
                  <button
                    onClick={closeUserDetails}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 md:py-3 rounded-xl font-semibold transition-colors text-sm md:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </BackgroundFix>
    </ProtectedRoute>
  );
}

export default AdminPage;