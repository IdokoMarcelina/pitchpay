import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { wallet } from '../lib/wallet';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isLoading: true,
  });

  useEffect(() => {
    const storedAddress = wallet.getAddress();
    if (storedAddress) {
      setState({
        address: storedAddress,
        isConnected: true,
        isLoading: false,
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const session = await wallet.connect();
      setState({
        address: session.address,
        isConnected: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    await wallet.disconnect();
    setState({
      address: null,
      isConnected: false,
      isLoading: false,
    });
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    return wallet.signMessage(message);
  }, []);

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
