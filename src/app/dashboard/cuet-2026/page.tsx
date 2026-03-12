"use client";

import { motion } from "framer-motion";
import { BookOpen, Calendar, Award, Target, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { GuideWrapper } from "@/app/cuet-2026/guides/GuideWrapper";

const guidanceSections = [
    {
        title: "Syllabus Analysis",
        icon: <BookOpen className="h-6 w-6 text-blue-400" />,
        content: "Detailed breakdown of the updated syllabus for Science, Commerce, and Humanities streams.",
        color: "from-blue-500/20",
        cmsKey: "syllabus_content"
    },
    {
        title: "Exam Pattern Strategy",
        icon: <Target className="h-6 w-6 text-purple-400" />,
        content: "Understanding the CBT mode. Learn how to manage 45/50 questions in 45/60 minutes.",
        color: "from-purple-500/20",
        cmsKey: "exam_strategy_content"
    },
    {
        title: "Important Dates",
        icon: <Calendar className="h-6 w-6 text-emerald-400" />,
        content: "Tentative schedule for CUET 2026. Keep track of NTA notifications and deadlines.",
        color: "from-emerald-500/20",
        cmsKey: "important_dates_content"
    },
    {
        title: "College Preferences",
        icon: <Award className="h-6 w-6 text-orange-400" />,
        content: "How to fill your CSAS portal preferences correctly. Priority lists for top colleges.",
        color: "from-orange-500/20",
        cmsKey: "college_preferences_content"
    }
];

export default function DashboardCuet2026Page() {
    const [activeModal, setActiveModal] = useState<typeof guidanceSections[0] | null>(null);

    return (
        <div className="space-y-12 pb-24 max-w-[1600px] mx-auto min-h-[80vh]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8 relative">
                <div className="absolute top-0 left-0 w-64 h-64 bg-cta-primary/10 rounded-full blur-[80px] pointer-events-none -mt-20 -ml-20" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 font-bold text-sm tracking-wide shadow-inner mb-4">
                        <Sparkles className="h-4 w-4 text-purple-400" /> ROADMAP
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">CUET 2026 Master Guide</h1>
                    <p className="text-white/50 font-medium mt-3 text-lg">Everything you need to know about the syllabus, exam pattern, and college admissions.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {guidanceSections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1, duration: 0.6, ease: "easeOut" as const } }
                        }}
                        className="h-full"
                    >
                        <button
                            onClick={() => setActiveModal(section)}
                            className="w-full text-left group relative bg-surface-card/60 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-[2.5rem] hover:bg-surface-card/80 hover:border-white/20 transition-all duration-300 overflow-hidden h-full flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-1"
                        >
                            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${section.color} to-transparent blur-3xl rounded-full opacity-30 group-hover:opacity-60 transition-opacity`} />

                            <div className="flex flex-col md:flex-row items-start gap-6 relative z-10 flex-1">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shrink-0 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-inner">
                                    {section.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-3 group-hover:text-cta-primary transition-colors tracking-tight">{section.title}</h3>
                                    <p className="text-white/60 leading-relaxed text-lg font-medium">
                                        {section.content}
                                    </p>
                                    <div className="mt-8 flex items-center gap-2 text-sm font-bold text-white/40 group-hover:text-white/90 group-hover:gap-3 transition-all">
                                        Open Guide <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* The Unified Guide Modal */}
            {activeModal && (
                <GuideWrapper
                    isOpen={!!activeModal}
                    onClose={() => setActiveModal(null)}
                    title={activeModal.title}
                    icon={activeModal.icon}
                    cmsKey={activeModal.cmsKey}
                />
            )}
        </div>
    );
}
