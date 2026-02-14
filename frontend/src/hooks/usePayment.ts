import { useState, useCallback } from 'react';
import { api, type PaymentDetails, type PitchCategory } from '../lib/api';
import { payForPitch, payForBoost, type TransactionResult } from '../lib/transactions';

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPitchWithPayment = useCallback(async (
    data: { title: string; description: string; website: string; founder: string; category?: PitchCategory; logoUrl?: string; deckUrl?: string },
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
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to create pitch';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const submitPitchPayment = useCallback(async (
    pitchIdHash: string,
    onPending: (txid: string) => void,
    onSuccess: (txid: string) => void,
    onError: (error: string) => void
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result: TransactionResult = await payForPitch(pitchIdHash);

      if (result.success && result.txid) {
        onPending(result.txid);
        onSuccess(result.txid);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Payment failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const verifyPitchPayment = useCallback(async (
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
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Payment verification failed';
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
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to boost pitch';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const submitBoostPayment = useCallback(async (
    pitchIdHash: string,
    onPending: (txid: string) => void,
    onSuccess: (txid: string) => void,
    onError: (error: string) => void
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result: TransactionResult = await payForBoost(pitchIdHash);

      if (result.success && result.txid) {
        onPending(result.txid);
        onSuccess(result.txid);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Boost payment failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const verifyBoostPayment = useCallback(async (
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
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Boost verification failed';
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
    submitPitchPayment,
    verifyPitchPayment,
    boostPitchWithPayment,
    submitBoostPayment,
    verifyBoostPayment,
  };
}
