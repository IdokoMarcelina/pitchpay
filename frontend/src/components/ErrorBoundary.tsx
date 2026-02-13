import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-brand-primary flex items-center justify-center p-4">
                    <div className="glass rounded-3xl p-8 max-w-md text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-red-400" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-white/60 mb-6">
                            We encountered an unexpected error. Please try again or contact support if the problem persists.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button variant="secondary" onClick={this.handleReset}>
                                <RefreshCw size={16} className="mr-2" />
                                Try Again
                            </Button>
                            <a href="/">
                                <Button variant="outline">
                                    <Home size={16} className="mr-2" />
                                    Go Home
                                </Button>
                            </a>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <pre className="mt-6 p-4 bg-black/30 rounded-lg text-left text-xs overflow-auto text-red-300">
                                {this.state.error.message}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
