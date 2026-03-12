import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";

export function CuetHero({ fadeUpVariants }: { fadeUpVariants: any }) {
    return (
        <section className="relative pt-40 pb-20 px-6">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                }}
                className="max-w-4xl mx-auto text-center"
            >
                <motion.div variants={fadeUpVariants} className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-white/80">Your ultimate roadmap</span>
                </motion.div>

                <motion.h1
                    variants={fadeUpVariants}
                    className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-8 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-purple-200"
                >
                    Master <span className="text-white">CUET 2026</span>
                </motion.h1>

                <motion.p
                    variants={fadeUpVariants}
                    className="text-lg md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
                >
                    Everything you need to know about the syllabus, exam pattern, and college admissions.
                </motion.p>
            </motion.div>

            {/* Floating playful elements */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute hidden lg:flex top-40 left-[10%] bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl items-center gap-4"
            >
                <div className="bg-blue-400/20 p-3 rounded-2xl text-blue-400"><BookOpen className="h-6 w-6" /></div>
                <div>
                    <div className="text-sm font-bold">New Syllabus</div>
                    <div className="text-xs text-white/60">Updated for 2026</div>
                </div>
            </motion.div>
        </section>
    );
}
