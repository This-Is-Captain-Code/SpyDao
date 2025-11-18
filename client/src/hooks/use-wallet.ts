import { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserProvider } from 'ethers';

interface WalletState {
  address: string | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnecting: false,
    error: null,
  });

  const provider = useMemo(() => {
    if (!window.ethereum) return null;
    return new BrowserProvider(window.ethereum);
  }, []);

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      if (!window.ethereum) {
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        setState(prev => ({ ...prev, address: accounts[0].address }));
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setState(prev => ({ ...prev, address: accounts[0], error: null }));
      } else {
        setState(prev => ({ ...prev, address: null }));
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [checkIfWalletIsConnected]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setState({
          address: accounts[0],
          isConnecting: false,
          error: null,
        });
      }
    } catch (error: any) {
      setState({
        address: null,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      });
    }
  };

  const disconnectWallet = () => {
    setState({
      address: null,
      isConnecting: false,
      error: null,
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    address: state.address,
    isConnecting: state.isConnecting,
    error: state.error,
    provider,
    connectWallet,
    disconnectWallet,
    truncateAddress,
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
