import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Rocket, Globe, FileText, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { usePayment } from '../hooks/usePayment';
import type { PaymentDetails } from '../lib/api';

const CreatePitch: React.FC = () => {
    const navigate = useNavigate();
    const { address, isConnected, connect } = useWallet();
    const { isProcessing, createPitchWithPayment } = usePayment();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        website: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isConnected || !address) {
            setError('Please connect your wallet first');
            return;
        }

        if (!formData.title || !formData.description || !formData.website) {
            setError('Please fill in all fields');
            return;
        }

        createPitchWithPayment(
            {
                title: formData.title,
                description: formData.description,
                website: formData.website,
                founder: address,
            },
            (details) => {
                setPaymentDetails(details);
            },
            () => {
                navigate('/dashboard');
            },
            (err) => {
                setError(err);
            }
        );
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen pb-20">
                <Navbar />
                <main className="container mx-auto px-4 pt-32">
                    <div className="max-w-2xl mx-auto text-center py-20">
                        <div className="mb-8">
                            <Rocket size={64} className="mx-auto text-brand-accent" />
                        </div>
                        <h1 className="text-4xl font-extrabold mb-4">Connect Your Wallet</h1>
                        <p className="text-white/40 text-lg mb-8">
                            You need to connect your Stacks wallet to create a pitch.
                        </p>
                        <Button variant="primary" onClick={connect} className="px-8 py-4 text-lg">
                            Connect Wallet
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <Navbar />

            <main className="container mx-auto px-4 pt-32">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 text-center"
                    >
                        <h1 className="text-4xl font-extrabold mb-4">Submit your <span className="text-gradient">Pitch</span></h1>
                        <p className="text-white/40 text-lg">Enter your startup details and launch your project on PitchPay.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent/50 to-transparent"></div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                                {error}
                            </div>
                        )}

                        {paymentDetails ? (
                            <div className="space-y-6">
                                <div className="p-6 bg-brand-accent/10 rounded-2xl border border-brand-accent/30">
                                    <h3 className="font-bold text-lg mb-4 text-brand-accent">Payment Required</h3>
                                    <p className="text-white/60 mb-4">
                                        To publish your pitch, please send <strong>{paymentDetails.payment_details.amount / 1000000} STX</strong> to the smart contract.
                                    </p>
                                    {paymentDetails.payment_details.contract_call && (
                                        <div className="text-xs text-white/40 space-y-2">
                                            <p><strong>Contract:</strong> {paymentDetails.payment_details.contract_call.contract}</p>
                                            <p><strong>Function:</strong> {paymentDetails.payment_details.contract_call.function}</p>
                                            <p><strong>Argument:</strong> {paymentDetails.payment_details.contract_call.args[0]}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => setPaymentDetails(null)}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button 
                                        variant="primary" 
                                        className="flex-1"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <><Loader2 className="animate-spin mr-2" /> Processing...</>
                                        ) : (
                                            <>I've sent the transaction</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-white/60 flex items-center gap-2">
                                            <FileText size={14} /> Startup Name
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. StacksSwap"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-accent/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-white/60 flex items-center gap-2">
                                            <Globe size={14} /> Website URL
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="https://yourstartup.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-accent/50 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-white/60 flex items-center gap-2">
                                        <AlertCircle size={14} /> Short Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Tell us about your startup in 280 characters..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-accent/50 transition-colors resize-none"
                                    ></textarea>
                                </div>

                                <div className="p-6 bg-brand-accent/5 rounded-2xl border border-brand-accent/20 flex gap-4">
                                    <div className="bg-brand-accent/20 p-3 rounded-xl h-fit text-brand-accent">
                                        <Rocket size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">Launch Fee: 5 STX</h4>
                                        <p className="text-xs text-white/40 leading-relaxed">
                                            By submitting, you will trigger a transaction to the PitchPay smart contract. Your pitch will be visible to all investors once verified on-chain.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-4">
                                    <Button 
                                        variant="primary" 
                                        className="w-full py-4 text-lg"
                                        type="submit"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <><Loader2 className="animate-spin mr-2" /> Processing...</>
                                        ) : (
                                            <>Submit & Pay <ArrowRight size={20} className="ml-2" /></>
                                        )}
                                    </Button>
                                    <p className="text-[10px] text-center text-white/20 uppercase tracking-widest font-medium">
                                        Transaction secured by the Stacks Blockchain
                                    </p>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default CreatePitch;
