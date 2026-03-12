import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Target, Calendar, Award } from "lucide-react";
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

export function CuetContentGrid() {
    const [activeModal, setActiveModal] = useState<typeof guidanceSections[0] | null>(null);

    return (
        <section className="py-20 px-6 relative">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Click to Explore</h2>
                    <p className="text-white/50">Select any module below to dive deep into the details.</p>
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
                        >
                            <button
                                onClick={() => setActiveModal(section)}
                                className="w-full text-left group relative bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-colors overflow-hidden h-full flex flex-col"
                            >
                                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${section.color} to-transparent blur-2xl rounded-full opacity-30 group-hover:opacity-60 transition-opacity`} />

                                <div className="flex flex-col md:flex-row items-start gap-6 relative z-10 flex-1">
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 shrink-0 group-hover:scale-110 transition-transform duration-500">
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">{section.title}</h3>
                                        <p className="text-white/60 leading-relaxed text-lg">
                                            {section.content}
                                        </p>
                                        <div className="mt-6 flex items-center gap-2 text-sm font-bold text-white/40 group-hover:text-white/80 transition-colors">
                                            Read Full Guide <ArrowRight className="h-4 w-4" />
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
        </section>
    );
}
