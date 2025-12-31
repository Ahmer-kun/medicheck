import React, { useState, useEffect } from "react";
import ExcelImportModal from '../components/ExcelImportModal';
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import ProtectedRoute from "../components/ProtectedRoute";
import ResponsiveContainer from "../components/ResponsiveContainer";
import { validateBatch } from "../utils/validation";
import { api } from "../utils/api";

function ManufacturerPage({ onRegister, metamask, user, theme, onRefresh }) {
  const [form, setForm] = useState({
    medicineName: "",
    batchNo: "",
    manufactureDate: "",
    expiryDate: "",
    formulation: "",
    manufacturer: "",
    packSize: "",
    quantity: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [manufacturerCompanies, setManufacturerCompanies] = useState([]);
  const [loadingManufacturers, setLoadingManufacturers] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  const [showRegisterBatchForm, setShowRegisterBatchForm] = useState(false);
  const [manufacturerBatches, setManufacturerBatches] = useState([]);
  const [showAvailableBatches, setShowAvailableBatches] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    licenseNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "Pakistan",
      zipCode: ""
    },
    contactEmail: "",
    phone: "",
    specialties: []
  });
  const [newSpecialty, setNewSpecialty] = useState("");
  const [companyFormErrors, setCompanyFormErrors] = useState({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
 const [loading, setLoading] = useState(false); // <-- Add this for general loading
 const [allBatches, setAllBatches] = useState([]);


  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch manufacturer companies on component mount
  useEffect(() => {
    fetchManufacturerCompanies();
    fetchManufacturerBatches();
  }, []);

  // Check URL parameters for pre-selected manufacturer
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('company');
    if (companyId && manufacturerCompanies.length > 0) {
      const company = manufacturerCompanies.find(c => c._id === companyId);
      if (company) {
        setSelectedCompany(companyId);
        setForm(prev => ({ ...prev, manufacturer: company.companyName }));
      }
    }
  }, [manufacturerCompanies]);

  // Added real-time batch number checking
  useEffect(() => {
  const checkBatchNumber = async () => {
    if (form.batchNo && form.batchNo.length >= 3) {
      try {
        console.log(`🔍 Checking batch number: ${form.batchNo}`);
        const checkResponse = await api.get(`/batches/${form.batchNo}`);
        
        console.log('Batch check response:', checkResponse);
        
        if (checkResponse === null || checkResponse.success === false) {
          // Batch doesn't exist (good!)
          setErrors(prev => ({ ...prev, batchNo: "" }));
        } else if (checkResponse.success === true || checkResponse.data) {
          // Batch exists
          setErrors(prev => ({
            ...prev,
            batchNo: `Batch number "${form.batchNo}" already exists`
          }));
        } else {
          // Unknown response - assume doesn't exist
          setErrors(prev => ({ ...prev, batchNo: "" }));
        }
      } catch (error) {
        console.log("Batch check error (non-critical):", error.message);
        // Don't set error - let user proceed
        setErrors(prev => ({ ...prev, batchNo: "" }));
      }
    }
  };

  const debounceTimer = setTimeout(checkBatchNumber, 500);
  return () => clearTimeout(debounceTimer);
}, [form.batchNo]);


  const handleImportSuccess = (importedData) => {
    fetchManufacturerBatches();
    if (onRefresh) onRefresh();
    console.log('Import successful:', importedData);
  };


  // In ManufacturerPage.js - Update the fetchManufacturerCompanies function:

const fetchManufacturerCompanies = async () => {
  try {
    setLoading(true);
    console.log("🔄 Fetching manufacturer companies with stats...");
    
    const response = await api.get("/manufacturer-companies");
    console.log("📦 Raw API response:", response);
    
    if (response.success) {
      const companiesData = response.data || [];
      console.log("✅ Companies data:", companiesData);
      
      // Get ALL batches once to avoid multiple API calls
      const batchesResponse = await api.get("/batches");
      const allBatches = batchesResponse.success ? batchesResponse.data : [];
      
      // Process each company with filtered batches - FILTER OUT ACCEPTED BATCHES
      const companiesWithStats = companiesData.map(company => {
        // Filter batches by this specific manufacturer AND status is not 'accepted'
        const manufacturerBatches = allBatches.filter(batch => {
          // Make sure we're comparing the same manufacturer
          const batchManufacturer = batch.manufacturer?.trim().toLowerCase();
          const companyName = company.companyName?.trim().toLowerCase();
          
          // Only include batches that are NOT already accepted by pharmacy
          return batchManufacturer === companyName && 
                 batch.status !== 'accepted' && 
                 batch.status !== 'at_pharmacy';
        });
        
        // Calculate stats
        const totalBatches = manufacturerBatches.length;
        const verifiedBatches = manufacturerBatches.filter(b => b.blockchainVerified).length;
        const expiredBatches = manufacturerBatches.filter(b => {
          const expiryDate = new Date(b.expiry || b.expiryDate);
          return expiryDate < new Date();
        }).length;
        const activeBatches = totalBatches - expiredBatches;
        
        return {
          ...company,
          stats: {
            totalBatches,
            verifiedBatches,
            expiredBatches,
            activeBatches
          },
          _batchCount: totalBatches,
          batches: manufacturerBatches // Store filtered batches
        };
      });
      
      setManufacturerCompanies(companiesWithStats);
      console.log("✅ Final processed companies:", companiesWithStats.map(c => ({
        name: c.companyName,
        batches: c.stats.totalBatches,
        availableBatches: c.batches.length
      })));
    } else {
      console.error("❌ API response not successful:", response);
      setManufacturerCompanies([]);
    }
  } catch (error) {
    console.error("❌ Error fetching manufacturer companies:", error);
    alert("❌ Failed to load manufacturer companies. Please try again.");
    setManufacturerCompanies([]);
  } finally {
    setLoading(false);
  }
};

//   const fetchManufacturerCompanies = async () => {
//   try {
//     setLoading(true);
//     console.log("🔄 Fetching manufacturer companies with stats...");
    
//     const response = await api.get("/manufacturer-companies");
//     console.log("📦 Raw API response:", response);
    
//     if (response.success) {
//       const companiesData = response.data || [];
//       console.log("✅ Companies data:", companiesData);
      
//       // Get ALL batches once to avoid multiple API calls
//       const batchesResponse = await api.get("/batches");
//       const allBatches = batchesResponse.success ? batchesResponse.data : [];
      
