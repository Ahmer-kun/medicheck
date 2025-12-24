import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import MetaMaskConnector from "./MetaMaskConnector";

function Topbar({ onToggle, metamask, user, theme }) {
  const [blockchainStatus, setBlockchainStatus] = useState({
    loading: false, // Start with false to prevent immediate flicker
    isRealBlockchain: false,
    connected: false,
    network: null,
    contract: null
  });

  const [checkInterval, setCheckInterval] = useState(null);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
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

  // Check blockchain status - SIMPLIFIED VERSION
  const checkBlockchainStatus = async () => {
    try {
      // Don't set loading to true immediately to prevent flicker
      // Only show loading state if it's the first check or after a long time
      
      let response;
      
      try {
        response = await api.get('/blockchain/status');
      } catch (endpoint1Error) {
        console.log('Blockchain status endpoint failed:', endpoint1Error.message);
        
        // Try alternative endpoint
        try {
          response = await api.get('/blockchain/health');
        } catch (endpoint2Error) {
          console.log('Alternative endpoint also failed:', endpoint2Error.message);
          
          setBlockchainStatus(prev => ({
            ...prev,
            loading: false,
            isRealBlockchain: false,
            connected: false,
            network: 'Offline',
            contract: 'Cannot Connect',
            error: true
          }));
          return;
        }
      }
      
      if (response.data && response.data.success) {
        const blockchain = response.data.blockchain || response.data;
        setBlockchainStatus({
          loading: false,
          isRealBlockchain: blockchain.isRealBlockchain || false,
          connected: blockchain.connected || false,
          network: blockchain.networkName || (blockchain.isRealBlockchain ? 'Real' : 'Local'),
          contract: blockchain.contract?.exists ? 'Deployed' : 'Not Found',
          blockNumber: blockchain.latestBlock || blockchain.blockNumber,
          gasPrice: blockchain.gasPrice,
          hasBalance: blockchain.hasBalance || blockchain.hasEnough || true,
          balance: blockchain.balance,
          timestamp: blockchain.timestamp,
          error: false
        });
      } else {
        setBlockchainStatus(prev => ({
          ...prev,
          loading: false,
          isRealBlockchain: false,
          connected: false,
          network: 'Local',
          contract: 'Not Connected',
          error: true
        }));
      }
    } catch (error) {
      console.log('Blockchain status check failed:', error.message);
      setBlockchainStatus(prev => ({
        ...prev,
        loading: false,
        isRealBlockchain: false,
        connected: false,
        network: 'Local',
        contract: 'Cannot Connect',
        error: true
      }));
    }
  };

  // Initialize blockchain status check
  useEffect(() => {
    // Initial check after 1 second delay to prevent immediate yellow state
    const initialCheckTimer = setTimeout(() => {
      checkBlockchainStatus();
    }, 1000);
    
    // Set up interval for regular checks (every 60 seconds instead of 30)
    const interval = setInterval(checkBlockchainStatus, 60000);
    setCheckInterval(interval);
    
    return () => {
      clearTimeout(initialCheckTimer);
      clearInterval(interval);
    };
  }, []);

  // Clear interval on component unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [checkInterval]);

  // Render blockchain status indicator - FIXED VERSION
  const renderBlockchainStatus = () => {
    // If MetaMask is connected, prioritize MetaMask status over backend status
    if (metamask.isConnected && metamask.account) {
      return null; // Don't show blockchain status when MetaMask is connected
    }

    if (blockchainStatus.loading) {
      return (
        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg 
          border border-yellow-200 w-full sm:w-auto">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-yellow-700 truncate">Checking...</span>
        </div>
      );
    }

    const isConnected = blockchainStatus.connected;
    const isReal = blockchainStatus.isRealBlockchain;
    const hasError = blockchainStatus.error;

    // Status indicator colors - SIMPLIFIED
    let color = 'gray';
    let statusText = 'Unknown';
    
    if (hasError) {
      color = 'gray'; // Use gray instead of yellow for errors
      statusText = 'Backend Offline';
    } else if (!isConnected) {
      color = 'gray'; // Use gray instead of red for disconnected
      statusText = 'Disconnected';
    } else {
      color = isReal ? 'green' : 'blue';
      statusText = isReal ? `Real Network` : 'Local Network';
    }

    const colorClasses = {
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        dot: 'bg-green-500'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        dot: 'bg-blue-500'
      },
      gray: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        dot: 'bg-gray-500'
      }
    }[color];

    return (
      <div className={`flex items-center gap-2 
        ${colorClasses.bg} ${colorClasses.border} px-3 py-2 rounded-lg border w-full sm:w-auto`}>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${colorClasses.dot} rounded-full ${isConnected && !hasError ? 'animate-pulse' : ''}`}></div>
          <span className={`text-xs font-medium ${colorClasses.text} truncate`}>
            {statusText}
          </span>
        </div>
      </div>
    );
  };

  // Render MetaMask status component - FIXED VERSION
  const renderMetaMaskStatus = () => {
    // If MetaMask is not installed
    if (!metamask.isMetaMaskInstalled) {
      return (
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 truncate">MetaMask Required</span>
          </div>
        </div>
      );
    }

    // If connected to MetaMask
    if (metamask.isConnected && metamask.account) {
      return (
        <div className="flex items-center gap-1 md:gap-2">
          {/* Main status container */}
          <div className="bg-green-50 border border-green-200 rounded-lg px-2 md:px-3 py-1 md:py-2">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
              <div className="flex flex-col">
                <span className="text-xs text-green-700 font-medium truncate max-w-[70px] md:max-w-[100px]">
                  {formatAddress(metamask.account)}
                </span>
                <span className="text-[9px] md:text-[10px] text-green-600 truncate hidden md:block">
                  MetaMask Connected
                </span>
              </div>
            </div>
          </div>
          
          {/* Disconnect button */}
          <button
            onClick={metamask.disconnect}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 md:px-3 py-1 md:py-2 rounded 
              transition-colors border border-red-200 flex-shrink-0 whitespace-nowrap"
          >
            <span className="hidden md:inline">Disconnect</span>
            <span className="md:hidden">X</span>
          </button>
        </div>
      );
    }

    // If MetaMask is installed but not connected
    return (
      <div className="flex items-center gap-2">
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">MetaMask Ready</span>
          </div>
        </div>
        <button
          onClick={metamask.connect}
          disabled={metamask.loading}
          className={`text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded 
            transition-colors border border-blue-200 whitespace-nowrap
            ${metamask.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {metamask.loading ? 'Connecting...' : 'Connect'}
        </button>
      </div>
    );
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
        <div className="flex flex-col min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate">
            Medicheck Portal - {getUserName()}
          </h2>
          {/* Role indicator for mobile */}
          <span className="md:hidden text-xs text-gray-500 capitalize mt-1">
            {getUserRole()}
          </span>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Only show backend blockchain status if MetaMask is NOT connected */}
        {(!metamask.isConnected || !metamask.account) && renderBlockchainStatus()}

        {/* MetaMask Status */}
        <div className="hidden sm:block">
          {renderMetaMaskStatus()}
        </div>
        
        {/* MetaMask Status - Mobile */}
        <div className="sm:hidden">
          {renderMetaMaskStatus()}
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 border-t border-gray-200 pt-3 sm:border-t-0 sm:pt-0">
            {/* Avatar */}
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full 
              flex items-center justify-center text-blue-600 font-bold shadow-lg border 
              border-blue-200 flex-shrink-0">
              {getUserInitial()}
            </div>
            
            {/* User details - hidden on mobile, shown on tablet+ */}
            <div className="hidden md:flex flex-1 min-w-0">
              <div className="flex flex-col min-w-0">
                <div className="text-gray-800 font-medium truncate text-sm">{getUserName()}</div>
                <div className="text-gray-600 text-xs capitalize truncate">{getUserRole()}</div>
              </div>
            </div>
            
            {/* Mobile user indicator */}
            <div className="md:hidden flex items-center">
              <div className="text-xs text-gray-500">
                {getUserName().split(' ')[0]}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Topbar;


