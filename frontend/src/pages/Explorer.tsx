import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PitchCard from '../components/PitchCard';
import { Search, Filter, TrendingUp, Loader2 } from 'lucide-react';
import { usePitches } from '../hooks/usePitches';

const Explorer: React.FC = () => {
    const [page, setPage] = useState(1);
    const { pitches, pagination, isLoading, error } = usePitches({ page, limit: 9 });

    const featuredPitches = pitches.filter(p => p.isBoosted);
    const latestPitches = pitches.filter(p => !p.isBoosted);

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

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-brand-accent" size={40} />
                    </div>
                ) : (
                    <>
                        {/* Featured Section */}
                        {featuredPitches.length > 0 && (
                            <div className="mb-16">
                                <div className="flex items-center gap-2 mb-6 text-brand-accent font-bold uppercase tracking-widest text-xs">
                                    <TrendingUp size={14} /> Featured Discoveries
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {featuredPitches.map(pitch => (
                                        <Link key={pitch._id} to={`/pitch/${pitch._id}`}>
                                            <PitchCard pitch={pitch} />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-6 text-white/40 font-bold uppercase tracking-widest text-xs">
                                Latest Submissions
                            </div>
                            {latestPitches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {latestPitches.map(pitch => (
                                        <Link key={pitch._id} to={`/pitch/${pitch._id}`}>
                                            <PitchCard pitch={pitch} />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-white/40 text-center py-12">
                                    No pitches yet. Be the first to submit!
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl transition-colors ${
                                            pageNum === page 
                                                ? 'bg-brand-accent text-white' 
                                                : 'glass text-white/60 hover:text-white'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Explorer;
