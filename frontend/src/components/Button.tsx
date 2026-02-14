import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading,
    className = '',
    ...props
}) => {
    const baseStyles = "relative inline-flex items-center justify-center px-8 py-4 font-bold rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group";

    const variants = {
        primary: "bg-brand-accent text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:bg-brand-accent-light",
        secondary: "bg-brand-gold text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]",
        outline: "border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40",
        ghost: "text-white/70 hover:text-white hover:bg-white/5"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...(props as any)}
        >
            {variant === 'primary' && (
                <span className="absolute inset-0 w-full h-full transition duration-300 ease-out opacity-0 bg-gradient-to-br from-white/20 to-transparent group-hover:opacity-100"></span>
            )}

            {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <span className="relative flex items-center gap-2">{children}</span>
            )}
        </motion.button>
    );
};

export default Button;