//          Simpler  &  Cleaner 

// import React, { useState, useEffect } from "react";
// import { api } from "../utils/api";
// import MetaMaskConnector from "./MetaMaskConnector";

// function Topbar({ onToggle, metamask, user, theme }) {
//   const [blockchainStatus, setBlockchainStatus] = useState({
//     loading: false,
//     isRealBlockchain: false,
//     connected: false,
//     network: null
//   });

//   const formatAddress = (address) => {
//     if (!address) return '';
//     return `${address.slice(0, 4)}...${address.slice(-4)}`;
//   };

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

//   // Simplified blockchain status check
//   const checkBlockchainStatus = async () => {
//     try {
//       const response = await api.get('/blockchain/status').catch(() => ({
//         data: { 
//           success: false, 
//           blockchain: { connected: false } 
//         }
//       }));
      
//       if (response.data?.success && response.data.blockchain) {
//         const blockchain = response.data.blockchain;
//         setBlockchainStatus({
//           loading: false,
//           isRealBlockchain: blockchain.isRealBlockchain || false,
//           connected: blockchain.connected || false,
//           network: blockchain.networkName || 'Local',
//           error: false
//         });
//       } else {
//         setBlockchainStatus(prev => ({
//           ...prev,
//           loading: false,
//           connected: false,
//           network: 'Local',
//           error: true
//         }));
//       }
//     } catch (error) {
//       setBlockchainStatus(prev => ({
//         ...prev,
//         loading: false,
//         connected: false,
//         error: true
//       }));
//     }
//   };

