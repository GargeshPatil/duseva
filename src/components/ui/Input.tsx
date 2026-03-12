import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className={`space-y-2 ${className || ''}`}>
                {label && (
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text-secondary">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    suppressHydrationWarning
                    className={`
            flex h-12 w-full rounded-xl border-2 border-border/80 bg-surface-base px-4 py-3 text-sm text-text-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted outline-none focus-visible:ring-4 focus-visible:ring-cta-primary/30 focus-visible:border-cta-primary shadow-sm hover:border-cta-primary/50 focus-visible:shadow-[0_0_20px_rgba(99,102,241,0.15)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 focus-visible:-translate-y-0.5
            ${error ? 'border-semantic-error hover:border-semantic-error focus-visible:ring-semantic-error/30 focus-visible:border-semantic-error focus-visible:shadow-[0_0_20px_rgba(239,68,68,0.15)]' : ''}
          `}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-semantic-error font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
