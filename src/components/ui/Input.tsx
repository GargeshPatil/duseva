import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPasswordType = type === "password";
        const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

        return (
            <div className={`space-y-2 ${className || ''}`}>
                {label && (
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text-secondary">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        type={inputType}
                        suppressHydrationWarning
                        className={`
                            flex h-12 w-full rounded-xl border-2 border-border/80 bg-surface-base px-4 py-3 text-sm text-text-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted outline-none focus-visible:ring-4 focus-visible:ring-cta-primary/30 focus-visible:border-cta-primary shadow-sm hover:border-cta-primary/50 focus-visible:shadow-[0_0_20px_rgba(99,102,241,0.15)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 focus-visible:-translate-y-0.5
                            ${error ? 'border-semantic-error hover:border-semantic-error focus-visible:ring-semantic-error/30 focus-visible:border-semantic-error focus-visible:shadow-[0_0_20px_rgba(239,68,68,0.15)]' : ''}
                            ${isPasswordType ? 'pr-12' : ''}
                        `}
                        {...props}
                    />
                    {isPasswordType && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-primary transition-colors focus:outline-none rounded-md"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="text-xs text-semantic-error font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
