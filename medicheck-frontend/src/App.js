// App.js - Fixed version
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import useMetaMask from "./hooks/useMetaMask";
import useAuth from "./hooks/useAuth"; // Make sure this is imported
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { api } from "./utils/api";
import { THEMES } from "./data/themes";
import ResponsiveContainer from "./components/ResponsiveContainer";
// Import all pages
import RoleSelectionPage from "./pages/RoleSelectionPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import PharmacistLoginPage from "./pages/PharmacistLoginPage";
import ManufacturerLoginPage from "./pages/ManufacturerLoginPage";
import ViewerLoginPage from "./pages/ViewerLoginPage";
import AnalyticsLoginPage from "./pages/AnalyticsLoginPage";
import DashboardPage from "./pages/DashboardPage";
import ManufacturerPage from "./pages/ManufacturerPage";
import PharmacyPage from "./pages/PharmacyPage";
import VerifyPage from "./pages/VerifyPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AdminPage from "./pages/AdminPage";
import PharmacyDashboardPage from "./pages/PharmacyDashboardPage";
import ManufacturerDashboardPage from "./pages/ManufacturerDashboardPage";
import SupportPage from "./pages/SupportPage";

function MedicheckDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, connected, error
  
  // Initialize hooks
  const metamask = useMetaMask();
  const auth = useAuth(); // This provides user, setUser, selectedRole, setSelectedRole, etc.

  const theme = THEMES[currentTheme];

  // Check backend connection on app load
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      setBackendStatus('checking');
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        setBackendStatus('connected');
        console.log('✅ Backend connected successfully');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setBackendStatus('error');
    }
  };

  // Set theme based on user role when logged in
  useEffect(() => {
    if (auth.user && auth.user.theme) {
      setCurrentTheme(auth.user.theme);
    }
  }, [auth.user]);

  // Fetch batches from backend when component mounts or user changes
  useEffect(() => {
    if (auth.isAuthenticated && backendStatus === 'connected') {
      fetchBatches();
    }
  }, [auth.isAuthenticated, backendStatus]);

  async function fetchBatches() {
    setLoading(true);
    try {
      const data = await api.get("/batches");
      
      // Handle the new response format from backend
      if (data && data.success && Array.isArray(data.data)) {
        setBatches(data.data);
        console.log("✅ Loaded batches from backend:", data.data.length);
      } else if (Array.isArray(data)) {
        // Fallback for old format
        setBatches(data);
        console.log("✅ Loaded batches from backend (legacy format):", data.length);
      } else {
        console.warn("⚠️ Invalid data format from backend:", data);
        setBatches([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch batches:", error.message);
      // Set empty array instead of showing error to user
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }

  // Register a new batch
  async function handleRegister(newBatch) {
    const formattedBatch = {
      batchNo: String(newBatch.batchNo),
      name: String(newBatch.name),
      medicineName: String(newBatch.medicineName || newBatch.name),
      manufactureDate: String(newBatch.manufactureDate),
      expiry: String(newBatch.expiry),
      formulation: String(newBatch.formulation),
      manufacturer: newBatch.manufacturer || "Unknown Manufacturer",
      pharmacy: newBatch.pharmacy || "To be assigned",
      quantity: newBatch.quantity || 0,
      status: "active",
      blockchainVerified: true
    };

    try {
      const savedBatch = await api.post("/batches", formattedBatch);
      
      // Update UI with the batch from backend
      setBatches(prev => [savedBatch, ...prev]);
      console.log("✅ Batch saved to backend:", savedBatch.batchNo);
      
      return true;
    } catch (error) {
      console.error("❌ Failed to save batch:", error);
      alert(`Failed to register batch: ${error.message}`);
      return false;
    }
  }

  async function handleAccept(batchNo) {
    console.log("Accepting batch:", batchNo);

    try {
      const updatedBatch = await api.put(`/batches/accept/${batchNo}`);
      
      // Update React state
      setBatches(prev =>
        prev.map(b => (b.batchNo === batchNo ? updatedBatch : b))
      );

      console.log("✅ Batch accepted:", batchNo);
      return true;
    } catch (error) {
      console.error("❌ Failed to accept batch:", error);
      alert(`Failed to accept batch: ${error.message}`);
      return false;
    }
  }

  // Show backend connection error
  if (backendStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg text-center max-w-md w-full">
          <div className="text-6xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Backend Server Not Found</h2>
          <p className="text-gray-600 mb-6">
            Cannot connect to the backend server on port 5000. Please make sure the backend is running.
          </p>
          <div className="space-y-3">
            <button 
              onClick={checkBackendConnection}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Retry Connection
            </button>
            <div className="text-sm text-gray-500">
              <p>To start the backend:</p>
              <code className="bg-gray-100 p-2 rounded block mt-2">
                cd medicheck-backend<br/>
                npm run dev
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate login page based on selected role
  // Use auth.selectedRole and auth.selectRole from the hook
  if (!auth.isAuthenticated) {
    if (!auth.selectedRole) {
      return <RoleSelectionPage onRoleSelect={auth.selectRole} />;
    }

    switch (auth.selectedRole) {
      case 'admin':
        return <AdminLoginPage onLogin={auth.login} onBack={() => auth.selectRole(null)} />;
      case 'pharmacist':
        return <PharmacistLoginPage onLogin={auth.login} onBack={() => auth.selectRole(null)} />;
      case 'manufacturer':
        return <ManufacturerLoginPage onLogin={auth.login} onBack={() => auth.selectRole(null)} />;
      case 'viewer':
        return <ViewerLoginPage onLogin={auth.login} onBack={() => auth.selectRole(null)} />;
      case 'analytics':
        return <AnalyticsLoginPage onLogin={auth.login} onBack={() => auth.selectRole(null)} />;
      default:
        return <RoleSelectionPage onRoleSelect={auth.selectRole} />;
    }
  }

 return (
    <ErrorBoundary>
      <Router>
        <div className={`min-h-screen bg-gradient-to-br ${theme.background} text-gray-800 flex`}>
          {/* Sidebar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:block">
            <Sidebar 
              collapsed={collapsed} 
              user={auth.user} 
              onLogout={auth.logout}
              theme={theme}
            />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden fixed top-4 left-4 z-50">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 bg-blue-600 text-white rounded-lg shadow-lg"
            >
              {collapsed ? '☰' : '✕'}
            </button>
          </div>

          {/* Mobile sidebar overlay */}
          {!collapsed && (
            <div className="md:hidden fixed inset-0 z-40">
              <div 
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setCollapsed(true)}
              ></div>
              <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
                <Sidebar 
                  collapsed={false} 
                  user={auth.user} 
                  onLogout={auth.logout}
                  theme={THEMES.blue}
                />
              </div>
            </div>
          )}
          
          <div className="flex-1 flex flex-col w-full">
            {/* Topbar - Adjusted for mobile */}
            <div className="md:hidden">
              <div className="h-16"></div> {/* Spacer for fixed topbar */}
            </div>
            <div className="fixed top-0 left-0 right-0 z-30 md:relative">
              <Topbar 
                onToggle={() => setCollapsed(!collapsed)} 
                metamask={metamask} 
                user={auth.user}
                theme={theme}
              />
            </div>
            
            {/* <main className="flex-1 overflow-auto pt-4 md:pt-0"> */}
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
              {/* Backend Status Indicator */}
              {backendStatus === 'checking' && (
                <ResponsiveContainer>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 text-center rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                      <div className="loading-spinner"></div>
                      <span className="text-yellow-700">Connecting to backend...</span>
                    </div>
                  </div>
                </ResponsiveContainer>
              )}
              
              {loading && (
                <div className="flex justify-center items-center p-4">
                  <div className="loading-spinner"></div>
                  <span className="ml-2 text-gray-600">Loading batches...</span>
                </div>
              )}
              
              <Routes>
                {/* Wrap all pages with ResponsiveContainer */}
                <Route path="/" element={
                  <ResponsiveContainer>
                    <DashboardPage 
                      batches={batches} 
                      metamask={metamask} 
                      user={auth.user}
                      theme={theme}
                      onRefresh={fetchBatches}
                    />
                  </ResponsiveContainer>
                } />
                <Route path="/manufacturer" element={
                  <ResponsiveContainer>
                    <ManufacturerPage 
                      onRegister={handleRegister} 
                      metamask={metamask} 
                      user={auth.user}
                      theme={theme}
                    />
                  </ResponsiveContainer>
                } />
                <Route path="/pharmacy" element={
                  <ResponsiveContainer>
                    <PharmacyPage 
                      batches={batches} 
                      onAccept={handleAccept} 
                      metamask={metamask} 
                      user={auth.user}
                      theme={theme}
                      onRefresh={fetchBatches}
                    />
                  </ResponsiveContainer>
                } />
                <Route path="/verify" element={
                  <ResponsiveContainer>
                    <VerifyPage 
                      batches={batches} 
                      metamask={metamask} 
                      user={auth.user}
                      theme={theme}
                    />
                  </ResponsiveContainer>
                } />
                <Route path="/analytics" element={
                  <ResponsiveContainer>
                    <AnalyticsPage 
                      batches={batches}
                      metamask={metamask} 
                      user={auth.user}
                      theme={theme}
                    />
                  </ResponsiveContainer>
                } />
                <Route path="/admin" element={
                  <ResponsiveContainer>
                    <AdminPage 
                      batches={batches}
                      metamask={metamask} 
                      user={auth.user}
                      theme={theme}
                      onRefresh={fetchBatches}
                    />
                  </ResponsiveContainer>
                } />
                <Route path="/manufacturer-dashboard" element={
                  <ResponsiveContainer>
                    <ManufacturerDashboardPage 
                     batches={batches}
                     metamask={metamask} 
                     user={auth.user}
                     theme={theme}
                     onRefresh={fetchBatches}
                   />
                  </ResponsiveContainer>
                 } />
                
                <Route path="/support" element={
                  <ResponsiveContainer>
                    <SupportPage 
                      user={auth.user}
                      theme={theme}
                    />
                  </ResponsiveContainer>
                } />
                <Route path="/login" element={<Navigate to="/" replace />} />

                <Route path="/pharmacy-dashboard" element={
                  <ResponsiveContainer>
                    <PharmacyDashboardPage 
                      batches={batches}
                      metamask={metamask} 
                      user={auth.user}
                      theme={theme}
                      onRefresh={fetchBatches}
                    />
                  </ResponsiveContainer>
                  } />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default MedicheckDashboard;