import React from 'react';
import { cn } from '@/lib/utils'; // Assuming this exists, I should check later, but standard in shadcn/ui

export type GradientVariant = 'hero' | 'transition' | 'cardGlow' | 'examSafe';

interface PremiumGradientProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: GradientVariant;
}

export function PremiumGradient({
    variant = 'hero',
    className,
    ...props
}: PremiumGradientProps) {
    // If examSafe, we render a static optimized flat deep background
    // without any grain, noise, or complex radial blending to ensure
    // 100% readability and zero performance overhead.
    if (variant === 'examSafe') {
        return (
            <div
                className={cn(
                    "absolute inset-0 pointer-events-none z-[-1]",
                    className
                )}
                style={{ backgroundColor: 'var(--gradient-base)' }}
                aria-hidden="true"
                {...props}
            />
        );
    }

    // Common styles for grain layout
    const grainStyle = {
        opacity: variant === 'cardGlow' ? 'calc(var(--grain-opacity) * 0.5)' : 'var(--grain-opacity)',
        mixBlendMode: 'overlay' as const,
    };

    return (
        <div
            className={cn(
                "absolute inset-0 overflow-hidden pointer-events-none z-[-1]",
                className
            )}
            style={{
                backgroundColor: 'var(--gradient-base)', // Fallback
            }}
            aria-hidden="true"
            {...props}
        >
            {/* 1. Base Flow + Deep Void Anchor */}
            {/* A single deep shadow pocket at the top-left, fading diagonally to create strong momentum */}
            <div
                className={cn(
                    "absolute inset-[-10%] opacity-80",
                    variant === 'cardGlow' && "opacity-60"
                )}
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 10% 0%, var(--gradient-base) 0%, transparent 60%),
                        linear-gradient(145deg, var(--gradient-base) 0%, var(--gradient-accent-1) 50%, var(--gradient-accent-2) 115%)
                    `,
                }}
            />

            {/* 2. Fluid Energetic Mass & Soft Highlights */}
            {/* Off-center, distinct masses with less blur so color zones are perceptible. Stronger warm glow. */}
            <div
                className={cn(
                    "absolute inset-[-15%] opacity-60",
                    variant === 'cardGlow' && "opacity-40"
                )}
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 70% 90% at 88% 85%, var(--gradient-warm) 0%, transparent 55%),
                        radial-gradient(ellipse 85% 75% at 10% 70%, var(--gradient-accent-1) 0%, transparent 50%),
                        radial-gradient(ellipse 55% 55% at 80% 10%, var(--gradient-accent-2) 0%, transparent 45%)
                    `,
                    mixBlendMode: 'screen',
                    filter: variant === 'cardGlow' ? 'blur(16px)' : 'blur(var(--gradient-blur))',
                    transform: variant === 'transition' ? 'scale(1.1)' : 'scale(1.0)',
                }}
            />

            {/* 3. Static SVG Noise Layer - Cinematic fine grain */}
            <svg
                className="absolute inset-0 w-full h-full object-cover"
                style={grainStyle}
                xmlns="http://www.w3.org/2000/svg"
            >
                <filter id="premium-grain">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.75"
                        numOctaves="4"
                        stitchTiles="stitch"
                    />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#premium-grain)" />
            </svg>
        </div>
    );
}
