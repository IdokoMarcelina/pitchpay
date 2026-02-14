import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Rocket, Clock, TrendingUp } from 'lucide-react';
import Button from './Button';
import type { Pitch } from '../lib/api';

const PitchCard: React.FC<{ pitch: Pitch }> = ({ pitch }) => {
    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    const totalInvested = pitch.investments?.reduce((sum, i) => sum + i.amount, 0) || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            viewport={{ once: true }}
            className={`card-premium relative overflow-hidden group border-white/5 ${pitch.isBoosted ? 'border-brand-accent/30 bg-brand-accent/5 ring-1 ring-brand-accent/10' : ''}`}
        >
            {pitch.isBoosted && (
                <div className="absolute top-0 right-0 bg-brand-accent text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                    <Rocket size={12} /> Featured
                </div>
            )}

            <div className="flex justify-between items-start mb-6">
                {pitch.logoUrl ? (
                    <div className="relative">
                        <img src={pitch.logoUrl} alt={pitch.title} className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white/5 shadow-2xl" />
                        {pitch.isBoosted && <div className="absolute -inset-1 bg-brand-accent/20 blur-xl rounded-full"></div>}
                    </div>
                ) : (
                    <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-brand-accent border border-white/10 group-hover:border-brand-accent/30 transition-colors relative">
                        <Rocket size={32} />
                        {pitch.isBoosted && <div className="absolute inset-0 bg-brand-accent/10 blur-xl rounded-full"></div>}
                    </div>
                )}
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                    <Clock size={12} /> {formatDate(pitch.createdAt)}
                </div>
            </div>

            <div className="mb-4">
                <span className="badge-premium border-white/10 text-white/40 bg-white/5 py-1.5 px-3">
                    {pitch.category}
                </span>
            </div>

            <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-brand-accent transition-colors duration-300">
                {pitch.title}
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                {pitch.description}
            </p>

            {totalInvested > 0 && (
                <div className="flex items-center gap-3 text-green-400 text-sm font-bold bg-green-400/5 py-3 px-4 rounded-2xl border border-green-400/10 mb-6 shadow-inner">
                    <TrendingUp size={16} />
                    <span>{(totalInvested / 1000000).toFixed(2)} STX Raised</span>
                </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-400 transition-colors">
                    Founder <span className="font-mono text-white/50 lowercase ml-1">{formatAddress(pitch.founder)}</span>
                </div>
                <Button variant="ghost" className="p-0 h-auto text-xs font-black uppercase tracking-tighter flex items-center gap-1 group-hover:text-brand-accent transition-all">
                    Detail <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
            </div>
        </motion.div>
    );
};

export default PitchCard;
