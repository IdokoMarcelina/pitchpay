import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Shield, ArrowLeft, Loader2, Twitter, Github, Linkedin, TrendingUp } from 'lucide-react';
import { usePitch } from '../hooks/usePitches';
import { useWallet } from '../context/WalletContext';
import { api, type PaymentDetails } from '../lib/api';
import { payForInvestment, type TransactionResult } from '../lib/transactions';

const PitchDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { pitch, isLoading, error } = usePitch(id || '');
    const { address, isConnected } = useWallet();
    
    const [showInvestModal, setShowInvestModal] = useState(false);
    const [investAmount, setInvestAmount] = useState<number>(5);
    const [isInvesting, setIsInvesting] = useState(false);
    const [investError, setInvestError] = useState<string | null>(null);
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
    const [pendingTxid, setPendingTxid] = useState<string | null>(null);
    const [investSuccess, setInvestSuccess] = useState(false);

    const handleInvest = async () => {
        if (!pitch || !isConnected) return;
        
        setIsInvesting(true);
        setInvestError(null);
        
        try {
            const details = await api.investPitch(pitch._id, investAmount);
            setPaymentDetails(details);
        } catch (err: unknown) {
            setInvestError((err as Error).message || 'Failed to initiate investment');
            setIsInvesting(false);
        }
    };

    const handleSubmitInvestment = async () => {
        if (!paymentDetails?.payment_details.contract_call?.args?.[0] || !pitch) return;
        
        setIsInvesting(true);
        setInvestError(null);
        
        try {
            const pitchIdHash = paymentDetails.payment_details.contract_call.args[0].replace('0x', '');
            const amount = paymentDetails.payment_details.contract_call.args[1];
            
            const result: TransactionResult = await payForInvestment(pitchIdHash, amount);
            
            if (result.success && result.txid) {
                setPendingTxid(result.txid);
                
                await api.verifyInvestment(pitch._id, result.txid);
                setInvestSuccess(true);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (err: unknown) {
            const errMsg = (err as Error).message || 'Investment failed';
            if (!errMsg.includes('cancel')) {
                setInvestError(errMsg);
            }
        } finally {
            setIsInvesting(false);
        }
    };

    const isOwner = address && pitch && address.toLowerCase() === pitch.founder.toLowerCase();

    if (isLoading) {
        return (
            <div className="min-h-screen pb-20">
                <Navbar />
                <main className="container mx-auto px-4 pt-32">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-brand-accent" size={40} />
                    </div>
                </main>
            </div>
        );
    }

    if (error || !pitch) {
        return (
            <div className="min-h-screen pb-20">
                <Navbar />
                <main className="container mx-auto px-4 pt-32">
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold mb-4">Pitch not found</h2>
                        <Link to="/explorer" className="text-brand-accent hover:underline">
                            Back to Explorer
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <Navbar />

            <main className="container mx-auto px-4 pt-32">
                <Link to="/explorer" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Explorer
                </Link>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-10">
                        <header>
                            <div className="flex items-center gap-3 mb-4">
                                {pitch.isBoosted && (
                                    <span className="bg-brand-accent/20 text-brand-accent text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-brand-accent/20">
                                        Featured
                                    </span>
                                )}
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${
                                    pitch.status === 'VERIFIED' 
                                        ? 'bg-green-500/20 text-green-400 border-green-500/20'
                                        : pitch.status === 'PAID'
                                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                                        : 'bg-white/5 text-white/40 border-white/5'
                                }`}>
                                    {pitch.status}
                                </span>
                            </div>
                            <h1 className="text-5xl font-extrabold mb-6">{pitch.title}</h1>
                            <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
                                {pitch.description}
                            </p>
                        </header>

                        <div className="glass rounded-3xl p-8 overflow-hidden relative">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-none">Founder Verified</h3>
                                    <p className="text-sm text-white/40 mt-1">Identity verified on the Stacks blockchain.</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <SocialLink icon={<Twitter size={18} />} label="Twitter" />
                                <SocialLink icon={<Github size={18} />} label="GitHub" />
                                <SocialLink icon={<Linkedin size={18} />} label="LinkedIn" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Action */}
                    <aside className="space-y-6">
                        <div className="glass p-8 rounded-3xl sticky top-32 border-brand-accent/20 bg-brand-accent/5">
                            <div className="text-center mb-8">
                                <div className="h-20 w-20 bg-brand-accent/20 rounded-2xl mx-auto flex items-center justify-center text-brand-accent mb-4">
                                    <TrendingUp size={40} />
                                </div>
                                <h3 className="font-bold text-xl mb-2">Invest in this Startup</h3>
                                <p className="text-white/40 text-sm">Support this founder directly with STX tokens.</p>
                            </div>

                            <div className="space-y-4">
                                {isOwner ? (
                                    <p className="text-center text-white/40 text-sm">This is your pitch</p>
                                ) : (
                                    <Button variant="primary" className="w-full py-4" onClick={() => setShowInvestModal(true)}>
                                        Invest Now <TrendingUp size={18} className="ml-2" />
                                    </Button>
                                )}
                                <a 
                                    href={pitch.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="block text-center text-sm font-medium text-white/60 hover:text-white underline transition-colors"
                                >
                                    Visit Website
                                </a>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10 text-center">
                                <div className="text-xs text-white/20 uppercase tracking-widest font-bold mb-4">Founder Address</div>
                                <div className="text-[10px] font-mono text-white/40 break-all bg-black/20 p-3 rounded-lg">
                                    {pitch.founder}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Investment Modal */}
            {showInvestModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-3xl p-8 max-w-md w-full">
                        <h3 className="font-bold text-2xl mb-6">Invest in {pitch.title}</h3>
                        
                        {investSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp size={32} className="text-green-400" />
                                </div>
                                <h4 className="font-bold text-xl mb-2">Investment Successful!</h4>
                                <p className="text-white/60 mb-6">Thank you for supporting this startup.</p>
                                <Button variant="primary" onClick={() => setShowInvestModal(false)}>
                                    Close
                                </Button>
                            </div>
                        ) : paymentDetails ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-brand-accent/10 rounded-xl border border-brand-accent/30">
                                    <p className="text-white/60 mb-2">Amount to invest:</p>
                                    <p className="text-2xl font-bold text-brand-accent">
                                        {(paymentDetails.payment_details.amount / 1000000).toFixed(2)} STX
                                    </p>
                                </div>
                                
                                {pendingTxid && (
                                    <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                                        <p className="text-yellow-400 text-sm">Transaction pending...</p>
                                        <p className="text-[10px] font-mono text-white/40 break-all">{pendingTxid}</p>
                                    </div>
                                )}

                                {investError && (
                                    <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-red-400 text-sm">
                                        {investError}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1" onClick={() => { setPaymentDetails(null); setShowInvestModal(false); }} disabled={isInvesting}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" className="flex-1" onClick={handleSubmitInvestment} disabled={isInvesting || !!pendingTxid}>
                                        {isInvesting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                        {pendingTxid ? 'Confirming...' : 'Pay & Invest'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-white/60">Investment Amount (STX)</label>
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={investAmount}
                                        onChange={(e) => setInvestAmount(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-accent/50"
                                    />
                                    <p className="text-xs text-white/40">Minimum 0.1 STX</p>
                                </div>

                                {investError && (
                                    <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-red-400 text-sm">
                                        {investError}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1" onClick={() => setShowInvestModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" className="flex-1" onClick={handleInvest} disabled={isInvesting || investAmount < 0.1}>
                                        {isInvesting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                        Continue
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SocialLink: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm">
        {icon} {label}
    </button>
);

export default PitchDetail;
