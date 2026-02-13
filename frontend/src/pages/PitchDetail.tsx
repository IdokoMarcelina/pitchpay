import React from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Rocket, Shield, ExternalLink, ArrowLeft, Twitter, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const PitchDetail: React.FC = () => {
    // Mock data
    const pitch = {
        title: 'StacksSwap Pro',
        description: 'Next-gen DEX with concentrated liquidity and gas optimizations for the Stacks ecosystem. StacksSwap Pro allows users to provide liquidity in specific price ranges, maximizing capital efficiency and reducing slippage. Built with Clarity 2.0 and fully audited for the Stacks Nakamoto release.',
        website: 'https://stacksswap.pro',
        founder: 'ST1PQHQKV0RJ7X6RGHN5X29D50Z6MR8BWG32W8A7',
        isBoosted: true,
        status: 'VERIFIED',
        stats: {
            views: '1.2k',
            interests: '45',
            raised: '50k STX'
        }
    };

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
                                <span className="bg-brand-accent/20 text-brand-accent text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-brand-accent/20">
                                    Featured
                                </span>
                                <span className="bg-white/5 text-white/40 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">
                                    DeFi
                                </span>
                            </div>
                            <h1 className="text-5xl font-extrabold mb-6">{pitch.title}</h1>
                            <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
                                {pitch.description}
                            </p>
                        </header>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="glass p-6 rounded-2xl">
                                <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Views</div>
                                <div className="text-2xl font-bold">{pitch.stats.views}</div>
                            </div>
                            <div className="glass p-6 rounded-2xl">
                                <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Interests</div>
                                <div className="text-2xl font-bold">{pitch.stats.interests}</div>
                            </div>
                            <div className="glass p-6 rounded-2xl">
                                <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Raised</div>
                                <div className="text-2xl font-bold text-brand-accent">{pitch.stats.raised}</div>
                            </div>
                        </div>

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
                                    <Rocket size={40} />
                                </div>
                                <h3 className="font-bold text-xl mb-2">Interested in this?</h3>
                                <p className="text-white/40 text-sm">Send a micro-payment to show your interest and get whitelist access.</p>
                            </div>

                            <div className="space-y-4">
                                <Button variant="primary" className="w-full py-4">
                                    Show Interest <ExternalLink size={18} className="ml-2" />
                                </Button>
                                <a href={pitch.website} target="_blank" rel="noopener noreferrer" className="block text-center text-sm font-medium text-white/60 hover:text-white underline transition-colors">
                                    Visit Website
                                </a>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10 text-center">
                                <div className="text-xs text-white/20 uppercase tracking-widest font-bold mb-4">Contract Address</div>
                                <div className="text-[10px] font-mono text-white/40 break-all bg-black/20 p-3 rounded-lg">
                                    {pitch.founder}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

const SocialLink: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm">
        {icon} {label}
    </button>
);

export default PitchDetail;
