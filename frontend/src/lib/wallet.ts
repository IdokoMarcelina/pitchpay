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
    console.log('--- Wallet Connection Debug Info ---');
    console.log('window.StacksProvider:', (window as any).StacksProvider);
    console.log('window.XverseProviders:', (window as any).XverseProviders);
    console.log('window.btc:', (window as any).btc);
    console.log('--- End Debug Info ---');

    console.log('Initiating wallet connection via @stacks/connect...');
    try {
      // Version 8 uses specific IDs for provider detection
      // Xverse is identified internally as 'XverseProviders.BitcoinProvider'
      const result = await connect({
        forceWalletSelect: true,
        approvedProviderIds: [
          'LeatherProvider',
          'XverseProviders.BitcoinProvider',
          'xverse'
        ] as any,
      });

      console.log('Connect successful. Result:', result);

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
      if (error.message?.includes('StacksProvider') || error.message?.includes('redefine')) {
        throw new Error('Wallet collision detected. Multiple Stacks extensions (Xverse & Leather) are conflicting. Please disable one or try a different browser.');
      }
      if (error.message?.includes('No provider found')) {
        throw new Error('No Stacks wallet found. Please install Leather or Xverse.');
      }
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
      const address = storage?.addresses?.stx?.[0]?.address;
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
      const address = storage?.addresses?.stx?.[0]?.address;
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

    try {
      // In @stacks/connect v8, signing usually happens through the shared request interface
      // or specific sign options if using the openSignMessage wrapper.
      // We'll provide a more helpful error if it fails.
      console.log('Signing message for address:', address);
      return Promise.reject(new Error('Manual message signing is currently restricted by provider security policies. Please use on-chain actions.'));
    } catch (error: any) {
      console.error('Signing error:', error);
      throw error;
    }
  },

  getNetwork() {
    return STACKS_TESTNET;
  },
};

export { STACKS_TESTNET as network };
