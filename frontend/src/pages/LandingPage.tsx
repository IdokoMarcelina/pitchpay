import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { Rocket, Shield, Zap, ArrowRight, Globe, BarChart3 } from 'lucide-react';
import Navbar from '../components/Navbar';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 container mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-brand-accent animate-pulse"></span>
                            <span className="text-sm font-medium">The Future of Startup Fundraising</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                            Pitch your startup, <br />
                            <span className="text-gradient">Get paid in micro-STX.</span>
                        </h1>
                        <p className="text-xl text-white/60 mb-10 max-w-lg leading-relaxed">
                            The first decentralized platform where quality startups meet early-stage investors through micro-payments and on-chain verification.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="primary" className="text-lg px-8 py-4" onClick={() => navigate('/create')}>
                                Start Pitching <Rocket className="ml-2" size={20} />
                            </Button>
                            <Button variant="outline" className="text-lg px-8 py-4" onClick={() => navigate('/explorer')}>
                                Explore Pitches <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </div>
                    </motion.div>

                    {/* Animated Hero Imagery - Fallback for image generation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative z-10 glass rounded-3xl p-8 aspect-square flex items-center justify-center overflow-hidden">
                            {/* Dynamic Abstract Shapes */}
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    borderRadius: ["20% 30% 70% 30%", "30% 60% 70% 40%", "20% 30% 70% 30%"]
                                }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-tr from-brand-accent/20 to-transparent blur-3xl"
                            ></motion.div>

                            <div className="grid grid-cols-2 gap-6 relative z-10 w-full">
                                <HeroCard icon={<Zap size={32} />} title="Instant Payments" delay={0.4} />
                                <HeroCard icon={<Shield size={32} />} title="Verified Founders" delay={0.6} />
                                <HeroCard icon={<BarChart3 size={32} />} title="Launchpad" delay={0.8} />
                                <HeroCard icon={<Globe size={32} />} title="Global reach" delay={1.0} />
                            </div>

                            {/* Central Floating Element */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute"
                            >
                                <div className="bg-brand-accent p-6 rounded-2xl shadow-2xl shadow-brand-accent/40 border border-white/30">
                                    <Rocket size={48} className="text-white" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Background Decorations */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl -z-10"></div>
                    </motion.div>
                </div>
            </section>

            {/* Stats/Logo Cloud */}
            <section className="py-20 bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">$2.4M+</div>
                            <div className="text-white/40 uppercase tracking-widest text-xs">Total Pitched</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">500+</div>
                            <div className="text-white/40 uppercase tracking-widest text-xs">Startups</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">12k+</div>
                            <div className="text-white/40 uppercase tracking-widest text-xs">Investors</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">100%</div>
                            <div className="text-white/40 uppercase tracking-widest text-xs">On-Chain</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">How it <span className="text-brand-accent">Works</span></h2>
                        <p className="text-white/60 max-w-2xl mx-auto">Get your startup funded in three simple steps on the Stacks blockchain.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="glass rounded-3xl p-4 aspect-video flex items-center justify-center overflow-hidden border-brand-accent/20"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1000"
                                alt="People pitching product"
                                className="w-full h-full object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-500"
                            />
                        </motion.div>

                        <div className="space-y-8">
                            <Step
                                number="01"
                                title="Submit Your Pitch"
                                description="Share your startup's vision, website, and details. A small launch fee of 5 STX ensures high-quality submissions."
                            />
                            <Step
                                number="02"
                                title="On-Chain Verification"
                                description="Our smart contract verifies your submission and makes it visible to a global pool of early-stage investors."
                            />
                            <Step
                                number="03"
                                title="Boost and Scale"
                                description="Gain 2x visibility by boosting your pitch. Get micro-payments and direct interest from the Stacks community."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 mt-20">
                <div className="container mx-auto px-4 text-center text-white/30 text-sm">
                    &copy; 2026 PitchPay. Built for the Stacks Ecosystem.
                </div>
            </footer>
        </div>
    );
};

const HeroCard: React.FC<{ icon: React.ReactNode, title: string, delay: number }> = ({ icon, title, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/20 transition-colors group cursor-default"
    >
        <div className="text-brand-accent mb-4 group-hover:scale-110 transition-transform">{icon}</div>
        <div className="font-semibold text-sm">{title}</div>
    </motion.div>
);

const Step: React.FC<{ number: string, title: string, description: string }> = ({ number, title, description }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex gap-6 items-start"
    >
        <div className="text-4xl font-black text-brand-accent/20 leading-none">{number}</div>
        <div>
            <h4 className="text-xl font-bold mb-2 text-white">{title}</h4>
            <p className="text-white/60 text-sm leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

export default LandingPage;
