import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import Button from './Button';
import { Menu, X, Wallet, Bell, TrendingUp } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { api } from '../lib/api';

interface Notification {
    _id: string;
    type: string;
    from: string;
    pitchId: string;
    pitchTitle: string;
    amount?: number;
    txid: string;
    read: boolean;
    createdAt: string;
}

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
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

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!address) return;
            try {
                const data = await api.getNotifications(address);
                setNotifications(data.notifications || []);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
        };

        if (address) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [address]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleWalletClick = async () => {
        if (isConnected) {
            disconnect();
        } else {
            try {
                await connect();
            } catch (error) {
                console.error('Wallet connection failed:', error);
                alert('Failed to connect wallet. Please make sure you have a Stacks wallet installed.');
            }
        }
    };

    return (
        <motion.nav
            style={{ backgroundColor }}
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 backdrop-blur-xl"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-24">
                    <div className="flex-shrink-0">
                        <Link to="/">
                            <Logo className="h-12" />
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-12">
                            <Link to="/explorer" className="text-white/70 hover:text-white font-medium transition-colors">Explorer</Link>
                            <Link to="/dashboard" className="text-white/70 hover:text-white font-medium transition-colors">Dashboard</Link>
                            {isConnected && address && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-3 text-white/70 hover:text-white transition-colors glass rounded-full"
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 bg-brand-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-primary">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 mt-4 w-96 glass rounded-3xl border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                                <h3 className="text-lg">Notifications</h3>
                                                <button onClick={() => setShowNotifications(false)} className="text-white/40 hover:text-white">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.slice(0, 5).map(n => (
                                                        <div key={n._id} className={`p-6 border-b border-white/5 ${!n.read ? 'bg-brand-accent/5' : ''} hover:bg-white/5 transition-colors`}>
                                                            <div className="flex items-start gap-4">
                                                                <div className="p-3 rounded-2xl bg-brand-accent/20 text-brand-accent">
                                                                    <TrendingUp size={18} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm leading-relaxed">
                                                                        <span className="font-mono text-white/60">{n.from.slice(0, 6)}...{n.from.slice(-4)}</span>
                                                                        {' '}invested in{' '}
                                                                        <span className="text-brand-accent font-semibold">{n.pitchTitle}</span>
                                                                    </p>
                                                                    {n.amount && (
                                                                        <p className="text-sm text-green-400 font-bold mt-1">
                                                                            +{(n.amount / 1000000).toFixed(2)} STX
                                                                        </p>
                                                                    )}
                                                                    <p className="text-xs text-white/40 mt-2">
                                                                        {new Date(n.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-12 text-center text-white/40">
                                                        <Bell size={40} className="mx-auto mb-4 opacity-20" />
                                                        <p>No notifications yet</p>
                                                    </div>
                                                )}
                                            </div>
                                            {notifications.length > 0 && (
                                                <Link
                                                    to={`/profile/${address}`}
                                                    className="block p-4 text-center text-sm font-bold text-brand-accent hover:bg-white/5 transition-colors"
                                                    onClick={() => setShowNotifications(false)}
                                                >
                                                    View All Activity
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            {isConnected && address ? (
                                <Link to={`/profile/${address}`}>
                                    <Button variant="secondary" onClick={handleWalletClick}>
                                        <Wallet size={16} className="mr-2" />
                                        {formatAddress(address)}
                                    </Button>
                                </Link>
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
                className="md:hidden overflow-hidden glass border-t border-white/5"
            >
                <div className="px-6 py-8 space-y-6 shadow-2xl">
                    <Link to="/explorer" className="block text-xl font-display font-medium text-white/80 hover:text-white" onClick={() => setIsOpen(false)}>Explorer</Link>
                    <Link to="/dashboard" className="block text-xl font-display font-medium text-white/80 hover:text-white" onClick={() => setIsOpen(false)}>Dashboard</Link>
                    {isConnected && address && (
                        <Link to={`/profile/${address}`} className="block text-xl font-display font-medium text-white/80 hover:text-white" onClick={() => setIsOpen(false)}>
                            Profile
                        </Link>
                    )}
                    <div className="pt-4">
                        {isConnected && address ? (
                            <Button variant="secondary" onClick={handleWalletClick} className="w-full justify-center">
                                <Wallet size={20} className="mr-3" />
                                {formatAddress(address)}
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleWalletClick}
                                disabled={isLoading}
                                className="w-full justify-center"
                            >
                                {isLoading ? 'Connecting...' : 'Connect Wallet'}
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.nav>
    );
};

export default Navbar;
