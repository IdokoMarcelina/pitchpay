import { useState, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { api } from '../lib/api';

export function useAuth() {
  const { address, isConnected, signMessage } = useWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticatedAddress, setAuthenticatedAddress] = useState<string | null>(null);

  const requestAuth = useCallback(async () => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsAuthenticating(true);
    try {
      const { nonce, message } = await api.getNonce(address);
      
      const signature = await signMessage(message);
      
      const result = await api.verifyAuth(address, signature, nonce);
      
      if (result.authenticated) {
        setAuthenticatedAddress(result.address);
        return result.address;
      }
      
      throw new Error('Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessage]);

  const getAuthHeader = useCallback(() => {
    if (!authenticatedAddress) return null;
    return authenticatedAddress;
  }, [authenticatedAddress]);

  const clearAuth = useCallback(() => {
    setAuthenticatedAddress(null);
  }, []);

  return {
    isAuthenticated: !!authenticatedAddress,
    isAuthenticating,
    authenticatedAddress,
    requestAuth,
    getAuthHeader,
    clearAuth,
    walletAddress: address,
    isWalletConnected: isConnected,
  };
}
