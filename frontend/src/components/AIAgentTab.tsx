import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useWallet } from '../context/WalletContext';
import Button from './Button';
import { Bot, Sparkles, AlertCircle, CheckCircle2, Loader2, BrainCircuit, TrendingUp, ExternalLink } from 'lucide-react';

const AIAgentTab: React.FC = () => {
    const { address } = useWallet();
    const [strategy, setStrategy] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (address) {
            fetchData();
        }
    }, [address]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [agentData, recData] = await Promise.all([
                api.getAIAgent(address!),
                api.getRecommendations(address!)
            ]);
            setStrategy(agentData.strategy);
            setIsActive(agentData.isActive);
            setRecommendations(recData);
        } catch (error) {
            console.error('Error fetching AI data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveStrategy = async () => {
        if (!address) return;
        setIsSaving(true);
        setMessage(null);
        try {
            await api.updateAIAgent(address, { strategy, isActive });
            setMessage({ type: 'success', text: 'Strategy updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update strategy.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-brand-accent" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Agent Configuration */}
            <div className="glass p-8 rounded-3xl border-brand-accent/20 bg-gradient-to-br from-brand-accent/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BrainCircuit size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-brand-accent rounded-2xl">
                            <Bot className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Your Investment Agent</h2>
                            <p className="text-white/40 text-sm italic">Powered by GPT-4o Analysis</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/60">Investment Strategy</label>
                            <textarea
                                value={strategy}
                                onChange={(e) => setStrategy(e.target.value)}
                                placeholder="e.g., Invest in DeFi protocols on Stacks, focus on tools with a verified deck and clear revenue models."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-accent/50 min-h-[120px]"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-12 h-6 rounded-full transition-colors relative ${isActive ? 'bg-brand-accent' : 'bg-white/10'}`}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isActive ? 'translate-x-6' : ''}`} />
                                </div>
                                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                                    Agent Active
                                </span>
                            </label>

                            <Button
                                variant="primary"
                                onClick={handleSaveStrategy}
                                isLoading={isSaving}
                                className="px-8"
                            >
                                <Sparkles size={18} className="mr-2" />
                                Update Strategy
                            </Button>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <span className="text-sm font-medium">{message.text}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recommendations Feed */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp size={20} className="text-brand-accent" />
                        AI Recommendations
                    </h3>
                    <span className="text-xs text-white/40 uppercase tracking-widest">{recommendations.length} total matches</span>
                </div>

                {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {recommendations.map((rec) => (
                            <div key={rec._id} className="glass p-6 rounded-3xl border-white/5 hover:border-brand-accent/30 transition-all group">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-48 h-32 bg-white/5 rounded-2xl overflow-hidden relative flex-shrink-0">
                                        {rec.pitchId.logoUrl ? (
                                            <img src={rec.pitchId.logoUrl} alt={rec.pitchId.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/10">
                                                <BrainCircuit size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-brand-accent text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                            {rec.score}% Match
                                        </div>
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-bold group-hover:text-brand-accent transition-colors">
                                                {rec.pitchId.title}
                                            </h4>
                                            <a
                                                href={`/pitch/${rec.pitchId._id}`}
                                                className="p-2 text-white/40 hover:text-white transition-colors"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                        </div>
                                        <p className="text-white/60 text-sm mb-4 line-clamp-2">
                                            {rec.reasoning}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase font-bold text-white/40 border border-white/5">
                                                {rec.pitchId.category}
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="py-1 px-4 text-xs h-auto border-brand-accent/50 text-brand-accent hover:bg-brand-accent hover:text-white"
                                                onClick={() => window.location.href = `/pitch/${rec.pitchId._id}`}
                                            >
                                                Review & Invest
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10">
                        <div className="p-4 bg-white/5 rounded-full w-fit mx-auto mb-4 text-white/20">
                            <Sparkles size={32} />
                        </div>
                        <h4 className="text-white/60 font-medium mb-1">No recommendations yet</h4>
                        <p className="text-white/30 text-xs">Set your strategy and your agent will start watching new pitches.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAgentTab;
