import React, { useState, useEffect } from "react";

function Topbar({ onToggle, metamask, user, theme }) {
  const [blockchainStatus, setBlockchainStatus] = useState({ loading: true });
  
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getUserName = () => {
    return user?.name || user?.username || 'User';
  };

  const getUserInitial = () => {
    const name = user?.name || user?.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getUserRole = () => {
    return user?.role ? user.role.toLowerCase() : 'user';
  };

  // Simple blockchain check - non-intrusive
  useEffect(() => {
    const checkBlockchain = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/blockchain/health');
        if (response.ok) {
          const data = await response.json();
          setBlockchainStatus({ 
            connected: data.blockchain?.isConnected || false,
            loading: false 
          });
        }
      } catch (error) {
        setBlockchainStatus({ connected: false, loading: false });
      }
    };
    
    checkBlockchain();
  }, []);

  // Simple blockchain indicator component
  const BlockchainIndicator = () => {
    if (blockchainStatus.loading) {
      return null; // Don't show anything while loading
    }
    
    const isConnected = blockchainStatus.connected;
    
    return (
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg 
        border bg-white border-gray-200 shadow-sm">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
        <span className="text-xs font-medium text-gray-700">
          {isConnected ? 'Blockchain Online' : 'Blockchain Offline'}
        </span>
      </div>
    );
  };

  // Mobile blockchain indicator (simpler)
  const MobileBlockchainIndicator = () => {
    if (blockchainStatus.loading) return null;
    
    const isConnected = blockchainStatus.connected;
    
    return (
      <div className="sm:hidden flex items-center justify-center mb-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-xs text-gray-600">
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white 
      text-gray-800 shadow-sm border-b border-gray-200`}>
      
      {/* Mobile blockchain indicator */}
      <MobileBlockchainIndicator />
      
      {/* Left Section - UNCHANGED */}
      <div className="flex items-center justify-between md:justify-start gap-4 mb-4 md:mb-0">
        <button
          onClick={onToggle}
          className="hidden md:block p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all transform 
            hover:scale-105 shadow-lg border border-blue-500"
        >
          ☰
        </button>
        <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate">
          Medicheck Portal - {getUserName()}
        </h2>
      </div>
      
      {/* Right Section - UNCHANGED except adding BlockchainIndicator */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Blockchain Indicator (Desktop only) */}
        <BlockchainIndicator />
        
        {/* MetaMask Status - UNCHANGED */}
        {!metamask.isMetaMaskInstalled() ? (
          <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg 
            border border-red-200 w-full sm:w-auto">
            <span className="text-sm text-red-700 truncate">Install MetaMask</span>
          </div>
        ) : metamask.isConnected ? (
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200 
              flex items-center gap-2 w-full sm:w-auto justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="text-sm text-green-700 truncate">{formatAddress(metamask.account)}</span>
            </div>
            <button
              onClick={metamask.disconnect}
              className="bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg 
                text-red-700 text-sm font-semibold transition-all border border-red-200 
                hover:shadow-lg w-full sm:w-auto"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={metamask.connect}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold transition-all 
              transform hover:scale-105 shadow-lg border border-blue-400 
              flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <span>🦊</span>
            <span>Connect MetaMask</span>
          </button>
        )}

        {/* User Info - UNCHANGED */}
        {user && (
          <div className="flex items-center gap-3 border-t border-gray-200 pt-3 sm:border-t-0 sm:pt-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full 
              flex items-center justify-center text-blue-600 font-bold shadow-lg border 
              border-blue-200 flex-shrink-0">
              {getUserInitial()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-800 font-medium truncate text-sm md:text-base">{getUserName()}</div>
              <div className="text-gray-600 text-xs capitalize truncate">{getUserRole()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Topbar;

ABOVE ALII



import React from "react";

// // In Topbar.js or DashboardPage.js
// function BlockchainStatusIndicator() {
//   const [realBlockchainStatus, setRealBlockchainStatus] = useState(null);
  
//   useEffect(() => {
//     checkRealBlockchainStatus();
//   }, []);
  
//   const checkRealBlockchainStatus = async () => {
//     try {
//       const response = await api.get('/api/blockchain/real/health');
//       setRealBlockchainStatus(response.data);
//     } catch (error) {
//       setRealBlockchainStatus({ connected: false });
//     }
//   };
  
//   return (
//     <div className="flex items-center gap-2">
//       {realBlockchainStatus?.connected ? (
//         <div className="flex items-center gap-1">
//           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//           <span className="text-xs">Real Blockchain</span>
//         </div>
//       ) : (
//         <div className="flex items-center gap-1">
//           <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
//           <span className="text-xs">Local Blockchain</span>
//         </div>
//       )}
//     </div>
//   );
// }
function Topbar({ onToggle, metamask, user, theme }) {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getUserName = () => {
    return user?.name || user?.username || 'User';
  };

  const getUserInitial = () => {
    const name = user?.name || user?.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getUserRole = () => {
    return user?.role ? user.role.toLowerCase() : 'user';
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white 
      text-gray-800 shadow-sm border-b border-gray-200`}>
      
      {/* Left Section */}
      <div className="flex items-center justify-between md:justify-start gap-4 mb-4 md:mb-0">
        <button
          onClick={onToggle}
          className="hidden md:block p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all transform 
            hover:scale-105 shadow-lg border border-blue-500"
        >
          ☰
        </button>
        <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate">
          Medicheck Portal - {getUserName()}
        </h2>
      </div>
      
      {/* Right Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* MetaMask Status */}
        {!metamask.isMetaMaskInstalled() ? (
          <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg 
            border border-red-200 w-full sm:w-auto">
            <span className="text-sm text-red-700 truncate">Install MetaMask</span>
          </div>
        ) : metamask.isConnected ? (
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200 
              flex items-center gap-2 w-full sm:w-auto justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="text-sm text-green-700 truncate">{formatAddress(metamask.account)}</span>
            </div>
            <button
              onClick={metamask.disconnect}
              className="bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg 
                text-red-700 text-sm font-semibold transition-all border border-red-200 
                hover:shadow-lg w-full sm:w-auto"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={metamask.connect}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold transition-all 
              transform hover:scale-105 shadow-lg border border-blue-400 
              flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <span>🦊</span>
            <span>Connect MetaMask</span>
          </button>
        )}

        {/* User Info - Show on all screens */}
        {user && (
          <div className="flex items-center gap-3 border-t border-gray-200 pt-3 sm:border-t-0 sm:pt-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full 
              flex items-center justify-center text-blue-600 font-bold shadow-lg border 
              border-blue-200 flex-shrink-0">
              {getUserInitial()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-800 font-medium truncate text-sm md:text-base">{getUserName()}</div>
              <div className="text-gray-600 text-xs capitalize truncate">{getUserRole()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Topbar;

// import React from "react";

// function Topbar({ onToggle, metamask, user, theme }) {
//   const formatAddress = (address) => {
//     if (!address) return '';
//     return `${address.slice(0, 6)}...${address.slice(-4)}`;
//   };

//   // Safe user data accessors
//   const getUserName = () => {
//     return user?.name || user?.username || 'User';
//   };

//   const getUserInitial = () => {
//     const name = user?.name || user?.username || 'U';
//     return name.charAt(0).toUpperCase();
//   };

//   const getUserRole = () => {
//     return user?.role ? user.role.toLowerCase() : 'user';
//   };

//   return (
//     <div className={`flex items-center justify-between p-6 bg-white 
//       text-gray-800 shadow-sm border-b border-gray-200`}>
//       <div className="flex items-center gap-4">
//         <button
//           onClick={onToggle}
//           className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all transform 
//             hover:scale-105 shadow-lg border border-blue-500"
//         >
//           ☰
//         </button>
//         <h2 className="text-xl font-bold text-gray-800">
//           Medicheck Portal - {getUserName()}
//         </h2>
//       </div>
      
//       <div className="flex items-center gap-4">
//         {!metamask.isMetaMaskInstalled() ? (
//           <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg 
//             border border-red-200">
//             <span className="text-sm text-red-700">Install MetaMask</span>
//           </div>
//         ) : metamask.isConnected ? (
//           <div className="flex items-center gap-3">
//             <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200 
//               flex items-center gap-2">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//               <span className="text-sm text-green-700">{formatAddress(metamask.account)}</span>
//             </div>
//             <button
//               onClick={metamask.disconnect}
//               className="bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg 
//                 text-red-700 text-sm font-semibold transition-all border border-red-200 
//                 hover:shadow-lg"
//             >
//               Disconnect
//             </button>
//           </div>
//         ) : (
//           <button
//             onClick={metamask.connect}
//             className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg text-white font-semibold transition-all 
//               transform hover:scale-105 shadow-lg border border-blue-400 
//               flex items-center gap-2"
//           >
//             <span>🦊</span>
//             <span>Connect MetaMask</span>
//           </button>
//         )}

//         {user && (
//           <div className="flex items-center gap-4">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full 
//               flex items-center justify-center text-blue-600 font-bold shadow-lg border 
//               border-blue-200">
//               {getUserInitial()}
//             </div>
//             <div className="text-right">
//               <div className="text-gray-800 font-medium">{getUserName()}</div>
//               <div className="text-gray-600 text-sm capitalize">{getUserRole()}</div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Topbar;








=================
@tailwind base;
@tailwind components;
@tailwind utilities;


/* Existing styles you might have... */

/* ============================================= */
/* VERIFICATION POPUP ANIMATIONS - ADD THIS PART */
/* ============================================= */

/* Verification Popup Animations */
.verification-popup-enter {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

.verification-popup-enter-active {
  opacity: 1;
  transform: scale(1) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.verification-popup-exit {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.verification-popup-exit-active {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

/* Success/Error Icon Animations */
.verification-icon {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse animation for verified status */
.pulse-verified {
  animation: pulseVerified 2s infinite;
}

@keyframes pulseVerified {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
}

/* Shake animation for invalid verification */
.shake-invalid {
  animation: shakeInvalid 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shakeInvalid {
  10%, 90% {
    transform: translateX(-1px);
  }
  20%, 80% {
    transform: translateX(2px);
  }
  30%, 50%, 70% {
    transform: translateX(-3px);
  }
  40%, 60% {
    transform: translateX(3px);
  }
}

/* Floating animation */
.floating {
  animation: floating 3s ease-in-out infinite;
}

@keyframes floating {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Gradient text animation */
.gradient-text {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Loading Spinners */
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner-small.border-white {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Smooth backdrop blur */
.backdrop-blur {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}





=====================
// controllers/pharmacyController.js
import PharmacyMedicine from "../models/PharmacyMedicine.js";
import Batch from "../models/Batch.js";
import BlockchainService from '../services/blockchainService.js';

/* --------------------------------------------
   ➕ Add Medicine to Pharmacy (Store in Both Collections)
-------------------------------------------- */
export const addPharmacyMedicine = async (req, res) => {
  try {
    const {
      name,
      batchNo,
      medicineName,
      manufactureDate,
      expiryDate,
      formulation,
      quantity,
      manufacturer,
      status = 'Active',
      pharmacy = 'Pharmacy'
    } = req.body;

    console.log("📦 Adding pharmacy medicine:", { name, batchNo, medicineName, manufactureDate, expiryDate, formulation, quantity, manufacturer });

    // Check if batch number already exists in either collection
    const [existingBatch, existingPharmacyMedicine] = await Promise.all([
      Batch.findOne({ batchNo }),
      PharmacyMedicine.findOne({ batchNo })
    ]);
    
    if (existingBatch || existingPharmacyMedicine) {
      return res.status(400).json({
        success: false,
        message: "Medicine with this batch number already exists"
      });
    }

    // Create in PharmacyMedicine collection
    const pharmacyMedicine = new PharmacyMedicine({
      name: name.trim(),
      batchNo: batchNo.trim(),
      medicineName: (medicineName || name).trim(),
      manufactureDate: new Date(manufactureDate),
      expiryDate: new Date(expiryDate),
      formulation: formulation.trim(),
      quantity: parseInt(quantity),
      manufacturer: manufacturer.trim(),
      status: status,
      pharmacy: pharmacy.trim(),
      blockchainVerified: false
    });

    // Also create in main Batch collection for consistency and verification
    const batch = new Batch({
      batchNo: batchNo.trim(),
      name: name.trim(),
      medicineName: (medicineName || name).trim(),
      manufactureDate: new Date(manufactureDate),
      expiry: new Date(expiryDate),
      formulation: formulation.trim(),
      manufacturer: manufacturer.trim(),
      pharmacy: pharmacy.trim(),
      quantity: parseInt(quantity),
      status: 'active',
      blockchainVerified: false
    });

    // Save both documents
    await Promise.all([pharmacyMedicine.save(), batch.save()]);

    console.log("✅ Medicine added successfully to both collections:", batchNo);

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: pharmacyMedicine
    });

  } catch (error) {
    console.error("❌ Error adding pharmacy medicine:", error.message);
    res.status(500).json({
      success: false,
      message: "Error adding medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   📋 Get All Pharmacy Medicines
-------------------------------------------- */
export const getPharmacyMedicines = async (req, res) => {
  try {
    const medicines = await PharmacyMedicine.find().sort({ createdAt: -1 });
    
    console.log(`✅ Fetched ${medicines.length} pharmacy medicines`);
    
    res.json({
      success: true,
      data: medicines
    });
  } catch (error) {
    console.error("❌ Error fetching pharmacy medicines:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medicines",
      error: error.message
    });
  }
};

/* --------------------------------------------
   ✏️ Update Pharmacy Medicine Status
-------------------------------------------- */
export const updatePharmacyMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, blockchainVerified } = req.body;

    const updatedMedicine = await PharmacyMedicine.findByIdAndUpdate(
      id,
      { status, blockchainVerified },
      { new: true }
    );

    if (!updatedMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    // Also update in Batch collection if exists
    await Batch.findOneAndUpdate(
      { batchNo: updatedMedicine.batchNo },
      { 
        status: status.toLowerCase(),
        blockchainVerified 
      }
    );

    res.json({
      success: true,
      message: "Medicine updated successfully",
      data: updatedMedicine
    });
  } catch (error) {
    console.error("❌ Error updating pharmacy medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error updating medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   🔍 Verify Pharmacy Medicine
-------------------------------------------- */
export const verifyPharmacyMedicine = async (req, res) => {
  try {
    const { batchNo } = req.params;

    const medicine = await PharmacyMedicine.findOne({ batchNo });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "Medicine not found in pharmacy database"
      });
    }

    const today = new Date();
    const expiryDate = new Date(medicine.expiryDate);
    const isExpired = expiryDate < today;

    res.json({
      success: true,
      exists: true,
      verified: true,
      authentic: !isExpired,
      message: isExpired ? 
        "❌ This batch is expired. Do not use this medicine." : 
        "✅ This medicine is authentic and safe to use.",
      batchNo: medicine.batchNo,
      name: medicine.name,
      medicineName: medicine.medicineName,
      formulation: medicine.formulation,
      expiry: medicine.expiryDate,
      manufacturer: medicine.manufacturer,
      pharmacy: medicine.pharmacy,
      status: isExpired ? 'Expired' : medicine.status,
      source: 'pharmacy',
      blockchainVerified: medicine.blockchainVerified
    });

  } catch (error) {
    console.error("❌ Error verifying pharmacy medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   🧹 Initialize Dummy Pharmacy Medicines (Optional)
-------------------------------------------- */
export const initializePharmacyMedicines = async () => {
  try {
    const count = await PharmacyMedicine.countDocuments();
    if (count > 0) {
      console.log("ℹ️ Pharmacy medicines already exist, skipping initialization.");
      return;
    }

    const dummyPharmacyMedicines = [
    ];

    await PharmacyMedicine.insertMany(dummyPharmacyMedicines);
    
    // Also add to Batch collection
    const batchData = dummyPharmacyMedicines.map(med => ({
      batchNo: med.batchNo,
      name: med.name,
      medicineName: med.medicineName,
      manufactureDate: med.manufactureDate,
      expiry: med.expiryDate,
      formulation: med.formulation,
      manufacturer: med.manufacturer,
      pharmacy: med.pharmacy,
      quantity: med.quantity,
      status: 'active',
      blockchainVerified: med.blockchainVerified
    }));
    
    await Batch.insertMany(batchData);
    
    console.log("✅ Dummy pharmacy medicines initialized successfully.");
  } catch (error) {
    console.error("❌ Error initializing pharmacy medicines:", error.message);
  }
};



//  To not only accept but also verify the authenticity
  



  export const acceptManufacturerBatch = async (req, res) => {
  try {
    const { batchNo, pharmacyCompanyId, acceptedQuantity } = req.body;
    const user = req.user;

    console.log(`🏥 Pharmacy accepting batch ${batchNo} from manufacturer...`);

    // 🔍 STEP 1: FIRST VERIFY THE BATCH IS AUTHENTIC
    console.log(`🔍 Verifying batch ${batchNo} authenticity before acceptance...`);
    
    let verificationResult = null;
    let verificationError = null;

    try {
      verificationResult = await BlockchainService.getMedicineFromBlockchain(batchNo);
      
      if (!verificationResult.exists) {
        return res.status(404).json({
          success: false,
          message: "Batch not found in blockchain system - cannot accept unverified medicine"
        });
      }

      // Check if batch is expired
      const expiryDate = new Date(verificationResult.expiryDate);
      const today = new Date();
      if (expiryDate < today) {
        return res.status(400).json({
          success: false,
          message: "Cannot accept expired medicine batch"
        });
      }

      console.log(`✅ Batch verification successful: ${batchNo} is authentic`);

    } catch (error) {
      verificationError = error.message;
      console.warn("⚠️ Blockchain verification failed:", verificationError);
      
      return res.status(400).json({
        success: false,
        message: "Could not verify batch authenticity - blockchain connection failed",
        error: verificationError
      });
    }

    // 📦 STEP 2: Find the original batch in database (additional check)
    const originalBatch = await Batch.findOne({ batchNo });
    if (!originalBatch) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer batch not found in database"
      });
    }

    // 🏪 STEP 3: Create pharmacy medicine record
    const pharmacyMedicine = new PharmacyMedicine({
      name: originalBatch.name,
      batchNo: originalBatch.batchNo,
      medicineName: originalBatch.medicineName || originalBatch.name,
      manufactureDate: originalBatch.manufactureDate,
      expiryDate: originalBatch.expiry,
      formulation: originalBatch.formulation,
      quantity: parseInt(acceptedQuantity || originalBatch.quantity),
      manufacturer: originalBatch.manufacturer,
      pharmacyCompany: pharmacyCompanyId,
      pharmacyName: user.pharmacyName || 'Unknown Pharmacy',
      status: 'In Stock',
      acceptedFromManufacturer: true,
      acceptanceDate: new Date(),
      blockchainVerified: true, // Now we know it's verified
      verificationData: {
        verifiedAt: new Date(),
        verifiedBy: user.username || 'Pharmacy System',
        blockchainConfirmed: true,
        manufacturer: verificationResult.manufacturer,
        manufactureDate: verificationResult.manufactureDate
      }
    });

    let blockchainTransferResult = null;
    let blockchainTransferError = null;

    // 🔗 STEP 4: Transfer ownership on blockchain (optional but recommended)
    try {
      const pharmacyAddress = user.blockchainAddress || '0x0000000000000000000000000000000000000000';
      
      blockchainTransferResult = await BlockchainService.transferMedicineOnBlockchain(
        batchNo,
        pharmacyAddress,
        "Pharmacy Acceptance"
      );

      // Update pharmacy medicine with transfer info
      pharmacyMedicine.blockchainTransactionHash = blockchainTransferResult.transactionHash;
      pharmacyMedicine.ownershipTransferred = true;
      pharmacyMedicine.transferredAt = new Date();

      console.log(`✅ Batch ${batchNo} ownership transferred to pharmacy on blockchain`);

    } catch (error) {
      blockchainTransferError = error.message;
      console.warn("⚠️ Blockchain transfer failed, but batch is verified:", blockchainTransferError);
      // Continue anyway since verification passed
    }

    await pharmacyMedicine.save();

    // 📝 STEP 5: Update original batch status
    originalBatch.status = 'accepted';
    originalBatch.pharmacy = user.pharmacyName || 'Unknown Pharmacy';
    originalBatch.blockchainVerified = true; // Mark as verified
    await originalBatch.save();

    // 📊 STEP 6: Prepare response
    const response = {
      success: true,
      message: "Batch verified and accepted successfully",
      verification: {
        authentic: true,
        verifiedAt: new Date().toISOString(),
        manufacturer: verificationResult.manufacturer,
        expiry: verificationResult.expiryDate
      },
      data: pharmacyMedicine
    };

    if (blockchainTransferResult) {
      response.blockchainTransfer = {
        success: true,
        transactionHash: blockchainTransferResult.transactionHash
      };
    } else {
      response.warning = "Ownership transfer failed but batch is verified";
      response.blockchainError = blockchainTransferError;
    }

    console.log(`✅ Pharmacy ${user.pharmacyName} successfully accepted verified batch: ${batchNo}`);
    
    res.json(response);

  } catch (error) {
    console.error("❌ Error in batch acceptance process:", error);
    res.status(500).json({
      success: false,
      message: "Error during batch acceptance process",
      error: error.message
    });
  }
};

// /* --------------------------------------------Manually Verify Batch

// Manual verification for existing inventory
export const verifyBatchManually = async (req, res) => {
  try {
    const { batchNo } = req.params;
    const user = req.user;

    console.log(`🔍 Manual verification requested for batch: ${batchNo}`);

    const verificationResult = await BlockchainService.getMedicineFromBlockchain(batchNo);
    
    if (!verificationResult.exists) {
      return res.json({
        success: false,
        verified: false,
        message: "❌ Batch not found in blockchain system - may be counterfeit"
      });
    }

    // Check expiry
    const expiryDate = new Date(verificationResult.expiryDate);
    const today = new Date();
    const isExpired = expiryDate < today;

    res.json({
      success: true,
      verified: true,
      authentic: !isExpired,
      message: isExpired ? 
        "✅ Batch verified but EXPIRED - do not dispense" : 
        "✅ Batch verified and AUTHENTIC",
      data: {
        batchNo: verificationResult.batchNo,
        name: verificationResult.name,
        manufacturer: verificationResult.manufacturer,
        expiryDate: verificationResult.expiryDate,
        verifiedBy: user.username,
        verifiedAt: new Date()
      }
    });

  } catch (error) {
    console.error("❌ Manual verification error:", error);
    res.status(500).json({
      success: false,
      verified: false,
      message: "Verification failed due to system error"
    });
  }
};


export const verifyMedicineOnBlockchain = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const user = req.user;

    console.log(`🔍 Verifying medicine ${medicineId} on blockchain...`);

    const medicine = await PharmacyMedicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    let blockchainResult = null;
    let blockchainError = null;

    // Verify on blockchain
    try {
      blockchainResult = await BlockchainService.verifyMedicineOnBlockchain(medicine.batchNo);

      // Update medicine verification status
      medicine.blockchainVerified = true;
      medicine.verificationTransactionHash = blockchainResult.transactionHash;
      medicine.verifiedAt = new Date();
      medicine.verifiedBy = user.name || 'Unknown Verifier';
      await medicine.save();

      console.log(`✅ Medicine ${medicine.batchNo} verified on blockchain`);

    } catch (error) {
      blockchainError = error.message;
      console.error("❌ Blockchain verification failed:", blockchainError);
    }

    const response = {
      success: true,
      message: blockchainResult ? 
        "Medicine verified on blockchain" : 
        "Medicine verification failed on blockchain",
      data: medicine
    };

    if (blockchainResult) {
      response.blockchain = blockchainResult;
    } else {
      response.error = "Blockchain verification failed";
      response.blockchainError = blockchainError;
    }

    res.json(response);

  } catch (error) {
    console.error("❌ Error verifying medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying medicine",
      error: error.message
    });
  }
};





















# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)













EH BROTHA 


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
          className="p-2 border rounded text-gray-700"
        />
        <input
          value={form.batchNo}
          onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
          placeholder="Batch No"
          className="p-2 border rounded text-gray-700"
        />
        <input
          type="date"
          value={form.manufactureDate}
          onChange={(e) =>
            setForm({ ...form, manufactureDate: e.target.value })
          }
          className="p-2 border rounded text-gray-700"
        />
        <input
          type="date"
          value={form.expiryDate}
          onChange={(e) =>
            setForm({ ...form, expiryDate: e.target.value })
          }
          className="p-2 border rounded text-gray-700"
        />
        <textarea
          value={form.formulation}
          onChange={(e) =>
            setForm({ ...form, formulation: e.target.value })
          }
          placeholder="Formulation"
          className="p-2 border rounded col-span-1 md:col-span-2 text-gray-700"
        />
        <input
          type="number"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.valueAsNumber })
          }
          placeholder="Quantity"
          className="p-2 border rounded text-gray-700"
        />

        <div className="flex items-center gap-3">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded">
            Register
          </button>
          <button
            type="button"
            className="bg-indigo-600 text-white px-4 py-2 rounded"
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


##analytics old

// function AnalyticsPage() {
//   // Calculate totals dynamically
//   const totalRegistered = analyticsData.reduce((sum, d) => sum + d.Registered, 0);
//   const totalVerified = analyticsData.reduce((sum, d) => sum + d.Verified, 0);
//   const totalExpired = analyticsData.reduce((sum, d) => sum + d.Expired, 0);

//   return (
//     <div className="p-6">
//       <h3 className="text-lg font-semibold mb-4">Analytics Overview</h3>

//       {/* Summary cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="bg-white p-4 rounded shadow text-center">
//           <div className="text-sm text-gray-500">Total Registered</div>
//           <div className="text-2xl font-bold text-indigo-600">{totalRegistered}</div>
//         </div>
//         <div className="bg-white p-4 rounded shadow text-center">
//           <div className="text-sm text-gray-500">Total Verified</div>
//           <div className="text-2xl font-bold text-green-600">{totalVerified}</div>
//         </div>
//         <div className="bg-white p-4 rounded shadow text-center">
//           <div className="text-sm text-gray-500">Total Expired</div>
//           <div className="text-2xl font-bold text-red-600">{totalExpired}</div>
//         </div>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <section className="bg-white p-4 rounded shadow">
//           <h4 className="font-medium mb-2">Weekly Registrations Trend</h4>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={analyticsData}>
//               <XAxis dataKey="name" angle={-30} textAnchor="end" />
//               <YAxis />
//               <Tooltip />
//               <Line type="monotone" dataKey="Registered" stroke="#6366F1" strokeWidth={2} />
//               <Line type="monotone" dataKey="Verified" stroke="#10B981" strokeWidth={2} />
//             </LineChart>
//           </ResponsiveContainer>
//         </section>

//         <section className="bg-white p-4 rounded shadow">
//           <h4 className="font-medium mb-2">Expired vs Verified (Weekly)</h4>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={analyticsData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" angle={-30} textAnchor="end" />
//               <YAxis />
//               <Tooltip />
//               <Legend/>
//               <Bar dataKey="Verified" fill="#10B981" />
//               <Bar dataKey="Expired" fill="#EF4444" />
//             </BarChart>
//           </ResponsiveContainer>
//         </section>
//       </div>
//     </div>
//   );
// }



##pharma old 

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











THIS IS FOR PACKAGE.JSON BACKEND




{
  "name": "medicheck-backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.19.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}






//POSTMAN

{
  "batchNo": "TEST-001",
  "name": "Sample Drug",
  "manufactureDate": "2025-01-01",
  "expiry": "2026-01-01",
  "formulation": "Tablet",
  "manufacturer": "Test Pharma",
  "pharmacy": "Test Pharmacy",
  "quantity": 1000,
  "status": "active",
  "blockchainVerified": true
}