import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PitchCard from '../components/PitchCard';
import { Search, Filter, TrendingUp, Loader2, Clock, Flame, Tag, X } from 'lucide-react';
import { motion } from 'framer-motion';
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
        <div className="min-h-screen pb-24">
            <Navbar />

            <main className="container mx-auto px-6 pt-40">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-20">
                    <div className="max-w-2xl">
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none"
                        >
                            Discover <span className="text-gradient">Startups</span>
                        </motion.h1>
                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
                            Explore the next generation of builders on Stacks. Verified, community-backed, and ready to scale.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
                        <form onSubmit={handleSearch} className="relative flex-grow lg:w-96 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-accent transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search the ecosystem..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-premium pl-16 pr-6"
                            />
                        </form>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`glass-card p-4 rounded-2xl w-full sm:w-auto flex items-center justify-center gap-3 transition-all hover:bg-white/10 ${showFilters ? 'text-brand-accent border-brand-accent/40 bg-brand-accent/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'text-slate-300'}`}
                        >
                            <Filter size={20} />
                            <span className="font-bold text-sm uppercase tracking-[0.1em]">Filters</span>
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="card-premium p-10 mb-20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 blur-[60px] rounded-full"></div>
                        <div className="flex flex-wrap gap-12 relative z-10">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                    <Tag size={12} /> Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as PitchCategory | 'All')}
                                    className="bg-brand-primary/50 text-white border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-accent/50 transition-all font-medium min-w-[240px]"
                                >
                                    <option value="All">All Sectors</option>
                                    {PITCH_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                    <TrendingUp size={12} /> Optimization
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => setSort('recent')}
                                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all text-sm ${sort === 'recent' ? 'bg-brand-accent text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <Clock size={18} /> Newest
                                    </button>
                                    <button
                                        onClick={() => setSort('trending')}
                                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all text-sm ${sort === 'trending' ? 'bg-brand-accent text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <Flame size={18} /> Hot
                                    </button>
                                    <button
                                        onClick={() => setSort('oldest')}
                                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all text-sm ${sort === 'oldest' ? 'bg-brand-accent text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <Clock size={18} /> Classic
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <div className="mb-12 p-8 glass border-red-500/20 rounded-3xl text-red-400 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                            <X size={32} />
                        </div>
                        <p className="text-lg font-bold">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="relative">
                            <Loader2 className="animate-spin text-brand-accent" size={64} />
                            <div className="absolute inset-0 bg-brand-accent/20 blur-2xl rounded-full"></div>
                        </div>
                        <p className="mt-8 text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Scanning Ecosystem...</p>
                    </div>
                ) : (
                    <div className="space-y-24">
                        {featuredPitches.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-1 px-1 bg-brand-accent rounded-full"></div>
                                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-accent">Spotlight Projects</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {featuredPitches.map(pitch => (
                                        <Link key={pitch._id} to={`/pitch/${pitch._id}`} className="block">
                                            <PitchCard pitch={pitch} />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="pb-20">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-1 px-1 bg-slate-700 rounded-full"></div>
                                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">
                                        {sort === 'trending' ? 'Global Trending' : sort === 'oldest' ? 'Ecosystem Classics' : 'Latest Submissions'}
                                    </h2>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 glass px-4 py-2 rounded-full border-white/5">
                                    {latestPitches.length} Total Found
                                </span>
                            </div>
                            {latestPitches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {latestPitches.map(pitch => (
                                        <Link key={pitch._id} to={`/pitch/${pitch._id}`} className="block">
                                            <PitchCard pitch={pitch} />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-40 glass rounded-[2.5rem] border-dashed border-white/10">
                                    <Search size={64} className="mx-auto mb-6 text-slate-800" />
                                    <h4 className="text-xl font-bold mb-2">No Discoveries Found</h4>
                                    <p className="text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
                                </div>
                            )}
                        </section>

                        {pagination && pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-12 pb-20">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-12 h-12 rounded-2xl font-bold transition-all ${pageNum === page
                                            ? 'bg-brand-accent text-white shadow-lg'
                                            : 'glass text-slate-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Explorer;