//   useEffect(() => {
//     // Initial check after delay
//     const timer = setTimeout(checkBlockchainStatus, 1000);
    
//     // Check every 2 minutes
//     const interval = setInterval(checkBlockchainStatus, 120000);
    
//     return () => {
//       clearTimeout(timer);
//       clearInterval(interval);
//     };
//   }, []);

//   // Render backend blockchain status (only when MetaMask is NOT connected)
//   const renderBackendStatus = () => {
//     // If MetaMask is connected, don't show backend status
//     if (metamask.isConnected && metamask.account) {
//       return null;
//     }

//     const { loading, connected, network, error } = blockchainStatus;
    
//     if (loading) {
//       return (
//         <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
//           <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
//           <span className="text-xs text-gray-600">Checking...</span>
//         </div>
//       );
//     }

//     let color = 'gray';
//     let statusText = 'Unknown';
    
//     if (error) {
//       color = 'gray';
//       statusText = 'Backend Offline';
//     } else if (!connected) {
//       color = 'gray';
//       statusText = 'Disconnected';
//     } else {
//       color = 'green';
//       statusText = network || 'Connected';
//     }

//     const colorClasses = {
//       green: {
//         bg: 'bg-green-50',
//         border: 'border-green-200',
//         text: 'text-green-700',
//         dot: 'bg-green-500'
//       },
//       gray: {
//         bg: 'bg-gray-50',
//         border: 'border-gray-200',
//         text: 'text-gray-700',
//         dot: 'bg-gray-500'
//       }
//     }[color];

//     return (
//       <div className={`flex items-center gap-2 ${colorClasses.bg} ${colorClasses.border} px-3 py-2 rounded-lg border`}>
//         <div className={`w-2 h-2 ${colorClasses.dot} rounded-full ${connected ? 'animate-pulse' : ''}`}></div>
//         <span className={`text-xs font-medium ${colorClasses.text}`}>
//           {statusText}
//         </span>
//       </div>
//     );
//   };

//   return (
//     <div className={`flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white 
//       text-gray-800 shadow-sm border-b border-gray-200`}>
      
//       {/* Left Section */}
//       <div className="flex items-center justify-between md:justify-start gap-4 mb-4 md:mb-0">
//         <button
//           onClick={onToggle}
//           className="hidden md:block p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all transform 
//             hover:scale-105 shadow-lg border border-blue-500"
//         >
//           ☰
//         </button>
//         <div className="flex flex-col min-w-0">
//           <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate">
//             Medicheck Portal - {getUserName()}
//           </h2>
//           <span className="md:hidden text-xs text-gray-500 capitalize mt-1">
//             {getUserRole()}
//           </span>
//         </div>
//       </div>
      
//       {/* Right Section */}
//       <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//         {/* Backend Status */}
//         {renderBackendStatus()}

//         {/* MetaMask Status - Using MetaMaskConnector component */}
//         <div className="hidden sm:block">
//           <MetaMaskConnector 
//             metamask={metamask}
//             compact={true}
//           />
//         </div>
        
//         {/* MetaMask Status - Mobile */}
//         <div className="sm:hidden">
//           <MetaMaskConnector 
//             metamask={metamask}
//             compact={true}
//           />
//         </div>

//         {/* User Info */}
//         {user && (
//           <div className="flex items-center gap-3 border-t border-gray-200 pt-3 sm:border-t-0 sm:pt-0">
//             {/* Avatar */}
//             <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full 
//               flex items-center justify-center text-blue-600 font-bold shadow-lg border 
//               border-blue-200 flex-shrink-0">
//               {getUserInitial()}
//             </div>
            
//             {/* User details */}
//             <div className="hidden md:flex flex-1 min-w-0">
//               <div className="flex flex-col min-w-0">
//                 <div className="text-gray-800 font-medium truncate text-sm">{getUserName()}</div>
//                 <div className="text-gray-600 text-xs capitalize truncate">{getUserRole()}</div>
//               </div>
//             </div>
            
//             {/* Mobile user indicator */}
//             <div className="md:hidden flex items-center">
//               <div className="text-xs text-gray-500">
//                 {getUserName().split(' ')[0]}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Topbar;
