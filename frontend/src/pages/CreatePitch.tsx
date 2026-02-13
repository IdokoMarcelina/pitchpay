import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Rocket, Globe, FileText, AlertCircle } from 'lucide-react';

const CreatePitch: React.FC = () => {
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

                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-white/60 flex items-center gap-2">
                                        <FileText size={14} /> Startup Name
                                    </label>
                                    <input
                                        type="text"
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
                                <Button variant="primary" className="w-full py-4 text-lg">
                                    Submit & Pay <ArrowRight size={20} className="ml-2" />
                                </Button>
                                <p className="text-[10px] text-center text-white/20 uppercase tracking-widest font-medium">
                                    Transaction secured by the Stacks Blockchain
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

const ArrowRight: React.FC<{ size?: number, className?: string }> = ({ size = 20, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default CreatePitch;
