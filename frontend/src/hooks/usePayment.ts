import { useState, useCallback } from 'react';
import { api, type PaymentDetails } from '../lib/api';

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPitchWithPayment = useCallback(async (
    data: { title: string; description: string; website: string; founder: string },
    onPaymentRequired: (details: PaymentDetails) => void,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await api.createPitch(data);
      
      if ('status' in response && response.status === 402) {
        onPaymentRequired(response as PaymentDetails);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create pitch';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const verifyPayment = useCallback(async (
    pitchId: string,
    txid: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      await api.verifyPitch(pitchId, txid);
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Payment verification failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const boostPitchWithPayment = useCallback(async (
    pitchId: string,
    authHeader: string,
    onPaymentRequired: (details: PaymentDetails) => void,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await api.boostPitch(pitchId, authHeader);
      
      if ('status' in response && response.status === 402) {
        onPaymentRequired(response as PaymentDetails);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to boost pitch';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const verifyBoost = useCallback(async (
    pitchId: string,
    txid: string,
    authHeader: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      await api.verifyBoost(pitchId, txid, authHeader);
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Boost verification failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    error,
    clearError: () => setError(null),
    createPitchWithPayment,
    verifyPayment,
    boostPitchWithPayment,
    verifyBoost,
  };
}
