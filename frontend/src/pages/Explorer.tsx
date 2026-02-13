import React from 'react';
import Navbar from '../components/Navbar';
import PitchCard from '../components/PitchCard';
import { Search, Filter, TrendingUp } from 'lucide-react';

const Explorer: React.FC = () => {
    // Mock data for UI only
    const mockPitches = [
        { id: '1', title: 'StacksSwap Pro', description: 'Next-gen DEX with concentrated liquidity and gas optimizations for the Stacks ecosystem.', founder: 'ST1PQHQKV0RJ7X6RGHN5X29D50Z6MR8BWG32W8A7', isBoosted: true, status: 'VERIFIED' },
        { id: '2', title: 'ArGo Finance', description: 'Decentralized cloud governance platform for managing distributed computing resources.', founder: 'ST20X...4RE', isBoosted: false, status: 'PAID' },
        { id: '3', title: 'NFTify Me', description: 'A seamless bridge for turning real-world assets into verifiable on-chain NFTs with legal backing.', founder: 'ST3A...B9X', isBoosted: true, status: 'VERIFIED' },
        { id: '4', title: 'Clarity Insights', description: 'Advanced analytics and security scanning for Clarity smart contracts on Stacks.', founder: 'ST3X...8ER', isBoosted: false, status: 'VERIFIED' },
        { id: '5', title: 'NeoBank Stacks', description: 'A crypto-native banking experience with integrated yield from Stacking.', founder: 'STG6...99L', isBoosted: false, status: 'PAID' },
        { id: '6', title: 'DeSocial', description: 'Decentralized social graph leveraging Bitcoin security through Stacks layers.', founder: 'STRB...X42', isBoosted: true, status: 'VERIFIED' },
    ];

    return (
        <div className="min-h-screen pb-20">
            <Navbar />

            <main className="container mx-auto px-4 pt-32">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div className="max-w-xl">
                        <h1 className="text-4xl font-extrabold mb-4">Discover <span className="text-gradient">Startups</span></h1>
                        <p className="text-white/60">Explore the latest startups pitching on the Stacks ecosystem. Verified and community-backed.</p>
                    </div>

                    <div className="flex w-full md:w-auto gap-4">
                        <div className="relative flex-grow md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                            <input
                                type="text"
                                placeholder="Search pitches..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-accent/50 transition-colors"
                            />
                        </div>
                        <button className="glass p-3 rounded-xl text-white/60 hover:text-white transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Featured Section */}
                <div className="mb-16">
                    <div className="flex items-center gap-2 mb-6 text-brand-accent font-bold uppercase tracking-widest text-xs">
                        <TrendingUp size={14} /> Featured Discoveries
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mockPitches.filter(p => p.isBoosted).map(pitch => (
                            <PitchCard key={pitch.id} pitch={pitch} />
                        ))}
                    </div>
                </div>

                {/* All Section */}
                <div>
                    <div className="flex items-center gap-2 mb-6 text-white/40 font-bold uppercase tracking-widest text-xs">
                        Latest Submissions
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mockPitches.filter(p => !p.isBoosted).map(pitch => (
                            <PitchCard key={pitch.id} pitch={pitch} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Explorer;
