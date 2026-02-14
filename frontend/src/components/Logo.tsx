import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-8" }) => {
    return (
        <a href="/" className={`flex items-center gap-3 ${className} hover:opacity-80 transition-opacity`}>
            <div className="relative h-full aspect-square">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full"
                >
                    <path
                        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                        fill="currentColor"
                        className="text-brand-accent"
                    />
                </svg>
                <div className="absolute inset-0 bg-brand-accent/20 blur-lg rounded-full animate-pulse-slow"></div>
            </div>
            <span className="font-display font-black text-2xl tracking-tighter text-white">
                Pitch<span className="text-brand-accent">Pay</span>
            </span>
        </a>
    );
};

export default Logo;
