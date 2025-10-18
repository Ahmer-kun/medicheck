// Medicheck Dashboard (Dark Mode Ready)

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
    expiry: "2025-07-10",
    formulation: "Telmisartan 40mg tablet",
  },
  {
    batchNo: "CFG-2025-003",
    name: "Cefiget 200mg",
    expiry: "2026-05-20",
    formulation: "Cefixime 200mg capsule",
  },
  {
    batchNo: "AMX-2025-004",
    name: "Amoxicillin 500mg",
    expiry: "2025-08-15",
    formulation: "Amoxicillin trihydrate capsule",
  },
  {
    batchNo: "AZT-2025-005",
    name: "Azithro 250mg",
    expiry: "2024-11-20",
    formulation: "Azithromycin 250mg tablet",
  },
  {
    batchNo: "CIP-2025-006",
    name: "Ciproflox 500mg",
    expiry: "2025-12-10",
    formulation: "Ciprofloxacin 500mg tablet",
  },
  {
    batchNo: "MET-2025-007",
    name: "Metformin 500mg",
    expiry: "2025-10-30",
    formulation: "Metformin hydrochloride tablet",
  },
  {
    batchNo: "PARA-2025-008",
    name: "Paracetamol 500mg",
    expiry: "2025-06-12",
    formulation: "Acetaminophen tablet",
  },
  {
    batchNo: "VITC-2025-009",
    name: "Ascoril C",
    expiry: "2026-02-01",
    formulation: "Vitamin C chewable tablet",
  },
  {
    batchNo: "IBU-2025-010",
    name: "Ibugesic Plus",
    expiry: "2024-12-05",
    formulation: "Ibuprofen + Paracetamol tablet",
  },
];

const analyticsData = [
  { name: "Week 1", Registered: 400, Verified: 300, Expired: 50 },
  { name: "Week 2", Registered: 420, Verified: 350, Expired: 60 },
  { name: "Week 3", Registered: 380, Verified: 340, Expired: 70 },
  { name: "Week 4", Registered: 500, Verified: 420, Expired: 80 },
  { name: "Week 5", Registered: 550, Verified: 470, Expired: 90 },
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
  //-----------------SideBar-----------------
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
  //-----------------TopBar-----------------
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
//---------------Card-------------------------
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
        
        {/* Verified Today */}
        <Card title="Verified Today" value={batches.filter(b => {
          const today = new Date().toISOString().slice(0, 10);
          return b.verifiedDate === today;
          }).length} />
        
        {/* Expired */}
        <Card title="Expired" value={batches.filter(b => new Date(b.expiry) < new Date()).length}/>
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
            {/* <tbody>
  {batches.map((b) => {
    let statusColor = "text-gray-400";
    if (b.status === "At Pharmacy") statusColor = "text-green-400";
    else if (b.status === "Expired") statusColor = "text-red-400";
    return (
      <tr
        key={b.batchNo}
        className="border-b border-gray-700 hover:bg-gray-700/40"
      >
        <td className="py-2">{b.batchNo}</td>
        <td className="py-2">{b.name}</td>
        <td className="py-2">{b.expiry}</td>
        <td className="py-2">{b.formulation}</td>
        <td className={`py-2 font-medium ${statusColor}`}>{b.status}</td>
      </tr>
    );
  })}
  
</tbody> */}
        <tbody>
  {batches.map((b) => {
    // Auto-determine status based on expiry date
    const isExpired = new Date(b.expiry) < new Date();
    const status = isExpired ? "Expired" : "At Pharmacy";
    const statusColor = isExpired ? "text-red-400" : "text-green-400";

    return (
      <tr
        key={b.batchNo}
        className="border-b border-gray-700 hover:bg-gray-700/40"
      >
        <td className="py-2">{b.batchNo}</td>
        <td className="py-2">{b.name}</td>
        <td className="py-2">{b.expiry}</td>
        <td className="py-2">{b.formulation}</td>
        <td className={`py-2 font-medium ${statusColor}`}>{status}</td>
      </tr>
    );
  })}
        </tbody>

          </table>
        </div>
      </section>
    </div>
  );
}