//       // Process each company with filtered batches - FILTER OUT ACCEPTED BATCHES
//       const companiesWithStats = companiesData.map(company => {
//         // Filter batches by this specific manufacturer AND status is not 'accepted'
//         const manufacturerBatches = allBatches.filter(batch => {
//           // Make sure we're comparing the same manufacturer
//           const batchManufacturer = batch.manufacturer?.trim().toLowerCase();
//           const companyName = company.companyName?.trim().toLowerCase();
          
//           // Only include batches that are NOT already accepted by pharmacy
//           return batchManufacturer === companyName && 
//                  batch.status !== 'accepted' && 
//                  batch.status !== 'at_pharmacy';
//         });
        
//         // Calculate stats
//         const totalBatches = manufacturerBatches.length;
//         const verifiedBatches = manufacturerBatches.filter(b => b.blockchainVerified).length;
//         const expiredBatches = manufacturerBatches.filter(b => {
//           const expiryDate = new Date(b.expiry || b.expiryDate);
//           return expiryDate < new Date();
//         }).length;
//         const activeBatches = totalBatches - expiredBatches;
        
//         return {
//           ...company,
//           stats: {
//             totalBatches,
//             verifiedBatches,
//             expiredBatches,
//             activeBatches
//           },
//           _batchCount: totalBatches,
//           batches: manufacturerBatches // Store filtered batches
//         };
//       });
      
//       setManufacturerCompanies(companiesWithStats);
//       console.log("✅ Final processed companies:", companiesWithStats.map(c => ({
//         name: c.companyName,
//         batches: c.stats.totalBatches,
//         availableBatches: c.batches.length
//       })));
//     } else {
//       console.error("❌ API response not successful:", response);
//       setManufacturerCompanies([]);
//     }
//   } catch (error) {
//     console.error("❌ Error fetching manufacturer companies:", error);
//     alert("❌ Failed to load manufacturer companies. Please try again.");
//     setManufacturerCompanies([]);
//   } finally {
//     setLoading(false);
//   }
// };


  // In ManufacturerPage.js - Replace the fetchManufacturerBatches function with this:


  
const fetchManufacturerBatches = async () => {
  try {
    setLoadingBatches(true);
    console.log("🔄 Fetching manufacturer batches...");
    
    const response = await api.get("/batches");
    if (response.success) {
      // Filter batches: only show batches from this manufacturer that are NOT accepted by pharmacy
      const manufacturerBatches = response.data.filter(batch => {
        const isThisManufacturer = batch.manufacturer?.trim().toLowerCase() === 
                                  getSelectedCompanyName().trim().toLowerCase();
        const isAccepted = batch.status?.toLowerCase() === 'accepted' || 
                          batch.status?.toLowerCase() === 'at_pharmacy';
        
        // Return TRUE for batches from this manufacturer that are NOT accepted by pharmacy
        return isThisManufacturer && !isAccepted;
      });
      
      console.log(`✅ Loaded ${manufacturerBatches.length} manufacturer batches (filtered out accepted ones)`);
      setManufacturerBatches(manufacturerBatches);
    }
  } catch (error) {
    console.error("❌ Error fetching manufacturer batches:", error);
    setManufacturerBatches([]);
  } finally {
    setLoadingBatches(false);
  }
};

//   const fetchManufacturerBatches = async () => {
//   try {
//     setLoadingBatches(true);
//     console.log("🔄 Fetching available manufacturer batches...");
    
//     const response = await api.get("/batches");
//     if (response.success) {
//       // Filter batches for this specific manufacturer that are NOT accepted
//       // AND are not duplicate entries (check for pharmacyCompanyId)
//       const availableBatches = response.data.filter(batch => {
//         const isThisManufacturer = batch.manufacturer?.trim().toLowerCase() === 
//                                   getSelectedCompanyName().trim().toLowerCase();
//         const isAvailable = !['accepted', 'at_pharmacy'].includes(batch.status?.toLowerCase());
//         const notTransferred = !batch.pharmacyCompanyId; // Not linked to pharmacy
//         const isOriginalBatch = batch.source !== 'pharmacy'; // Not from pharmacy collection
        
//         return isThisManufacturer && isAvailable && notTransferred && isOriginalBatch;
//       });
      
