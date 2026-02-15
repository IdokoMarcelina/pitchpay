import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Rocket, Clock, TrendingUp, Tag } from 'lucide-react';
import Button from './Button';
import type { Pitch } from '../lib/api';

const PitchCard: React.FC<{ pitch: Pitch }> = ({ pitch }) => {
    const formatAddress = (addr: string | undefined | null) => {
        if (!addr) return '...';
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
            viewport={{ once: true }}
            className={`glass rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-brand-accent/50 ${pitch.isBoosted ? 'border-brand-accent/30 bg-brand-accent/5' : ''}`}
        >
            {pitch.isBoosted && (
                <div className="absolute top-0 right-0 bg-brand-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                    <Rocket size={10} /> Boosted
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                {pitch.logoUrl ? (
                    <img src={pitch.logoUrl} alt={pitch.title} className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-accent border border-white/10 group-hover:border-brand-accent/30">
                        <Rocket size={24} />
                    </div>
                )}
                <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Clock size={12} /> {formatDate(pitch.createdAt)}
                </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/10 flex items-center gap-1">
                    <Tag size={10} /> {pitch.category}
                </span>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-brand-accent transition-colors">{pitch.title}</h3>
            <p className="text-white/60 text-sm mb-4 line-clamp-2">
                {pitch.description}
            </p>

            {totalInvested > 0 && (
                <div className="flex items-center gap-2 text-green-400 text-sm mb-4">
                    <TrendingUp size={14} />
                    <span className="font-medium">{(totalInvested / 1000000).toFixed(2)} STX raised</span>
                </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                <div className="text-xs text-white/40">
                    By <span className="text-white/80 font-mono">{formatAddress(pitch.founder)}</span>
                </div>
                <Button variant="ghost" className="p-2 h-auto text-xs flex items-center gap-1">
                    View Detail <ExternalLink size={14} />
                </Button>
            </div>
        </motion.div>
    );
};

export default PitchCard;
