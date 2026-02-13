import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import Button from './Button';
import { Menu, X, Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { scrollY } = useScroll();
    const { address, isConnected, isLoading, connect, disconnect } = useWallet();

    const backgroundColor = useTransform(
        scrollY,
        [0, 50],
        ['rgba(27, 65, 64, 0)', 'rgba(27, 65, 64, 0.9)']
    );

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const handleWalletClick = async () => {
        if (isConnected) {
            disconnect();
        } else {
            try {
                await connect();
            } catch (error) {
                console.error('Failed to connect wallet:', error);
            }
        }
    };

    return (
        <motion.nav
            style={{ backgroundColor }}
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent backdrop-blur-lg"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0">
                        <Link to="/">
                            <Logo className="h-10" />
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link to="/explorer" className="text-white/80 hover:text-white transition-colors">Explorer</Link>
                            <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">Dashboard</Link>
                            {isConnected && address ? (
                                <Button variant="secondary" onClick={handleWalletClick}>
                                    <Wallet size={16} className="mr-2" />
                                    {formatAddress(address)}
                                </Button>
                            ) : (
                                <Button 
                                    variant="primary" 
                                    onClick={handleWalletClick}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                                </Button>
                            )}
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
                    <Link to="/explorer" className="block py-2 text-lg text-white/80" onClick={() => setIsOpen(false)}>Explorer</Link>
                    <Link to="/dashboard" className="block py-2 text-lg text-white/80" onClick={() => setIsOpen(false)}>Dashboard</Link>
                    {isConnected && address ? (
                        <Button variant="secondary" onClick={handleWalletClick} className="w-full">
                            <Wallet size={16} className="mr-2" />
                            {formatAddress(address)}
                        </Button>
                    ) : (
                        <Button 
                            variant="primary" 
                            onClick={handleWalletClick}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Connecting...' : 'Connect Wallet'}
                        </Button>
                    )}
                </div>
            </motion.div>
        </motion.nav>
    );
};

export default Navbar;
