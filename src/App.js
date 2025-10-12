// Medicheck Dashboard - Fixed + Improved UI (Dark Mode Ready)

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
// import QRCode from "qrcode.react";
import { QRCodeCanvas as QRCode } from "qrcode.react";

// ----------------- Default sample data -----------------
const DEFAULT_BATCHES = [
  {
    batchNo: "PANT-2025-001",
    name: "Pantra 40mg",
    expiry: "2026-06-30",
    formulation: "Pantoprazole 40mg tablet",
  },
  {
    batchNo: "TLD-2025-010",
    name: "Telday 40mg",
    expiry: "2026-07-10",
    formulation: "Telmisartan 40mg tablet",
  },
  {
    batchNo: "CFG-2025-003",
    name: "Cefiget 200mg",
    expiry: "2026-05-20",
    formulation: "Cefixime 200mg capsule",
  },
];

const analyticsData = [
  { name: "Week 1", Registered: 12, Verified: 9, Expired: 1 },
  { name: "Week 2", Registered: 18, Verified: 14, Expired: 2 },
  { name: "Week 3", Registered: 22, Verified: 20, Expired: 0 },
  { name: "Week 4", Registered: 16, Verified: 12, Expired: 1 },
];

// ----------------- Small Components -----------------
function NavLinkItem({ to, label, collapsed }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-2 hover:bg-indigo-700 hover:text-white rounded transition"
    >
      <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-semibold">
        {String(label)[0]}
      </div>
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}

function Sidebar({ collapsed }) {
  return (
    <div
      className={`h-full bg-gray-900 text-gray-200 border-r border-gray-800 shadow-inner ${
        collapsed ? "w-20" : "w-64"
      } p-4 transition-all duration-300`}
    >
      <div className="mb-6">
        <h1
          className={`font-bold ${
            collapsed
              ? "text-2xl text-center text-indigo-400"
              : "text-2xl text-indigo-400"
          }`}
        >
          
          {!collapsed && <span className="text-gray-300"> Medicheck</span>}
        </h1>
        {!collapsed && (
          <p className="text-xs text-gray-500">Blockchain Medicine Tracker</p>
        )}
      </div>
      <nav className="flex flex-col gap-2">
        <NavLinkItem to="/" label="Dashboard" collapsed={collapsed} />
        <NavLinkItem to="/manufacturer" label="Manufacturer" collapsed={collapsed} />
        <NavLinkItem to="/pharmacy" label="Pharmacy" collapsed={collapsed} />
        <NavLinkItem to="/verify" label="Customer Verify" collapsed={collapsed} />
        <NavLinkItem to="/analytics" label="Analytics" collapsed={collapsed} />
        <NavLinkItem to="/admin" label="Admin" collapsed={collapsed} />
      </nav>
    </div>
  );
}

function Topbar({ onToggle }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="p-2 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition"
        >
          ☰
        </button>
        <h2 className="text-lg font-semibold text-gray-100">
          Medicheck Admin Portal
        </h2>
      </div>
      <div className="flex items-center gap-3 text-gray-400">Admin</div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700 flex flex-col">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-bold text-indigo-400">{value}</div>
    </div>
  );
}

// ----------------- Pages -----------------



//            -----------------DASHBOARD---------------
function DashboardPage({ batches }) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card title="Total Batches" value={batches.length} />
        <Card title="Verified Today" value="34" />
        <Card title="Expired" value="6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700">
          <h3 className="font-semibold mb-4 text-gray-300">
            Registration / Verification Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analyticsData}>
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line type="monotone" dataKey="Registered" stroke="#6366F1" />
              <Line type="monotone" dataKey="Verified" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700">
          <h3 className="font-semibold mb-4 text-gray-300">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Registered" fill="#6366F1" />
              <Bar dataKey="Expired" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="mt-6 bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700">
        <h3 className="font-semibold mb-3 text-gray-300">Recent Batches</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="py-2">Batch No</th>
                <th className="py-2">Medicine</th>
                <th className="py-2">Expiry</th>
                <th className="py-2">Formulation</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.batchNo} className="border-b border-gray-700 hover:bg-gray-700/40">
                  <td className="py-2">{b.batchNo}</td>
                  <td className="py-2">{b.name}</td>
                  <td className="py-2">{b.expiry}</td>
                  <td className="py-2">{b.formulation}</td>
                  <td className="py-2 text-green-400 font-medium">At Pharmacy</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


