import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {

        const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

        let variantClasses = "";
        switch (variant) {
            case 'primary':
                variantClasses = "bg-primary text-primary-foreground hover:bg-blue-700 shadow-sm";
                break;
            case 'secondary':
                variantClasses = "bg-secondary text-secondary-foreground hover:bg-slate-200 shadow-sm";
                break;
            case 'outline':
                variantClasses = "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
                break;
            case 'ghost':
                variantClasses = "hover:bg-muted hover:text-muted-foreground";
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

        return (
            <button
                ref={ref}
                className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className || ''}`}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
