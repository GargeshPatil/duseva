import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Heart, Star, Coffee } from "lucide-react";

interface HeroSectionProps {
    heroContent: { headline: string; subheadline: string };
    fadeUpVariants: any;
}

export function HeroSection({ heroContent, fadeUpVariants }: HeroSectionProps) {
    return (
        <section className="relative min-h-[90svh] flex flex-col items-center justify-center pt-32 pb-20 px-6">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                }}
                className="max-w-4xl mx-auto flex flex-col items-center text-center"
            >
                <motion.div variants={fadeUpVariants} className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white/80">Batch 2026 is officially open</span>
                </motion.div>

                <motion.h1 variants={fadeUpVariants} className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-8 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-purple-200">
                    {heroContent.headline}
                </motion.h1>

                <motion.p variants={fadeUpVariants} className="text-lg md:text-2xl text-white/70 mb-12 max-w-2xl font-medium leading-relaxed">
                    {heroContent.subheadline}
                </motion.p>

                <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                    <Link
                        href="/auth/signup"
                        className="group relative inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-[2rem] font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95 overflow-hidden"
                    >
                        <span className="relative z-10">Claim 10 Free Credits</span>
                        <Heart className="h-5 w-5 relative z-10 fill-red-500 text-red-500 transition-transform group-hover:scale-110" />
                    </Link>
                    <Link
                        href="#who-we-are"
                        className="inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[2rem] font-medium text-lg transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 active:scale-95 backdrop-blur-md"
                    >
                        Take the Tour
                    </Link>
                </motion.div>
            </motion.div>

            {/* Floating playful elements */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute hidden lg:flex top-40 left-[10%] bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl items-center gap-4"
            >
                <div className="bg-yellow-400/20 p-3 rounded-2xl text-yellow-400"><Star className="h-6 w-6 fill-yellow-400" /></div>
                <div>
                    <div className="text-sm font-bold">100 Percentile</div>
                    <div className="text-xs text-white/60">English & GT</div>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute hidden lg:flex bottom-40 right-[10%] bg-surface-glass backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl items-center gap-4"
            >
                <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400"><Coffee className="h-6 w-6" /></div>
                <div>
                    <div className="text-sm font-bold">Stress-Free Prep</div>
                    <div className="text-xs text-white/60">We got you.</div>
                </div>
            </motion.div>
        </section>
    );
}
