import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import ProtectedRoute from "../components/ProtectedRoute";

function ManufacturerPage({ onRegister, metamask, user, theme }) {
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

    if (!metamask.isConnected) {
      setMessage({
        type: "error",
        text: "Please connect MetaMask to register batches on blockchain.",
      });
      return;
    }

    if (!form.medicineName || !form.batchNo || !form.manufactureDate) {
      setMessage({
        type: "error",
        text: "Medicine name, batch number, and manufacturing date are required.",
      });
      return;
    }

    setMessage({ type: "info", text: "🔄 Registering batch on blockchain..." });
    
    const success = await onRegister({
      batchNo: form.batchNo,
      name: form.medicineName,
      medicineName: form.medicineName,
      manufactureDate: form.manufactureDate,
      expiry: form.expiryDate,
      formulation: form.formulation,
      manufacturer: user.name,
      pharmacy: "To be assigned",
      quantity: form.quantity
    });

    if (success) {
      setMessage({ 
        type: "success", 
        text: `✅ Batch registered successfully on blockchain!` 
      });
      setForm({
        medicineName: "",
        batchNo: "",
        manufactureDate: "",
        expiryDate: "",
        formulation: "",
        quantity: 0,
      });
    } else {
      setMessage({
        type: "error",
        text: "Failed to register batch. Please try again."
      });
    }
  }

  return (
    <ProtectedRoute user={user} requiredRole="manufacturer">
      <BackgroundFix theme={theme}>
        <div className="p-6 min-h-screen">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Manufacturer Dashboard
            </h1>
            <p className="text-gray-600">
              Register new medicine batches on the blockchain network
            </p>
          </div>

          {/* Blockchain Network Visualization */}
          <BlockchainVisualization />

          {/* Registration Form */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Register New Batch</h3>

            {!metamask.isConnected && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700">
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="font-semibold">Connect MetaMask to Register on Blockchain</p>
                    <p className="text-sm">Your batches will be stored on the blockchain for transparency.</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Medicine Name</label>
                <input
                  value={form.medicineName}
                  onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
                  placeholder="e.g. Pantra 40mg"
                  className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                <input
                  value={form.batchNo}
                  onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
                  placeholder="e.g. PANT-2025-001"
                  className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Manufacture Date</label>
                <input
                  type="date"
                  value={form.manufactureDate}
                  onChange={(e) => setForm({ ...form, manufactureDate: e.target.value })}
                  className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2">Formulation</label>
                <textarea
                  value={form.formulation}
                  onChange={(e) => setForm({ ...form, formulation: e.target.value })}
                  placeholder="e.g. Pantoprazole 40mg tablet"
                  className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition h-24"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.valueAsNumber })}
                  placeholder="e.g. 1000"
                  className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              <div className="flex items-center gap-4 md:col-span-2">
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg font-semibold border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!metamask.isConnected}
                >
                  {metamask.isConnected ? "Register on Blockchain" : "Connect MetaMask First"}
                </button>
                <button
                  type="button"
                  className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition font-semibold"
                  onClick={() => setForm({
                    medicineName: "",
                    batchNo: "",
                    manufactureDate: "",
                    expiryDate: "",
                    formulation: "",
                    quantity: 0,
                  })}
                >
                  Reset Form
                </button>
              </div>
            </form>

            {message && (
              <div
                className={`mt-6 p-4 rounded-xl border-2 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : message.type === "error"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </div>
      </BackgroundFix>
    </ProtectedRoute>
  );
}

export default ManufacturerPage;