import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, BookOpen, Star, Coffee } from "lucide-react";

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

                <motion.div variants={fadeUpVariants} className="flex flex-col items-center gap-4 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                        <Link
                            href="/auth/signup"
                            className="group relative inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-[2rem] font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10">Start Your CUET Prep</span>
                            <BookOpen className="h-5 w-5 relative z-10 transition-transform group-hover:scale-110" />
                        </Link>
                        <a
                            href="https://chat.whatsapp.com/Gxa8GQH8bPcAC9Wd2IW3Ui"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] px-8 py-4 rounded-[2rem] font-bold text-lg transition-all hover:bg-[#25D366]/20 hover:border-[#25D366]/50 hover:-translate-y-1 active:scale-95 backdrop-blur-md"
                        >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366] shrink-0" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Join Community
                        </a>
                    </div>
                    <p className="text-sm text-white/40 font-medium">
                        Free to start &nbsp;·&nbsp; One-on-one Mentorship &nbsp;·&nbsp; NTA-pattern tests
                    </p>
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
