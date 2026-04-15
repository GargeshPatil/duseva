"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix: string }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                    const controls = animate(0, value, {
                        duration: 2,
                        ease: "easeOut",
                        onUpdate(val) { setDisplay(Math.floor(val)); }
                    });
                    return () => controls.stop();
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value, hasStarted]);

    return <div ref={ref}>{display}{suffix}</div>;
}

const stats = [
    { number: 50, suffix: "k+", label: "Happy Students", color: "from-indigo-500/20 to-transparent", accent: "text-indigo-300" },
    { number: 100, suffix: "%", label: "Syllabus Covered", color: "from-purple-500/20 to-transparent", accent: "text-purple-300" },
    { number: 400, suffix: "+", label: "Selections in DU", color: "from-emerald-500/20 to-transparent", accent: "text-emerald-300" },
    { number: 4.9, suffix: "/5", label: "Average Rating", color: "from-amber-500/20 to-transparent", accent: "text-amber-300" },
];

export function SuccessStatsSection() {
    return (
        <section className="py-24 relative px-6 overflow-hidden">
            <div className="container mx-auto max-w-5xl">
                {/* Eyebrow */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-medium mb-4">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        By the numbers
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Results that speak for themselves
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, type: "spring" }}
                            className="relative text-center p-6 md:p-8 rounded-3xl bg-white/[0.06] border border-white/10 overflow-hidden hover:bg-white/[0.09] transition-colors"
                        >
                            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${stat.color} pointer-events-none`} />
                            <div className={`text-4xl md:text-5xl font-black mb-2 relative z-10 ${stat.accent}`}>
                                <AnimatedNumber value={stat.number} suffix={stat.suffix} />
                            </div>
                            <div className="text-sm md:text-base text-white/60 font-medium relative z-10">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
