import { API_CONFIG } from './config';

export interface Pitch {
  _id: string;
  pitchIdHash: string;
  title: string;
  description: string;
  website: string;
  founder: string;
  isBoosted: boolean;
  txid?: string;
  status: 'PENDING' | 'PAID' | 'VERIFIED';
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
  getPitches: (page = 1, limit = 10) => 
    fetchApi<PaginatedResponse<Pitch>>(`/pitches?page=${page}&limit=${limit}`),
  
  getPitch: (id: string) => 
    fetchApi<Pitch>(`/pitches/${id}`),
  
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
  
  // Sync
  syncPitch: (id: string) => 
    fetchApi<{ message: string }>(`/pitches/${id}/sync`, {
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
