import { STACKS_TESTNET } from '@stacks/network';
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';

let currentAddress: string | null = null;
const AUTH_STORAGE_KEY = 'stacks-wallet-auth';

export interface WalletSession {
  address: string;
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
    console.log('Initiating wallet connection via @stacks/connect...');
    try {
      const result = await connect({
        network: 'testnet',
      });

      console.log('Wallet connection result:', result);

      const stxAddress = result.addresses.find(a => a.address.startsWith('ST'))?.address
        || result.addresses[0]?.address;

      if (stxAddress) {
        currentAddress = stxAddress;
        storeAuth(currentAddress);
        return { address: currentAddress };
      }

      throw new Error('No Stacks address found');
    } catch (error: any) {
      console.error('Connection error:', error);
      throw error;
    }
  },

  async disconnect(): Promise<void> {
    disconnect();
    currentAddress = null;
    clearAuth();
  },

  isConnected(): boolean {
    if (currentAddress) return true;

    // Check @stacks/connect standard storage if available
    if (isConnected()) {
      const storage = getLocalStorage();
      const address = storage.addresses?.[0]?.address;
      if (address) {
        currentAddress = address;
        return true;
      }
    }

    const stored = getStoredAuth();
    if (stored?.address) {
      currentAddress = stored.address;
      return true;
    }
    return false;
  },

  getAddress(): string | null {
    if (currentAddress) return currentAddress;

    if (isConnected()) {
      const storage = getLocalStorage();
      const address = storage.addresses?.[0]?.address;
      if (address) {
        currentAddress = address;
        return address;
      }
    }

    const stored = getStoredAuth();
    if (stored?.address) {
      currentAddress = stored.address;
      return stored.address;
    }
    return null;
  },

  async signMessage(_message: string): Promise<string> {
    const address = this.getAddress();
    if (!address) {
      throw new Error('Wallet not connected');
    }
    // Note: Version 8 uses request('stx_signMessage', { message })
    // But for now we'll keep it simple or implement if actually needed.
    return Promise.reject(new Error('signMessage not implemented in new wallet flow'));
  },

  getNetwork() {
    return STACKS_TESTNET;
  },
};

export { STACKS_TESTNET as network };
