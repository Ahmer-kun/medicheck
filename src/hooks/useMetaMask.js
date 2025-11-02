import { useState, useEffect } from "react";

function useMetaMask() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install it to use this feature.");
      return false;
    }

    try {
      setError(null);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(chainId);
        
        return true;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    setError(null);
  };

  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(chainId);
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return {
    account,
    chainId,
    isConnected,
    error,
    connect,
    disconnect,
    isMetaMaskInstalled
  };
}

export default useMetaMask;