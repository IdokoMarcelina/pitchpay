import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Logo from './Logo';
import Button from './Button';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { scrollY } = useScroll();

    const backgroundColor = useTransform(
        scrollY,
        [0, 50],
        ['rgba(27, 65, 64, 0)', 'rgba(27, 65, 64, 0.9)']
    );

    return (
        <motion.nav
            style={{ backgroundColor }}
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent backdrop-blur-lg"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0">
                        <Logo className="h-10" />
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a href="/explorer" className="text-white/80 hover:text-white transition-colors">Explorer</a>
                            <a href="/dashboard" className="text-white/80 hover:text-white transition-colors">Dashboard</a>
                            <Button variant="primary">Connect Wallet</Button>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white p-2"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <motion.div
                initial={false}
                animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden bg-brand-primary/95 backdrop-blur-xl"
            >
                <div className="px-4 pt-2 pb-6 space-y-4 shadow-2xl">
                    <a href="/explorer" className="block py-2 text-lg text-white/80">Explorer</a>
                    <a href="/dashboard" className="block py-2 text-lg text-white/80">Dashboard</a>
                    <Button variant="primary" className="w-full">Connect Wallet</Button>
                </div>
            </motion.div>
        </motion.nav>
    );
};

export default Navbar;