//            -----------------Manufacturer---------------
// ----------------- Manufacturer -----------------
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
        {/* Medicine Name */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Medicine Name</label>
          <input
            value={form.medicineName}
            onChange={(e) =>
              setForm({ ...form, medicineName: e.target.value })
            }
            placeholder="e.g. Pantra 40mg"
            className="p-2 border rounded text-gray-700"
          />
        </div>

        {/* Batch Number */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Batch Number</label>
          <input
            value={form.batchNo}
            onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
            placeholder="e.g. PANT-2025-001"
            className="p-2 border rounded text-gray-700"
          />
        </div>

        {/* Manufacture Date */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Manufacture Date</label>
          <input
            type="date"
            value={form.manufactureDate}
            onChange={(e) =>
              setForm({ ...form, manufactureDate: e.target.value })
            }
            className="p-2 border rounded text-gray-700"
          />
        </div>

        {/* Expiry Date */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Expiry Date</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) =>
              setForm({ ...form, expiryDate: e.target.value })
            }
            className="p-2 border rounded text-gray-700"
          />
        </div>

        {/* Formulation */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm text-gray-600 mb-1">Formulation</label>
          <textarea
            value={form.formulation}
            onChange={(e) =>
              setForm({ ...form, formulation: e.target.value })
            }
            placeholder="e.g. Pantoprazole 40mg tablet"
            className="p-2 border rounded text-gray-700"
          />
        </div>

        {/* Quantity */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Quantity</label>
          <input
            type="number"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.valueAsNumber })
            }
            placeholder="e.g. 1000"
            className="p-2 border rounded text-gray-700"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded">
            Register
          </button>
          <button
            type="button"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded border"
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




// ----------------- Pharmacy Page ---------------
function PharmacyPage({ batches, onAccept }) {
  function handleReceive(batchNo) {
    if (typeof onAccept === "function") onAccept(batchNo);
    alert("Received batch: " + String(batchNo));
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Received Batches
      </h3>

      <div className="bg-white p-4 rounded shadow">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b bg-gray-100 text-gray-700">
              <th className="py-2 px-3 font-medium">Batch</th>
              <th className="py-2 px-3 font-medium">Medicine</th>
              <th className="py-2 px-3 font-medium">Expiry</th>
              <th className="py-2 px-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {batches.map((b) => (
              <tr
                key={String(b.batchNo)}
                className="border-b hover:bg-gray-50 text-gray-700 transition"
              >
                <td className="py-2 px-3">{String(b.batchNo)}</td>
                <td className="py-2 px-3">{String(b.name)}</td>
                <td className="py-2 px-3">{String(b.expiry)}</td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => handleReceive(b.batchNo)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                  >
                    Accept
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {batches.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            No batches available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}



// ---------------------------------------Verify-------------------------



function VerifyPage({ batches }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => setResult(null), [batches]);

  // function handleVerify(e) {
  //   e.preventDefault();
  //   const query = input.trim();
  //   if (!query) {
  //     setResult({
  //       authentic: false,
  //       message: "Please enter a batch number or scan a QR.",
  //     });
  //     return;
  //   }

  //   const found = batches.find(
  //     (s) => String(s.batchNo).toLowerCase() === query.toLowerCase()
  //   );

  //   if (found) {
  //     setResult({
  //       authentic: true,
  //       batchNo: found.batchNo,
  //       name: found.name,
  //       formulation: found.formulation,
  //       expiry: found.expiry,
  //     });
  //   } else {
  //     setResult({
  //       authentic: false,
  //       message: "Batch not found on blockchain (mock).",
  //     });
  //   }
  // }


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

  if (!found) {
    setResult({
      authentic: false,
      message: "Batch not found on blockchain (mock).",
    });
    return;
  }

  // Parse expiry date and check if expired
  const today = new Date();
  const expiryDate = new Date(found.expiry);

  if (expiryDate < today) {
    setResult({
      authentic: false,
      message: "This batch is expired. Do not use this medicine.",
      batchNo: found.batchNo,
      name: found.name,
      formulation: found.formulation,
      expiry: found.expiry,
    });
    return;
  }

  // Check for recall or pending verification
  if (found.status === "Recalled") {
    setResult({
      authentic: false,
      message: "This batch has been recalled due to safety concerns.",
      batchNo: found.batchNo,
      name: found.name,
      formulation: found.formulation,
      expiry: found.expiry,
    });
    return;
  }

  if (found.status === "Pending Verification") {
    setResult({
      authentic: false,
      message: "This batch is pending verification. Not yet approved.",
      batchNo: found.batchNo,
      name: found.name,
      formulation: found.formulation,
      expiry: found.expiry,
    });
    return;
  }

  // Passed all checks
  setResult({
    authentic: true,
    message: "This medicine is authentic and safe to use.",
    batchNo: found.batchNo,
    name: found.name,
    formulation: found.formulation,
    expiry: found.expiry,
  });
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
  // Here we Calculate Totals Dynamically
  const totalRegistered = analyticsData.reduce((sum, d) => sum + d.Registered, 0);
  const totalVerified = analyticsData.reduce((sum, d) => sum + d.Verified, 0);
  const totalExpired = analyticsData.reduce((sum, d) => sum + d.Expired, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <h3 className="text-lg font-semibold mb-4">Analytics Overview</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow text-center border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Total Registered</div>
          <div className="text-3xl font-bold text-indigo-600">{totalRegistered}</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Total Verified</div>
          <div className="text-3xl font-bold text-green-600">{totalVerified}</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Total Expired</div>
          <div className="text-3xl font-bold text-red-600">{totalExpired}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <section className="bg-white p-4 rounded-xl shadow border border-gray-100">
          <h4 className="font-medium text-gray-700 mb-3 text-center">
            Weekly Registrations Trend
          </h4>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  tick={{ fontSize: 11 }}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="Registered"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="Verified"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Bar Chart */}
        <section className="bg-white p-4 rounded-xl shadow border border-gray-100">
          <h4 className="font-medium text-gray-700 mb-3 text-center">
            Expired vs Verified (Weekly)
          </h4>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  tick={{ fontSize: 11 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Verified" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expired" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

//--------------------------------------------------------------------

// function AdminPage() {
//   return (
//     <div className="p-6">
//       <h3 className="text-lg font-semibold mb-4">
//         Admin Panel
//       </h3>

//       <div className="bg-white p-4 rounded shadow">
//         <p className="mb-3 text-gray-600">
//           Manage roles, view system logs, and perform recall actions.
//         </p>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <div className="p-3 border rounded text-gray-700 bg-gray-50 hover:bg-gray-100 transition">
//             Roles Management (placeholder)
//           </div>
//           <div className="p-3 border rounded text-gray-700 bg-gray-50 hover:bg-gray-100 transition">
//             Recall Batch (placeholder)
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



//-------------------------ADMIN PAGE-------------------------------

function AdminPage() {
  const [users, setUsers] = useState([
    { id: 1, username: "admin", role: "Administrator" },
    { id: 2, username: "pharma01", role: "Pharmacist" },
    { id: 3, username: "qc_officer", role: "Quality Control" },
  ]);

  const [recallList, setRecallList] = useState([
    { id: 1, batchNo: "BCH102", reason: "Defective packaging", date: "2025-10-17" },
    { id: 2, batchNo: "BCH099", reason: "Expired medicine", date: "2025-10-14" },
  ]);

  const [logs, setLogs] = useState([
    { id: 1, message: "User pharma01 Verified 10 medicines", time: "10:05 AM" },
    { id: 2, message: "Batch BCH099 marked as Expired", time: "09:40 AM" },
    { id: 3, message: "Admin added new batch BCH120", time: "09:15 AM" },
  ]);

  const handleRecallRemove = (id) => {
    setRecallList(recallList.filter((r) => r.id !== id));
    setLogs([
      ...logs,
      {
        id: Date.now(),
        message: `Batch ${id} recall entry removed`,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleRoleChange = (id, newRole) => {
    const updated = users.map((u) =>
      u.id === id ? { ...u, role: newRole } : u
    );
    setUsers(updated);
    setLogs([
      ...logs,
      {
        id: Date.now(),
        message: `User ${id} role updated to ${newRole}`,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="p-6 text-gray-200">
      <h2 className="text-2xl font-semibold mb-4">Admin Panel</h2>

      {/* Section 1 — Role Management */}
      <section className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-3 text-gray-300">User Role Management</h3>
        <table className="min-w-full text-sm text-gray-300">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="py-2 text-left">Username</th>
              <th className="py-2 text-left">Current Role</th>
              <th className="py-2 text-left">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-700 hover:bg-gray-700/40 transition"
              >
                <td className="py-2">{u.username}</td>
                <td className="py-2 text-blue-400">{u.role}</td>
                <td className="py-2">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200"
                  >
                    <option>Administrator</option>
                    <option>Pharmacist</option>
                    <option>Quality Control</option>
                    <option>Viewer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Section 2 — Recall Management */}
      <section className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-3 text-gray-300">Recall Management</h3>
        {recallList.length === 0 ? (
          <p className="text-gray-400 italic">No recalls pending.</p>
        ) : (
          <table className="min-w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="py-2 text-left">Batch No</th>
                <th className="py-2 text-left">Reason</th>
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {recallList.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-700 hover:bg-gray-700/40 transition"
                >
                  <td className="py-2">{r.batchNo}</td>
                  <td className="py-2">{r.reason}</td>
                  <td className="py-2">{r.date}</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleRecallRemove(r.id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Section 3 — System Logs */}
      <section className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-3 text-gray-300">System Activity Logs</h3>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2 border border-gray-700 rounded bg-gray-900/50 flex justify-between"
            >
              <span>{log.message}</span>
              <span className="text-gray-500 text-xs">{log.time}</span>
            </div>
          ))}
        </div>
      </section>
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
