import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {

        // Base classes
        const baseClasses = "btn";

        // Variant classes
        let variantClasses = "";
        if (variant === 'primary') variantClasses = "btn-primary";
        else if (variant === 'secondary') variantClasses = "btn-secondary";
        else if (variant === 'outline') variantClasses = "btn-outline";
        else if (variant === 'ghost') variantClasses = "bg-transparent hover:bg-muted text-foreground";

        // Size classes (can be expanded in globals.css or here with inline styles/utility classes)
        let sizeClasses = "";
        if (size === 'sm') sizeClasses = "text-sm px-3 py-1.5";
        else if (size === 'lg') sizeClasses = "text-lg px-6 py-3";

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
