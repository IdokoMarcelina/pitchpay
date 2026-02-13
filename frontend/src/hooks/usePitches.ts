import { useState, useEffect, useCallback } from 'react';
import { api, type Pitch, type PaginatedResponse } from '../lib/api';

interface UsePitchesOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function usePitches({ page = 1, limit = 10, autoFetch = true }: UsePitchesOptions = {}) {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Pitch>['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPitches = useCallback(async (pageNum: number = page) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getPitches(pageNum, limit);
      setPitches(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pitches');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    if (autoFetch) {
      fetchPitches();
    }
  }, [autoFetch, fetchPitches]);

  const refetch = useCallback(() => {
    fetchPitches();
  }, [fetchPitches]);

  return {
    pitches,
    pagination,
    isLoading,
    error,
    refetch,
    fetchPage: fetchPitches,
  };
}

export function usePitch(id: string) {
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPitch = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPitch(id);
      setPitch(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pitch');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPitch();
  }, [fetchPitch]);

  const refetch = useCallback(() => {
    fetchPitch();
  }, [fetchPitch]);

  return {
    pitch,
    isLoading,
    error,
    refetch,
  };
}
