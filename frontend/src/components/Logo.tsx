import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-8" }) => {
    return (
        <a href="/" className={`flex items-center gap-2 ${className} hover:opacity-80 transition-opacity`}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto"
            >
                <path
                    d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                    fill="#d47f0d"
                    stroke="#d47f0d"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span className="font-bold text-xl tracking-tight text-white">
                Pitch<span className="text-[#d47f0d]">Pay</span>
            </span>
        </a>
    );
};

export default Logo;
