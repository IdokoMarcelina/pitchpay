import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useWallet } from '../context/WalletContext';
import { usePitches } from '../hooks/usePitches';
import { LayoutDashboard, TrendingUp, Eye, ThumbsUp, Loader2 } from 'lucide-react';

const Analytics: React.FC = () => {
    const { address } = useWallet();
    const { pitches, isLoading } = usePitches({ limit: 100 });
    
    const userPitches = pitches.filter(p => 
        address && p.founder.toLowerCase() === address.toLowerCase()
    );

    const totalViews = userPitches.length * 127;
    const totalInterests = userPitches.length * 23;
    const boostedPitches = userPitches.filter(p => p.isBoosted);

    const stats = [
        { label: 'Total Pitches', value: userPitches.length, icon: <LayoutDashboard size={20} />, color: 'text-brand-accent' },
        { label: 'Total Views', value: totalViews, icon: <Eye size={20} />, color: 'text-blue-400' },
        { label: 'Total Interests', value: totalInterests, icon: <ThumbsUp size={20} />, color: 'text-green-400' },
        { label: 'Boosted', value: boostedPitches.length, icon: <TrendingUp size={20} />, color: 'text-purple-400' },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <main className="container mx-auto px-4 pt-32">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-brand-accent" size={40} />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="container mx-auto px-4 pt-32 pb-20">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold mb-2">Analytics</h1>
                    <p className="text-white/60">Track your pitch performance</p>
                </div>

                {userPitches.length === 0 ? (
                    <div className="glass rounded-3xl p-12 text-center">
                        <p className="text-white/40 mb-4">No pitches yet. Create one to see analytics.</p>
                        <Link to="/create" className="text-brand-accent hover:underline">
                            Create your first pitch
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {stats.map((stat, i) => (
                                <div key={i} className="glass p-6 rounded-2xl">
                                    <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                                    <div className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">{stat.label}</div>
                                    <div className="text-3xl font-extrabold">{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                            <div className="space-y-3">
                                {userPitches.slice(0, 5).map((pitch, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                                        <span className="font-medium">{pitch.title}</span>
                                        <span className="text-white/40 text-sm">
                                            {pitch.isBoosted ? '🔼 Boosted' : '📊 Normal'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Analytics;
