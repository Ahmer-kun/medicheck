// import React, { useState } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import BlockchainVisualization from "../components/BlockchainVisualization";
// import ProtectedRoute from "../components/ProtectedRoute";

// function ManufacturerPage({ onRegister, metamask, user, theme }) {
//   const [form, setForm] = useState({
//     medicineName: "",
//     batchNo: "",
//     manufactureDate: "",
//     expiryDate: "",
//     formulation: "",
//     quantity: 0,
//   });
//   const [message, setMessage] = useState(null);

//   async function handleRegister(e) {
//     e.preventDefault();

//     if (!metamask.isConnected) {
//       setMessage({
//         type: "error",
//         text: "Please connect MetaMask to register batches on blockchain.",
//       });
//       return;
//     }

//     if (!form.medicineName || !form.batchNo || !form.manufactureDate) {
//       setMessage({
//         type: "error",
//         text: "Medicine name, batch number, and manufacturing date are required.",
//       });
//       return;
//     }

//     setMessage({ type: "info", text: "🔄 Registering batch on blockchain..." });
    
//     const success = await onRegister({
//       batchNo: form.batchNo,
//       name: form.medicineName,
//       medicineName: form.medicineName,
//       manufactureDate: form.manufactureDate,
//       expiry: form.expiryDate,
//       formulation: form.formulation,
//       manufacturer: user.name,
//       pharmacy: "To be assigned",
//       quantity: form.quantity
//     });

//     if (success) {
//       setMessage({ 
//         type: "success", 
//         text: `✅ Batch registered successfully on blockchain!` 
//       });
//       setForm({
//         medicineName: "",
//         batchNo: "",
//         manufactureDate: "",
//         expiryDate: "",
//         formulation: "",
//         quantity: 0,
//       });
//     } else {
//       setMessage({
//         type: "error",
//         text: "Failed to register batch. Please try again."
//       });
//     }
//   }

//   return (
//     <ProtectedRoute user={user} requiredRole="manufacturer">
//       <BackgroundFix theme={theme}>
//         <div className="p-6 min-h-screen">
//           <div className="mb-6">
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">
//               Manufacturer Dashboard
//             </h1>
//             <p className="text-gray-600">
//               Register new medicine batches on the blockchain network
//             </p>
//           </div>

//           {/* Blockchain Network Visualization */}
//           <BlockchainVisualization />

//           {/* Registration Form */}
//           <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
//             <h3 className="text-2xl font-bold text-gray-800 mb-6">Register New Batch</h3>

//             {!metamask.isConnected && (
//               <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700">
//                 <div className="flex items-center gap-3">
//                   <span className="text-lg">⚠️</span>
//                   <div>
//                     <p className="font-semibold">Connect MetaMask to Register on Blockchain</p>
//                     <p className="text-sm">Your batches will be stored on the blockchain for transparency.</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium text-gray-700 mb-2">Medicine Name</label>
//                 <input
//                   value={form.medicineName}
//                   onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
//                   placeholder="e.g. Pantra 40mg"
//                   className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
//                 />
//               </div>

//               <div className="flex flex-col">
//                 <label className="text-sm font-medium text-gray-700 mb-2">Batch Number</label>
//                 <input
//                   value={form.batchNo}
//                   onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
//                   placeholder="e.g. PANT-2025-001"
//                   className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
//                 />
//               </div>

//               <div className="flex flex-col">
//                 <label className="text-sm font-medium text-gray-700 mb-2">Manufacture Date</label>
//                 <input
//                   type="date"
//                   value={form.manufactureDate}
//                   onChange={(e) => setForm({ ...form, manufactureDate: e.target.value })}
//                   className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
//                 />
//               </div>

//               <div className="flex flex-col">
//                 <label className="text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
//                 <input
//                   type="date"
//                   value={form.expiryDate}
//                   onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
//                   className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
//                 />
//               </div>

