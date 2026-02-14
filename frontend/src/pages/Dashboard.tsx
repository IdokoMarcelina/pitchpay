import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Plus, LayoutDashboard, Wallet, BarChart2, PlusCircle, Rocket, Loader2, TrendingUp } from 'lucide-react';
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
        <div className="min-h-screen">
            <Navbar />

            <main className="container mx-auto px-4 pt-32 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 space-y-2">
                        <Link to="/dashboard">
                            <DashboardNavItem 
                                icon={<LayoutDashboard size={20} />} 
                                label="Overview" 
                                active={isActive('/dashboard')} 
                            />
                        </Link>
                        <Link to="/analytics">
                            <DashboardNavItem 
                                icon={<BarChart2 size={20} />} 
                                label="Analytics" 
                                active={isActive('/analytics')} 
                            />
                        </Link>
                        <Link to="/create">
                            <DashboardNavItem 
                                icon={<PlusCircle size={20} />} 
                                label="New Pitch" 
                                active={isActive('/create')} 
                            />
                        </Link>
                        <div className="pt-8 px-4">
                            <div className="bg-gradient-to-br from-brand-accent/20 to-transparent p-6 rounded-2xl border border-brand-accent/30 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-sm mb-2 text-brand-accent">Boost Portfolio</h4>
                                    <p className="text-xs text-white/60 mb-4">Get 2x more visibility for your latest startups.</p>
                                    <Button 
                                        variant="primary" 
                                        className="w-full py-2 text-xs"
                                        onClick={() => navigate('/boost')}
                                    >
                                        Upgrade
                                    </Button>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <Rocket size={80} />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <section className="flex-grow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                            <div>
                                <h1 className="text-3xl font-extrabold mb-1">Your Dashboard</h1>
                                <p className="text-white/40 flex items-center gap-2">
                                    <Wallet size={14} /> {formatAddress(address)}
                                </p>
                            </div>
                            <Button variant="primary" onClick={() => navigate('/create')}>
                                <Plus size={20} /> New Submission
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                            <StatsCard label="Total Pitches" value={String(userPitches.length)} sub="Created" />
                            <StatsCard label="Verified" value={String(userPitches.filter(p => p.status === 'VERIFIED').length)} sub="On-chain" />
                            <StatsCard label="Invested" value={String(investedPitches.length)} sub="Startups" />
                            <StatsCard label="Total Invested" value={(totalInvested / 1000000).toFixed(2)} sub="STX" />
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={() => setActiveTab('founder')}
                                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                    activeTab === 'founder' 
                                        ? 'bg-brand-accent text-white' 
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Rocket size={18} className="inline mr-2" />
                                My Pitches
                            </button>
                            <button
                                onClick={() => setActiveTab('investor')}
                                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                    activeTab === 'investor' 
                                        ? 'bg-brand-accent text-white' 
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <TrendingUp size={18} className="inline mr-2" />
                                My Investments
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-brand-accent" size={32} />
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                                {error}
                            </div>
                        ) : activeTab === 'founder' ? (
                            userPitches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {userPitches.map(pitch => (
                                        <Link key={pitch._id} to={`/pitch/${pitch._id}`}>
                                            <PitchCard pitch={pitch} />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-white/40">
                                    <p className="mb-4">You haven't created any pitches yet.</p>
                                    <Button variant="outline" onClick={() => navigate('/create')}>
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
                                                <div className="glass rounded-2xl p-6 border-brand-accent/30 bg-brand-accent/5">
                                                    <h3 className="text-xl font-bold mb-2">{pitch.title}</h3>
                                                    <p className="text-white/60 text-sm mb-4 line-clamp-2">{pitch.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-green-400 font-bold">
                                                            {(investedAmount / 1000000).toFixed(2)} STX invested
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-white/40">
                                    <p className="mb-4">You haven't invested in any pitches yet.</p>
                                    <Button variant="outline" onClick={() => navigate('/explorer')}>
                                        Explore Pitches
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
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-brand-accent text-white shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const StatsCard: React.FC<{ label: string, value: string, sub: string }> = ({ label, value, sub }) => (
    <div className="glass p-6 rounded-2xl">
        <div className="text-white/40 text-xs uppercase tracking-widest font-bold mb-2">{label}</div>
        <div className="text-3xl font-extrabold mb-1">{value}</div>
        <div className="text-brand-accent text-[10px] font-medium uppercase tracking-wider">{sub}</div>
    </div>
);

export default Dashboard;
