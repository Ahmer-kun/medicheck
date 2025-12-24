import { useState, useEffect, useCallback } from "react";

function useMetaMask() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Enhanced MetaMask detection
  const isMetaMaskInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    // Method 1: Modern MetaMask detection
    if (window.ethereum && window.ethereum.isMetaMask) {
      return true;
    }
    
    // Method 2: Multiple providers
    if (window.ethereum?.providers) {
      return window.ethereum.providers.some(provider => provider.isMetaMask);
    }
    
    // Method 3: Legacy detection
    if (typeof window.web3 !== 'undefined' && 
        window.web3.currentProvider && 
        window.web3.currentProvider.isMetaMask) {
      return true;
    }
    
    // Method 4: Check for MetaMask extension directly
    if (typeof window !== 'undefined') {
      try {
        // Try to access MetaMask's injected object
        if (window.ethereum && window.ethereum._metamask) {
          return true;
        }
      } catch (e) {
        console.log('MetaMask check failed:', e.message);
      }
    }
    
    console.log('MetaMask not detected. Available window objects:', {
      ethereum: !!window.ethereum,
      web3: !!window.web3,
      ethereumIsMetaMask: window.ethereum?.isMetaMask,
      providers: window.ethereum?.providers?.length
    });
    
    return false;
  }, []);

  // Get MetaMask provider
  const getMetaMaskProvider = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    if (window.ethereum) {
      // Modern MetaMask
      if (window.ethereum.isMetaMask) {
        return window.ethereum;
      }
      
      // Multiple providers
      if (window.ethereum.providers) {
        const metamaskProvider = window.ethereum.providers.find(
          provider => provider.isMetaMask
        );
        if (metamaskProvider) return metamaskProvider;
      }
    }
    
    // Legacy
    if (window.web3 && window.web3.currentProvider) {
      return window.web3.currentProvider;
    }
    
    return null;
  }, []);

  // Get network information
  const getNetworkInfo = useCallback(async () => {
    const provider = getMetaMaskProvider();
    if (!provider || !account) return null;
    
    try {
      const currentChainId = await provider.request({ method: 'eth_chainId' });
      const networkId = await provider.request({ method: 'net_version' });
      
      const networkNames = {
        '0x1': 'Ethereum Mainnet',
        '0x5': 'Goerli Testnet',
        '0xaa36a7': 'Sepolia Testnet', // 11155111 in decimal
        '0x89': 'Polygon Mainnet',
        '0x13881': 'Polygon Mumbai',
        '0x38': 'BNB Smart Chain',
        '0x61': 'BNB Testnet',
        '0xa86a': 'Avalanche',
        '0xa869': 'Avalanche Testnet'
      };
      
      const info = {
        chainId: currentChainId,
        networkId: networkId,
        name: networkNames[currentChainId] || `Unknown Network (${currentChainId})`,
        isTestnet: ['0x5', '0xaa36a7', '0x13881', '0x61'].includes(currentChainId)
      };
      
      setNetworkInfo(info);
      return info;
    } catch (error) {
      console.error('Error getting network info:', error);
      return null;
    }
  }, [getMetaMaskProvider, account]);

  const checkConnection = useCallback(async () => {
    const provider = getMetaMaskProvider();
    if (!provider) return false;

    try {
      // Use eth_accounts for silent check
      const accounts = await provider.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Get chain ID
        const chainId = await provider.request({ method: 'eth_chainId' });
        setChainId(chainId);
        
        // Get network info
        await getNetworkInfo();
        
        console.log('✅ Auto-connected to MetaMask:', accounts[0]);
        return true;
      } else {
        // No accounts connected
        setIsConnected(false);
        setAccount(null);
        return false;
      }
    } catch (err) {
      console.log('Check connection error:', err.message);
      setIsConnected(false);
      return false;
    }
  }, [getMetaMaskProvider, getNetworkInfo]);

  const connect = useCallback(async () => {
    const provider = getMetaMaskProvider();
    
    if (!provider) {
      setError("MetaMask is not installed or not detected. Please install MetaMask from https://metamask.io");
      setLoading(false);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🦊 Connecting to MetaMask...');

      // Method 1: Try eth_requestAccounts
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please create or import an account in MetaMask.");
      }

      const account = accounts[0];
      setAccount(account);
      setIsConnected(true);
      
      // Get chain ID
      const chainId = await provider.request({ method: 'eth_chainId' });
      setChainId(chainId);
      
      // Get network info
      await getNetworkInfo();
      
      console.log(`✅ Connected to MetaMask: ${account}`);
      
      setLoading(false);
      return true;

    } catch (err) {
      console.error('❌ MetaMask connection error:', err);
      
      let userMessage = err.message;
      
      // Handle specific error codes
      if (err.code === 4001) {
        userMessage = "Connection rejected. Please approve the connection in MetaMask.";
      } else if (err.code === -32002) {
        userMessage = "Connection already pending. Please check MetaMask extension.";
      } else if (err.code === -32603) {
        userMessage = "Internal error. Please try restarting MetaMask.";
      } else if (err.message.includes('Already processing')) {
        userMessage = "Already processing connection. Please check MetaMask.";
      } else if (err.message.includes('User denied')) {
        userMessage = "Connection denied. Please approve in MetaMask.";
      } else if (err.message.includes('extension not found')) {
        userMessage = "MetaMask extension not found. Please make sure it's installed and enabled.";
      }
      
      setError(userMessage);
      setLoading(false);
      return false;
    }
  }, [getMetaMaskProvider, getNetworkInfo]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    setNetworkInfo(null);
    setError(null);
    console.log('🔌 Disconnected from MetaMask');
  }, []);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (isMetaMaskInstalled()) {
        await checkConnection();
        
        const provider = getMetaMaskProvider();
        if (!provider) return;

        const handleAccountsChanged = (accounts) => {
          if (accounts.length === 0) {
            disconnect();
          } else {
            setAccount(accounts[0]);
            console.log('Account changed:', accounts[0]);
          }
        };

        const handleChainChanged = (chainId) => {
          setChainId(chainId);
          getNetworkInfo(); // Update network info when chain changes
          console.log('Chain changed:', chainId);
        };

        const handleDisconnect = () => {
          disconnect();
          console.log('MetaMask disconnected');
        };

        // Add event listeners
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('chainChanged', handleChainChanged);
        provider.on('disconnect', handleDisconnect);

        // Cleanup
        return () => {
          if (provider.removeListener) {
            provider.removeListener('accountsChanged', handleAccountsChanged);
            provider.removeListener('chainChanged', handleChainChanged);
            provider.removeListener('disconnect', handleDisconnect);
          }
        };
      }
    };

    init();
  }, [isMetaMaskInstalled, checkConnection, disconnect, getMetaMaskProvider, getNetworkInfo]);

  return {
    account,
    chainId,
    networkInfo,
    isConnected,
    error,
    loading,
    connect,
    disconnect,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    checkConnection,
    getNetworkInfo,
    provider: getMetaMaskProvider()
  };
}

export default useMetaMask;