//               <div className="flex flex-col md:col-span-2">
//                 <label className="text-sm font-medium text-gray-700 mb-2">Formulation</label>
//                 <textarea
//                   value={form.formulation}
//                   onChange={(e) => setForm({ ...form, formulation: e.target.value })}
//                   placeholder="e.g. Pantoprazole 40mg tablet"
//                   className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition h-24"
//                 />
//               </div>

//               <div className="flex flex-col">
//                 <label className="text-sm font-medium text-gray-700 mb-2">Quantity</label>
//                 <input
//                   type="number"
//                   value={form.quantity}
//                   onChange={(e) => setForm({ ...form, quantity: e.target.valueAsNumber })}
//                   placeholder="e.g. 1000"
//                   className="p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
//                 />
//               </div>

//               <div className="flex items-center gap-4 md:col-span-2">
//                 <button 
//                   type="submit"
//                   className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg font-semibold border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={!metamask.isConnected}
//                 >
//                   {metamask.isConnected ? "Register on Blockchain" : "Connect MetaMask First"}
//                 </button>
//                 <button
//                   type="button"
//                   className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition font-semibold"
//                   onClick={() => setForm({
//                     medicineName: "",
//                     batchNo: "",
//                     manufactureDate: "",
//                     expiryDate: "",
//                     formulation: "",
//                     quantity: 0,
//                   })}
//                 >
//                   Reset Form
//                 </button>
//               </div>
//             </form>

//             {message && (
//               <div
//                 className={`mt-6 p-4 rounded-xl border-2 ${
//                   message.type === "success"
//                     ? "bg-green-50 text-green-700 border-green-200"
//                     : message.type === "error"
//                     ? "bg-red-50 text-red-700 border-red-200"
//                     : "bg-blue-50 text-blue-700 border-blue-200"
//                 }`}
//               >
//                 {message.text}
//               </div>
//             )}
//           </div>
//         </div>
//       </BackgroundFix>
//     </ProtectedRoute>
//   );
// }

// export default ManufacturerPage;






import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import ProtectedRoute from "../components/ProtectedRoute";
import { validateBatch } from "../utils/validation";

