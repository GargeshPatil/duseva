"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PremiumCursorTracker() {
    const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    // Do not show on test engine to maintain exam integrity
    const isTestEngine = pathname?.startsWith("/test/");

    useEffect(() => {
        if (isTestEngine) return;

        const updateMousePosition = (e: MouseEvent) => {
            if (!isVisible) setIsVisible(true);
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener("mousemove", updateMousePosition);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [isTestEngine, isVisible]);

    if (isTestEngine) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-1000" style={{ opacity: isVisible ? 1 : 0 }}>
            {/* The primary vibrant orb - Mid Blend Tone & Subtle Warm Edge */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full blur-[120px]"
                animate={{
                    x: mousePosition.x - 400,
                    y: mousePosition.y - 400,
                }}
                transition={{
                    type: "tween",
                    ease: "easeOut",
                    duration: 0.8,
                }}
                style={{
                    background: "radial-gradient(circle, rgba(76, 29, 149, 0.15) 0%, rgba(91, 33, 182, 0.1) 40%, rgba(154, 52, 18, 0.08) 70%, transparent 80%)",
                }}
            />
            {/* A tighter, brighter core - Primary Accent Glow */}
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full blur-[80px]"
                animate={{
                    x: mousePosition.x - 200,
                    y: mousePosition.y - 200,
                }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 25,
                    mass: 0.5
                }}
                style={{
                    background: "radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(190, 24, 93, 0.15) 50%, transparent 80%)",
                }}
            />
        </div>
    );
}
