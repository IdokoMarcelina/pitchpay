import { Navigate, Outlet } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const ProtectedRoute = () => {
    const { isConnected, isLoading } = useWallet();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
            </div>
        );
    }

    if (!isConnected) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
