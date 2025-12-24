import React, { useState } from 'react';
import { api } from '../utils/api';
import useMetaMask from '../hooks/useMetaMask';

function CompanyMetaMaskConnector({ companyId, companyName, companyType, currentAddress, onConnectionChange }) {
  const metamask = useMetaMask();
  const [address, setAddress] = useState(currentAddress || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnect = async () => {
    // Check if MetaMask is available using the hook
    if (!metamask.isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install MetaMask first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Connect to MetaMask using the hook
      const connected = await metamask.connect();
      
      if (!connected || !metamask.account) {
        throw new Error('Failed to connect to MetaMask');
      }

      const connectedAddress = metamask.account;
      
      // Update company with blockchain address
      const endpoint = companyType === 'manufacturer' 
        ? `/manufacturer-companies/${companyId}/blockchain-address`
        : `/pharmacy-companies/${companyId}/blockchain-address`;

      const response = await api.put(endpoint, {
        blockchainAddress: connectedAddress
      });

      if (response.success) {
        setAddress(connectedAddress);
        setSuccess(`Blockchain address connected: ${connectedAddress.substring(0, 8)}...`);
        
        // Notify parent component
        if (onConnectionChange) {
          onConnectionChange({
            connected: true,
            address: connectedAddress,
            companyId: companyId
          });
        }
      } else {
        throw new Error(response.message || 'Failed to update company address');
      }

    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect MetaMask');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const endpoint = companyType === 'manufacturer' 
        ? `/manufacturer-companies/${companyId}/blockchain-address`
        : `/pharmacy-companies/${companyId}/blockchain-address`;

      const response = await api.put(endpoint, {
        blockchainAddress: ''
      });

      if (response.success) {
        setAddress('');
        setSuccess('Blockchain address disconnected');
        
        // Disconnect from MetaMask if you want
        if (metamask.isConnected) {
          metamask.disconnect();
        }
        
        // Notify parent component
        if (onConnectionChange) {
          onConnectionChange({
            connected: false,
            address: '',
            companyId: companyId
          });
        }
      } else {
        throw new Error(response.message || 'Failed to disconnect');
      }

    } catch (err) {
      console.error('Disconnection error:', err);
      setError('Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  // Show MetaMask status
  const showMetaMaskStatus = () => {
    if (!metamask.isMetaMaskInstalled) {
      return (
        <div className="text-xs text-red-600 mb-1">
          ⚠️ MetaMask not installed
        </div>
      );
    }

    if (metamask.isConnected && metamask.account) {
      return (
        <div className="text-xs text-green-600 mb-1 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          MetaMask connected: {metamask.account.substring(0, 6)}...
        </div>
      );
    }

    return (
      <div className="text-xs text-yellow-600 mb-1">
        🔗 Connect MetaMask to assign address
      </div>
    );
  };

  // Check if the company already has an address connected
  const isConnected = address && address !== '';

  return (
    <div className="mt-2">
      <div className="text-xs font-medium text-gray-700 mb-1">Blockchain Address</div>
      
      {showMetaMaskStatus()}
      
      {isConnected ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded border truncate flex-1">
              {address.substring(0, 12)}...{address.substring(address.length - 8)}
            </div>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'Disconnect'}
            </button>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Company Address Saved</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleConnect}
            disabled={loading || !metamask.isMetaMaskInstalled}
            className="w-full text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded border border-blue-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                <span className="text-xs">🦊</span>
                {metamask.isConnected ? 'Use Current Address' : 'Connect MetaMask'}
              </>
            )}
          </button>
          {address === '' && (
            <div className="text-xs text-gray-500 text-center">
              No address assigned yet
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 mt-1 p-1 bg-red-50 rounded border border-red-200">
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div className="text-xs text-green-600 mt-1 p-1 bg-green-50 rounded border border-green-200">
          ✅ {success}
        </div>
      )}
    </div>
  );
}

export default CompanyMetaMaskConnector;