import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { api } from "../utils/api";
import ResponsiveContainer from "../components/ResponsiveContainer";

function VerifyPage({ batches, metamask, user, theme }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [pharmacyMedicines, setPharmacyMedicines] = useState([]);
  const [showPharmacyList, setShowPharmacyList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [backendBlockchainInfo, setBackendBlockchainInfo] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    setResult(null);
    fetchPharmacyMedicines();
    fetchBackendBlockchainInfo();
  }, []);

  // Fetch blockchain info from backend
  const fetchBackendBlockchainInfo = async () => {
    try {
      const response = await api.get('/blockchain/real/status-detailed');
      if (response.success) {
        setBackendBlockchainInfo(response);
        console.log('✅ Backend blockchain info:', response.networkName);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch backend blockchain info:', error.message);
    }
  };

  // Auto-refresh blockchain info
  useEffect(() => {
    if (metamask.isConnected) {
      const interval = setInterval(() => {
        fetchBackendBlockchainInfo();
        setRefreshCounter(prev => prev + 1);
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [metamask.isConnected]);

  // Fetch pharmacy medicines
  const fetchPharmacyMedicines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("https://medicheck-production.up.railway.app/api/pharmacy/medicines", {
        method: "GET",
        headers: headers
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPharmacyMedicines(data.data);
          console.log("✅ Loaded pharmacy medicines for verification:", data.data.length);
        }
      } else if (response.status === 401) {
        console.warn("⚠️ Not authenticated - showing medicines anyway");
        const publicResponse = await fetch("https://medicheck-production.up.railway.app/api/pharmacy/medicines");
        if (publicResponse.ok) {
          const publicData = await publicResponse.json();
          if (publicData.success) {
            setPharmacyMedicines(publicData.data);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching pharmacy medicines:", error);
      try {
        const fallbackResponse = await fetch("https://medicheck-production.up.railway.app/api/pharmacy/medicines");
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success) {
            setPharmacyMedicines(fallbackData.data);
          }
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setPharmacyMedicines([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced verification with blockchain simulation
  const handleVerify = async (e) => {
    e.preventDefault();
    const query = input.trim();

    if (!query) {
      setResult({
        authentic: false,
        message: "Please enter a batch number to verify.",
      });
      return;
    }

    await verifyBatch(query);
  };

  // Main verification function
  const verifyBatch = async (query) => {
    setLoading(true);
    setResult(null);
    setBlockchainData(null);
    setVerificationHistory([]);

    try {
      console.log(`🔍 Verifying batch: ${query}`);

      // FIRST: Check in pharmacy medicines database (most accurate)
      let medicineFromPharmacy = pharmacyMedicines.find(
        medicine => String(medicine.batchNo).toLowerCase() === query.toLowerCase()
      );

      // SECOND: Check in manufacturer batches
      let medicineFromManufacturer = batches.find(
        batch => String(batch.batchNo).toLowerCase() === query.toLowerCase()
      );

      // If not found anywhere
      if (!medicineFromPharmacy && !medicineFromManufacturer) {
        setResult({
          authentic: false,
          message: "❌ Batch number not found in system.",
          exists: false
        });
        return;
      }

      // Use the most complete medicine data
      const medicine = medicineFromPharmacy || medicineFromManufacturer;
      
      // Get expiry date - handle different field names
      const expiryDateString = medicine.expiryDate || medicine.expiry;
      const expiryDate = new Date(expiryDateString);
      const today = new Date();
      
      // Clear time for accurate comparison
      today.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);
      
      // Medicine expires TODAY is considered expired
      const isExpired = expiryDate <= today;
      
      // Calculate days remaining (negative if expired)
      const daysRemaining = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      const isVerified = medicine.blockchainVerified || false;

      // Generate verification history based on actual medicine data
      const history = generateVerificationHistory(medicine, isVerified);
      setVerificationHistory(history);

      // Prepare result message
      let message = "";
      let status = "";
      
      if (isExpired) {
        message = "❌ This medicine is EXPIRED. Do not use!";
        status = "EXPIRED";
      } else if (daysRemaining === 0) {
        message = "⚠️ This medicine expires TODAY - Use immediately";
        status = "EXPIRES_TODAY";
      } else if (isVerified) {
        message = "✅ Medicine VERIFIED on Blockchain - Safe to Use";
        status = "ACTIVE";
      } else if (medicineFromPharmacy?.acceptedFromManufacturer) {
        message = "✅ Medicine AUTHENTIC (Accepted by Pharmacy)";
        status = "ACTIVE";
      } else {
        message = "⚠️ Medicine found but not blockchain verified";
        status = "UNVERIFIED";
      }

      setResult({
        authentic: !isExpired && (isVerified || medicineFromPharmacy?.acceptedFromManufacturer),
        exists: true,
        message: message,
        batchNo: medicine.batchNo,
        name: medicine.name,
        formulation: medicine.formulation,
        expiry: expiryDateString,
        expiryDate: expiryDateString,
        manufacturer: medicine.manufacturer,
        pharmacy: medicine.pharmacyName || medicine.pharmacy || 'Unknown',
        quantity: medicine.quantity,
        status: status,
        source: medicineFromPharmacy ? 'pharmacy' : 'manufacturer',
        blockchainVerified: isVerified,
        verifiedBy: medicine.verifiedBy || 'System',
        verifiedAt: medicine.verifiedAt || medicine.acceptanceDate,
        isExpired: isExpired,
        daysRemaining: daysRemaining,
        expiresToday: daysRemaining === 0,
        expiryCheck: {
          expiryDate: expiryDate.toISOString().split('T')[0],
          today: today.toISOString().split('T')[0],
          daysRemaining: daysRemaining,
          isExpired: isExpired,
          expiresToday: daysRemaining === 0
        }
      });

      // Log expiry check for debugging
      console.log("📅 Expiry check:", {
        expiryDate: expiryDate.toISOString().split('T')[0],
        today: today.toISOString().split('T')[0],
        isExpired: isExpired,
        daysRemaining: daysRemaining,
        expiresToday: daysRemaining === 0
      });

    } catch (error) {
      console.error("❌ Verification error:", error);
      setResult({
        authentic: false,
        message: "❌ Error verifying medicine. Please try again.",
        exists: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate verification history timeline
  const generateVerificationHistory = (medicine, isVerified) => {
    const history = [];
    const now = Math.floor(Date.now() / 1000);

    // Manufacturing event
    if (medicine.manufactureDate) {
      history.push({
        type: "manufactured",
        timestamp: Math.floor(new Date(medicine.manufactureDate).getTime() / 1000),
        description: `Manufactured by ${medicine.manufacturer}`,
        address: medicine.manufacturer,
        transaction: null,
        icon: "🏭"
      });
    }

    // Blockchain registration
    if (medicine.blockchainTransactionHash) {
      history.push({
        type: "blockchain_registered",
        timestamp: Math.floor(new Date(medicine.createdAt || Date.now()).getTime() / 1000),
        description: "Registered on blockchain",
        address: "Blockchain Network",
        transaction: medicine.blockchainTransactionHash,
        icon: "🔗"
      });
    }

    // Pharmacy acceptance (if exists)
    if (medicine.acceptedFromManufacturer && medicine.acceptanceDate) {
      history.push({
        type: "pharmacy_accepted",
        timestamp: Math.floor(new Date(medicine.acceptanceDate).getTime() / 1000),
        description: `Accepted by ${medicine.pharmacyName || 'Pharmacy'}`,
        address: medicine.pharmacyName || 'Pharmacy',
        transaction: null,
        icon: "🏪"
      });
    }

    // Verification event (if verified)
    if (isVerified) {
      history.push({
        type: "verified",
        timestamp: Math.floor(new Date(medicine.verifiedAt || Date.now()).getTime() / 1000),
        description: "Verified by quality control",
        address: medicine.verifiedBy || "Quality Controller",
        transaction: null,
        icon: "✅"
      });
    }

    // Current verification
    history.push({
      type: "current_verification",
      timestamp: now,
      description: "Current verification check",
      address: "Verification System",
      transaction: null,
      icon: "🔍"
    });

    return history.sort((a, b) => a.timestamp - b.timestamp);
  };

  // Format blockchain address for display
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (address.startsWith('0x')) {
      return `${address.slice(0, 8)}...${address.slice(-6)}`;
    }
    return address;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Generate QR code data
  const generateQRCode = (batchNo) => {
    const verificationData = {
      batchNo: batchNo,
      timestamp: new Date().toISOString(),
      system: "Medicheck Blockchain",
      verifyUrl: `${window.location.origin}/verify?batch=${batchNo}`,
      network: backendBlockchainInfo?.networkName || 'Unknown',
      contract: backendBlockchainInfo?.contract?.address || 'Not deployed'
    };
    return JSON.stringify(verificationData);
  };

  const handleShowQRCode = (medicine) => {
    setSelectedMedicine(medicine);
    setShowQRModal(true);
  };

  // Helper function to get network status color
  const getNetworkStatusColor = () => {
    if (!metamask.isConnected) return 'yellow';
    
    const networkName = backendBlockchainInfo?.networkName || '';
    if (networkName.includes('Sepolia') || networkName.includes('Goerli') || networkName.includes('Mumbai')) {
      return 'blue'; // Testnets
    } else if (networkName.includes('Mainnet')) {
      return 'green'; // Mainnets
    } else {
      return 'purple'; // Unknown/other
    }
  };

  // Helper function to get network icon
  const getNetworkIcon = () => {
    if (!metamask.isConnected) return '⚠️';
    
    const networkName = backendBlockchainInfo?.networkName || '';
    if (networkName.includes('Sepolia')) return '🔵';
    if (networkName.includes('Goerli')) return '🟣';
    if (networkName.includes('Mumbai')) return '🟠';
    if (networkName.includes('Mainnet')) return '🟢';
    return '🌐';
  };

  // Check if network matches between MetaMask and backend
  const checkNetworkMatch = () => {
    if (!metamask.isConnected || !backendBlockchainInfo || !metamask.networkInfo) {
      return { match: true, warning: null };
    }
    
    const metamaskChainId = metamask.chainId;
    const backendChainId = `0x${parseInt(backendBlockchainInfo.networkId).toString(16)}`;
    
    if (metamaskChainId !== backendChainId) {
      return {
        match: false,
        warning: `MetaMask is on ${metamask.networkInfo?.name}, but backend is on ${backendBlockchainInfo.networkName}`
      };
    }
    
    return { match: true, warning: null };
  };

  const networkMatch = checkNetworkMatch();

  return (
    <BackgroundFix theme={theme}>
      <ResponsiveContainer>
        <div className="py-4 md:py-6">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
              Medicine Verification Portal
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Verify medicine authenticity using blockchain technology
            </p>
          </div>

          {/* Enhanced Blockchain Status */}
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 md:gap-3 mb-3">
              <span className={`text-xl md:text-2xl ${
                metamask.isConnected ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {getNetworkIcon()}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-base md:text-lg">
                  {metamask.isConnected 
                    ? (backendBlockchainInfo?.networkName || 'Blockchain Connected')
                    : 'Database Verification Mode'
                  }
                </p>
                <p className="text-gray-600 text-xs md:text-sm">
                  {metamask.isConnected 
                    ? (backendBlockchainInfo ? (
                      <span>
                        Network: <strong>{backendBlockchainInfo.networkName}</strong> • 
                        Block: <strong>{backendBlockchainInfo.latestBlock?.toLocaleString()}</strong> • 
                        Gas: <strong>{backendBlockchainInfo.gasPrice}</strong>
                      </span>
                    ) : 'Loading blockchain info...')
                    : 'Connect MetaMask for enhanced blockchain security'
                  }
                </p>
              </div>
              
              <div className="flex flex-col items-end">
                {!metamask.isConnected ? (
                  <button
                    onClick={metamask.connect}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold transition-colors text-xs md:text-sm whitespace-nowrap"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      getNetworkStatusColor() === 'green' ? 'bg-green-100 text-green-800' :
                      getNetworkStatusColor() === 'blue' ? 'bg-blue-100 text-blue-800' :
                      getNetworkStatusColor() === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {backendBlockchainInfo?.isTestnet ? 'Test Network' : 'Main Network'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Updated {refreshCounter > 0 ? `${refreshCounter}m ago` : 'just now'}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Show detailed blockchain info when connected */}
            {metamask.isConnected && backendBlockchainInfo && (
              <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Network ID:</span>
                    <div className="font-medium font-mono">{backendBlockchainInfo.networkId}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Latest Block:</span>
                    <div className="font-medium">{backendBlockchainInfo.latestBlock?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Gas Price:</span>
                    <div className="font-medium">{backendBlockchainInfo.gasPrice}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className={`font-medium ${
                      backendBlockchainInfo.connected ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {backendBlockchainInfo.connected ? 'Connected ✓' : 'Disconnected ✗'}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Contract:</span>
                    <div className="font-mono text-xs truncate flex items-center gap-1">
                      <span>{formatAddress(backendBlockchainInfo.contract?.address || 'Not deployed')}</span>
                      {backendBlockchainInfo.contract?.hasCode && (
                        <span className="text-green-600">✓</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">RPC:</span>
                    <div className="font-mono text-xs truncate">
                      {backendBlockchainInfo.rpcUrl?.replace('https://', '') || 'Not configured'}
                    </div>
                  </div>
                </div>
                
                {/* Network mismatch warning */}
                {!networkMatch.match && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-1 text-yellow-700 text-xs">
                      <span>⚠️</span>
                      <span>{networkMatch.warning}</span>
                    </div>
                  </div>
                )}
                
                {/* Refresh button */}
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={fetchBackendBlockchainInfo}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
                  >
                    <span>🔄</span>
                    Refresh Status
                  </button>
                </div>
              </div>
            )}
            
            {/* Show backend error if MetaMask is connected but no blockchain info */}
            {metamask.isConnected && !backendBlockchainInfo && !loading && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center gap-1 text-red-700 text-xs">
                  <span>❌</span>
                  <span>Could not connect to blockchain backend. Please check if backend is running.</span>
                </div>
              </div>
            )}
          </div>

          {/* Blockchain Visualization */}
          <div className="mb-4 md:mb-8">
            <BlockchainVisualization />
          </div>

          {/* Available Medicines from Pharmacy */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6 mb-4 md:mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-0 mb-3 md:mb-4">
              <div>
                <h4 className="text-base md:text-xl font-semibold text-gray-800">Available Medicines</h4>
                <p className="text-gray-600 text-xs md:text-sm">Medicines available from pharmacy (accepted from manufacturers)</p>
              </div>
              <button
                onClick={() => setShowPharmacyList(!showPharmacyList)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm"
              >
                {showPharmacyList ? '👇 Hide List' : '👆 Show Available Medicines'}
                <span className="bg-blue-600 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs">
                  {pharmacyMedicines.length}
                </span>
              </button>
            </div>

            {showPharmacyList && (
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-4 md:py-8">
                    <div className="loading-spinner mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading available medicines...</p>
                  </div>
                ) : pharmacyMedicines.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {pharmacyMedicines.map((medicine) => (
                      <div key={medicine._id} className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start mb-2 md:mb-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-800 text-sm truncate">{medicine.name}</h5>
                            <p className="text-xs text-gray-600 font-mono truncate">{medicine.batchNo}</p>
                            <p className="text-xs text-gray-500 truncate">{medicine.manufacturer}</p>
                            <div className="flex items-center gap-1 md:gap-2 mt-1">
                              <span className={`inline-flex px-1.5 md:px-2 py-0.5 md:py-1 text-xs font-semibold rounded-full ${
                                medicine.blockchainVerified 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              }`}>
                                {medicine.blockchainVerified ? '🔗 Verified' : '⚠️ Unverified'}
                              </span>
                              {medicine.blockchainTransactionHash && (
                                <span className="text-xs text-gray-500 truncate" title={medicine.blockchainTransactionHash}>
                                  TX: {formatAddress(medicine.blockchainTransactionHash)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleShowQRCode(medicine)}
                            className="ml-1 md:ml-2 bg-white border border-gray-300 rounded-lg p-1.5 md:p-2 hover:bg-gray-50 transition-colors flex-shrink-0"
                            title="Show QR Code"
                          >
                            <span className="text-base md:text-lg">📷</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1 md:gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Formulation:</span>
                            <div className="font-medium truncate">{medicine.formulation}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <div className="font-medium">{medicine.quantity} units</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Pharmacy:</span>
                            <div className="font-medium text-xs truncate">{medicine.pharmacyName}</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Expiry:</span>
                            <div className="font-medium text-xs">
                              {new Date(medicine.expiryDate || medicine.expiry).toLocaleDateString()}
                              {(() => {
                                const expiryDate = new Date(medicine.expiryDate || medicine.expiry);
                                const today = new Date();
                                const daysRemaining = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
                                
                                if (daysRemaining < 0) {
                                  return <span className="text-red-600 ml-1">(Expired)</span>;
                                } else if (daysRemaining < 30) {
                                  return <span className="text-orange-600 ml-1">({daysRemaining}d left)</span>;
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setInput(medicine.batchNo);
                            verifyBatch(medicine.batchNo);
                          }}
                          className="w-full mt-2 md:mt-3 bg-green-500 hover:bg-green-600 text-white py-1.5 md:py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          <span>🔍</span>
                          Verify This Medicine
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 md:py-8 text-gray-500">
                    <div className="text-2xl md:text-4xl mb-1 md:mb-2">💊</div>
                    <p className="text-sm">No medicines available in pharmacy inventory</p>
                    <p className="text-xs md:text-sm">Pharmacy needs to accept medicines from manufacturers first</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verification Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Verification Input & Result */}
            <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
              <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter medicine batch number..."
                  className="flex-1 p-3 md:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl 
                    text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 
                    focus:ring-blue-500/20 transition text-base md:text-lg font-mono"
                  disabled={loading}
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4 md:px-6 lg:px-8 py-3 md:py-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all transform 
                    hover:scale-105 shadow-lg font-semibold border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1 md:gap-2 justify-center"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner border-white"></div>
                      <span className="text-sm md:text-base">Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg md:text-xl">🔍</span>
                      <span className="text-sm md:text-base">Verify</span>
                    </>
                  )}
                </button>
              </form>

              {result && (
                <div className={`p-4 md:p-6 rounded-xl border-2 ${
                  result.isExpired 
                    ? "bg-red-50 border-red-200" 
                    : result.expiresToday
                    ? "bg-orange-50 border-orange-200"
                    : result.authentic && !result.status?.includes('EXPIRED')
                    ? "bg-green-50 border-green-200" 
                    : result.exists === false
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  {result.exists === false ? (
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl mb-3 md:mb-4">❓</div>
                      <div className="font-bold text-yellow-700 text-base md:text-lg mb-2">
                        {result.message}
                      </div>
                      <p className="text-yellow-600 text-sm md:text-base">Please check the batch number and try again.</p>
                    </div>
                  ) : result.isExpired ? (
                    <div>
                      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <div className="text-2xl md:text-3xl">❌</div>
                        <div>
                          <div className="font-bold text-red-700 text-base md:text-lg">{result.message}</div>
                          <div className="text-xs md:text-sm text-red-600 flex items-center gap-1 mt-1">
                            <span>⚠️</span> Expired on {new Date(result.expiry).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-gray-700 bg-white p-3 md:p-4 rounded-lg border border-red-200">
                        <div><strong className="text-gray-800 text-sm md:text-base">Medicine Name:</strong> <span className="truncate block">{result.name}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Batch Number:</strong> <span className="font-mono text-sm md:text-base truncate block">{result.batchNo}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Manufacturer:</strong> <span className="truncate block">{result.manufacturer}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Pharmacy:</strong> <span className="truncate block">{result.pharmacy || 'Not yet accepted'}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Formulation:</strong> <span className="truncate block">{result.formulation}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Quantity:</strong> <span className="text-sm md:text-base">{result.quantity} units</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Expiry Date:</strong> <span className="text-red-600 font-semibold text-sm md:text-base">{new Date(result.expiry).toLocaleDateString()}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Status:</strong> <span className="text-red-600 font-semibold text-sm md:text-base">EXPIRED</span></div>
                        {result.expiryCheck && (
                          <div className="md:col-span-2 bg-red-50 p-2 md:p-3 rounded border border-red-200">
                            <strong className="text-red-700 text-sm">Expiry Alert:</strong>
                            <div className="text-xs text-red-600">
                              • This medicine expired {Math.abs(result.expiryCheck.daysRemaining)} days ago
                              <br/>
                              • Do not dispense or use this medicine
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : result.expiresToday ? (
                    <div>
                      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <div className="text-2xl md:text-3xl">⚠️</div>
                        <div>
                          <div className="font-bold text-orange-700 text-base md:text-lg">{result.message}</div>
                          <div className="text-xs md:text-sm text-orange-600 flex items-center gap-1 mt-1">
                            <span>⏰</span> Expires today ({new Date(result.expiry).toLocaleDateString()})
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-gray-700 bg-white p-3 md:p-4 rounded-lg border border-orange-200">
                        <div><strong className="text-gray-800 text-sm md:text-base">Medicine Name:</strong> <span className="truncate block">{result.name}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Batch Number:</strong> <span className="font-mono text-sm md:text-base truncate block">{result.batchNo}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Manufacturer:</strong> <span className="truncate block">{result.manufacturer}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Pharmacy:</strong> <span className="truncate block">{result.pharmacy || 'Not yet accepted'}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Formulation:</strong> <span className="truncate block">{result.formulation}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Quantity:</strong> <span className="text-sm md:text-base">{result.quantity} units</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Expiry Date:</strong> <span className="text-orange-600 font-semibold text-sm md:text-base">{new Date(result.expiry).toLocaleDateString()}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Status:</strong> <span className="text-orange-600 font-semibold text-sm md:text-base">EXPIRES TODAY</span></div>
                        {result.blockchainVerified && (
                          <div className="text-xs md:text-sm text-green-600 flex items-center gap-1">
                            <span>🔗</span> Blockchain Verified • Transaction: {formatAddress(result.transaction)}
                          </div>
                        )}
                        <div className="md:col-span-2 bg-orange-50 p-2 md:p-3 rounded border border-orange-200">
                          <strong className="text-orange-700 text-sm">Urgent Notice:</strong>
                          <div className="text-xs text-orange-600">
                            • This medicine expires TODAY
                            <br/>
                            • Use immediately - do not accept new stock
                            <br/>
                            • Mark for disposal if not used by end of day
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : result.authentic ? (
                    <div>
                      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <div className="text-2xl md:text-3xl">✅</div>
                        <div>
                          <div className="font-bold text-green-700 text-base md:text-lg">{result.message}</div>
                          {result.blockchainVerified && (
                            <div className="text-xs md:text-sm text-green-600 flex items-center gap-1 mt-1">
                              <span>🔗</span> Blockchain Verified • Transaction: {formatAddress(result.transaction)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-gray-700 bg-white p-3 md:p-4 rounded-lg border border-green-200">
                        <div><strong className="text-gray-800 text-sm md:text-base">Medicine Name:</strong> <span className="truncate block">{result.name}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Batch Number:</strong> <span className="font-mono text-sm md:text-base truncate block">{result.batchNo}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Manufacturer:</strong> <span className="truncate block">{result.manufacturer}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Pharmacy:</strong> <span className="truncate block">{result.pharmacy || 'Not yet accepted'}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Formulation:</strong> <span className="truncate block">{result.formulation}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Quantity:</strong> <span className="text-sm md:text-base">{result.quantity} units</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Expiry Date:</strong> <span className="text-green-600 font-semibold text-sm md:text-base">{new Date(result.expiry).toLocaleDateString()}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Status:</strong> <span className="text-green-600 font-semibold text-sm md:text-base">
                          {result.daysRemaining < 30 ? `${result.daysRemaining} DAYS REMAINING` : 'ACTIVE'}
                        </span></div>
                        {result.expiryCheck && result.daysRemaining < 30 && (
                          <div className={`md:col-span-2 p-2 md:p-3 rounded border ${
                            result.daysRemaining < 7 ? 'bg-red-50 border-red-200' : 
                            result.daysRemaining < 30 ? 'bg-yellow-50 border-yellow-200' : 
                            'bg-green-50 border-green-200'
                          }`}>
                            <strong className={`text-sm ${
                              result.daysRemaining < 7 ? 'text-red-700' : 
                              result.daysRemaining < 30 ? 'text-yellow-700' : 
                              'text-green-700'
                            }`}>
                              {result.daysRemaining < 7 ? 'Urgent Expiry Alert:' : 'Expiry Notice:'}
                            </strong>
                            <div className={`text-xs ${
                              result.daysRemaining < 7 ? 'text-red-600' : 
                              result.daysRemaining < 30 ? 'text-yellow-600' : 
                              'text-green-600'
                            }`}>
                              • This medicine expires in {result.daysRemaining} days
                              <br/>
                              {result.daysRemaining < 7 ? '• Use immediately - mark for disposal' : '• Please monitor stock and plan accordingly'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <div className="text-2xl md:text-3xl">⚠️</div>
                        <div className="font-bold text-yellow-700 text-base md:text-lg">{result.message}</div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-gray-700 bg-white p-3 md:p-4 rounded-lg border border-yellow-200">
                        <div><strong className="text-gray-800 text-sm md:text-base">Medicine Name:</strong> <span className="truncate block">{result.name}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Batch Number:</strong> <span className="font-mono text-sm md:text-base truncate block">{result.batchNo}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Manufacturer:</strong> <span className="truncate block">{result.manufacturer}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Pharmacy:</strong> <span className="truncate block">{result.pharmacy || 'Not yet accepted'}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Formulation:</strong> <span className="truncate block">{result.formulation}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Expiry Date:</strong> <span className="text-sm md:text-base">{new Date(result.expiry).toLocaleDateString()}</span></div>
                        <div><strong className="text-gray-800 text-sm md:text-base">Status:</strong> <span className="text-yellow-600 font-semibold text-sm md:text-base">{result.status}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Verification History */}
              {verificationHistory.length > 0 && (
                <div className="mt-4 md:mt-6 bg-white p-4 md:p-6 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Verification History</h4>
                  <div className="space-y-2 md:space-y-4 max-h-64 md:max-h-80 overflow-y-auto pr-2">
                    {verificationHistory.map((event, index) => (
                      <div key={index} className="flex items-start gap-2 md:gap-4 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xl md:text-2xl flex-shrink-0">{event.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm md:text-base">{event.description}</p>
                          <p className="text-xs md:text-sm text-gray-600">
                            Address: <span className="font-mono text-xs truncate block">{formatAddress(event.address)}</span>
                          </p>
                          {event.transaction && (
                            <p className="text-xs md:text-sm text-gray-600">
                              TX: <span className="font-mono text-xs truncate block">{formatAddress(event.transaction)}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Display Section */}
            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-center text-base md:text-lg">QR Code Verification</h4>
              
              {result && result.exists ? (
                <div className="text-center mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="p-3 md:p-4 bg-white rounded-xl border border-gray-200 mx-auto max-w-[160px] md:max-w-[200px]">
                    <QRCode
                      value={generateQRCode(result.batchNo)}
                      size={result.batchNo.length > 15 ? 140 : 160}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  
                  <div className="mt-3 md:mt-4">
                    <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">{result.name}</h4>
                    <p className="text-gray-600 text-xs md:text-sm font-mono truncate">{result.batchNo}</p>
                    <p className="text-gray-500 text-xs truncate">{result.manufacturer}</p>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.blockchainVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.blockchainVerified ? '🔗 Blockchain Verified' : '⚠️ Not Verified'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.batchNo);
                      alert('Batch number copied to clipboard!');
                    }}
                    className="w-full mt-2 md:mt-3 bg-gray-500 hover:bg-gray-600 text-white py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors"
                  >
                    📋 Copy Batch Number
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4 md:py-6">
                  <div className="text-3xl md:text-4xl mb-1 md:mb-2">📱</div>
                  <p className="text-xs md:text-sm">Enter a batch number to generate QR code</p>
                </div>
              )}

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h5 className="font-semibold text-gray-800 mb-2 text-sm">How to Verify:</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span>1.</span>
                    <span>Enter batch number above</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>2.</span>
                    <span>Click Verify button</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>3.</span>
                    <span>Check blockchain verification status</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>4.</span>
                    <span>Use QR code for mobile scanning</span>
                  </li>
                </ul>
              </div>

              {/* Enhanced Blockchain Info */}
              <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <h5 className="font-semibold text-purple-800 mb-2 text-sm">Blockchain Information</h5>
                <div className="text-xs text-purple-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="font-medium">
                      {backendBlockchainInfo?.networkName || (metamask.isConnected ? 'Ethereum' : 'Simulated')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Block Height:</span>
                    <span className="font-mono">
                      {backendBlockchainInfo?.latestBlock?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Price:</span>
                    <span className="font-medium">
                      {backendBlockchainInfo?.gasPrice || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verification:</span>
                    <span className={`font-medium ${
                      result?.blockchainVerified ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {result?.blockchainVerified ? 'On-chain Verified' : 'Database'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contract Status:</span>
                    <span className={`font-medium ${
                      backendBlockchainInfo?.contract?.hasCode ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {backendBlockchainInfo?.contract?.hasCode ? 'Active' : 'Not Deployed'}
                    </span>
                  </div>
                  {backendBlockchainInfo?.contract?.address && (
                    <div className="pt-1 border-t border-purple-200">
                      <div className="flex justify-between">
                        <span>Contract:</span>
                        <span className="font-mono text-xs truncate max-w-[100px]" 
                              title={backendBlockchainInfo.contract.address}>
                          {formatAddress(backendBlockchainInfo.contract.address)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Modal */}
          {showQRModal && selectedMedicine && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 w-full max-w-md mx-auto">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-bold text-gray-800">QR Code</h3>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="text-center">
                  <div className="p-3 md:p-4 bg-white border border-gray-200 rounded-xl mx-auto max-w-[200px] md:max-w-[250px]">
                    <QRCode
                      value={generateQRCode(selectedMedicine.batchNo)}
                      size={selectedMedicine.batchNo.length > 15 ? 160 : 180}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  
                  <div className="mt-3 md:mt-4">
                    <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">{selectedMedicine.name}</h4>
                    <p className="text-gray-600 text-xs md:text-sm font-mono truncate">{selectedMedicine.batchNo}</p>
                    <p className="text-gray-500 text-xs truncate">{selectedMedicine.manufacturer}</p>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedMedicine.blockchainVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedMedicine.blockchainVerified ? '🔗 Blockchain Verified' : '⚠️ Not Verified'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-3 md:mt-4">
                    <button
                      onClick={() => {
                        setInput(selectedMedicine.batchNo);
                        verifyBatch(selectedMedicine.batchNo);
                        setShowQRModal(false);
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 md:py-2 rounded-lg font-semibold transition-colors text-xs md:text-sm"
                    >
                      Verify This Medicine
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedMedicine.batchNo);
                        alert('Batch number copied to clipboard!');
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-1.5 md:py-2 rounded-lg font-semibold transition-colors text-xs md:text-sm"
                    >
                      Copy Batch No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </BackgroundFix>
  );
}

export default VerifyPage;