//            -----------------Manufacturer---------------

function ManufacturerPage({ onRegister }) {
  const [form, setForm] = useState({
    medicineName: "",
    batchNo: "",
    manufactureDate: "",
    expiryDate: "",
    formulation: "",
    quantity: 0,
  });
  const [message, setMessage] = useState(null);

  async function handleRegister(e) {
    e.preventDefault();

    // Minimal validation
    if (!form.medicineName || !form.batchNo) {
      setMessage({
        type: "error",
        text: "Medicine name and batch number are required.",
      });
      return;
    }

    // Call parent callback (or API) to register
    if (typeof onRegister === "function")
      onRegister({
        batchNo: form.batchNo,
        name: form.medicineName,
        expiry: form.expiryDate,
        formulation: form.formulation,
      });

    setMessage({ type: "success", text: "Batch registered (mock)." });
    setForm({
      medicineName: "",
      batchNo: "",
      manufactureDate: "",
      expiryDate: "",
      formulation: "",
      quantity: 0,
    });
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Register New Batch</h3>

      <form
        onSubmit={handleRegister}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow"
      >
        <input
          value={form.medicineName}
          onChange={(e) =>
            setForm({ ...form, medicineName: e.target.value })
          }
          placeholder="Medicine Name"
          className="p-2 border rounded"
        />
        <input
          value={form.batchNo}
          onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
          placeholder="Batch No"
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={form.manufactureDate}
          onChange={(e) =>
            setForm({ ...form, manufactureDate: e.target.value })
          }
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={form.expiryDate}
          onChange={(e) =>
            setForm({ ...form, expiryDate: e.target.value })
          }
          className="p-2 border rounded"
        />
        <textarea
          value={form.formulation}
          onChange={(e) =>
            setForm({ ...form, formulation: e.target.value })
          }
          placeholder="Formulation"
          className="p-2 border rounded col-span-1 md:col-span-2"
        />
        <input
          type="number"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.valueAsNumber })
          }
          placeholder="Quantity"
          className="p-2 border rounded"
        />

        <div className="flex items-center gap-3">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded">
            Register
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded border"
            onClick={() =>
              setForm({
                medicineName: "",
                batchNo: "",
                manufactureDate: "",
                expiryDate: "",
                formulation: "",
                quantity: 0,
              })
            }
          >
            Reset
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

