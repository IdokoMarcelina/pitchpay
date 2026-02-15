import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Rocket, ArrowLeft, Loader2, Check, Zap } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { usePitches } from '../hooks/usePitches';
import { usePayment } from '../hooks/usePayment';
import type { PaymentDetails } from '../lib/api';

const Boost: React.FC = () => {
    const navigate = useNavigate();
    const { address } = useWallet();
    const { pitches, isLoading, error, refetch } = usePitches({ limit: 50 });
    const { isProcessing, boostPitchWithPayment, submitBoostPayment, verifyBoostPayment } = usePayment();

    const userPitches = pitches.filter(p =>
        address && p.founder.toLowerCase() === address.toLowerCase()
    );

    const [boostingId, setBoostingId] = useState<string | null>(null);
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
    const [pendingTxid, setPendingTxid] = useState<string | null>(null);
    const [successIds, setSuccessIds] = useState<Set<string>>(new Set());

    const handleBoost = async (pitchId: string) => {
        if (!address) {
            alert('Please connect your wallet first');
            return;
        }

        setBoostingId(pitchId);

        try {
            await new Promise<void>((resolve, reject) => {
                boostPitchWithPayment(
                    pitchId,
                    address,
                    (details) => {
                        setPaymentDetails(details);
                        resolve();
                    },
                    () => {
                        reject(new Error('Boost failed'));
                    },
                    (err) => {
                        reject(new Error(err));
                    }
                );
            });
        } catch (err) {
            console.error('Boost error:', err);
            setBoostingId(null);
        }
    };

    const handleSubmitPayment = async () => {
        try {
            if (!address || !paymentDetails || !paymentDetails.payment_details.contract_call) return;

            const pitchIdHash = paymentDetails.payment_details.contract_call.args[0].replace('0x', '');

            await new Promise<void>((resolve, reject) => {
                submitBoostPayment(
                    pitchIdHash,
                    address,
                    paymentDetails.payment_details.amount,
                    (txid) => setPendingTxid(txid),
                    () => resolve(),
                    (err) => reject(new Error(err))
                );
            });
        } catch (err) {
            console.error('Payment error:', err);
        }
    };

    const handleVerifyPayment = async () => {
        if (!pendingTxid || !address || !paymentDetails) return;

        const pitchId = paymentDetails.payment_details.internal_id;

        try {
            await new Promise<void>((resolve, reject) => {
                verifyBoostPayment(
                    pitchId,
                    pendingTxid,
                    address,
                    () => {
                        setSuccessIds(prev => new Set(prev).add(pitchId));
                        setPaymentDetails(null);
                        setPendingTxid(null);
                        setBoostingId(null);
                        refetch();
                        resolve();
                    },
                    (err) => reject(new Error(err))
                );
            });
        } catch (err) {
            console.error('Verify error:', err);
        }
    };

    if (!address) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <main className="container mx-auto px-4 pt-32 pb-20">
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
                        <p className="text-white/40 mb-6">Please connect your wallet to boost your pitches.</p>
                        <Button variant="primary" onClick={() => navigate('/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="container mx-auto px-4 pt-32 pb-20">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Link>

                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/20 rounded-2xl mb-6">
                            <Zap size={32} className="text-brand-accent" />
                        </div>
                        <h1 className="text-4xl font-extrabold mb-4">Boost Your <span className="text-gradient">Portfolio</span></h1>
                        <p className="text-white/60 text-lg max-w-xl mx-auto">
                            Get 2x more visibility for your startups. Boosted pitches appear in the featured section and get priority placement.
                        </p>
                    </div>

                    {paymentDetails && (
                        <div className="glass p-6 rounded-2xl mb-8 border-brand-accent/30 bg-brand-accent/5">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Rocket size={20} className="text-brand-accent" /> Boost "{pitches.find(p => p._id === boostingId)?.title || 'Pitch'}"
                            </h3>
                            <div className="p-4 bg-brand-primary/50 rounded-xl mb-6 border border-brand-accent/20">
                                <p className="text-sm text-white/60 mb-1">Total Fee:</p>
                                <p className="text-2xl font-black text-brand-accent">
                                    {(paymentDetails.payment_details.amount / 1000000).toFixed(2)} STX
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    variant="primary"
                                    onClick={handleSubmitPayment}
                                    disabled={isProcessing}
                                    className="flex-1 py-4"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin mr-2" size={18} /> : <Zap size={18} className="mr-2" />}
                                    Pay & Boost Now
                                </Button>
                                <Button variant="outline" className="px-6" onClick={() => { setPaymentDetails(null); setBoostingId(null); }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {pendingTxid && (
                        <div className="glass p-6 rounded-2xl mb-8 border-yellow-500/30 bg-yellow-500/5">
                            <h3 className="font-bold text-lg mb-4 text-yellow-400 flex items-center gap-2">
                                <Loader2 className="animate-spin" size={20} /> Boosting "{pitches.find(p => p._id === boostingId)?.title || 'Pitch'}"
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-black/20 rounded-xl">
                                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Transaction ID</p>
                                    <p className="font-mono text-xs text-white/60 break-all">{pendingTxid}</p>
                                </div>
                                <p className="text-white/40 text-sm">
                                    Your payment has been broadcast. Click verify to complete the boost once confirmed.
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={handleVerifyPayment}
                                    disabled={isProcessing}
                                    className="w-full"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                    Verify & Activate Boost
                                </Button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-brand-accent" size={32} />
                        </div>
                    ) : userPitches.length > 0 ? (
                        <div className="space-y-6">
                            {userPitches.map(pitch => (
                                <BoostCard
                                    key={pitch._id}
                                    pitch={pitch}
                                    isBoosting={boostingId === pitch._id}
                                    isSuccess={successIds.has(pitch._id)}
                                    onBoost={() => handleBoost(pitch._id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-white/40">
                            <p className="mb-4">You haven't created any pitches yet.</p>
                            <Button variant="outline" onClick={() => navigate('/create')}>
                                Create Your First Pitch
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const BoostCard: React.FC<{
    pitch: { _id: string; title: string; description: string; isBoosted: boolean; createdAt: string };
    isBoosting: boolean;
    isSuccess: boolean;
    onBoost: () => void;
}> = ({ pitch, isBoosting, isSuccess, onBoost }) => {
    return (
        <div className={`glass rounded-2xl p-6 flex items-center justify-between gap-6 ${pitch.isBoosted ? 'border-brand-accent/30 bg-brand-accent/5' : ''}`}>
            <div className="flex-grow">
                <h3 className="text-xl font-bold mb-2">{pitch.title}</h3>
                <p className="text-white/40 text-sm line-clamp-2">{pitch.description}</p>
            </div>
            <div className="flex items-center gap-4">
                {isSuccess || pitch.isBoosted ? (
                    <div className="flex items-center gap-2 text-green-400">
                        <Check size={20} />
                        <span className="font-medium">Boosted</span>
                    </div>
                ) : (
                    <Button
                        variant="primary"
                        onClick={onBoost}
                        disabled={isBoosting}
                        className="whitespace-nowrap"
                    >
                        {isBoosting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Zap size={18} className="mr-2" />}
                        Boost Now
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Boost;
