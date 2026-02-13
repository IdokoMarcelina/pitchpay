export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
};

export const STACKS_CONFIG = {
  network: import.meta.env.VITE_NETWORK || 'testnet',
  appName: 'PitchPay',
};