function ManufacturerPage({ onRegister, metamask, user, theme }) {
  const [form, setForm] = useState({
    medicineName: "",
    batchNo: "",
    manufactureDate: "",
    expiryDate: "",
    formulation: "",
    quantity: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    
    // Validate form
    const validation = validateBatch({
      ...form,
      manufactureDate: form.manufactureDate,
      expiry: form.expiryDate
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSubmitting(false);
      return;
    }

    if (!metamask.isConnected) {
      setMessage({
        type: "error",
        text: "Please connect MetaMask to register batches on blockchain.",
      });
      setSubmitting(false);
      return;
    }

    setMessage({ type: "info", text: "🔄 Registering batch on blockchain..." });
    
    try {
      const success = await onRegister({
        batchNo: form.batchNo.trim(),
        name: form.medicineName.trim(),
        medicineName: form.medicineName.trim(),
        manufactureDate: form.manufactureDate,
        expiry: form.expiryDate,
        formulation: form.formulation.trim(),
        manufacturer: user.name || "Manufacturer",
        pharmacy: "To be assigned",
        quantity: parseInt(form.quantity)
      });

      if (success) {
        setMessage({ 
          type: "success", 
          text: `✅ Batch "${form.batchNo}" registered successfully on blockchain!` 
        });
        resetForm();
      } else {
        setMessage({
          type: "error",
          text: "Failed to register batch. Please try again."
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error: ${error.message}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      medicineName: "",
      batchNo: "",
      manufactureDate: "",
      expiryDate: "",
      formulation: "",
      quantity: "",
    });
    setErrors({});
    setMessage(null);
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinExpiryDate = () => {
    if (!form.manufactureDate) return getCurrentDate();
    const minDate = new Date(form.manufactureDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split('T')[0];
  };

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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Register New Batch</h3>
              <button
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 transition font-semibold text-sm"
              >
                Clear Form
              </button>
            </div>

            {!metamask.isConnected && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="font-semibold text-yellow-800">Connect MetaMask to Register on Blockchain</p>
                    <p className="text-sm text-yellow-700">Your batches will be stored on the blockchain for transparency.</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medicine Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.medicineName}
                  onChange={(e) => handleInputChange("medicineName", e.target.value)}
                  placeholder="e.g. Pantoprazole 40mg"
                  className={`p-3 rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                    errors.medicineName 
                      ? "border-red-300 bg-red-50 focus:border-red-500" 
                      : "border-gray-200 bg-gray-50 focus:border-blue-500"
                  }`}
                  disabled={submitting}
                />
                {errors.medicineName && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.medicineName}
                  </p>
                )}
              </div>

              {/* Batch Number */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Batch Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.batchNo}
                  onChange={(e) => handleInputChange("batchNo", e.target.value)}
                  placeholder="e.g. PANT-2025-001"
                  className={`p-3 rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                    errors.batchNo 
                      ? "border-red-300 bg-red-50 focus:border-red-500" 
                      : "border-gray-200 bg-gray-50 focus:border-blue-500"
                  }`}
                  disabled={submitting}
                />
                {errors.batchNo && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.batchNo}
                  </p>
                )}
              </div>

              {/* Manufacture Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Manufacture Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.manufactureDate}
                  onChange={(e) => handleInputChange("manufactureDate", e.target.value)}
                  max={getCurrentDate()}
                  className={`p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                    errors.manufactureDate 
                      ? "border-red-300 bg-red-50 focus:border-red-500" 
                      : "border-gray-200 bg-gray-50 focus:border-blue-500"
                  }`}
                  disabled={submitting}
                />
                {errors.manufactureDate && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.manufactureDate}
                  </p>
                )}
              </div>

              {/* Expiry Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  min={getMinExpiryDate()}
                  className={`p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                    errors.expiryDate 
                      ? "border-red-300 bg-red-50 focus:border-red-500" 
                      : "border-gray-200 bg-gray-50 focus:border-blue-500"
                  }`}
                  disabled={submitting}
                />
                {errors.expiryDate && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.expiryDate}
                  </p>
                )}
              </div>

              {/* Formulation */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Formulation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.formulation}
                  onChange={(e) => handleInputChange("formulation", e.target.value)}
                  placeholder="e.g. Pantoprazole Sodium 40mg tablets, film-coated"
                  rows="3"
                  className={`p-3 rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 transition border-2 resize-none ${
                    errors.formulation 
                      ? "border-red-300 bg-red-50 focus:border-red-500" 
                      : "border-gray-200 bg-gray-50 focus:border-blue-500"
                  }`}
                  disabled={submitting}
                />
                {errors.formulation && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.formulation}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  placeholder="e.g. 1000"
                  min="1"
                  max="1000000"
                  step="1"
                  className={`p-3 rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                    errors.quantity 
                      ? "border-red-300 bg-red-50 focus:border-red-500" 
                      : "border-gray-200 bg-gray-50 focus:border-blue-500"
                  }`}
                  disabled={submitting}
                />
                {errors.quantity && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.quantity}
                  </p>
                )}
              </div>

              {/* Manufacturer Info (Read-only) */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={user.name || "Manufacturer"}
                  className="p-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-600"
                  readOnly
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Automatically filled from your account</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:col-span-2 gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    type="submit"
                    disabled={!metamask.isConnected || submitting}

                    // disabled={!submitted}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg font-semibold border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[200px]"
                  >
                    {submitting ? (
                      <>
                        <div className="loading-spinner"></div>
                        Registering...
                      </>
                    ) : (
                      metamask.isConnected ? "Register on Blockchain" : "Connect MetaMask First"
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition font-semibold disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>Fields marked with <span className="text-red-500">*</span> are required.</p>
                </div>
              </div>
            </form>

            {/* Status Messages */}
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
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {message.type === "success" ? "✅" : 
                     message.type === "error" ? "❌" : "🔄"}
                  </span>
                  <span>{message.text}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </BackgroundFix>
    </ProtectedRoute>
  );
}

export default ManufacturerPage;