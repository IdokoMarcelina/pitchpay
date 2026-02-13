import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Rocket, Shield, ExternalLink, ArrowLeft, Loader2, Twitter, Github, Linkedin } from 'lucide-react';
import { usePitch } from '../hooks/usePitches';

const PitchDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { pitch, isLoading, error } = usePitch(id || '');

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
                                    <Rocket size={40} />
                                </div>
                                <h3 className="font-bold text-xl mb-2">Interested in this?</h3>
                                <p className="text-white/40 text-sm">Send a micro-payment to show your interest and get whitelist access.</p>
                            </div>

                            <div className="space-y-4">
                                <Button variant="primary" className="w-full py-4">
                                    Show Interest <ExternalLink size={18} className="ml-2" />
                                </Button>
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