//       setManufacturerBatches(availableBatches);
//       console.log(`✅ Loaded ${availableBatches.length} available manufacturer batches`);
//     }
//   } catch (error) {
//     console.error("❌ Error fetching manufacturer batches:", error);
//     setManufacturerBatches([]);
//   } finally {
//     setLoadingBatches(false);
//   }
// };

  const fetchManufacturerMedicines = async (manufacturerName) => {
  try {
    setLoadingBatches(true);
    console.log(`🔄 Fetching medicines for manufacturer: ${manufacturerName}`);
    
    // ✅ Use the new endpoint or filter locally
    const response = await api.get("/batches");
    if (response.success) {
      const filteredBatches = response.data.filter(batch => 
        batch.manufacturer && 
        batch.manufacturer.trim().toLowerCase() === manufacturerName.trim().toLowerCase() &&
        batch.status !== 'accepted' && // ✅ Don't show accepted batches
        batch.status !== 'at_pharmacy'
      );
      
      setManufacturerBatches(filteredBatches);
      console.log(`✅ Loaded ${filteredBatches.length} batches for ${manufacturerName}`);
    }
  } catch (error) {
    console.error(`❌ Error fetching medicines for ${manufacturerName}:`, error);
    setManufacturerBatches([]);
  } finally {
    setLoadingBatches(false);
  }
};

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleCompanyChange = (companyId) => {
    setSelectedCompany(companyId);
    const company = manufacturerCompanies.find(c => c._id === companyId);
    if (company) {
      setForm(prev => ({ ...prev, manufacturer: company.companyName }));
      fetchManufacturerBatches();
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("🔄 Form submitted with DUAL STORAGE requirement...");
  
  setSubmitting(true);
  setMessage(null);

  // Validate form data
  const validationData = {
    batchNo: form.batchNo,
    name: form.medicineName,
    medicineName: form.medicineName,
    manufactureDate: form.manufactureDate,
    expiry: form.expiryDate,
    formulation: form.formulation,
    manufacturer: form.manufacturer,
    quantity: form.quantity,
    packSize: form.packSize
  };
  
  console.log("📋 Validation data:", validationData);
  
  const validation = validateBatch(validationData);
  
  console.log("📋 Validation result:", validation);
  
  if (!validation.isValid) {
    console.log("❌ Validation failed:", validation.errors);
    setErrors(validation.errors);
    setSubmitting(false);
    return;
  }

  try {
    console.log(`🔍 Checking if batch ${form.batchNo} already exists...`);
    
    // Check if batch exists
    const checkResponse = await api.get(`/batches/${form.batchNo}`);
    
    if (checkResponse !== null) {
      if (checkResponse.success === false) {
        // This means batch doesn't exist (404 returns success: false)
        console.log("✅ Batch doesn't exist, proceeding...");
      } else {
        // Batch exists
        setMessage({
          type: "error",
          text: `❌ Batch number "${form.batchNo}" already exists in the system.`
        });
        setSubmitting(false);
        return;
      }
    }
    
    console.log("✅ Batch doesn't exist, proceeding with DUAL storage...");
    setMessage({ type: "info", text: "🔄 Registering batch with DUAL storage..." });

    try {
      const success = await registerBatch({
        batchNo: form.batchNo.trim(),
        name: form.medicineName.trim(),
        medicineName: form.medicineName.trim(),
        manufactureDate: form.manufactureDate,
        expiryDate: form.expiryDate,
        formulation: form.formulation.trim(),
        manufacturer: form.manufacturer,
        pharmacy: "To be assigned",
        quantity: parseInt(form.quantity) || 1,
        packSize: form.packSize.trim()
      });

      if (success) {
        setMessage({ 
          type: "success", 
          text: `✅ Batch "${form.batchNo}" registered successfully in BOTH MongoDB AND Blockchain!` 
        });
        resetForm();
        setShowRegisterBatchForm(false);
        fetchManufacturerBatches();
      } else {
        setMessage({
          type: "error",
          text: "Failed to register batch. Both storage systems must succeed."
        });
      }
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        setMessage({
          type: "error",
          text: `❌ Batch number "${form.batchNo}" already exists.`
        });
      } else if (error.message.includes("Session expired")) {
        setMessage({
          type: "error",
          text: "Your session has expired. Please log in again."
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else if (error.message.includes("Blockchain transaction failed")) {
        setMessage({
          type: "error",
          text: `❌ ${error.message} Please check your blockchain connection and try again.`
        });
      } else {
        setMessage({
          type: "error",
          text: `Error: ${error.message}`
        });
      }
    }
  } catch (error) {
    console.error("❌ Error during batch check:", error);
    setMessage({
      type: "error",
      text: `Error: ${error.message}`
    });
  } finally {
    setSubmitting(false);
  }
};

const registerBatch = async (batchData) => {
  try {
    console.log("🚀 Sending batch data for DUAL storage:", batchData);
    
    // CRITICAL FIX: Format data EXACTLY as backend expects
    const formattedBatchData = {
      batchNo: batchData.batchNo.trim(),
      name: batchData.name.trim(),
      medicineName: batchData.medicineName.trim(),
      manufactureDate: batchData.manufactureDate,
      expiry: batchData.expiryDate, // Backend expects 'expiry' not 'expiryDate'
      formulation: batchData.formulation.trim(),
      manufacturer: batchData.manufacturer.trim(),
      pharmacy: batchData.pharmacy || "To be assigned",
      quantity: parseInt(batchData.quantity) || 1, // Must be a number > 0
      packSize: batchData.packSize || "1X1"
    };

    console.log("📦 Formatted batch data for API:", formattedBatchData);

    const response = await api.post("/batches", formattedBatchData);
    console.log("📨 DUAL STORAGE API Response:", response);
    
    // Check response structure
    if (response.success === true) {
      if (response.storage?.status === "fully_synced") {
        console.log("✅ Batch registered successfully in BOTH systems");
        return true;
      } else if (response.storage?.mongodb === true) {
        console.log("⚠️ Batch saved in database only (blockchain failed)");
        throw new Error("Batch saved in database but blockchain registration failed");
      } else {
        console.log("❌ Unknown response:", response);
        throw new Error(response.message || "Registration failed");
      }
    } else {
      console.log("❌ API returned failure:", response);
      throw new Error(response.message || "Registration failed");
    }
  } catch (error) {
    console.error("❌ DUAL STORAGE API Error:", error);
    
    // Provide specific error messages
    if (error.message.includes('already exists')) {
      throw new Error(`Batch number "${batchData.batchNo}" already exists`);
    } else if (error.message.includes('insufficient funds')) {
      throw new Error('Blockchain transaction failed: Insufficient ETH for gas');
    } else if (error.message.includes('nonce')) {
      throw new Error('Blockchain error: Please try again');
    }
    
    throw error;
  }
};




//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   console.log("🔄 Form submitted, starting validation...");
  
//   setSubmitting(true);
//   setMessage(null);

//   const validationData = {
//     batchNo: form.batchNo,
//     name: form.medicineName,
//     medicineName: form.medicineName,
//     manufactureDate: form.manufactureDate,
//     expiry: form.expiryDate,
//     formulation: form.formulation,
//     manufacturer: form.manufacturer,
//     quantity: form.quantity,
//     packaging: {
//       packSize: form.packSize
//     }
//   };
  
//   console.log("📋 Validation data:", validationData);
  
//   const validation = validateBatch(validationData);
  
//   console.log("📋 Validation result:", validation);
  
//   if (!validation.isValid) {
//     console.log("❌ Validation failed:", validation.errors);
//     setErrors(validation.errors);
//     setSubmitting(false);
//     return;
//   }

//   try {
//     console.log(`🔍 Checking if batch ${form.batchNo} already exists...`);
    
//     const checkResponse = await api.get(`/batches/${form.batchNo}`);
    
//     // Check if batch exists - checkResponse is null if batch doesn't exist
//     if (checkResponse !== null) {
//       // Batch exists (in any format)
//       setMessage({
//         type: "error",
//         text: `❌ Batch number "${form.batchNo}" already exists in the system. Please use a different batch number.`
//       });
//       setSubmitting(false);
//       return;
//     }
    
//     // Batch doesn't exist (checkResponse is null) - good to proceed
//     console.log("✅ Batch doesn't exist, proceeding with registration...");
    
//     setMessage({ type: "info", text: "🔄 Registering batch..." });

//     try {
//       const success = await registerBatch({
//         batchNo: form.batchNo.trim(),
//         name: form.medicineName.trim(),
//         medicineName: form.medicineName.trim(),
//         manufactureDate: form.manufactureDate,
//         expiry: form.expiryDate,
//         formulation: form.formulation.trim(),
//         manufacturer: form.manufacturer,
//         pharmacy: "To be assigned",
//         quantity: parseInt(form.quantity) || 0,
//         packSize: form.packSize.trim()
//       });

//       if (success) {
//         setMessage({ 
//           type: "success", 
//           text: `✅ Batch "${form.batchNo}" registered successfully!` 
//         });
//         resetForm();
//         setShowRegisterBatchForm(false);
//         fetchManufacturerBatches();
//       } else {
//         setMessage({
//           type: "error",
//           text: "Failed to register batch. Please try again."
//         });
//       }
//     } catch (error) {
//       if (error.message.includes('already exists') || error.message.includes('duplicate')) {
//         setMessage({
//           type: "error",
//           text: `❌ Batch number "${form.batchNo}" already exists. Please use a different batch number.`
//         });
//       } else if (error.message.includes("Session expired")) {
//         setMessage({
//           type: "error",
//           text: "Your session has expired. Please log in again."
//         });
//         setTimeout(() => {
//           window.location.href = '/';
//         }, 3000);
//       } else {
//         setMessage({
//           type: "error",
//           text: `Error: ${error.message}`
//         });
//       }
//     }
//   } catch (error) {
//     // This catch block is for the initial batch check
//     console.error("❌ Error during batch check:", error);
//     setMessage({
//       type: "error",
//       text: `Error checking batch: ${error.message}`
//     });
//     setSubmitting(false);
//     return;
//   } finally {
//     setSubmitting(false);
//   }
// };

  // const registerBatch = async (batchData) => {
  //   try {
  //     console.log("🚀 Sending batch data to API:", batchData);
      
  //     const formattedBatchData = {
  //       batchNo: batchData.batchNo.trim(),
  //       name: batchData.name.trim(),
  //       medicineName: batchData.medicineName.trim(),
  //       manufactureDate: batchData.manufactureDate,
  //       expiry: batchData.expiry,
  //       formulation: batchData.formulation.trim(),
  //       manufacturer: batchData.manufacturer.trim(),
  //       pharmacy: batchData.pharmacy || "To be assigned",
  //       quantity: parseInt(batchData.quantity) || 0,
  //       packSize: batchData.packSize || "1X1"
  //     };

  //     console.log("📦 Formatted batch data:", formattedBatchData);

  //     const response = await api.post("/batches", formattedBatchData);
  //     console.log("📨 API Response:", response);
      
  //     if (response.success === true) {
  //       console.log("✅ Batch registered successfully");
  //       return true;
  //     }
  //     else if (response._id || response.batchNo) {
  //       console.log("✅ Batch registered successfully in database");
  //       return true;
  //     }
  //     else if (typeof response === 'object' && response.batchNo) {
  //       console.log("✅ Batch registered successfully (direct object)");
  //       return true;
  //     }
  //     else {
  //       console.log("❌ Unexpected API response format:", response);
  //       throw new Error(response.message || "Failed to register batch - invalid response format");
  //     }
  //   } catch (error) {
  //     console.error("❌ API Error:", error);
  //     console.error("❌ API Error Details:", {
  //       message: error.message,
  //       response: error.response
  //     });
      
  //     throw error;
  //   }
  // };

  const handleDeleteBatch = async (batchId, batchNo) => {
    if (!window.confirm(`Are you sure you want to delete batch "${batchNo}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`🗑️ Deleting batch:`, { batchId, batchNo });
      
      let response;
      
      try {
        response = await api.delete(`/batches/${batchId}`);
      } catch (idError) {
        console.log('Trying with batch number instead...');
        response = await api.delete(`/batches/${batchNo}`);
      }
      
      console.log(`📨 Delete response:`, response);
      
      if (response.success) {
        setManufacturerBatches(prev => {
          const updated = prev.filter(batch => batch._id !== batchId);
          console.log(`🔄 Updated batches count: ${updated.length}`);
          return updated;
        });
        
        if (onRefresh) {
          console.log(`🔄 Refreshing main batches...`);
          await onRefresh();
        }
        
        alert(`✅ Batch "${batchNo}" deleted successfully!`);
      } else {
        throw new Error(response.message || 'Failed to delete batch');
      }
    } catch (error) {
      console.error("❌ Error deleting batch:", error);
      
      if (error.message.includes('not found')) {
        alert(`❌ Batch "${batchNo}" not found. It may have been already deleted.`);
        setManufacturerBatches(prev => prev.filter(batch => batch._id !== batchId));
      } else if (error.message.includes('Resource not found')) {
        try {
          const directResponse = await fetch(`http://localhost:5000/api/batches/${batchId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (directResponse.ok) {
            setManufacturerBatches(prev => prev.filter(batch => batch._id !== batchId));
            alert(`✅ Batch "${batchNo}" deleted successfully!`);
          } else {
            throw new Error(`HTTP ${directResponse.status}`);
          }
        } catch (directError) {
          alert(`❌ Could not delete batch. Please try again.`);
        }
      } else if (error.message.includes('unauthorized') || error.message.includes('permission')) {
        alert(`❌ You don't have permission to delete this batch.`);
      } else {
        alert(`❌ Failed to delete batch: ${error.message}`);
      }
    }
  };

  const handleCompanyInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCompanyForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCompanyForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !companyForm.specialties.includes(newSpecialty.trim())) {
      setCompanyForm(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index) => {
    setCompanyForm(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const companyData = {
        ...companyForm,
        specialties: companyForm.specialties.filter(s => s.trim() !== "")
      };

      console.log("📤 Adding manufacturer company:", companyData);

      const response = await api.post("/manufacturer-companies", companyData);
      
      if (response.success) {
        await fetchManufacturerCompanies();
        resetCompanyForm();
        setShowAddCompanyForm(false);
        alert("✅ Manufacturer company added successfully!");
      }
    } catch (error) {
      console.error("Error adding manufacturer company:", error);
      alert(`❌ Failed to add manufacturer company: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetCompanyForm = () => {
    setCompanyForm({
      companyName: "",
      licenseNumber: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "Pakistan",
        zipCode: ""
      },
      contactEmail: "",
      phone: "",
      specialties: []
    });
    setNewSpecialty("");
    setCompanyFormErrors({});
  };

  const resetForm = () => {
    setForm({
      medicineName: "",
      batchNo: "",
      manufactureDate: "",
      expiryDate: "",
      formulation: "",
      manufacturer: selectedCompany && manufacturerCompanies.length > 0 ? 
        manufacturerCompanies.find(c => c._id === selectedCompany)?.companyName || "" : "",
      packSize: "",
      quantity: ""
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

  const getSelectedCompanyName = () => {
    if (!selectedCompany) return 'Select Manufacturer Company';
    const company = manufacturerCompanies.find(c => c._id === selectedCompany);
    return company ? company.companyName : 'Select Manufacturer Company';
  };

  return (
    <ProtectedRoute user={user} requiredRole="manufacturer">
      <BackgroundFix theme={theme}>
        <ResponsiveContainer>
          <div className="py-4 md:py-6">
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <h1 className="heading-1">Manufacturer Dashboard</h1>
              <p className="text-body">
                Manage your manufacturing company and medicine batches
              </p>
            </div>

            {/* Manufacturer Company Selection */}
            <div className="responsive-card mb-4 md:mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4">
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1">Manufacturer Company</h3>
                  <p className="text-small">Select which manufacturer company you want to manage batches for</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <select
                    value={selectedCompany}
                    onChange={(e) => {
                      const companyId = e.target.value;
                      setSelectedCompany(companyId);
                      
                      const company = manufacturerCompanies.find(c => c._id === companyId);
                      if (company) {
                        setForm(prev => ({ 
                          ...prev, 
                          manufacturer: company.companyName 
                        }));
                        fetchManufacturerMedicines(company.companyName);
                      }
                    }}
                    className="px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white w-full sm:w-auto"
                  >
                    <option value="">Select Manufacturer Company</option>
                    {manufacturerCompanies.map(company => (
                      <option key={company._id} value={company._id}>
                        {company.companyName} ({company.licenseNumber})
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowAddCompanyForm(true)}
                      className="btn-responsive bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 md:gap-2 flex-1 sm:flex-none"
                    >
                      <span className="text-sm">➕</span>
                      <span>Add Manufacturer</span>
                    </button>
                    <button
                      onClick={() => window.location.href = '/manufacturer-dashboard'}
                      className="btn-responsive bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-1 md:gap-2 flex-1 sm:flex-none"
                    >
                      <span className="text-sm">🏭</span>
                      <span>Manage Companies</span>
                    </button>
                    {selectedCompany && (
                      <>
                        <button
                          onClick={() => setShowRegisterBatchForm(true)}
                          className="btn-responsive bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 md:gap-2 flex-1 sm:flex-none"
                        >
                          <span className="text-sm">📦</span>
                          <span>Register Batch</span>
                        </button>
                        <button
                          onClick={() => setShowImportModal(true)}
                          className="btn-responsive bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 md:gap-2 flex-1 sm:flex-none"
                          disabled={!selectedCompany}
                        >
                          <span className="text-sm">📊</span>
                          <span>Import Excel</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {!selectedCompany && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-yellow-600 text-lg md:text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-yellow-800 text-sm md:text-base">No Company Selected</p>
                    <p className="text-yellow-700 text-xs md:text-sm">Please select a manufacturer company to manage batches.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Medicine Inventory Section */}




            {/* Medicine Inventory Section */}
{/* Medicine Inventory Section */}
{/* Medicine Inventory Section */}
{selectedCompany && (
  <div className="responsive-card mb-4 md:mb-6">
    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="heading-3">
            Medicine Inventory - {getSelectedCompanyName()}
          </h2>
          <p className="text-small">
            Showing ONLY manufacturer batches (pharmacy-accepted batches hidden)
          </p>
        </div>
        <div className="mt-1 md:mt-0 text-small bg-white px-2 md:px-3 py-1 rounded-full border">
          {manufacturerBatches.filter(batch => {
            const status = batch.status?.toLowerCase() || '';
            return !status.includes('pharmacy') && status !== 'accepted';
          }).length} manufacturer batches found
          {manufacturerBatches.length > 0 && (
            <span className="ml-1 md:ml-2 text-green-600">
              • Manufacturer: {manufacturerBatches[0]?.manufacturer}
            </span>
          )}
        </div>
      </div>
    </div>
    
    {loadingBatches ? (
      <div className="p-6 md:p-8 text-center">
        <div className="loading-spinner mx-auto mb-3 md:mb-4"></div>
        <p className="text-gray-600">Loading manufacturer inventory...</p>
      </div>
    ) : (
      <div className="table-container">
        <div className="table-container-inner">
          <table className={`min-w-full text-xs md:text-sm ${isMobile ? 'min-w-[800px]' : 'w-full'}`}>
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-3 md:px-6 text-left font-semibold text-gray-500 uppercase">Medicine</th>
                <th className="py-3 px-3 md:px-6 text-left font-semibold text-gray-500 uppercase">Batch Info</th>
                <th className="py-3 px-3 md:px-6 text-left font-semibold text-gray-500 uppercase">Manufacturer</th>
                <th className="py-3 px-3 md:px-6 text-left font-semibold text-gray-500 uppercase">Expiry</th>
                <th className="py-3 px-3 md:px-6 text-left font-semibold text-gray-500 uppercase">Status</th>
                <th className="py-3 px-3 md:px-6 text-left font-semibold text-gray-500 uppercase">Blockchain</th>
                <th className="py-3 px-3 md:px-6 text-left font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* ✅ CORRECT FILTER: Show ONLY manufacturer batches, hide pharmacy-accepted ones */}
              {manufacturerBatches
                .filter(batch => {
                  const status = batch.status?.toLowerCase() || '';
                  // HIDE any batch that's been accepted by pharmacy
                  return !status.includes('pharmacy') && status !== 'accepted';
                })
                .map((batch) => {
                  const isExpired = new Date(batch.expiry) < new Date();
                  const statusColor = isExpired ? 'bg-red-100 text-red-800 border-red-200' :
                    batch.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                    'bg-blue-100 text-blue-800 border-blue-200';
                  
                  const blockchainColor = batch.blockchainVerified ? 
                    'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';

                  return (
                    <tr key={batch._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 md:py-4 px-3 md:px-6">
                        <div className="font-semibold text-gray-900 truncate-1">{batch.name}</div>
                        <div className="text-gray-600 text-xs mt-0.5 truncate-1">{batch.medicineName}</div>
                        <div className="text-gray-400 text-xs mt-0.5 truncate-1">{batch.formulation}</div>
                        {batch.packaging && (
                          <div className="text-gray-500 text-xs mt-0.5 truncate-1">
                            Packaging: {batch.packaging.unitType}
                          </div>
                        )}
                      </td>
                      
                      <td className="py-3 md:py-4 px-3 md:px-6">
                        <div className="text-gray-900 font-mono text-xs bg-gray-100 px-2 py-1 rounded border truncate-1">
                          {batch.batchNo}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          Mfg: {new Date(batch.manufactureDate).toLocaleDateString()}
                        </div>
                      </td>
                      
                      <td className="py-3 md:py-4 px-3 md:px-6">
                        <div className="text-gray-900 font-medium truncate-1">{batch.manufacturer}</div>
                      </td>
                      
                      <td className="py-3 md:py-4 px-3 md:px-6">
                        <div className={`font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                          {new Date(batch.expiry).toLocaleDateString()}
                          {isExpired && (
                            <div className="text-red-500 text-xs font-semibold mt-0.5 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              EXPIRED
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-3 md:py-4 px-3 md:px-6">
                        <span className={`inline-flex px-2 md:px-3 py-0.5 md:py-1 text-xs font-semibold rounded-full border ${statusColor} truncate-1`}>
                          {batch.status === 'manufactured' ? 'Manufactured' : batch.status}
                        </span>
                      </td>
                      
                      <td className="py-3 md:py-4 px-3 md:px-6">
                        <span className={`inline-flex px-2 md:px-3 py-0.5 md:py-1 text-xs font-semibold rounded-full border ${blockchainColor} truncate-1`}>
                          {batch.blockchainVerified ? '✅ Verified' : '❌ Not Verified'}
                        </span>
                      </td>
                      
                      <td className="py-3 md:py-4 px-3 md:px-6">
                        <div className="flex gap-1 md:gap-2">
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteBatch(batch._id, batch.batchNo)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 md:px-3 py-1 md:py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-0.5 md:gap-1"
                              title={`Delete ${batch.name}`}
                            >
                              <span className="text-xs">🗑️</span>
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              
              {manufacturerBatches.filter(batch => {
                const status = batch.status?.toLowerCase() || '';
                return !status.includes('pharmacy') && status !== 'accepted';
              }).length === 0 && (
                <tr>
                  <td colSpan="7" className="py-6 md:py-12 px-3 md:px-6 text-center">
                    <div className="text-gray-400 text-4xl md:text-6xl mb-2 md:mb-4">📦</div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-500 mb-1 md:mb-2">No Manufacturer Batches Found</h3>
                    <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto">
                      No manufacturer batches available for {getSelectedCompanyName()}.<br/>
                      All batches may have been accepted by pharmacies.
                    </p>
                    <button
                      onClick={() => setShowRegisterBatchForm(true)}
                      className="mt-3 md:mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg font-semibold transition-colors text-sm"
                    >
                      Register New Batch
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
)}

            {/* Register Batch Form Modal */}
            {showRegisterBatchForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
                <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-6 w-full max-w-full md:max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-3 md:mb-6">
                    <h3 className="text-lg md:text-2xl font-bold text-gray-800 truncate">Register New Batch</h3>
                    <button
                      onClick={() => {
                        setShowRegisterBatchForm(false);
                        resetForm();
                      }}
                      className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl p-1"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    {/* Medicine Name */}
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Medicine Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.medicineName}
                        onChange={(e) => handleInputChange("medicineName", e.target.value)}
                        placeholder="e.g. Paracetamol 120MG"
                        className={`p-2 md:p-3 rounded-lg md:rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                          errors.name || errors.medicineName
                            ? "border-red-300 bg-red-50 focus:border-red-500" 
                            : "border-gray-200 bg-gray-50 focus:border-blue-500"
                        }`}
                        disabled={submitting || !selectedCompany}
                      />
                      {(errors.name || errors.medicineName) && (
                        <p className="text-red-600 text-xs mt-0.5 md:mt-1 flex items-center gap-0.5 md:gap-1">
                          <span>⚠</span> {errors.name || errors.medicineName}
                        </p>
                      )}
                    </div>

                    {/* Batch Number */}
                    <div className="flex flex-col">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Batch Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.batchNo}
                        onChange={(e) => {
                          handleInputChange("batchNo", e.target.value);
                          if (errors.batchNo && errors.batchNo.includes('already exists')) {
                            setErrors(prev => ({ ...prev, batchNo: "" }));
                          }
                        }}
                        placeholder="e.g. HG69"
                        className={`p-2 md:p-3 rounded-lg md:rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                          errors.batchNo 
                            ? errors.batchNo.includes('already exists')
                              ? "border-red-500 bg-red-50 focus:border-red-500" 
                              : "border-red-300 bg-red-50 focus:border-red-500"
                            : "border-gray-200 bg-gray-50 focus:border-blue-500"
                        }`}
                        disabled={submitting || !selectedCompany}
                      />
                      {errors.batchNo && (
                        <p className={`text-xs mt-0.5 md:mt-1 flex items-center gap-0.5 md:gap-1 ${
                          errors.batchNo.includes('already exists') ? 'text-red-600 font-semibold' : 'text-red-600'
                        }`}>
                          <span>⚠</span> {errors.batchNo}
                          {errors.batchNo.includes('already exists') && (
                            <button 
                              type="button"
                              onClick={() => {
                                const suggested = form.batchNo + "-" + Math.floor(Math.random() * 100);
                                handleInputChange("batchNo", suggested);
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800 text-xs underline"
                            >
                              Suggest alternative
                            </button>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Pack Size */}
                    <div className="flex flex-col">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Pack Size <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.packSize || ""}
                        onChange={(e) => handleInputChange("packSize", e.target.value)}
                        placeholder="e.g. 1X30"
                        className={`p-2 md:p-3 rounded-lg md:rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                          errors.packSize 
                            ? "border-red-300 bg-red-50 focus:border-red-500" 
                            : "border-gray-200 bg-gray-50 focus:border-blue-500"
                        }`}
                        disabled={submitting || !selectedCompany}
                      />
                      {errors.packSize && (
                        <p className="text-red-600 text-xs mt-0.5 md:mt-1 flex items-center gap-0.5 md:gap-1">
                          <span>⚠</span> {errors.packSize}
                        </p>
                      )}
                    </div>

                    {/* Formulation */}
                    <div className="flex flex-col">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Formulation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.formulation}
                        onChange={(e) => handleInputChange("formulation", e.target.value)}
                        placeholder="e.g. Paracetamol"
                        className={`p-2 md:p-3 rounded-lg md:rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                          errors.formulation 
                            ? "border-red-300 bg-red-50 focus:border-red-500" 
                            : "border-gray-200 bg-gray-50 focus:border-blue-500"
                        }`}
                        disabled={submitting || !selectedCompany}
                      />
                      {errors.formulation && (
                        <p className="text-red-600 text-xs mt-0.5 md:mt-1 flex items-center gap-0.5 md:gap-1">
                          <span>⚠</span> {errors.formulation}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="flex flex-col">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Quantity (Units) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={form.quantity || ""}
                        onChange={(e) => handleInputChange("quantity", e.target.value)}
                        placeholder="e.g. 1000"
                        min="1"
                        className={`p-2 md:p-3 rounded-lg md:rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                          errors.quantity 
                            ? "border-red-300 bg-red-50 focus:border-red-500" 
                            : "border-gray-200 bg-gray-50 focus:border-blue-500"
                        }`}
                        disabled={submitting || !selectedCompany}
                      />
                      {errors.quantity && (
                        <p className="text-red-600 text-xs mt-0.5 md:mt-1 flex items-center gap-0.5 md:gap-1">
                          <span>⚠</span> {errors.quantity}
                        </p>
                      )}
                    </div>

                    {/* Manufacturer Selection */}
                    <div className="flex flex-col">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Manufacturer <span className="text-red-500">*</span>
                      </label>
                      {loadingManufacturers ? (
                        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-100 rounded-lg md:rounded-xl">
                          <div className="loading-spinner-small"></div>
                          <span className="text-gray-600 text-xs md:text-sm">Loading manufacturers...</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={form.manufacturer}
                          readOnly
                          className="p-2 md:p-3 rounded-lg md:rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-600 text-xs md:text-sm"
                          placeholder="Select a company first"
                        />
                      )}
                      {errors.manufacturer && (
                        <p className="text-red-600 text-xs mt-0.5 md:mt-1 flex items-center gap-0.5 md:gap-1">
                          <span>⚠</span> {errors.manufacturer}
                        </p>
                      )}
                    </div>

                    {/* Manufacture Date */}
                    <div className="flex flex-col">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Manufacture Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={form.manufactureDate}
                        onChange={(e) => handleInputChange("manufactureDate", e.target.value)}
                        max={getCurrentDate()}
                        className={`p-2 md:p-3 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                          errors.manufactureDate 
                            ? "border-red-300 bg-red-50 focus:border-red-500" 
                            : "border-gray-200 bg-gray-50 focus:border-blue-500"
                        }`}
                        disabled={submitting || !selectedCompany}
                      />
                      {errors.manufactureDate && (
                        <p className="text-red-600 text-xs mt-0.5 md:mt-1 flex items-center gap-0.5 md:gap-1">
                          <span>⚠</span> {errors.manufactureDate}
                        </p>
                      )}
                    </div>

                    {/* Expiry Date */}
                    <div className="flex flex-col">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={form.expiryDate}
                        onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        min={getMinExpiryDate()}
                        className={`p-2 md:p-3 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500/20 transition border-2 ${
                          errors.expiryDate 
                            ? "border-red-300 bg-red-50 focus:border-red-500" 
                            : "border-gray-200 bg-gray-50 focus:border-blue-500"
                        }`}
                        disabled={submitting || !selectedCompany}
                      />
                      {errors.expiryDate && (
                        <p className="text-red-600 text-xs mt-0.5 md:mt-1 flex items-center gap-0.5 md:gap-1">
                          <span>⚠</span> {errors.expiryDate}
                        </p>
                      )}
                    </div>

                    {/* Packaging Summary */}
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Packaging Summary
                      </label>
                      <div className="p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2 block">
                              Pack Size
                            </label>
                            <div className="w-full p-2 md:p-3 rounded-lg md:rounded-xl border-2 border-gray-200 bg-white">
                              <div className="text-gray-800 font-medium text-sm md:text-base">
                                {form.packSize ? (
                                  <span>{form.packSize}</span>
                                ) : (
                                  <span className="text-gray-400 italic text-xs md:text-sm">Not entered yet</span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 md:mt-1">
                              Enter pack size in the field above
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2 block">
                              Total Quantity (Units)
                            </label>
                            <div className="w-full p-2 md:p-3 rounded-lg md:rounded-xl border-2 border-gray-200 bg-white">
                              <div className="text-gray-800 font-medium text-sm md:text-base">
                                {form.quantity ? (
                                  <span>{form.quantity} units</span>
                                ) : (
                                  <span className="text-gray-400 italic text-xs md:text-sm">Not entered yet</span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 md:mt-1">
                              Enter quantity in the field above
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 md:mt-4 p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="text-xs md:text-sm font-semibold text-blue-800 mb-1 md:mb-2">Batch Packaging Summary</h4>
                          <div className="text-xs md:text-sm text-blue-700 space-y-1 md:space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Pack Size:</span>
                              <span className="font-bold bg-blue-100 px-1 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm">
                                {form.packSize || "Not set"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Total Quantity:</span>
                              <span className="font-bold text-sm md:text-lg">
                                {form.quantity ? `${form.quantity} units` : "Not set"}
                              </span>
                            </div>
                            
                            {form.packSize && form.quantity && form.packSize.includes('X') && (
                              <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-blue-200">
                                <div className="text-xs text-blue-600">
                                  <div className="flex justify-between">
                                    <span>Pack size breakdown:</span>
                                    <span className="font-mono text-xs">
                                      {(() => {
                                        const parts = form.packSize.split('X');
                                        if (parts.length === 2) {
                                          const packs = parseInt(parts[0]) || 1;
                                          const perPack = parseInt(parts[1]) || 1;
                                          const totalPacks = Math.ceil(form.quantity / perPack);
                                          return `${totalPacks} packs × ${perPack} units each`;
                                        }
                                        return "Custom format";
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2 md:mt-3 p-1 md:p-2 bg-yellow-50 rounded border border-yellow-200">
                          <p className="text-xs text-yellow-700 flex items-center gap-0.5 md:gap-1">
                            <span className="text-yellow-600">📝</span>
                            Enter Pack Size and Quantity in the main form fields above. This section displays the summary.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:col-span-2 gap-3 md:gap-4">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4">
                        <button 
                          type="submit"
                          disabled={submitting || !selectedCompany}
                          className="flex items-center justify-center gap-1 md:gap-2 bg-blue-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg font-semibold border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {submitting ? (
                            <>
                              <div className="loading-spinner-small md:loading-spinner"></div>
                              <span className="text-xs md:text-sm">Registering...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm md:text-base">📦</span>
                              <span className="text-xs md:text-sm">Register Medicine Batch</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={resetForm}
                          disabled={submitting || !selectedCompany}
                          className="bg-gray-100 text-gray-700 px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition font-semibold disabled:opacity-50"
                        >
                          <span className="text-xs md:text-sm">Reset</span>
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <p>Fields marked with <span className="text-red-500">*</span> are required.</p>
                        <p className="mt-0.5 md:mt-1">
                          Packaging information is entered in the Pack Size and Quantity fields above.
                          The Packaging Summary section displays your entries.
                        </p>
                      </div>
                    </div>
                  </form>

                  {/* Status Messages */}
                  {message && (
  <div
    className={`mt-3 md:mt-6 p-2 md:p-4 rounded-lg md:rounded-xl border-2 ${
      message.type === "success"
        ? "bg-green-50 text-green-700 border-green-200"
        : message.type === "error"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-blue-50 text-blue-700 border-blue-200"
    }`}
  >
    <div className="flex items-center gap-1 md:gap-2">
      <span className="text-base md:text-lg">
        {message.type === "success" ? "✅" : 
         message.type === "error" ? "❌" : "🔄"}
      </span>
      <div>
        <span className="text-xs md:text-sm font-semibold">{message.text}</span>
        {message.details && (
          <div className="text-xs mt-1 opacity-75">
            {message.details}
          </div>
        )}
      </div>
    </div>
  </div>
)}
                </div>
              </div>
            )}

            {/* Add Manufacturer Company Form Modal */}
            {showAddCompanyForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
                <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-6 w-full max-w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-3 md:mb-6">
                    <h3 className="text-lg md:text-2xl font-bold text-gray-800 truncate">Add New Manufacturer</h3>
                    <button
                      onClick={() => {
                        setShowAddCompanyForm(false);
                        resetCompanyForm();
                      }}
                      className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl p-1"
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddCompany} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    {/* Company Name */}
                    <div className="md:col-span-2">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyForm.companyName}
                        onChange={(e) => handleCompanyInputChange("companyName", e.target.value)}
                        className="w-full p-2 md:p-3 border-2 border-gray-200 bg-gray-50 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                        placeholder="e.g. MediLife Labs"
                        required
                      />
                    </div>

                    {/* License Number */}
                    <div>
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        License Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyForm.licenseNumber}
                        onChange={(e) => handleCompanyInputChange("licenseNumber", e.target.value)}
                        className="w-full p-2 md:p-3 border-2 border-gray-200 bg-gray-50 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                        placeholder="e.g. MANU-PK-001"
                        required
                      />
                    </div>

                    {/* Contact Email */}
                    <div>
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Contact Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={companyForm.contactEmail}
                        onChange={(e) => handleCompanyInputChange("contactEmail", e.target.value)}
                        className="w-full p-2 md:p-3 border-2 border-gray-200 bg-gray-50 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                        placeholder="e.g. info@company.com"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={companyForm.phone}
                        onChange={(e) => handleCompanyInputChange("phone", e.target.value)}
                        className="w-full p-2 md:p-3 border-2 border-gray-200 bg-gray-50 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                        placeholder="e.g. +92-21-34567890"
                        required
                      />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Address</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                        <input
                          type="text"
                          placeholder="Street"
                          value={companyForm.address.street}
                          onChange={(e) => handleCompanyInputChange("address.street", e.target.value)}
                          className="p-2 md:p-3 border-2 border-gray-200 bg-gray-50 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={companyForm.address.city}
                          onChange={(e) => handleCompanyInputChange("address.city", e.target.value)}
                          className="p-2 md:p-3 border-2 border-gray-200 bg-gray-50 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={companyForm.address.state}
                          onChange={(e) => handleCompanyInputChange("address.state", e.target.value)}
                          className="p-2 md:p-3 border-2 border-gray-200 bg-gray-50 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                        />
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={companyForm.address.zipCode}
                          onChange={(e) => handleCompanyInputChange("address.zipCode", e.target.value)}
                          className="p-2 md:p-3 border-2 border-gray-200 bg-gray-50 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                        />
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="md:col-span-2">
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Specialties</label>
                      <div className="space-y-1 md:space-y-2">
                        <div className="flex gap-1 md:gap-2">
                          <input
                            type="text"
                            value={newSpecialty}
                            onChange={(e) => setNewSpecialty(e.target.value)}
                            className="flex-1 p-2 md:p-3 border-2 border-gray-200 bg-gray-50 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                            placeholder="Add specialty (e.g., Antibiotics)"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                          />
                          <button
                            type="button"
                            onClick={addSpecialty}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-colors text-xs md:text-sm"
                          >
                            Add
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {companyForm.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-0.5 md:gap-1 bg-blue-100 text-blue-800 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm"
                            >
                              {specialty}
                              <button
                                type="button"
                                onClick={() => removeSpecialty(index)}
                                className="text-blue-600 hover:text-blue-800 text-xs md:text-sm"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 md:gap-4 pt-3 md:pt-6">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 md:gap-3 text-sm md:text-lg disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="loading-spinner-small md:loading-spinner border-white"></div>
                            <span className="text-xs md:text-sm">Adding Company...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-base md:text-xl">🏭</span>
                            <span className="text-xs md:text-sm">Add Manufacturer Company</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCompanyForm(false);
                          resetCompanyForm();
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 md:gap-3 text-sm md:text-lg"
                      >
                        <span className="text-base md:text-xl">❌</span>
                        <span className="text-xs md:text-sm">Cancel</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showImportModal && selectedCompany && (
              <ExcelImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                manufacturerName={getSelectedCompanyName()}
                companyId={selectedCompany}
                onImportSuccess={handleImportSuccess}
              />
            )}
          </div>
        </ResponsiveContainer>
      </BackgroundFix>
    </ProtectedRoute>
  );
}

export default ManufacturerPage;