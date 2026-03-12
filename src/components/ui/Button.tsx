import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export function getButtonClasses({ variant = 'primary', size = 'md', fullWidth = false, className = '' }: { variant?: ButtonProps['variant'], size?: ButtonProps['size'], fullWidth?: boolean, className?: string }) {
    const baseClasses = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 outline-none focus-visible:ring-4 focus-visible:ring-cta-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 relative overflow-hidden group";

    let variantClasses = "";
    switch (variant) {
        case 'primary':
            variantClasses = "bg-gradient-to-r from-cta-primary to-cta-hover text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-white/10 hover:-translate-y-1";
            break;
        case 'secondary':
            variantClasses = "bg-surface-glass backdrop-blur-xl text-text-primary hover:bg-surface-elevated border border-border/80 shadow-lg hover:shadow-xl hover:-translate-y-1";
            break;
        case 'outline':
            variantClasses = "bg-surface-base border-2 border-border text-text-primary hover:border-cta-primary hover:text-cta-primary hover:bg-cta-primary/5 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:-translate-y-1";
            break;
        case 'ghost':
            variantClasses = "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated/80 hover:scale-105 active:scale-95";
            break;
    }

    let sizeClasses = "";
    switch (size) {
        case 'sm':
            sizeClasses = "h-8 rounded-md px-3 text-xs";
            break;
        case 'md':
            sizeClasses = "h-10 px-4 py-2 text-sm";
            break;
        case 'lg':
            sizeClasses = "h-12 px-8 text-base";
            break;
    }

    const widthClass = fullWidth ? "w-full" : "";

    return `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
        const classes = getButtonClasses({ variant, size, fullWidth, className });
        return (
            <button
                ref={ref}
                suppressHydrationWarning
                className={classes}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