//            -----------------Pharmacy Page---------------
function PharmacyPage({ batches, onAccept }) {
  function handleReceive(batchNo) {
    if (typeof onAccept === "function") onAccept(batchNo);
    alert("Received batch: " + String(batchNo));
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Received Batches</h3>
      <div className="bg-white p-4 rounded shadow">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Batch</th>
              <th className="py-2">Medicine</th>
              <th className="py-2">Expiry</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={String(b.batchNo)} className="border-b hover:bg-gray-50">
                <td className="py-2">{String(b.batchNo)}</td>
                <td className="py-2">{String(b.name)}</td>
                <td className="py-2">{String(b.expiry)}</td>
                <td className="py-2">
                  <button
                    onClick={() => handleReceive(b.batchNo)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                  >
                    Accept
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}




// ---------------------------------------Verify-------------------------

function VerifyPage({ batches }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => setResult(null), [batches]);

  function handleVerify(e) {
    e.preventDefault();
    const query = input.trim();
    if (!query) {
      setResult({
        authentic: false,
        message: "Please enter a batch number or scan a QR.",
      });
      return;
    }

    const found = batches.find(
      (s) => String(s.batchNo).toLowerCase() === query.toLowerCase()
    );

    if (found) {
      setResult({
        authentic: true,
        batchNo: found.batchNo,
        name: found.name,
        formulation: found.formulation,
        expiry: found.expiry,
      });
    } else {
      setResult({
        authentic: false,
        message: "Batch not found on blockchain (mock).",
      });
    }
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Customer Verification</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-4 rounded shadow text-gray-800">
          <form onSubmit={handleVerify} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter Batch No or scan QR"
              className="flex-1 p-2 border rounded"
            />
            <button className="px-4 py-2 rounded bg-green-600 text-white">
              Verify
            </button>
          </form>

          {result && (
            <div className="mt-4 p-4 rounded border">
              {result.authentic ? (
                <div>
                  <div className="font-semibold text-green-600">Authentic</div>
                  <div>
                    <strong>Medicine:</strong> {result.name}
                  </div>
                  <div>
                    <strong>Formulation:</strong> {result.formulation}
                  </div>
                  <div>
                    <strong>Expiry:</strong> {result.expiry}
                  </div>
                </div>
              ) : (
                <div className="text-red-600 font-medium">
                  {result.message ||
                    "Not found on blockchain — possibly counterfeit."}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow text-gray-800">
          <h4 className="font-medium mb-2">QR Example</h4>
          <div className="flex flex-col items-center gap-2">
            {batches.length > 0 ? (
              <QRCode
                value={`https://medicheck.example/verify?b=${batches[0].batchNo}`}
                size={140}
              />
            ) : (
              <div className="text-gray-400 text-sm">
                No batches available
              </div>
            )}
            <div className="text-xs text-gray-500">
              Scan this QR to verify a sample batch
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// ----------------- Analytics Page -----------------
function AnalyticsPage() {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white p-4 rounded shadow">
          <h4 className="font-medium mb-2">Monthly Registrations</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analyticsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Registered" stroke="#6366F1" />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h4 className="font-medium mb-2">Expired vs Verified</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Verified" fill="#10B981" />
              <Bar dataKey="Expired" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}

//--------------------------------------------------------------------

function AdminPage() {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Admin Panel</h3>
      <div className="bg-white p-4 rounded shadow">
        <p className="mb-3">
          Manage roles, view system logs, and perform recall actions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 border rounded">Roles Management (placeholder)</div>
          <div className="p-3 border rounded">Recall Batch (placeholder)</div>
        </div>
      </div>
    </div>
  );
}


// ----------------- App wrapper -----------------
export default function MedicheckDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [batches, setBatches] = useState(DEFAULT_BATCHES);

  // Example handlers — in real app connect to backend API
  function handleRegister(newBatch) {
    setBatches((prev) => [
      {
        batchNo: String(newBatch.batchNo),
        name: String(newBatch.name),
        expiry: String(newBatch.expiry),
        formulation: String(newBatch.formulation),
      },
      ...prev,
    ]);
  }

  function handleAccept(batchNo) {
    // Placeholder for accept logic
    console.log("Accepted batch:", batchNo);
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex">
        {/* Sidebar collapsible section */}
        <aside
          className={`transition-all duration-300 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <Sidebar collapsed={collapsed} />
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <Topbar onToggle={() => setCollapsed(!collapsed)} />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<DashboardPage batches={batches} />} />
              <Route
                path="/manufacturer"
                element={<ManufacturerPage onRegister={handleRegister} />}
              />
              <Route
                path="/pharmacy"
                element={
                  <PharmacyPage batches={batches} onAccept={handleAccept} />
                }
              />
              <Route path="/verify" element={<VerifyPage batches={batches} />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}



// //------------------------------------------App-----------------------
// //------------------------------------------App-----------------------
// function App() {
//   const [collapsed, setCollapsed] = useState(false);
//   const [batches, setBatches] = useState(DEFAULT_BATCHES);

//   const handleRegister = (batch) => setBatches((prev) => [...prev, batch]);
//   const handleAccept = (batchNo) => console.log("Batch accepted:", batchNo);

//   return (
//     <Router>
//       <div className="flex h-screen bg-gray-900 text-gray-100">
//         <Sidebar collapsed={collapsed} />
//         <div className="flex-1 flex flex-col">
//           <Topbar onToggle={() => setCollapsed(!collapsed)} />
//           <main className="flex-1 overflow-auto">
//             <Routes>
//               <Route path="/" element={<DashboardPage batches={batches} />} />
//               <Route
//                 path="/manufacturer"
//                 element={<ManufacturerPage onRegister={handleRegister} />}
//               />
//               <Route
//                 path="/pharmacy"
//                 element={<PharmacyPage batches={batches} onAccept={handleAccept} />}
//               />
//               <Route
//                 path="/verify"
//                 element={<VerifyPage batches={batches} />}
//               />

//             <Route
//                 path="/analytics"
//                 element={<AnalyticsPage batches={batches} />}
//               />

//             <Route
//                 path="/admin"
//                 element={<AdminPage batches={batches} />}
//               />
//             </Routes>
            
//           </main>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;