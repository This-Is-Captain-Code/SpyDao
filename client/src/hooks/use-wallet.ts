import { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserProvider } from 'ethers';

const RAYLS_DEVNET_CHAIN_ID = '0x1e0f3'; // 123123 in hex
const RAYLS_DEVNET_PARAMS = {
  chainId: RAYLS_DEVNET_CHAIN_ID,
  chainName: 'Rayls Testnet',
  nativeCurrency: {
    name: 'USDgas',
    symbol: 'USDgas',
    decimals: 18,
  },
  rpcUrls: ['https://devnet-rpc.rayls.com'],
  blockExplorerUrls: ['https://devnet-explorer.rayls.com'],
};

interface WalletState {
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  chainId: string | null;
  isCorrectNetwork: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnecting: false,
    error: null,
    chainId: null,
    isCorrectNetwork: false,
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
      const network = await provider.getNetwork();
      const chainId = '0x' + network.chainId.toString(16);
      
      if (accounts.length > 0) {
        setState(prev => ({ 
          ...prev, 
          address: accounts[0].address,
          chainId,
          isCorrectNetwork: chainId === RAYLS_DEVNET_CHAIN_ID,
        }));
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

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({ 
        ...prev, 
        chainId,
        isCorrectNetwork: chainId === RAYLS_DEVNET_CHAIN_ID,
      }));
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
      const network = await provider.getNetwork();
      const chainId = '0x' + network.chainId.toString(16);
      
      if (accounts.length > 0) {
        setState({
          address: accounts[0],
          isConnecting: false,
          error: null,
          chainId,
          isCorrectNetwork: chainId === RAYLS_DEVNET_CHAIN_ID,
        });
      }
    } catch (error: any) {
      setState({
        address: null,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
        chainId: null,
        isCorrectNetwork: false,
      });
    }
  };

  const switchToRaylsDevnet = async () => {
    if (!window.ethereum) {
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: RAYLS_DEVNET_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [RAYLS_DEVNET_PARAMS],
          });
        } catch (addError) {
          console.error('Error adding Rayls Devnet:', addError);
        }
      } else {
        console.error('Error switching to Rayls Devnet:', switchError);
      }
    }
  };

  const disconnectWallet = () => {
    setState({
      address: null,
      isConnecting: false,
      error: null,
      chainId: null,
      isCorrectNetwork: false,
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    address: state.address,
    isConnecting: state.isConnecting,
    error: state.error,
    chainId: state.chainId,
    isCorrectNetwork: state.isCorrectNetwork,
    provider,
    connectWallet,
    disconnectWallet,
    switchToRaylsDevnet,
    truncateAddress,
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
