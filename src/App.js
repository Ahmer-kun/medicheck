import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import useMetaMask from "./hooks/useMetaMask";
import useAuth from "./hooks/useAuth";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { api } from "./utils/api";
import { THEMES } from "./data/themes";

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

function MedicheckDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, connected, error
  const metamask = useMetaMask();
  const auth = useAuth();

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
      
      if (Array.isArray(data)) {
        setBatches(data);
        console.log("✅ Loaded batches from backend:", data.length);
      } else {
        console.warn("⚠️ Invalid data format from backend");
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
          <Sidebar 
            collapsed={collapsed} 
            user={auth.user} 
            onLogout={auth.logout}
            theme={theme}
          />
          
          <div className="flex-1 flex flex-col">
            <Topbar 
              onToggle={() => setCollapsed(!collapsed)} 
              metamask={metamask} 
              user={auth.user}
              theme={theme}
            />
            
            {/* Backend Status Indicator */}
            {backendStatus === 'checking' && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner"></div>
                  <span className="text-yellow-700">Connecting to backend...</span>
                </div>
              </div>
            )}
            
            <main className="flex-1 overflow-auto">
              {loading && (
                <div className="flex justify-center items-center p-4">
                  <div className="loading-spinner"></div>
                  <span className="ml-2 text-gray-600">Loading batches...</span>
                </div>
              )}
              
              <Routes>
                <Route path="/" element={
                  <DashboardPage 
                    batches={batches} 
                    metamask={metamask} 
                    user={auth.user}
                    theme={theme}
                    onRefresh={fetchBatches}
                  />
                } />
                <Route path="/manufacturer" element={
                  <ManufacturerPage 
                    onRegister={handleRegister} 
                    metamask={metamask} 
                    user={auth.user}
                    theme={theme}
                  />
                } />
                <Route path="/pharmacy" element={
                  <PharmacyPage 
                    batches={batches} 
                    onAccept={handleAccept} 
                    metamask={metamask} 
                    user={auth.user}
                    theme={theme}
                    onRefresh={fetchBatches}
                  />
                } />
                <Route path="/verify" element={
                  <VerifyPage 
                    batches={batches} 
                    metamask={metamask} 
                    user={auth.user}
                    theme={theme}
                  />
                } />
                <Route path="/analytics" element={
                  <AnalyticsPage 
                    batches={batches}
                    metamask={metamask} 
                    user={auth.user}
                    theme={theme}
                  />
                } />
                <Route path="/admin" element={
                  <AdminPage 
                    batches={batches}
                    metamask={metamask} 
                    user={auth.user}
                    theme={theme}
                    onRefresh={fetchBatches}
                  />
                } />
                <Route path="/login" element={<Navigate to="/" replace />} />

                <Route path="/pharmacy-dashboard" element={
                  <PharmacyDashboardPage 
                    batches={batches}
                    metamask={metamask} 
                    user={auth.user}
                    theme={theme}
                    onRefresh={fetchBatches}
                  />
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




//      ahmers code


// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import useMetaMask from "./hooks/useMetaMask";
// import useAuth from "./hooks/useAuth";
// import Sidebar from "./components/Sidebar";
// import Topbar from "./components/Topbar";
// import ErrorBoundary from "./components/ErrorBoundary";
// import { api } from "./utils/api"; // Import the API utility
// import { THEMES } from "./data/themes";

// // Import all pages
// import RoleSelectionPage from "./pages/RoleSelectionPage";
// import AdminLoginPage from "./pages/AdminLoginPage";
// import PharmacistLoginPage from "./pages/PharmacistLoginPage";
// import ManufacturerLoginPage from "./pages/ManufacturerLoginPage";
// import ViewerLoginPage from "./pages/ViewerLoginPage";
// import AnalyticsLoginPage from "./pages/AnalyticsLoginPage";
// import DashboardPage from "./pages/DashboardPage";
// import ManufacturerPage from "./pages/ManufacturerPage";
// import PharmacyPage from "./pages/PharmacyPage";
// import VerifyPage from "./pages/VerifyPage";
// import AnalyticsPage from "./pages/AnalyticsPage";
// import AdminPage from "./pages/AdminPage";

// // Add CSS styles
// const styles = `
// @keyframes pulse {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.7; }
// }

// ::-webkit-scrollbar {
//   width: 6px;
// }

// ::-webkit-scrollbar-track {
//   background: rgba(0, 0, 0, 0.1);
//   border-radius: 3px;
// }

// ::-webkit-scrollbar-thumb {
//   background: rgba(0, 0, 0, 0.3);
//   border-radius: 3px;
// }

// ::-webkit-scrollbar-thumb:hover {
//   background: rgba(0, 0, 0, 0.5);
// }

// /* Ensure proper background colors */
// body {
//   background: #ffffff !important;
//   margin: 0;
//   padding: 0;
//   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
// }

// #root {
//   min-height: 100vh;
// }

// /* Text visibility improvements */
// .text-gray-800 {
//   color: #1f2937 !important;
// }

// .text-gray-700 {
//   color: #374151 !important;
// }

// .text-gray-600 {
//   color: #4b5563 !important;
// }

// /* Loading states */
// .loading-spinner {
//   border: 2px solid #f3f4f6;
//   border-top: 2px solid #3b82f6;
//   border-radius: 50%;
//   width: 20px;
//   height: 20px;
//   animation: spin 1s linear infinite;
// }

// @keyframes spin {
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// }
// `;

// // Inject styles
// if (typeof document !== 'undefined') {
//   const styleSheet = document.createElement("style");
//   styleSheet.innerText = styles;
//   document.head.appendChild(styleSheet);
// }

// function MedicheckDashboard() {
//   const [collapsed, setCollapsed] = useState(false);
//   const [batches, setBatches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentTheme, setCurrentTheme] = useState('blue');
//   const metamask = useMetaMask();
//   const auth = useAuth();

//   const theme = THEMES[currentTheme];

//   // Set theme based on user role when logged in
//   useEffect(() => {
//     if (auth.user && auth.user.theme) {
//       setCurrentTheme(auth.user.theme);
//     }
//   }, [auth.user]);

//   // Fetch batches from backend when component mounts or user changes
//   useEffect(() => {
//     if (auth.isAuthenticated) {
//       fetchBatches();
//     }
//   }, [auth.isAuthenticated]);

//   async function fetchBatches() {
//     setLoading(true);
//     try {
//       const data = await api.get("/batches");
      
//       if (Array.isArray(data)) {
//         setBatches(data);
//         console.log("✅ Loaded batches from backend:", data.length);
//       } else {
//         console.warn("⚠️ Invalid data format from backend");
//         setBatches([]);
//       }
//     } catch (error) {
//       console.error("❌ Failed to fetch batches:", error.message);
//       // Set empty array instead of showing error to user
//       setBatches([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Register a new batch
//   async function handleRegister(newBatch) {
//     const formattedBatch = {
//       batchNo: String(newBatch.batchNo),
//       name: String(newBatch.name),
//       medicineName: String(newBatch.medicineName || newBatch.name),
//       manufactureDate: String(newBatch.manufactureDate),
//       expiry: String(newBatch.expiry),
//       formulation: String(newBatch.formulation),
//       manufacturer: newBatch.manufacturer || "Unknown Manufacturer",
//       pharmacy: newBatch.pharmacy || "To be assigned",
//       quantity: newBatch.quantity || 0,
//       status: "active",
//       blockchainVerified: true
//     };

//     try {
//       const savedBatch = await api.post("/batches", formattedBatch);
      
//       // Update UI with the batch from backend
//       setBatches(prev => [savedBatch, ...prev]);
//       console.log("✅ Batch saved to backend:", savedBatch.batchNo);
      
//       return true;
//     } catch (error) {
//       console.error("❌ Failed to save batch:", error);
//       alert(`Failed to register batch: ${error.message}`);
//       return false;
//     }
//   }

//   async function handleAccept(batchNo) {
//     console.log("Accepting batch:", batchNo);

//     try {
//       const updatedBatch = await api.put(`/batches/accept/${batchNo}`);
      
//       // Update React state
//       setBatches(prev =>
//         prev.map(b => (b.batchNo === batchNo ? updatedBatch : b))
//       );

//       console.log("✅ Batch accepted:", batchNo);
//       return true;
//     } catch (error) {
//       console.error("❌ Failed to accept batch:", error);
//       alert(`Failed to accept batch: ${error.message}`);
//       return false;
//     }
//   }

//   // Render appropriate login page based on selected role
//   if (!auth.isAuthenticated) {
//     if (!auth.selectedRole) {
//       return <RoleSelectionPage onRoleSelect={auth.selectRole} />;
//     }

//     switch (auth.selectedRole) {
//       case 'admin':
//         return <AdminLoginPage onLogin={auth.login} onBack={() => auth.selectRole(null)} />;
//       case 'pharmacist':
//         return <PharmacistLoginPage onLogin={auth.login} onBack={() => auth.selectRole(null)} />;
//       case 'manufacturer':
//         return <ManufacturerLoginPage onLogin={auth.login} onBack={() => auth.selectRole(null)} />;
//       case 'viewer':
//         return <ViewerLoginPage onLogin={auth.login} onBack={() => auth.selectRole(null)} />;
//       case 'analytics':
//         return <AnalyticsLoginPage onLogin={auth.login} onBack={() => auth.selectRole(null)} />;
//       default:
//         return <RoleSelectionPage onRoleSelect={auth.selectRole} />;
//     }
//   }

//   return (
//     <ErrorBoundary>
//       <Router>
//         <div className={`min-h-screen bg-gradient-to-br ${theme.background} text-gray-800 flex`}>
//           <Sidebar 
//             collapsed={collapsed} 
//             user={auth.user} 
//             onLogout={auth.logout}
//             theme={theme}
//           />
          
//           <div className="flex-1 flex flex-col">
//             <Topbar 
//               onToggle={() => setCollapsed(!collapsed)} 
//               metamask={metamask} 
//               user={auth.user}
//               theme={theme}
//             />
            
//             <main className="flex-1 overflow-auto">
//               {loading && (
//                 <div className="flex justify-center items-center p-4">
//                   <div className="loading-spinner"></div>
//                   <span className="ml-2 text-gray-600">Loading batches...</span>
//                 </div>
//               )}
              
//               <Routes>
//                 <Route path="/" element={
//                   <DashboardPage 
//                     batches={batches} 
//                     metamask={metamask} 
//                     user={auth.user}
//                     theme={theme}
//                     onRefresh={fetchBatches}
//                   />
//                 } />
//                 <Route path="/manufacturer" element={
//                   <ManufacturerPage 
//                     onRegister={handleRegister} 
//                     metamask={metamask} 
//                     user={auth.user}
//                     theme={theme}
//                   />
//                 } />
//                 <Route path="/pharmacy" element={
//                   <PharmacyPage 
//                     batches={batches} 
//                     onAccept={handleAccept} 
//                     metamask={metamask} 
//                     user={auth.user}
//                     theme={theme}
//                     onRefresh={fetchBatches}
//                   />
//                 } />
//                 <Route path="/verify" element={
//                   <VerifyPage 
//                     batches={batches} 
//                     metamask={metamask} 
//                     user={auth.user}
//                     theme={theme}
//                   />
//                 } />
//                 <Route path="/analytics" element={
//                   <AnalyticsPage 
//                     batches={batches}
//                     metamask={metamask} 
//                     user={auth.user}
//                     theme={theme}
//                   />
//                 } />
//                 <Route path="/admin" element={
//                   <AdminPage 
//                     batches={batches}
//                     metamask={metamask} 
//                     user={auth.user}
//                     theme={theme}
//                     onRefresh={fetchBatches}
//                   />
//                 } />
//                 <Route path="/login" element={<Navigate to="/" replace />} />
//               </Routes>
//             </main>
//           </div>
//         </div>
//       </Router>
//     </ErrorBoundary>
//   );
// }

// export default MedicheckDashboard;
