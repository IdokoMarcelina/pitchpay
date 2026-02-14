import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { Rocket, Shield, Zap, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const LandingPage: React.FC = () => {
    return (
        <div className="overflow-x-hidden bg-brand-primary">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-40 px-6 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent/20 blur-[120px] rounded-full -z-10 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/10 blur-[120px] rounded-full -z-10 animate-pulse-slow font-delay-2000"></div>

                <div className="container mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-white/10 text-brand-accent mb-10 shadow-xl"
                            >
                                <span className="flex h-2.5 w-2.5 rounded-full bg-brand-accent animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]"></span>
                                <span className="text-xs font-black uppercase tracking-[0.3em]">Built for the Stacks Ecosystem</span>
                            </motion.div>

                            <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] mb-10 tracking-tighter">
                                Pitch your vision, <br />
                                <span className="text-gradient">Fund your future.</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-xl leading-relaxed font-medium">
                                The premier decentralized bridge for early-stage builders. Secure micro-funding on the Stacks blockchain.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <Button variant="primary" className="text-lg px-10 py-5 rounded-[1.5rem] shadow-[0_20px_40px_-12px_rgba(99,102,241,0.5)]">
                                    Start Pitching <Rocket className="ml-3" size={24} />
                                </Button>
                                <Button variant="outline" className="text-lg px-10 py-5 rounded-[1.5rem] border-white/10 hover:bg-white/5">
                                    Explore Ecosystem <ArrowRight className="ml-3" size={24} />
                                </Button>
                            </div>

                            <div className="mt-16 flex items-center gap-8">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-brand-primary bg-slate-800 flex items-center justify-center overflow-hidden">
                                            <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover grayscale opacity-50" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                    Trusted by <span className="text-white">500+</span> Founders
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, rotateY: -20, scale: 0.9 }}
                            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                            transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="relative perspective-1000"
                        >
                            <div className="relative z-10 p-4">
                                <div className="aspect-square relative group">
                                    {/* Visual Frame */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-accent/30 to-brand-secondary/30 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-60"></div>
                                    <div className="relative glass border-white/10 rounded-[3rem] overflow-hidden shadow-2xl h-full flex items-center justify-center p-8 border ring-1 ring-white/20">
                                        <img
                                            src="/hero_startup_visualization.png"
                                            alt="Ecosystem Visualization"
                                            className="w-full h-full object-cover rounded-[2rem] opacity-80 group-hover:scale-105 transition-transform duration-1000"
                                        />

                                        {/* Floating UI Badges */}
                                        <motion.div
                                            animate={{ y: [0, -15, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute top-10 right-10 glass px-6 py-4 rounded-3xl border-white/20 shadow-2xl backdrop-blur-2xl"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 flex items-center justify-center">
                                                    <Zap size={24} className="text-brand-accent" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Live Payments</div>
                                                    <div className="text-lg font-black text-white">$2,450.00 <span className="text-brand-accent">STX</span></div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            animate={{ y: [0, 15, 0] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                            className="absolute bottom-10 left-10 glass px-6 py-4 rounded-3xl border-white/20 shadow-2xl backdrop-blur-2xl"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                                                    <Shield size={24} className="text-green-400" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Verification Status</div>
                                                    <div className="text-sm font-black text-green-400 uppercase tracking-widest">Verified Pitch</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
                        {[
                            { label: "Volume Traded", value: "$12.8M+", color: "text-white" },
                            { label: "Active Startups", value: "840+", color: "text-brand-accent" },
                            { label: "Ecosystem Partners", value: "120+", color: "text-white" },
                            { label: "Yield Generated", value: "24%", color: "text-brand-gold" }
                        ].map((stat, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                key={i}
                                className="text-center group"
                            >
                                <div className={`text-4xl lg:text-6xl font-black mb-4 tracking-tighter ${stat.color} group-hover:scale-105 transition-transform`}>{stat.value}</div>
                                <div className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 leading-none">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-40 bg-white/[0.02] border-y border-white/5 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl lg:text-7xl font-black mb-8 tracking-tight">The <span className="text-gradient">Alpha</span> Workflow</h2>
                        <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">Three steps to launch. Zero friction. Total decentralization.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {[
                            { number: "01", title: "Global Submission", desc: "Sync your project and metadata on-chain. Securely stored, globally accessible." },
                            { number: "02", title: "Market Verification", desc: "The Stacks ecosystem validates your pitch through automated smart contracts." },
                            { number: "03", title: "Boosted Scaling", desc: "Ignite your visibility. Reach top-tier investors with premium placement." }
                        ].map((step, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                viewport={{ once: true }}
                                key={i}
                                className="card-premium p-12 text-center relative pt-20 overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 group-hover:text-brand-accent/10 transition-colors leading-none">{step.number}</div>
                                <h3 className="text-2xl font-black mb-6 tracking-tight relative z-10">{step.title}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed relative z-10">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 relative">
                <div className="container mx-auto px-6">
                    <div className="card-premium p-12 lg:p-24 bg-gradient-to-br from-brand-accent/20 to-brand-secondary/10 border-brand-accent/30 text-center relative overflow-hidden rounded-[3rem]">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        <h2 className="text-5xl lg:text-7xl font-black mb-10 tracking-tight leading-none relative z-10">
                            Ready to <span className="text-gradient">Innovate?</span>
                        </h2>
                        <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto font-medium relative z-10">
                            Join the fastest growing startup launchpad on Stacks. Tomorrow starts on-chain.
                        </p>
                        <Button variant="primary" className="text-xl px-12 py-6 rounded-3xl shadow-2xl relative z-10 group">
                            Launch Your Pitch <Rocket size={24} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 mt-20">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="text-2xl font-black tracking-tighter">
                            Pitch<span className="text-brand-accent">Pay</span>
                        </div>
                        <div className="flex gap-12 text-sm font-bold uppercase tracking-widest text-slate-500">
                            <a href="#" className="hover:text-white transition-colors">Documentation</a>
                            <a href="#" className="hover:text-white transition-colors">Governance</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        </div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">
                            &copy; 2026 Built with <span className="text-brand-accent">♥</span> for Stacks
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
