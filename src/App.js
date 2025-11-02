import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import useMetaMask from "./hooks/useMetaMask";
import useAuth from "./hooks/useAuth";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
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

// Add CSS styles
const styles = `
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* Ensure proper background colors */
body {
  background: #ffffff !important;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

#root {
  min-height: 100vh;
}

/* Text visibility improvements */
.text-gray-800 {
  color: #1f2937 !important;
}

.text-gray-700 {
  color: #374151 !important;
}

.text-gray-600 {
  color: #4b5563 !important;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

function MedicheckDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [batches, setBatches] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('blue');
  const metamask = useMetaMask();
  const auth = useAuth();

  const theme = THEMES[currentTheme];

  // Set theme based on user role when logged in
  useEffect(() => {
    if (auth.user && auth.user.theme) {
      setCurrentTheme(auth.user.theme);
    }
  }, [auth.user]);

  // Fetch batches from backend when component mounts
  useEffect(() => {
    async function fetchBatches() {
      try {
        const response = await fetch("http://localhost:5000/api/batches");
        if (!response.ok) throw new Error("Failed to fetch batches");
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setBatches(data);
          console.log("✅ Loaded batches from backend");
        } else {
          console.warn("⚠️ No data from backend, using defaults");
        }
      } catch (error) {
        console.error("❌ Backend fetch failed, using defaults:", error);
      }
    }
    fetchBatches();
  }, []);

  // Register a new batch — now also send it to backend
  async function handleRegister(newBatch) {
    const formattedBatch = {
      batchNo: String(newBatch.batchNo),
      name: String(newBatch.name),
      manufactureDate: String(newBatch.manufactureDate),
      expiry: String(newBatch.expiry),
      formulation: String(newBatch.formulation),
      manufacturer: newBatch.manufacturer || "Unknown Manufacturer",
      pharmacy: newBatch.pharmacy || "To be assigned",
      quantity: newBatch.quantity || 0,
      status: "active",
      blockchainVerified: true
    };

    // Update UI immediately (frontend)
    setBatches(prev => [formattedBatch, ...prev]);

    // Send to backend (persist in MongoDB)
    try {
      const response = await fetch("http://localhost:5000/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedBatch)
      });

      if (!response.ok) throw new Error("Failed to save batch");
      console.log("✅ Batch saved to backend");
    } catch (error) {
      console.error("❌ Failed to save batch to backend:", error);
    }
  }

  async function handleAccept(batchNo) {
    console.log("Accepted batch:", batchNo);

    try {
      const response = await fetch(`http://localhost:5000/api/batches/accept/${batchNo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Accepted" }),
      });

      if (!response.ok) throw new Error("Failed to update batch");

      const updatedBatch = await response.json();

      // Update your React state (so UI refreshes instantly)
      setBatches(prev =>
        prev.map(b => (b.batchNo === batchNo ? updatedBatch : b))
      );

      console.log("✅ Batch marked as accepted and saved to backend");
    } catch (error) {
      console.error("❌ Failed to accept batch:", error);
    }
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
          
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={
                <DashboardPage 
                  batches={batches} 
                  metamask={metamask} 
                  user={auth.user}
                  theme={theme}
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
                  metamask={metamask} 
                  user={auth.user}
                  theme={theme}
                />
              } />
              <Route path="/admin" element={
                <AdminPage 
                  metamask={metamask} 
                  user={auth.user}
                  theme={theme}
                />
              } />
              <Route path="/login" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default MedicheckDashboard;