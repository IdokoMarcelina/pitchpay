import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PitchCard from '../components/PitchCard';
import { Search, Filter, TrendingUp, Loader2, Clock, Flame } from 'lucide-react';
import { usePitches } from '../hooks/usePitches';
import { PITCH_CATEGORIES, type PitchCategory } from '../lib/api';

const Explorer: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<PitchCategory | 'All'>('All');
    const [sort, setSort] = useState<'recent' | 'trending' | 'oldest'>('recent');
    const [showFilters, setShowFilters] = useState(false);

    const { pitches, pagination, isLoading, error, refetch } = usePitches({
        page,
        limit: 9,
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        sort
    });

    const featuredPitches = pitches.filter(p => p.isBoosted);
    const latestPitches = pitches.filter(p => !p.isBoosted);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        refetch();
    };

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
                        <form onSubmit={handleSearch} className="relative flex-grow md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                            <input
                                type="text"
                                placeholder="Search pitches..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-accent/50 transition-colors"
                            />
                        </form>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`glass p-3 rounded-xl transition-colors ${showFilters ? 'text-brand-accent bg-brand-accent/10' : 'text-white/60 hover:text-white'}`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="glass rounded-2xl p-6 mb-8">
                        <div className="flex flex-wrap gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-white/60">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as PitchCategory | 'All')}
                                    className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 pr-10 focus:outline-none focus:border-brand-accent/50"
                                >
                                    <option value="All">All Categories</option>
                                    {PITCH_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-white/60">Sort By</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSort('recent')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${sort === 'recent' ? 'bg-brand-accent text-white' : 'bg-white/5 text-white/60 hover:text-white'
                                            }`}
                                    >
                                        <Clock size={16} /> Recent
                                    </button>
                                    <button
                                        onClick={() => setSort('trending')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${sort === 'trending' ? 'bg-brand-accent text-white' : 'bg-white/5 text-white/60 hover:text-white'
                                            }`}
                                    >
                                        <Flame size={16} /> Trending
                                    </button>
                                    <button
                                        onClick={() => setSort('oldest')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${sort === 'oldest' ? 'bg-brand-accent text-white' : 'bg-white/5 text-white/60 hover:text-white'
                                            }`}
                                    >
                                        <Clock size={16} /> Oldest
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

                        <div>
                            <div className="flex items-center gap-2 mb-6 text-white/40 font-bold uppercase tracking-widest text-xs">
                                {sort === 'trending' ? <Flame size={14} /> : <Clock size={14} />}
                                {sort === 'trending' ? 'Trending Now' : sort === 'oldest' ? 'Oldest First' : 'Latest Submissions'}
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
                                    No pitches found. Be the first to submit!
                                </div>
                            )}
                        </div>

                        {pagination && pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl transition-colors ${pageNum === page
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
