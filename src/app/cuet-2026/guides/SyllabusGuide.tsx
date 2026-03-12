"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SyllabusSubject } from "@/components/admin/cms/CUET2026Editors";
import { BookOpen, Layers, BarChart, ChevronRight, X } from "lucide-react";

export function SyllabusGuide({ data }: { data: SyllabusSubject[] }) {
    const [selectedDomain, setSelectedDomain] = useState<string>('All');
    const [activeSubject, setActiveSubject] = useState<SyllabusSubject | null>(null);

    const domains = useMemo(() => {
        const uniqueDomains = new Set(data.map(item => item.domain));
        return ['All', ...Array.from(uniqueDomains)];
    }, [data]);

    const filteredData = useMemo(() => {
        if (selectedDomain === 'All') return data;
        return data.filter(item => item.domain === selectedDomain);
    }, [data, selectedDomain]);

    const getDifficultyColor = (diff: SyllabusSubject['difficulty']) => {
        switch (diff) {
            case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="h-full flex flex-col relative bg-transparent">
            {/* Domain Filter Bar */}
            <div className="shrink-0 p-6 border-b border-white/10 overflow-x-auto hide-scrollbar bg-surface-card/20 backdrop-blur-xl">
                <div className="flex gap-3">
                    {domains.map(domain => (
                        <button
                            key={domain}
                            onClick={() => setSelectedDomain(domain)}
                            className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${selectedDomain === domain
                                ? 'bg-cta-primary/20 border-cta-primary/50 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                                }`}
                        >
                            {domain}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative flex">
                {/* Subjects Grid */}
                <div className={`flex-1 overflow-y-auto p-6 transition-all duration-500 ${activeSubject ? 'md:pr-[400px]' : ''}`}>
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredData.map(subject => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    key={subject.id}
                                    onClick={() => setActiveSubject(subject)}
                                    className={`bg-surface-card/30 backdrop-blur-xl border transition-all duration-300 rounded-[2rem] p-6 cursor-pointer group hover:-translate-y-1 ${activeSubject?.id === subject.id ? 'border-cta-primary/50 shadow-[0_0_40px_rgba(139,92,246,0.15)] ring-1 ring-cta-primary/30' : 'border-white/10 hover:border-white/20 hover:bg-surface-card/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-white/5 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${getDifficultyColor(subject.difficulty)}`}>
                                            {subject.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors mb-2">{subject.subject}</h3>
                                    <div className="flex items-center text-xs text-white/40 tracking-wider">
                                        <Layers className="h-3 w-3 mr-1.5" /> {subject.domain}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Subject Details Sidebar */}
                <AnimatePresence>
                    {activeSubject && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                            className="absolute top-0 right-0 bottom-0 w-full md:w-[400px] bg-[#111113] border-l border-white/10 shadow-2xl z-10 overflow-y-auto"
                        >
                            <div className="p-8">
                                <button
                                    onClick={() => setActiveSubject(null)}
                                    className="md:hidden absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white/60 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-6 ${getDifficultyColor(activeSubject.difficulty)}`}>
                                    {activeSubject.difficulty} Difficulty
                                </div>

                                <h2 className="text-3xl font-bold text-white mb-2">{activeSubject.subject}</h2>
                                <div className="text-sm font-medium text-white/40 uppercase tracking-widest flex items-center gap-2 mb-10 pb-8 border-b border-white/10">
                                    <Layers className="h-4 w-4" />
                                    {activeSubject.domain}
                                </div>

                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <BarChart className="h-5 w-5 text-purple-400" />
                                    Core Topics to Master
                                </h3>

                                <div className="space-y-3">
                                    {activeSubject.topics && activeSubject.topics.length > 0 ? (
                                        activeSubject.topics.map((topic, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 + (idx * 0.05) }}
                                                key={idx}
                                                className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-start gap-3 group hover:bg-white/10 hover:border-white/10 transition-colors"
                                            >
                                                <div className="shrink-0 mt-0.5 text-blue-400/50 group-hover:text-blue-400 transition-colors">
                                                    <ChevronRight className="h-4 w-4" />
                                                </div>
                                                <span className="text-base font-medium text-white/80 group-hover:text-white transition-colors">{topic.title}</span>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-white/40 text-sm p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                            No core topics listed.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
