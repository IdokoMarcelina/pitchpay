import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Plus, LayoutDashboard, Wallet, BarChart2, PlusCircle, Rocket, Loader2, TrendingUp, Shield, Bot } from 'lucide-react';
import PitchCard from '../components/PitchCard';
import AIAgentTab from '../components/AIAgentTab';
import { useWallet } from '../context/WalletContext';
import { usePitches } from '../hooks/usePitches';
import { useProfile } from '../hooks/useProfile';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { address } = useWallet();
    const { pitches, isLoading: pitchesLoading, error: pitchesError } = usePitches({ limit: 50, user: address || undefined });
    const { profile, isLoading: profileLoading, error: profileError } = useProfile(address);
    const [activeTab, setActiveTab] = useState<'founder' | 'investor' | 'receipts' | 'ai'>('founder');

    const isLoading = pitchesLoading || profileLoading;
    const error = pitchesError || profileError;

    const userPitches = pitches.filter(p =>
        address && p.founder.toLowerCase() === address.toLowerCase()
    );

    const investedPitches = pitches.filter(p =>
        address && p.investments?.some(i => i.investor.toLowerCase() === address.toLowerCase())
    );

    const stats = profile?.stats || {
        pitchesCreated: userPitches.length,
        pitchesInvested: investedPitches.length,
        totalInvested: 0,
        totalRaised: 0,
        rewardBalance: 0
    };

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

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
                            <StatsCard label="Total Pitches" value={String(stats.pitchesCreated)} sub="Created" />
                            <StatsCard label="Verified" value={String(userPitches.filter(p => p.status === 'VERIFIED').length)} sub="On-chain" />
                            <StatsCard label="Invested" value={String(stats.pitchesInvested)} sub="Startups" />
                            <StatsCard label="Total Invested" value={(stats.totalInvested / 1000000).toFixed(2)} sub="STX" />
                            <StatsCard label="PPR Rewards" value={(stats.rewardBalance / 1000000).toFixed(0)} sub="PPR Tokens" highlighted />
                        </div>

                        {/* Tabs */}
                        <div className="flex flex-wrap gap-4 mb-8">
                            <button
                                onClick={() => setActiveTab('founder')}
                                className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'founder'
                                    ? 'bg-brand-accent text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Rocket size={18} className="inline mr-2" />
                                My Pitches
                            </button>
                            <button
                                onClick={() => setActiveTab('investor')}
                                className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'investor'
                                    ? 'bg-brand-accent text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <TrendingUp size={18} className="inline mr-2" />
                                My Investments
                            </button>
                            <button
                                onClick={() => setActiveTab('receipts')}
                                className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'receipts'
                                    ? 'bg-brand-accent text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Shield size={18} className="inline mr-2" />
                                NFT Receipts
                            </button>
                            <button
                                onClick={() => setActiveTab('ai')}
                                className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'ai'
                                    ? 'bg-brand-accent text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Bot size={18} className="inline mr-2" />
                                AI Agent
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
                            // ...
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
                        ) : activeTab === 'investor' ? (
                            investedPitches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {investedPitches.map(pitch => {
                                        const investorAddress = address?.toLowerCase() || '';
                                        const userInvestments = pitch.investments?.filter(i =>
                                            i.investor && i.investor.toLowerCase() === investorAddress
                                        ) || [];
                                        const investedAmount = userInvestments.reduce((s, i) => s + (i.amount || 0), 0);
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
                        ) : activeTab === 'ai' ? (
                            <AIAgentTab />
                        ) : (
                            profile?.receipts && profile.receipts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {profile.receipts.map(receipt => (
                                        <div key={receipt.receiptId} className="relative group">
                                            <div className="absolute inset-0 bg-brand-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                                            <div className="relative glass p-6 rounded-3xl border-brand-accent/50 bg-gradient-to-br from-brand-accent/10 to-transparent">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`${receipt.status === 'VERIFIED' ? 'bg-brand-accent/20 text-brand-accent' : 'bg-yellow-400/20 text-yellow-500'} p-2 rounded-lg`}>
                                                        <Shield size={24} />
                                                    </div>
                                                    <span className="text-xs font-mono text-white/40">
                                                        {receipt.status === 'VERIFIED' ? `#${receipt.receiptId}` : 'MINTING...'}
                                                    </span>
                                                </div>
                                                <h4 className="text-[10px] uppercase tracking-widest text-brand-accent font-bold mb-1">{receipt.pitchTitle || 'Investment Receipt'}</h4>
                                                <h3 className="text-lg font-bold mb-1">Receipt of Support</h3>
                                                <p className="text-2xl font-black text-white mb-4">
                                                    {receipt.amount ? (
                                                        receipt.amount > 100000000 // Heuristic for sBTC sats vs STX micro
                                                            ? `${(receipt.amount / 100000000).toFixed(4)} sBTC`
                                                            : `${(receipt.amount / 1000000).toFixed(2)} STX`
                                                    ) : 'Metadata Pending'}
                                                </p>
                                                <div className="pt-4 border-t border-white/10 space-y-2">
                                                    <div className="flex justify-between text-[10px] uppercase tracking-wider">
                                                        <span className="text-white/40">Status</span>
                                                        <span className={`${receipt.status === 'VERIFIED' ? 'text-brand-accent' : 'text-yellow-400'} font-bold text-[10px]`}>
                                                            {receipt.status || 'VERIFIED'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] uppercase tracking-wider">
                                                        <span className="text-white/40">Network</span>
                                                        <span className="text-white/60">Stacks Testnet</span>
                                                    </div>
                                                </div>
                                                <a
                                                    href={`https://explorer.hiro.so/txid/${receipt.txid}?chain=testnet`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-6 block w-full py-2 text-center text-xs font-bold bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                                                >
                                                    View Transaction
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-white/40">
                                    <p className="mb-4">You don't have any NFT receipts yet. Invest in a pitch to earn one!</p>
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

const StatsCard: React.FC<{ label: string, value: string, sub: string, highlighted?: boolean }> = ({ label, value, sub, highlighted }) => (
    <div className={`glass p-6 rounded-2xl relative overflow-hidden ${highlighted ? 'border-brand-accent/50' : ''}`}>
        {highlighted && (
            <div className="absolute inset-0 bg-brand-accent/5 -z-10"></div>
        )}
        <div className="text-white/40 text-xs uppercase tracking-widest font-bold mb-2">{label}</div>
        <div className={`text-3xl font-extrabold mb-1 ${highlighted ? 'text-brand-accent' : ''}`}>{value}</div>
        <div className={`${highlighted ? 'text-brand-accent/60' : 'text-brand-accent'} text-[10px] font-medium uppercase tracking-wider`}>{sub}</div>
    </div>
);

export default Dashboard;
