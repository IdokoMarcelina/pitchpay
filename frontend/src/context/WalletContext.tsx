import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { StacksMockWallet } from '../lib/wallet';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isLoading: false,
  });

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const wallet = new StacksMockWallet();
      await wallet.connect();
      setState({
        address: wallet.address,
        isConnected: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      isLoading: false,
    });
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!state.address) {
      throw new Error('Wallet not connected');
    }
    return `mock_signature_for_${message}`;
  }, [state.address]);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, signMessage }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
