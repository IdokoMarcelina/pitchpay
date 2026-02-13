import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PitchCard from '../components/PitchCard';
import { Loader2, Rocket, TrendingUp, Wallet } from 'lucide-react';
import { api, type Pitch } from '../lib/api';
import { useWallet } from '../context/WalletContext';

interface UserProfile {
    address: string;
    pitches: Pitch[];
    investedPitches: Pitch[];
    stats: {
        pitchesCreated: number;
        pitchesInvested: number;
        totalInvested: number;
        totalRaised: number;
    };
}

const Profile: React.FC = () => {
    const { address } = useParams<{ address: string }>();
    const { address: currentAddress } = useWallet();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'pitches' | 'investments'>('pitches');

    const isOwner = currentAddress?.toLowerCase() === address?.toLowerCase();

    useEffect(() => {
        const fetchProfile = async () => {
            if (!address) return;
            
            setIsLoading(true);
            setError(null);
            try {
                const data = await api.getUserProfile(address);
                setProfile(data);
            } catch (err: unknown) {
                setError((err as Error).message || 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [address]);

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

    if (error || !profile) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <main className="container mx-auto px-4 pt-32">
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
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
                <div className="max-w-4xl mx-auto">
                    <div className="glass rounded-3xl p-8 mb-8">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="h-20 w-20 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                                <Wallet size={40} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold mb-2">
                                    {isOwner ? 'Your Profile' : 'Founder Profile'}
                                </h1>
                                <p className="text-white/60 font-mono text-sm">{profile.address}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-2 text-brand-accent mb-2">
                                    <Rocket size={18} />
                                </div>
                                <div className="text-2xl font-bold">{profile.stats.pitchesCreated}</div>
                                <div className="text-xs text-white/40">Pitches Created</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                                    <TrendingUp size={18} />
                                </div>
                                <div className="text-2xl font-bold">{profile.stats.pitchesInvested}</div>
                                <div className="text-xs text-white/40">Invested In</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <div className="text-green-400 text-2xl font-bold">
                                    {(profile.stats.totalInvested / 1000000).toFixed(2)}
                                </div>
                                <div className="text-xs text-white/40">STX Invested</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <div className="text-brand-accent text-2xl font-bold">
                                    {(profile.stats.totalRaised / 1000000).toFixed(2)}
                                </div>
                                <div className="text-xs text-white/40">STX Raised</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setActiveTab('pitches')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                activeTab === 'pitches' 
                                    ? 'bg-brand-accent text-white' 
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Rocket size={18} className="inline mr-2" />
                            Created Pitches ({profile.pitches.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('investments')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                activeTab === 'investments' 
                                    ? 'bg-brand-accent text-white' 
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <TrendingUp size={18} className="inline mr-2" />
                            Investments ({profile.investedPitches.length})
                        </button>
                    </div>

                    {activeTab === 'pitches' ? (
                        profile.pitches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {profile.pitches.map(pitch => (
                                    <Link key={pitch._id} to={`/pitch/${pitch._id}`}>
                                        <PitchCard pitch={pitch} />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-white/40">
                                <p>No pitches created yet</p>
                            </div>
                        )
                    ) : (
                        profile.investedPitches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {profile.investedPitches.map(pitch => {
                                    const userInvestments = pitch.investments?.filter(i => i.investor.toLowerCase() === address?.toLowerCase()) || [];
                                    const investedAmount = userInvestments.reduce((s, i) => s + i.amount, 0);
                                    return (
                                        <Link key={pitch._id} to={`/pitch/${pitch._id}`}>
                                            <div className="glass rounded-2xl p-6 border-green-500/30 bg-green-500/5">
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
                                <p>No investments yet</p>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;
