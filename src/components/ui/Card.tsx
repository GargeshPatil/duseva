import React from "react";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={`group relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-surface-card backdrop-blur-2xl text-text-primary shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_15px_40px_rgba(99,102,241,0.15)] hover:-translate-y-1 ${className || ""}`}
            {...props}
        />
    )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={`flex flex-col space-y-1.5 p-6 ${className || ""}`}
            {...props}
        />
    )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={`text-lg font-semibold leading-none tracking-tight ${className || ""}`}
            {...props}
        />
    )
);
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={`p-6 pt-0 ${className || ""}`} {...props} />
    )
);
CardContent.displayName = "CardContent";
