import { useState, useEffect, useCallback } from 'react';
import { api, type Pitch } from '../lib/api';

interface UserProfile {
    address: string;
    pitches: Pitch[];
    investedPitches: Pitch[];
    stats: {
        pitchesCreated: number;
        pitchesInvested: number;
        totalInvested: number;
        totalRaised: number;
        rewardBalance: number;
    };
    receipts: Array<{
        receiptId: number;
        txid: string;
        amount: number;
        "pitch-id": string;
        investor: string;
        timestamp: number;
        pitchTitle?: string;
        status: 'VERIFIED' | 'PENDING';
    }>;
    notifications: any[];
}

export function useProfile(address: string | null) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!address) return;

        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getUserProfile(address);
            setProfile(data as UserProfile);
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to fetch profile');
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        isLoading,
        error,
        refetch: fetchProfile,
    };
}
