import { disconnect, request } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';

let currentAddress: string | null = null;

const AUTH_STORAGE_KEY = 'stacks-wallet-auth';

export interface WalletSession {
  address: string;
  pubKey?: string;
}

function getStoredAuth(): { address: string } | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.address ? { address: parsed.address } : null;
    }
  } catch (e) {
    console.error('Error reading wallet auth:', e);
  }
  return null;
}

function storeAuth(address: string): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ address }));
  } catch (e) {
    console.error('Error storing wallet auth:', e);
  }
}

function clearAuth(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing wallet auth:', e);
  }
}

export const wallet = {
  async connect(): Promise<WalletSession> {
    try {
      const response = await request('stx_getAddresses', {
        network: 'testnet',
      }) as { addresses: { address: string }[] };
      
      if (response?.addresses?.[0]?.address) {
        currentAddress = response.addresses[0].address;
        storeAuth(currentAddress);
        return { address: currentAddress };
      }
      
      throw new Error('Authentication failed');
    } catch (error: unknown) {
      const err = error as { message?: string; code?: number };
      if (err.message === 'User cancelled authentication' || err.code === 4001) {
        throw new Error('User cancelled wallet connection');
      }
      throw error;
    }
  },

  async disconnect(): Promise<void> {
    try {
      disconnect();
    } catch (e) {
      console.error('Error disconnecting wallet:', e);
    }
    currentAddress = null;
    clearAuth();
  },

  isConnected(): boolean {
    if (currentAddress) return true;
    
    const stored = getStoredAuth();
    if (stored?.address) {
      currentAddress = stored.address;
      return true;
    }
    return false;
  },

  getAddress(): string | null {
    if (currentAddress) return currentAddress;
    
    const stored = getStoredAuth();
    if (stored?.address) {
      currentAddress = stored.address;
      return stored.address;
    }
    return null;
  },

  async signMessage(message: string): Promise<string> {
    const address = this.getAddress();
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await request('stx_signMessage', {
        message,
      }) as { signature: string; publicKey: string };
      
      return response.signature;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: number };
      if (err.message?.includes('cancel') || err.code === 4001) {
        throw new Error('User cancelled message signing');
      }
      throw error;
    }
  },

  getNetwork() {
    return STACKS_TESTNET;
  },
};

export { STACKS_TESTNET as network };
