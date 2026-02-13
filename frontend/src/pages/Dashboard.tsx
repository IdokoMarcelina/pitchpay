import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Plus, LayoutDashboard, Wallet, BarChart2, PlusCircle, Rocket, Loader2 } from 'lucide-react';
import PitchCard from '../components/PitchCard';
import { useWallet } from '../context/WalletContext';
import { usePitches } from '../hooks/usePitches';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { address } = useWallet();
    const { pitches, isLoading, error } = usePitches({ limit: 50 });
    
    const userPitches = pitches.filter(p => 
        address && p.founder.toLowerCase() === address.toLowerCase()
    );

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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <StatsCard label="Total Pitches" value={String(userPitches.length)} sub="Submissions" />
                            <StatsCard label="Verified" value={String(userPitches.filter(p => p.status === 'VERIFIED').length)} sub="On-chain" />
                            <StatsCard label="Boosted" value={String(userPitches.filter(p => p.isBoosted).length)} sub="Featured" />
                        </div>

                        <div className="mb-10">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                Your Pitches <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-white/40">{userPitches.length}</span>
                            </h2>
                            
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-brand-accent" size={32} />
                                </div>
                            ) : error ? (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                                    {error}
                                </div>
                            ) : userPitches.length > 0 ? (
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
                            )}
                        </div>
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
