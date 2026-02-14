import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Rocket, ArrowLeft, Loader2, Check, Zap, X } from 'lucide-react';
import { motion } from 'framer-motion';
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

    // Restore state from localStorage
    React.useEffect(() => {
        const savedTxid = localStorage.getItem('pitchpay_pending_boost_txid');
        const savedId = localStorage.getItem('pitchpay_pending_boost_id');
        if (savedTxid) setPendingTxid(savedTxid);
        if (savedId) setBoostingId(savedId);
    }, []);

    // Persist state to localStorage
    React.useEffect(() => {
        if (pendingTxid) localStorage.setItem('pitchpay_pending_boost_txid', pendingTxid);
        else localStorage.removeItem('pitchpay_pending_boost_txid');
    }, [pendingTxid]);

    React.useEffect(() => {
        if (boostingId) localStorage.setItem('pitchpay_pending_boost_id', boostingId);
        else localStorage.removeItem('pitchpay_pending_boost_id');
    }, [boostingId]);

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

    const handleSubmitPayment = async (pitchId: string) => {
        if (!address || !paymentDetails?.payment_details.contract_call?.args?.[0]) return;

        const pitchIdHash = paymentDetails.payment_details.contract_call.args[0].replace('0x', '');

        try {
            await new Promise<void>((resolve, reject) => {
                submitBoostPayment(
                    pitchIdHash,
                    address,
                    paymentDetails.payment_details.amount,
                    (txid) => setPendingTxid(txid),
                    (txid) => {
                        handleVerifyPayment(pitchId, txid);
                        resolve();
                    },
                    (err) => reject(new Error(err))
                );
            });
        } catch (err) {
            console.error('Payment error:', err);
        }
    };

    const handleVerifyPayment = async (pitchId: string, txid?: string) => {
        const verifyTxid = txid || pendingTxid;
        if (!verifyTxid || !address) return;

        try {
            await new Promise<void>((resolve, reject) => {
                verifyBoostPayment(
                    pitchId,
                    verifyTxid,
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

            <main className="container mx-auto px-6 pt-32 pb-24">
                <Link to="/dashboard" className="inline-flex items-center gap-3 text-white/40 hover:text-white transition-all mb-12 group glass px-4 py-2 rounded-xl">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Dashboard</span>
                </Link>

                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-brand-accent/10 rounded-3xl mb-8 relative"
                        >
                            <Zap size={36} className="text-brand-accent relative z-10" />
                            <div className="absolute inset-0 bg-brand-accent/20 blur-2xl rounded-full"></div>
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                            Boost Your <span className="text-gradient">Portfolio</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            Ascend to the top. Boosted pitches gain 2x more visibility and exclusive placement in the featured spotlight.
                        </p>
                    </div>

                    {paymentDetails && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="card-premium mb-12 border-brand-accent/20 bg-brand-accent/5 ring-1 ring-brand-accent/10"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                                        <Rocket size={24} className="text-brand-accent" /> Payment Required
                                    </h3>
                                    <p className="text-slate-400">
                                        Activate your boost for <span className="text-white font-bold">{(paymentDetails.payment_details.amount / 1000000).toFixed(2)} STX</span>
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        variant="primary"
                                        onClick={() => handleSubmitPayment(boostingId || '')}
                                        isLoading={isProcessing}
                                    >
                                        Complete Payment
                                    </Button>
                                    <Button variant="ghost" onClick={() => { setPaymentDetails(null); setBoostingId(null); }}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {pendingTxid && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="card-premium mb-12 border-brand-gold/20 bg-brand-gold/5"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2 text-brand-gold flex items-center gap-3">
                                        <Loader2 size={24} className="animate-spin" /> Transaction Pending
                                    </h3>
                                    <p className="text-slate-400 text-sm font-mono truncate max-w-xs">
                                        TX: {pendingTxid}
                                    </p>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleVerifyPayment(boostingId || '')}
                                    isLoading={isProcessing}
                                >
                                    Verify Confirmation
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <div className="mb-12 p-6 glass border-red-500/20 rounded-3xl text-red-400 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                <X size={24} />
                            </div>
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4 mb-20">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold">Your Startups</h3>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 glass px-3 py-1 rounded-full">
                                {userPitches.length} Total
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 glass rounded-[2.5rem]">
                                <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
                                <p className="text-slate-500 font-medium tracking-wide">Loading your portfolio...</p>
                            </div>
                        ) : userPitches.length > 0 ? (
                            <div className="grid gap-4">
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
                            <div className="text-center py-24 card-premium border-dashed border-white/10 hover:border-white/20">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Rocket size={32} className="text-white/20" />
                                </div>
                                <h4 className="text-xl font-bold mb-3">No Pitches Found</h4>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Create a pitch first to start boosting your visibility.</p>
                                <Button variant="primary" onClick={() => navigate('/create')}>
                                    Create Your First Pitch
                                </Button>
                            </div>
                        )}
                    </div>
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
        <motion.div
            whileHover={{ scale: 1.01 }}
            className={`card-premium flex flex-col md:flex-row items-center justify-between gap-8 ${pitch.isBoosted ? 'border-brand-accent/40 bg-brand-accent/5' : ''}`}
        >
            <div className="flex-grow">
                <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold tracking-tight">{pitch.title}</h3>
                    {pitch.isBoosted && (
                        <span className="badge-premium border-brand-accent/30 text-brand-accent bg-brand-accent/10">Featured</span>
                    )}
                </div>
                <p className="text-slate-400 leading-relaxed max-w-2xl line-clamp-2">{pitch.description}</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                {isSuccess || pitch.isBoosted ? (
                    <div className="flex items-center gap-3 px-6 py-4 glass rounded-2xl text-brand-accent border-brand-accent/20 w-full md:w-auto justify-center">
                        <Check size={20} />
                        <span className="font-bold tracking-wide uppercase text-sm">Boost Active</span>
                    </div>
                ) : (
                    <Button
                        variant="primary"
                        onClick={onBoost}
                        isLoading={isBoosting}
                        className="w-full md:w-auto min-w-[160px]"
                    >
                        <Zap size={18} className="mr-2" />
                        Boost Now
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

export default Boost;
