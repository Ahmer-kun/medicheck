import React, { useState } from 'react';

function MetaMaskConnector({ metamask, onSuccess, compact = false }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleConnect = async () => {
    try {
      const success = await metamask.connect();
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const installMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  // If MetaMask is not installed
  if (!metamask.isMetaMaskInstalled) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={installMetaMask}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 
            text-white px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 
            shadow-lg border border-orange-400 flex items-center justify-center gap-2"
        >
          <span className="text-lg">🦊</span>
          <span>Install MetaMask</span>
        </button>
      </div>
    );
  }

  // If connected
  if (metamask.isConnected && metamask.account) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700">
              {`${metamask.account.slice(0, 6)}...${metamask.account.slice(-4)}`}
            </span>
          </div>
        </div>
        <button
          onClick={metamask.disconnect}
          className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded 
            transition-colors border border-red-200"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Connection button
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleConnect}
        disabled={metamask.loading}
        className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
          text-white px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 
          shadow-lg border border-blue-400 flex items-center justify-center gap-2
          ${metamask.loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {metamask.loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <span className="text-lg">🦊</span>
            <span>Connect MetaMask</span>
          </>
        )}
      </button>

      {/* Error display */}
      {metamask.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-red-500">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium">{metamask.error}</p>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-red-500 mt-1 hover:text-red-700"
              >
                {showDetails ? 'Hide details' : 'Troubleshoot'}
              </button>
              
              {showDetails && (
                <div className="mt-2 text-xs text-red-600 space-y-1">
                  <p>1. Click the MetaMask extension icon</p>
                  <p>2. Unlock with password if needed</p>
                  <p>3. Refresh page and try again</p>
                  <p>4. Make sure MetaMask is latest version</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MetaMaskConnector;