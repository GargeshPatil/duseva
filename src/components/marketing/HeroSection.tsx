import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, BookOpen, Users, ArrowRight } from "lucide-react";

const WA_URL = "https://chat.whatsapp.com/Gxa8GQH8bPcAC9Wd2IW3Ui";

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366] shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

interface HeroSectionProps {
    heroContent: { headline: string; subheadline: string };
    fadeUpVariants: any;
}

export function HeroSection({ heroContent, fadeUpVariants }: HeroSectionProps) {
    return (
        <section className="relative min-h-[88svh] flex flex-col items-center justify-center pt-28 pb-16 px-6">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.18 } }
                }}
                className="max-w-4xl mx-auto flex flex-col items-center text-center"
            >
                {/* Eyebrow badge */}
                <motion.div variants={fadeUpVariants} className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-xl">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-white/80">Batch 2026 is officially open</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={fadeUpVariants}
                    className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight mb-6 leading-[1.05]"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-purple-300">
                        {heroContent.headline}
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p variants={fadeUpVariants} className="text-lg md:text-xl text-white/55 mb-10 max-w-2xl font-medium leading-relaxed">
                    {heroContent.subheadline}
                </motion.p>

                {/* CTAs */}
                <motion.div variants={fadeUpVariants} className="flex flex-col items-center gap-4 w-full">
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link
                            href="/score-checker"
                            className="group inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-[2rem] font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] active:scale-95"
                        >
                            <span>Score Calculator</span>
                            <BookOpen className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <a
                            href={WA_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] px-8 py-4 rounded-[2rem] font-bold text-lg transition-all hover:bg-[#25D366]/20 hover:border-[#25D366]/50 hover:-translate-y-0.5 active:scale-95"
                        >
                            <WhatsAppIcon />
                            Join Community
                        </a>
                    </div>
                    <p className="text-sm text-white/35 font-medium">
                        Free to start &nbsp;·&nbsp; One-on-one Mentorship &nbsp;·&nbsp; NTA-pattern tests
                    </p>
                </motion.div>

                {/* Social proof row */}
                <motion.div variants={fadeUpVariants} className="mt-12 flex flex-wrap items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-white/50">
                        <Users className="h-4 w-4 text-indigo-400" />
                        <span><span className="text-white font-bold">50,000+</span> students enrolled</span>
                    </div>
                    <div className="w-px h-4 bg-white/10 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm text-white/50">
                        <span>🏆</span>
                        <span><span className="text-white font-bold">400+</span> DU selections</span>
                    </div>
                    <div className="w-px h-4 bg-white/10 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm text-white/50">
                        <span>⭐</span>
                        <span><span className="text-white font-bold">4.9/5</span> average rating</span>
                    </div>
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    variants={fadeUpVariants}
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-16 flex flex-col items-center gap-2 text-white/25 cursor-default select-none"
                >
                    <span className="text-xs font-medium tracking-[0.2em] uppercase">Scroll</span>
                    <ArrowRight className="h-4 w-4 rotate-90" />
                </motion.div>
            </motion.div>
        </section>
    );
}
