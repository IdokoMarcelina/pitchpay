import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Rocket, Clock } from 'lucide-react';
import Button from './Button';

interface Pitch {
    id: string;
    title: string;
    description: string;
    founder: string;
    isBoosted: boolean;
    status: string;
}

const PitchCard: React.FC<{ pitch: Pitch }> = ({ pitch }) => {
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
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-accent border border-white/10 group-hover:border-brand-accent/30">
                    <Rocket size={24} />
                </div>
                <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Clock size={12} /> 2 days ago
                </div>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-brand-accent transition-colors">{pitch.title}</h3>
            <p className="text-white/60 text-sm mb-6 line-clamp-3">
                {pitch.description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                <div className="text-xs text-white/40">
                    By <span className="text-white/80 font-mono">{pitch.founder.slice(0, 6)}...{pitch.founder.slice(-4)}</span>
                </div>
                <Button variant="ghost" className="p-2 h-auto text-xs flex items-center gap-1">
                    View Detail <ExternalLink size={14} />
                </Button>
            </div>
        </motion.div>
    );
};

export default PitchCard;
