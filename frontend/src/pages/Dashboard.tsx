import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Plus, LayoutDashboard, Wallet, BarChart2, PlusCircle, Rocket, Loader2, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import PitchCard from '../components/PitchCard';
import { useWallet } from '../context/WalletContext';
import { usePitches } from '../hooks/usePitches';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { address } = useWallet();
    const { pitches, isLoading, error } = usePitches({ limit: 50 });
    const [activeTab, setActiveTab] = useState<'founder' | 'investor'>('founder');

    const userPitches = pitches.filter(p =>
        address && p.founder.toLowerCase() === address.toLowerCase()
    );

    const investedPitches = pitches.filter(p =>
        address && p.investments?.some(i => i.investor.toLowerCase() === address.toLowerCase())
    );

    const totalInvested = investedPitches.reduce((sum, p) => {
        const userInvestments = p.investments?.filter(i => i.investor.toLowerCase() === address?.toLowerCase()) || [];
        return sum + userInvestments.reduce((s, i) => s + i.amount, 0);
    }, 0);

    const formatAddress = (addr: string | null) => {
        if (!addr) return 'Not connected';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen pb-24">
            <Navbar />

            <main className="container mx-auto px-6 pt-40">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <aside className="lg:w-80 space-y-3">
                        <div className="mb-8 px-4">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Main Navigation</div>
                            <div className="space-y-2">
                                <Link to="/dashboard" className="block">
                                    <DashboardNavItem
                                        icon={<LayoutDashboard size={22} />}
                                        label="Overview"
                                        active={isActive('/dashboard')}
                                    />
                                </Link>
                                <Link to="/analytics" className="block">
                                    <DashboardNavItem
                                        icon={<BarChart2 size={22} />}
                                        label="Performance"
                                        active={isActive('/analytics')}
                                    />
                                </Link>
                                <Link to="/create" className="block">
                                    <DashboardNavItem
                                        icon={<PlusCircle size={22} />}
                                        label="Create Pitch"
                                        active={isActive('/create')}
                                    />
                                </Link>
                            </div>
                        </div>

                        <div className="pt-6 px-4">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="card-premium p-8 bg-gradient-to-br from-brand-accent/20 to-brand-secondary/5 border-brand-accent/30 relative overflow-hidden group rounded-[2rem]"
                            >
                                <div className="relative z-10">
                                    <Rocket size={32} className="text-brand-accent mb-6 group-hover:rotate-12 transition-transform" />
                                    <h4 className="font-black text-lg mb-3 tracking-tight">Boost Portfolio</h4>
                                    <p className="text-xs font-medium text-slate-400 mb-6 leading-relaxed">Instantly double your visibility and reach top-tier investors.</p>
                                    <Button
                                        variant="primary"
                                        className="w-full py-4 text-xs font-black uppercase tracking-widest shadow-xl"
                                        onClick={() => navigate('/boost')}
                                    >
                                        Upgrade Now
                                    </Button>
                                </div>
                                <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Rocket size={140} />
                                </div>
                            </motion.div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <section className="flex-grow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                            <div>
                                <h1 className="text-5xl lg:text-6xl font-black mb-4 tracking-tighter">Your <span className="text-gradient">Console</span></h1>
                                <div className="flex items-center gap-3 glass px-4 py-2 rounded-full border-white/5 shadow-inner">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Active Node: <span className="text-white ml-2 lowercase font-mono">{formatAddress(address)}</span>
                                    </p>
                                </div>
                            </div>
                            <Button variant="primary" onClick={() => navigate('/create')} className="px-8 py-4 rounded-2xl shadow-2xl">
                                <Plus size={20} className="mr-2" /> New Submission
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                            <StatsCard label="Launched" value={String(userPitches.length)} sub="Live Projects" icon={<Rocket size={20} />} />
                            <StatsCard label="Verified" value={String(userPitches.filter(p => p.status === 'VERIFIED').length)} sub="On-Chain Status" icon={<Shield size={20} />} />
                            <StatsCard label="Portfolio" value={String(investedPitches.length)} sub="Supported Assets" icon={<LayoutDashboard size={20} />} />
                            <StatsCard label="Cap. Deployed" value={(totalInvested / 1000000).toFixed(1)} sub="STX Assets" icon={<Wallet size={20} />} />
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1.5 glass rounded-2xl border-white/5 mb-12 w-fit">
                            <button
                                onClick={() => setActiveTab('founder')}
                                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'founder'
                                    ? 'bg-brand-accent text-white shadow-xl'
                                    : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                <Rocket size={16} />
                                My Projects
                            </button>
                            <button
                                onClick={() => setActiveTab('investor')}
                                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'investor'
                                    ? 'bg-brand-accent text-white shadow-xl'
                                    : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                <TrendingUp size={16} />
                                Investments
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 glass rounded-[2.5rem]">
                                <Loader2 className="animate-spin text-brand-accent mb-6" size={48} />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Synchronizing Data...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 glass border-red-500/20 rounded-[2rem] text-red-400 flex items-center gap-4">
                                <Plus size={24} className="rotate-45" />
                                <p className="font-bold">{error}</p>
                            </div>
                        ) : activeTab === 'founder' ? (
                            userPitches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {userPitches.map(pitch => (
                                        <Link key={pitch._id} to={`/pitch/${pitch._id}`} className="block">
                                            <PitchCard pitch={pitch} />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-32 card-premium border-dashed border-white/10">
                                    <Rocket size={64} className="mx-auto mb-8 text-slate-800" />
                                    <h4 className="text-2xl font-black mb-3 tracking-tight">No Projects Launched</h4>
                                    <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">It looks like you haven't shared your vision yet. Start your journey today.</p>
                                    <Button variant="primary" onClick={() => navigate('/create')} className="px-10 py-5 rounded-2xl">
                                        Create Your First Pitch
                                    </Button>
                                </div>
                            )
                        ) : (
                            investedPitches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {investedPitches.map(pitch => {
                                        const userInvestments = pitch.investments?.filter(i => i.investor.toLowerCase() === address?.toLowerCase()) || [];
                                        const investedAmount = userInvestments.reduce((s, i) => s + i.amount, 0);
                                        return (
                                            <Link key={pitch._id} to={`/pitch/${pitch._id}`}>
                                                <div className="card-premium p-8 group hover:border-brand-accent/30 transition-all active:scale-[0.98]">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h3 className="text-2xl font-black tracking-tight group-hover:text-brand-accent transition-colors">{pitch.title}</h3>
                                                        <div className="p-3 bg-brand-accent/10 rounded-2xl">
                                                            <Rocket size={20} className="text-brand-accent" />
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-2">{pitch.description}</p>
                                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Capital Commited</span>
                                                        <span className="text-lg font-black text-green-400">
                                                            {(investedAmount / 1000000).toFixed(1)} <span className="text-[10px]">STX</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-32 card-premium border-dashed border-white/10">
                                    <TrendingUp size={64} className="mx-auto mb-8 text-slate-800" />
                                    <h4 className="text-2xl font-black mb-3 tracking-tight">Zero Investments</h4>
                                    <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Explore the ecosystem to discover and support high-potential startups.</p>
                                    <Button variant="outline" onClick={() => navigate('/explorer')} className="px-10 py-5 rounded-2xl">
                                        Browse Startups
                                    </Button>
                                </div>
                            )
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

const DashboardNavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean }> = ({ icon, label, active }) => (
    <div className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all duration-300 group cursor-pointer ${active ? 'bg-brand-accent text-white shadow-2xl shadow-brand-accent/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
        <div className={`${active ? 'text-white' : 'text-slate-600 group-hover:text-brand-accent'} transition-colors`}>
            {icon}
        </div>
        <span className="font-black text-xs uppercase tracking-[0.2em]">{label}</span>
    </div>
);

const StatsCard: React.FC<{ label: string, value: string, sub: string, icon: React.ReactNode }> = ({ label, value, sub, icon }) => (
    <div className="card-premium p-8 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-accent/5 rounded-full blur-2xl group-hover:bg-brand-accent/10 transition-all"></div>
        <div className="flex items-center justify-between mb-8">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</div>
            <div className="text-brand-accent/40">{icon}</div>
        </div>
        <div className="text-4xl font-black mb-2 tracking-tighter">{value}</div>
        <div className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 italic">{sub}</div>
    </div>
);

export default Dashboard;
