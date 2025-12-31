import React, { useState, useEffect } from 'react';
import ProtectedRoute from "../components/ProtectedRoute";
import { api } from "../utils/api";
import ResponsiveContainer from "../components/ResponsiveContainer";

const PharmacyPage = ({ batches, onAccept, metamask, user, theme, onRefresh }) => {
  
  const [manufacturerBatches, setManufacturerBatches] = useState([]);
  const [showManufacturerBatches, setShowManufacturerBatches] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyBatchNo, setVerifyBatchNo] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [pharmacyCompanies, setPharmacyCompanies] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [manufacturersLoading, setManufacturersLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    verified: 0
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchPharmacyCompanies();
    fetchMedicines();
    fetchManufacturers();
    fetchManufacturerBatches();
  }, [selectedCompany]);

  // Check URL parameters for pre-selected company
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('company');
    if (companyId) {
      setSelectedCompany(companyId);
    }
  }, []);

  // Update stats when medicines change
  useEffect(() => {
    updateStats();
  }, [medicines, selectedCompany]);

  const fetchPharmacyCompanies = async () => {
    try {
      console.log("🔄 Fetching pharmacy companies...");
      const response = await api.get("/pharmacy-companies");
      if (response.success) {
        setPharmacyCompanies(response.data);
        console.log("✅ Loaded pharmacy companies:", response.data.length);
        
        // Auto-select first company if none selected
        if (response.data.length > 0 && !selectedCompany) {
          setSelectedCompany(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching pharmacy companies:", error);
      alert('Failed to load pharmacy companies. Please check backend connection.');
    }
  };

  const fetchManufacturerBatches = async () => {
    try {
      console.log("🔄 Fetching available manufacturer batches...");
      
      // Use the new endpoint that filters out already accepted batches
      const response = await api.get("/batches/available/manufacturer");
      
      if (response.success) {
        setManufacturerBatches(response.data);
        console.log(`✅ Loaded ${response.data.length} available manufacturer batches`);
        
        // Show stats if available
        if (response.stats) {
          console.log(`📊 Batch Stats: ${response.stats.availableBatches} available, ${response.stats.acceptedBatches} already accepted`);
        }
      } else {
        // Fallback to the old method if new endpoint fails
        console.log("⚠️ Using fallback method to fetch manufacturer batches");
        const fallbackResponse = await api.get("/batches");
        if (fallbackResponse.success) {
          let manufacturerBatches = fallbackResponse.data.filter(batch => 
            batch.source === 'batch' || !batch.source
          );

          // Manual filtering
          const pharmacyMedicinesResponse = await api.get("/pharmacy/medicines");
          if (pharmacyMedicinesResponse.success) {
            const acceptedBatchNumbers = pharmacyMedicinesResponse.data.map(medicine => medicine.batchNo);
            manufacturerBatches = manufacturerBatches.filter(batch => 
              !acceptedBatchNumbers.includes(batch.batchNo)
            );
          }

          setManufacturerBatches(manufacturerBatches);
          console.log(`✅ Loaded ${manufacturerBatches.length} manufacturer batches (fallback method)`);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching manufacturer batches:", error);
      setManufacturerBatches([]);
    }
  };

  const handleAcceptManufacturerBatch = async (batch) => {
  if (!selectedCompany) {
    alert("Please select a pharmacy company first.");
    return;
  }

  try {
    console.log("🏥 Accepting manufacturer batch WITH DUAL STORAGE...");
    
    const response = await api.post("/pharmacy/accept-batch", {
      batchNo: batch.batchNo,
      pharmacyCompanyId: selectedCompany,
      acceptedQuantity: batch.quantity || batch.packaging?.tabletsPerStrip || 100
    });

    console.log("✅ Accept batch response:", response);

    if (response.success) {
      // Check storage status
      if (response.storage?.status === "fully_synced") {
        alert(`✅ Batch "${batch.batchNo}" accepted successfully in BOTH MongoDB AND Blockchain!`);
      } else if (response.storage?.mongodb === true && response.storage?.blockchain === false) {
        alert(`⚠️ Batch "${batch.batchNo}" accepted in database only.\n\nBlockchain update failed: ${response.warning || 'Unknown error'}`);
      } else {
        alert(`✅ Batch "${batch.batchNo}" accepted successfully!`);
      }
      
      await fetchMedicines();
      await fetchManufacturerBatches();
      
    } else {
      throw new Error(response.message || 'Failed to accept batch');
    }
  } catch (error) {
    console.error("❌ Error accepting batch:", error);
    
    if (error.message.includes('already exists')) {
      alert(`❌ This batch is already in your pharmacy inventory.`);
    } else if (error.message.includes('not found')) {
      alert(`❌ Batch not found. Please refresh the page and try again.`);
    } else if (error.message.includes('Both MongoDB and Blockchain')) {
      alert(`❌ ${error.message}`);
    } else {
      alert(`❌ Failed to accept batch: ${error.message}`);
    }
  }
};

  // const handleAcceptManufacturerBatch = async (batch) => {
  //   if (!selectedCompany) {
  //     alert("Please select a pharmacy company first.");
  //     return;
  //   }

  //   try {
  //     console.log("🏥 Accepting manufacturer batch WITH blockchain...", { 
  //       batchNo: batch.batchNo, 
  //       pharmacyCompanyId: selectedCompany,
  //       batchData: batch 
  //     });
      
  //     const response = await api.post("/pharmacy/accept-batch", {
  //       batchNo: batch.batchNo,
  //       pharmacyCompanyId: selectedCompany,
  //       acceptedQuantity: batch.quantity || batch.packaging?.tabletsPerStrip || 100
  //     });

  //     console.log("✅ Accept batch response:", response);

  //     if (response.success) {
  //       // Check blockchain status
  //       if (response.blockchain && response.blockchain.registered) {
  //         alert(`✅ Batch "${batch.batchNo}" accepted successfully!\n\n📊 Blockchain Status: ✅ Registered\n🔗 Transaction: ${response.blockchain.transactionHash.substring(0, 20)}...`);
  //       } else if (response.blockchain && response.blockchain.warning) {
  //         alert(`⚠️ Batch "${batch.batchNo}" accepted locally but blockchain registration failed.\n\n📊 Blockchain Status: ⚠️ Local Only\n📝 Note: ${response.blockchain.warning}`);
  //       } else {
  //         alert(`✅ Batch "${batch.batchNo}" accepted successfully!`);
  //       }
        
  //       await fetchMedicines();
  //       await fetchManufacturerBatches();
  //     } else {
  //       throw new Error(response.message || 'Failed to accept batch');
  //     }
  //   } catch (error) {
  //     console.error("❌ Error accepting batch:", error);
  //     console.error("❌ Error details:", {
  //       message: error.message,
  //       response: error.response
  //     });
      
  //     // Show more detailed error message
  //     if (error.message.includes('already exists')) {
  //       alert(`❌ This batch is already in your pharmacy inventory.`);
  //     } else if (error.message.includes('not found')) {
  //       alert(`❌ Batch not found. Please refresh the page and try again.`);
  //     } else {
  //       alert(`❌ Failed to accept batch: ${error.message}`);
  //     }
  //   }
  // };

  const handleBlockchainSync = async () => {
    try {
      if (!metamask.isConnected) {
        alert('Please connect MetaMask first to sync with blockchain.');
        return;
      }

      const confirmed = window.confirm(
        'This will synchronize all your pharmacy medicines with the blockchain.\n\n' +
        'Note: This may take a few minutes depending on the number of medicines.\n\n' +
        'Do you want to continue?'
      );
      
      if (!confirmed) return;

      // Show loading
      setLoading(true);
      
      // Call blockchain sync endpoint
      const response = await api.post('/pharmacy/synchronize-blockchain');
      
      if (response.success) {
        alert(`✅ Blockchain synchronization completed!\n\n` +
              `✅ Synchronized: ${response.report?.synchronized || 0} medicines\n` +
              `❌ Failed: ${response.report?.failed || 0} medicines`);
        
        // Refresh medicines to show updated blockchain status
        await fetchMedicines();
      } else {
        throw new Error(response.message || 'Sync failed');
      }
    } catch (error) {
      console.error('❌ Blockchain sync error:', error);
      alert(`❌ Blockchain synchronization failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchManufacturers = async () => {
  try {
    setManufacturersLoading(true);
    console.log("🔄 Fetching manufacturer companies from backend...");
    
    // Try the correct endpoint for manufacturer companies
    const response = await api.get("/manufacturer-companies");
    
    if (response.success) {
      setManufacturers(response.data);
      console.log("✅ Loaded manufacturer companies:", response.data.length);
    } else {
      // Try fallback endpoint
      console.log("⚠️ Trying fallback endpoint...");
      const fallbackResponse = await api.get("/manufacturers/list");
      if (fallbackResponse.success) {
        setManufacturers(fallbackResponse.data);
        console.log("✅ Loaded manufacturers (fallback):", fallbackResponse.data.length);
      } else {
        console.warn("⚠️ No manufacturers found, but this might be OK");
        setManufacturers([]);
      }
    }
  } catch (error) {
    console.warn("⚠️ Error fetching manufacturers:", error.message);
    // Don't show error alert here - it's not critical for pharmacy page
    setManufacturers([]);
  } finally {
    setManufacturersLoading(false);
  }
};
 
    
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching medicines...");
      
      let url = "/pharmacy/medicines";
      
      // If a specific pharmacy company is selected, fetch medicines for that company
      if (selectedCompany) {
        url = `/pharmacy/medicines/${selectedCompany}`;
      }
      
      const response = await api.get(url);
      if (response.success) {
        setMedicines(response.data);
        console.log(`✅ Loaded ${response.data.length} pharmacy medicines for ${selectedCompany || 'all pharmacies'}`);
      } else {
        throw new Error(response.message || 'Failed to fetch medicines');
      }
    } catch (error) {
      console.error("❌ Error fetching medicines:", error);
      alert(`Failed to load medicines: ${error.message}`);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = () => {
    const displayedMedicines = getMedicinesForSelectedCompany();
    const newStats = {
      total: displayedMedicines.length,
      active: displayedMedicines.filter(m => m.status === 'Active').length,
      expired: displayedMedicines.filter(m => {
        const expiryDate = new Date(m.expiryDate || m.expiry);
        return expiryDate < new Date();
      }).length,
      verified: displayedMedicines.filter(m => m.blockchainVerified).length
    };
    setStats(newStats);
  };

  const handleDeleteMedicine = async (medicineId, medicineName) => {
    if (!window.confirm(`Are you sure you want to delete "${medicineName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      console.log(`🗑️ Deleting medicine: ${medicineName}`);
      
      const response = await api.delete(`/pharmacy/medicines/${medicineId}`);
      
      if (response.success) {
        await fetchMedicines();
        if (onRefresh) await onRefresh();
        alert(`✅ Medicine "${medicineName}" deleted successfully!`);
      } else {
        throw new Error(response.message || 'Failed to delete medicine');
      }
    } catch (error) {
      console.error("❌ Error deleting medicine:", error);
      alert(`❌ Failed to delete medicine: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const getMedicinesForSelectedCompany = () => {
    if (!selectedCompany) return medicines;
    return medicines.filter(medicine => medicine.pharmacyCompany?._id === selectedCompany);
  };

  const getSelectedCompanyName = () => {
    const company = pharmacyCompanies.find(c => c._id === selectedCompany);
    return company ? company.name : 'All Pharmacies';
  };

  const handleAcceptOnBlockchain = async (medicine) => {
    try {
      console.log('🔗 Accepting on blockchain:', medicine.batchNo);
      
      const response = await api.put(`/pharmacy/medicines/${medicine._id}`, {
        blockchainVerified: true,
        status: 'At Pharmacy'
      });
      
      if (response.success) {
        await fetchMedicines();
        if (onRefresh) await onRefresh();
        alert(`✅ Batch ${medicine.batchNo} accepted on blockchain successfully!`);
      } else {
        throw new Error(response.message || 'Failed to accept batch');
      }
    } catch (error) {
      console.error("❌ Error accepting batch:", error);
      alert(`❌ Failed to accept batch: ${error.message}`);
    }
  };

  const handleVerifyMedicine = async () => {
    if (!verifyBatchNo.trim()) {
      alert('Please enter a batch number');
      return;
    }

    try {
      setVerifying(true);
      console.log(`🔍 Verifying batch: ${verifyBatchNo}`);
      
      const response = await api.get(`/batches/verify/${verifyBatchNo}`);
      
      if (response.exists) {
        if (response.authentic) {
          alert(`✅ ${response.message}\n\nMedicine: ${response.name}\nBatch: ${response.batchNo}\nStatus: ${response.status}\nPharmacy: ${response.pharmacy}\nManufacturer: ${response.manufacturer}`);
        } else {
          alert(`❌ ${response.message}\n\nMedicine: ${response.name}\nBatch: ${response.batchNo}\nManufacturer: ${response.manufacturer}`);
        }
      } else {
        alert('❌ Medicine not found in system. Please check the batch number.');
      }
    } catch (error) {
      console.error("❌ Verification error:", error);
      alert('❌ Error verifying medicine. Please try again.');
    } finally {
      setVerifying(false);
      setShowVerifyModal(false);
      setVerifyBatchNo('');
    }
  };

  const refreshAllData = async () => {
    await Promise.all([
      fetchPharmacyCompanies(),
      fetchMedicines(), // This will now fetch filtered data if company is selected
      fetchManufacturers(),
      fetchManufacturerBatches()
    ]);
    alert('✅ Data refreshed successfully!');
  };

  const displayedMedicines = getMedicinesForSelectedCompany();
  const showAllPharmacies = !selectedCompany;

  return (
    <ProtectedRoute user={user} requiredRole="pharmacy">
      <ResponsiveContainer>
        <div className="py-4 md:py-6">
          {/* Header Section */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">Medicine Management</h1>
            <p className="text-gray-600 text-sm md:text-base">Manage medicines and verify authenticity using blockchain technology</p>
          </div>

          {/* Pharmacy Company Selection */}
          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm mb-4 md:mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4">
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1">Pharmacy Company</h3>
                <p className="text-gray-600 text-xs md:text-sm">Select which pharmacy you want to manage medicines for</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-auto bg-white"
                >
                  <option value="">All Pharmacies</option>
                  {pharmacyCompanies.map(company => (
                    <option key={company._id} value={company._id}>
                      {company.name} ({company.licenseNumber})
                    </option>
                  ))}
                </select>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => window.location.href = '/pharmacy-dashboard'}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1 md:gap-2 text-xs md:text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="text-base md:text-lg">🏪</span>
                    Add Pharmacy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Status Section */}
          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1">Blockchain Integration Status</h3>
                <p className="text-gray-600 text-xs md:text-sm">
                  Track blockchain verification for your pharmacy medicines
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                  metamask.isConnected 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {metamask.isConnected ? '🔗 Connected' : '⚠️ Disconnected'}
                </div>
                <button
                  onClick={() => {
                    // Optional: Force blockchain sync for all medicines
                    handleBlockchainSync();
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                >
                  <span className="text-base md:text-lg">🔄</span>
                  Sync Blockchain
                </button>
              </div>
            </div>
            
            {/* Blockchain Stats */}
            <div className="mt-3 md:mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
                <div className="text-lg md:text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs md:text-sm text-gray-600">Total Medicines</div>
              </div>
              
              <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200">
                <div className="text-lg md:text-2xl font-bold text-green-600">{stats.verified}</div>
                <div className="text-xs md:text-sm text-green-700">Blockchain Verified</div>
                <div className="text-xs text-green-600 mt-1">
                  {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% coverage
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 md:p-4 rounded-lg border border-yellow-200">
                <div className="text-lg md:text-2xl font-bold text-yellow-600">{stats.total - stats.verified}</div>
                <div className="text-xs md:text-sm text-yellow-700">Pending Verification</div>
              </div>
              
              <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200">
                <div className="text-lg md:text-2xl font-bold text-blue-600">{manufacturerBatches.length}</div>
                <div className="text-xs md:text-sm text-blue-700">Available Batches</div>
                <div className="text-xs text-blue-600 mt-1">Ready for acceptance</div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4 mb-4 md:mb-6">
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 lg:p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-1">Total Medicines</h3>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="text-lg md:text-xl lg:text-2xl text-blue-500">💊</div>
              </div>
              <p className="text-xs text-gray-500 mt-1 md:mt-2 truncate">{getSelectedCompanyName()}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 lg:p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-1">Active</h3>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">{stats.active}</p>
                </div>
                <div className="text-lg md:text-xl lg:text-2xl text-green-500">✅</div>
              </div>
              <p className="text-xs text-gray-500 mt-1 md:mt-2">Ready for distribution</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 lg:p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-1">Verified</h3>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">{stats.verified}</p>
                </div>
                <div className="text-lg md:text-xl lg:text-2xl text-yellow-500">🔒</div>
              </div>
              <p className="text-xs text-gray-500 mt-1 md:mt-2">On blockchain</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 lg:p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-1">Expired</h3>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">{stats.expired}</p>
                </div>
                <div className="text-lg md:text-xl lg:text-2xl text-red-500">❌</div>
              </div>
              <p className="text-xs text-gray-500 mt-1 md:mt-2">Needs attention</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
            <button
              onClick={() => setShowVerifyModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 lg:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-1 md:gap-2 text-xs md:text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="text-base md:text-lg">🔍</span>
              Verify Medicine
            </button>
            
            <button
              onClick={refreshAllData}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 md:px-4 lg:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-1 md:gap-2 text-xs md:text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="text-base md:text-lg">🔄</span>
              Refresh Data
            </button>

            {metamask.isConnected ? (
              <div className="bg-green-100 border border-green-300 text-green-700 px-3 md:px-4 py-2 md:py-3 rounded-xl flex items-center gap-1 md:gap-2">
                <span className="text-base md:text-lg">🔗</span>
                <span className="font-semibold text-xs md:text-sm">Blockchain Connected</span>
              </div>
            ) : (
              <button
                onClick={metamask.connect}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 md:px-4 lg:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-1 md:gap-2 text-xs md:text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-base md:text-lg">🦊</span>
                Connect MetaMask
              </button>
            )}
          </div>

          {/* Manufacturer Batches Available Section */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden border border-gray-200 mb-4 md:mb-6">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Manufacturer Batches Available</h2>
                  <p className="text-gray-600 text-xs md:text-sm mt-1">
                    Accept manufacturer batches into your pharmacy inventory
                    <span className="ml-1 md:ml-2 text-green-600 font-semibold">
                      ({manufacturerBatches.length} available)
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => setShowManufacturerBatches(!showManufacturerBatches)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-1 md:py-2 rounded-lg font-semibold transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                  >
                    {showManufacturerBatches ? '👇 Hide' : '👆 Show'} Available
                    <span className="bg-blue-600 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs">
                      {manufacturerBatches.length}
                    </span>
                  </button>
                  <button
                    onClick={fetchManufacturerBatches}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 md:px-4 py-1 md:py-2 rounded-lg font-semibold transition-colors text-xs md:text-sm"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>

            {showManufacturerBatches && (
              <div className="p-4 md:p-6">
                {manufacturerBatches.length === 0 ? (
                  <div className="text-center py-4 md:py-8 text-gray-500">
                    <div className="text-3xl md:text-4xl mb-2 md:mb-4">📦</div>
                    <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">No Manufacturer Batches Available</h3>
                    <p className="text-sm">All manufacturer batches have been accepted into pharmacy inventory.</p>
                    <p className="text-xs md:text-sm mt-1 md:mt-2">Manufacturers need to register new batches first.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <div className="min-w-full inline-block align-middle">
                      <div className="overflow-hidden">
                        <table className="min-w-full text-xs md:text-sm">
                          <thead>
                            <tr>
                              <th className="py-2 md:py-3 px-2 md:px-4 text-left font-semibold text-gray-500 uppercase">Medicine</th>
                              <th className="py-2 md:py-3 px-2 md:px-4 text-left font-semibold text-gray-500 uppercase">Batch No</th>
                              <th className="py-2 md:py-3 px-2 md:px-4 text-left font-semibold text-gray-500 uppercase hidden sm:table-cell">Manufacturer</th>
                              <th className="py-2 md:py-3 px-2 md:px-4 text-left font-semibold text-gray-500 uppercase hidden md:table-cell">Manufacture Date</th>
                              <th className="py-2 md:py-3 px-2 md:px-4 text-left font-semibold text-gray-500 uppercase">Expiry</th>
                              <th className="py-2 md:py-3 px-2 md:px-4 text-left font-semibold text-gray-500 uppercase">Status</th>
                              <th className="py-2 md:py-3 px-2 md:px-4 text-left font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {manufacturerBatches.map((batch) => {
                              const isExpired = new Date(batch.expiry) < new Date();
                              return (
                                <tr key={batch._id} className="hover:bg-gray-50">
                                  <td className="py-2 md:py-3 px-2 md:px-4">
                                    <div className="font-semibold text-gray-900 truncate max-w-[120px]">{batch.name}</div>
                                    <div className="text-gray-500 text-xs truncate max-w-[120px]">{batch.formulation}</div>
                                    {batch.packaging && (
                                      <div className="text-gray-500 text-xs mt-1 hidden md:block">
                                        Packaging: {batch.packaging.packSize || 'Standard'}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-4">
                                    <div className="font-mono text-xs bg-gray-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                                      {batch.batchNo}
                                    </div>
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-4 text-gray-700 hidden sm:table-cell truncate max-w-[100px]">
                                    {batch.manufacturer}
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-4 text-gray-700 hidden md:table-cell">
                                    {new Date(batch.manufactureDate).toLocaleDateString()}
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-4">
                                    <div className={`font-semibold text-xs ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                                      {new Date(batch.expiry).toLocaleDateString()}
                                      {isExpired && <div className="text-red-500 text-xs">Expired</div>}
                                    </div>
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-4">
                                    <span className="inline-flex px-1.5 md:px-2 py-0.5 md:py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                      ✅ Available
                                    </span>
                                    {batch.blockchainVerified && (
                                      <div className="text-xs text-green-600 mt-1 hidden md:block">
                                        🔗 Blockchain Verified
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-2 md:py-3 px-2 md:px-4">
                                    <button
                                      onClick={() => handleAcceptManufacturerBatch(batch)}
                                      disabled={!selectedCompany || isExpired}
                                      className="bg-green-500 hover:bg-green-600 text-white px-2 md:px-3 py-1 md:py-2 rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                                    >
                                      <span>➕</span>
                                      <span className="hidden sm:inline">Add to Pharmacy</span>
                                      <span className="sm:hidden">Add</span>
                                    </button>
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
              </div>
            )}
          </div>

          {/* Status Messages */}
          {!selectedCompany && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-yellow-600 text-lg md:text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-yellow-800 text-sm md:text-base">All Pharmacies View</p>
                  <p className="text-yellow-700 text-xs md:text-sm">You are viewing medicines from all pharmacy companies. Select a specific pharmacy to manage medicines.</p>
                </div>
              </div>
            </div>
          )}

          {manufacturers.length === 0 && !manufacturersLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-red-600 text-lg md:text-xl">❌</span>
                <div>
                  <p className="font-semibold text-red-800 text-sm md:text-base">No Manufacturers Available</p>
                  <p className="text-red-700 text-xs md:text-sm">
                    Please make sure the backend is running and manufacturers are initialized.
                    Contact administrator to add manufacturers to the system.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Medicines Table */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Medicines Inventory</h2>
                  <p className="text-gray-600 text-xs md:text-sm mt-1">
                    {selectedCompany 
                      ? `Showing medicines for ${getSelectedCompanyName()}` 
                      : 'Showing all medicines across all pharmacies'
                    }
                  </p>
                </div>
                <div className="mt-1 md:mt-0 text-xs md:text-sm text-gray-500 bg-white px-2 md:px-3 py-1 rounded-full border">
                  {displayedMedicines.length} medicines found
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-6 md:p-8 text-center">
                <div className="loading-spinner mx-auto mb-2 md:mb-4"></div>
                <p className="text-gray-600 text-sm md:text-base">Loading medicines inventory...</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className={`min-w-full text-xs md:text-sm ${showAllPharmacies ? 'min-w-[800px] md:min-w-[1000px]' : 'min-w-[700px] md:min-w-[900px]'}`}>
                      <thead>
                        <tr>
                          <th className="py-2 md:py-3 px-2 md:px-3 text-left font-semibold text-gray-500 uppercase tracking-wider">
                            Medicine Details
                          </th>
                          {showAllPharmacies && (
                            <th className="py-2 md:py-3 px-2 md:px-3 text-left font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                              Pharmacy
                            </th>
                          )}
                          <th className="py-2 md:py-3 px-2 md:px-3 text-left font-semibold text-gray-500 uppercase tracking-wider">
                            Batch Info
                          </th>
                          <th className="py-2 md:py-3 px-2 md:px-3 text-left font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Manufacturer
                          </th>
                          <th className="py-2 md:py-3 px-2 md:px-3 text-left font-semibold text-gray-500 uppercase tracking-wider">
                            Expiry
                          </th>
                          <th className="py-2 md:py-3 px-2 md:px-3 text-left font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="py-2 md:py-3 px-2 md:px-3 text-left font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Blockchain
                          </th>
                          <th className="py-2 md:py-3 px-2 md:px-3 text-left font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {displayedMedicines.map((medicine) => {
                          const isExpired = new Date(medicine.expiryDate || medicine.expiry) < new Date();
                          const statusColor = isExpired ? 'bg-red-100 text-red-800 border-red-200' :
                            medicine.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
                            medicine.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-blue-100 text-blue-800 border-blue-200';
                          
                          const blockchainColor = medicine.blockchainVerified ? 
                            'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';

                          return (
                            <tr key={medicine._id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <div className="font-semibold text-gray-900 truncate max-w-[120px]">{medicine.name}</div>
                                <div className="text-gray-600 text-xs truncate max-w-[120px]">{medicine.medicineName}</div>
                                <div className="text-gray-400 text-xs truncate max-w-[120px]">{medicine.formulation}</div>
                                <div className="text-gray-500 text-xs truncate max-w-[120px]">Qty: {medicine.quantity}</div>
                              </td>
                              
                              {showAllPharmacies && (
                                <td className="py-2 md:py-3 px-2 md:px-3 hidden md:table-cell">
                                  <div className="text-gray-900 text-sm font-medium truncate max-w-[120px]">{medicine.pharmacyName}</div>
                                  <div className="text-gray-500 text-xs truncate max-w-[120px]">
                                    {medicine.pharmacyCompany?.licenseNumber}
                                  </div>
                                </td>
                              )}
                              
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <div className="text-gray-900 font-mono text-xs bg-gray-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded border">
                                  {medicine.batchNo}
                                </div>
                                <div className="text-gray-500 text-xs mt-1 hidden md:block">
                                  Mfg: {new Date(medicine.manufactureDate).toLocaleDateString()}
                                </div>
                              </td>
                              
                              <td className="py-2 md:py-3 px-2 md:px-3 hidden sm:table-cell">
                                <div className="text-gray-900 text-sm font-medium truncate max-w-[100px]">{medicine.manufacturer}</div>
                              </td>
                              
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <div className={`font-semibold text-xs ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                                  {new Date(medicine.expiryDate || medicine.expiry).toLocaleDateString()}
                                  {isExpired && (
                                    <div className="text-red-500 text-xs font-semibold mt-1 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                                      EXPIRED
                                    </div>
                                  )}
                                </div>
                              </td>
                              
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <span className={`inline-flex px-1.5 md:px-2 py-0.5 md:py-1 text-xs font-semibold rounded-full border ${statusColor} truncate max-w-[100px]`}>
                                  {medicine.status}
                                </span>
                              </td>
                              
                              <td className="py-2 md:py-3 px-2 md:px-3 hidden md:table-cell">
                                <span className={`inline-flex px-1.5 md:px-2 py-0.5 md:py-1 text-xs font-semibold rounded-full border ${blockchainColor}`}>
                                  {medicine.blockchainVerified ? '✅ Verified' : '❌ Not Verified'}
                                </span>
                              </td>
                              
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <div className="flex flex-col sm:flex-row gap-1 md:gap-2">
                                  {!medicine.blockchainVerified && (
                                    <button
                                      onClick={() => handleAcceptOnBlockchain(medicine)}
                                      disabled={!metamask.isConnected}
                                      className="bg-green-500 hover:bg-green-600 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                      title={metamask.isConnected ? 'Verify on blockchain' : 'Connect MetaMask to verify'}
                                    >
                                      <span>🔗</span>
                                      <span className="hidden sm:inline">Verify</span>
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => {
                                      setVerifyBatchNo(medicine.batchNo);
                                      setShowVerifyModal(true);
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1"
                                  >
                                    <span>🔍</span>
                                    <span className="hidden sm:inline">Check</span>
                                  </button>
                                  
                                  {/* Only show delete button for admin users */}
                                  {user?.role === 'admin' && (
                                    <button
                                      onClick={() => handleDeleteMedicine(medicine._id, medicine.name)}
                                      disabled={deleting}
                                      className="bg-red-500 hover:bg-red-600 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1 disabled:opacity-50"
                                      title={`Delete ${medicine.name}`}
                                    >
                                      <span>🗑️</span>
                                      <span className="hidden sm:inline">{deleting ? '...' : 'Delete'}</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        
                        {displayedMedicines.length === 0 && (
                          <tr>
                            <td colSpan={showAllPharmacies ? "8" : "7"} className="py-4 md:py-8 px-4 text-center">
                              <div className="text-gray-400 text-3xl md:text-4xl mb-1 md:mb-2">💊</div>
                              <h3 className="text-base md:text-lg font-semibold text-gray-500 mb-1 md:mb-2">No Medicines Found</h3>
                              <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto">
                                {selectedCompany 
                                  ? `No medicines found for ${getSelectedCompanyName()}. Accept manufacturer batches to add medicines to your inventory.`
                                  : 'No medicines found across all pharmacies. Select a specific pharmacy to manage medicines.'
                                }
                              </p>
                              {selectedCompany && (
                                <button
                                  onClick={() => setShowManufacturerBatches(true)}
                                  className="mt-2 md:mt-4 bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold transition-colors text-xs md:text-sm"
                                >
                                  👆 Show Available Manufacturer Batches
                                </button>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Verify Medicine Modal */}
          {showVerifyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 w-full max-w-md mx-auto shadow-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Verify Medicine</h3>
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl p-1 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2 md:mb-3">
                      Enter Batch Number to Verify
                    </label>
                    <input
                      type="text"
                      value={verifyBatchNo}
                      onChange={(e) => setVerifyBatchNo(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                      placeholder="Enter batch number (e.g., PHARM-2024-001)"
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-2">
                    <button
                      onClick={handleVerifyMedicine}
                      disabled={verifying || !verifyBatchNo.trim()}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm md:text-base"
                    >
                      {verifying ? (
                        <>
                          <div className="loading-spinner border-white"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <span className="text-base md:text-lg">🔍</span>
                          Verify Medicine
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowVerifyModal(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="text-xs md:text-sm text-gray-500 text-center pt-3 md:pt-4 border-t border-gray-200">
                    <p>Verify medicine authenticity using blockchain technology</p>
                    {metamask.isConnected && (
                      <p className="text-green-600 font-semibold mt-1">🔗 Blockchain verification enabled</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </ProtectedRoute>
  );
};

export default PharmacyPage;