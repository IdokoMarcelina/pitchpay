import { API_CONFIG } from './config';

export const PITCH_CATEGORIES = ['DeFi', 'NFT', 'Gaming', 'Social', 'Infrastructure', 'Tools', 'Other'] as const;
export type PitchCategory = typeof PITCH_CATEGORIES[number];

export interface Investment {
  investor: string;
  amount: number;
  txid: string;
  createdAt: string;
}

export interface Pitch {
  _id: string;
  pitchIdHash: string;
  title: string;
  description: string;
  website: string;
  founder: string;
  category: PitchCategory;
  logoUrl?: string;
  deckUrl?: string;
  isBoosted: boolean;
  txid?: string;
  status: 'PENDING' | 'PAID' | 'VERIFIED';
  investments: Investment[];
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaymentDetails {
  status: number;
  message: string;
  payment_details: {
    type: string;
    amount: number;
    memo?: string;
    contract_call?: {
      contract: string;
      function: string;
      args: string[];
    };
    internal_id: string;
  };
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (response.status === 402) {
    const data = await response.json();
    return data as T;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(error.error || 'Request failed', response.status);
  }

  return response.json();
}

export const api = {
  // Pitches
  getPitches: (page = 1, limit = 10, search?: string, category?: string, sort?: string, founder?: string, user?: string) =>
    fetchApi<PaginatedResponse<Pitch>>(`/pitches?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}${category ? `&category=${encodeURIComponent(category)}` : ''}${sort ? `&sort=${sort}` : ''}${founder ? `&founder=${encodeURIComponent(founder)}` : ''}${user ? `&user=${encodeURIComponent(user)}` : ''}`),

  getPitch: (id: string) =>
    fetchApi<Pitch>(`/pitches/${id}`),

  getPitchPaymentDetails: (id: string) =>
    fetchApi<PaymentDetails>(`/pitches/${id}/payment-details`),

  createPitch: (data: { title: string; description: string; website: string; founder: string }, authHeader?: string) =>
    fetchApi<Pitch | PaymentDetails>('/pitches', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeader ? { Authorization: `Bearer ${authHeader}` } : {},
    }),

  updatePitch: (id: string, data: Partial<Pitch>, authHeader: string) =>
    fetchApi<Pitch>(`/pitches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${authHeader}` },
    }),

  deletePitch: (id: string, authHeader: string) =>
    fetchApi<{ message: string }>(`/pitches/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authHeader}` },
    }),

  // Payment verification
  verifyPitch: (id: string, txid: string) =>
    fetchApi<{ message: string; pitch: Pitch }>(`/pitches/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ txid }),
    }),

  // Boost
  boostPitch: (id: string, authHeader: string) =>
    fetchApi<PaymentDetails>(`/pitches/${id}/boost`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authHeader}` },
    }),

  verifyBoost: (id: string, txid: string, authHeader: string) =>
    fetchApi<{ message: string; pitch: Pitch }>(`/pitches/${id}/verify-boost`, {
      method: 'POST',
      body: JSON.stringify({ txid }),
      headers: { Authorization: `Bearer ${authHeader}` },
    }),

  // Invest
  investPitch: (id: string, amount?: number) =>
    fetchApi<PaymentDetails>(`/pitches/${id}/invest`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  verifyInvestment: (id: string, txid: string, investor: string, amount: number) =>
    fetchApi<{ message: string }>(`/pitches/${id}/verify-investment`, {
      method: 'POST',
      body: JSON.stringify({ txid, investor, amount }),
    }),

  // User Profile
  getUserProfile: (address: string) =>
    fetchApi<{
      address: string;
      pitches: Pitch[];
      investedPitches: Pitch[];
      stats: {
        pitchesCreated: number;
        pitchesInvested: number;
        totalInvested: number;
        totalRaised: number;
        rewardBalance?: number;
      };
      receipts?: Array<{
        receiptId: number;
        txid: string;
        amount: number;
        "pitch-id": string;
        investor: string;
        timestamp: number;
      }>;
      notifications: any[];
    }>(`/users/${address}`),

  // Notifications
  getNotifications: (address: string) =>
    fetchApi<{ notifications: any[] }>(`/users/${address}/notifications`),

  // Sync
  syncPitch: (id: string) =>
    fetchApi<{ message: string; updated?: boolean; newStatus?: string }>(`/pitches/${id}/sync`, {
      method: 'POST',
    }),

  // Auth
  getNonce: (address: string) =>
    fetchApi<{ nonce: string; message: string }>('/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ address }),
    }),

  verifyAuth: (address: string, signature: string, nonce: string) =>
    fetchApi<{ authenticated: boolean; address: string }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ address, signature, nonce }),
    }),
};

export { ApiError };
