"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImportantDateItem } from "@/components/admin/cms/CUET2026Editors";
import {
  ZoomOut,
  ZoomIn,
  Clock,
  ChevronRight
} from "lucide-react";

export function ImportantDatesGuide({ data }: { data: ImportantDateItem[] }) {
    const [view, setView] = useState<'timeline' | 'calendar'>('timeline');

    const getTypeColor = (type: ImportantDateItem['type']) => {
        switch (type) {
            case 'exam': return 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20';
            case 'registration': return 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20';
            case 'result': return 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20';
            default: return 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20';
        }
    };

    const getTypeDotColor = (type: ImportantDateItem['type']) => {
        switch (type) {
            case 'exam': return 'bg-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.5)]';
            case 'registration': return 'bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]';
            case 'result': return 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]';
            default: return 'bg-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.5)]';
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-[#0A0A0B] relative overflow-hidden">
            {/* Controls */}
            <div className="absolute top-6 right-6 z-20 flex bg-white/5 backdrop-blur-md rounded-full border border-white/10 p-1">
                <button
                    onClick={() => setView('timeline')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${view === 'timeline' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
                        }`}
                >
                    <ZoomIn className="h-4 w-4" /> Timeline
                </button>
                <button
                    onClick={() => setView('calendar')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${view === 'calendar' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
                        }`}
                >
                    <ZoomOut className="h-4 w-4" /> Calendar
                </button>
            </div>

            {/* Views */}
            <div className="w-full h-full relative perspective-1000">
                <AnimatePresence mode="wait">
                    {view === 'timeline' ? (
                        <motion.div
                            key="timeline"
                            initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-0 flex items-center overflow-x-auto snap-x snap-mandatory pt-20 pb-10 hide-scrollbar"
                        >
                            <div className="flex gap-20 px-[20vw] min-w-max items-center h-full relative">
                                {/* The continuous line */}
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />

                                {data.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                                        className={`shrink-0 w-80 snap-center relative flex flex-col ${idx % 2 === 0 ? 'justify-end pb-16' : 'justify-start pt-16 mt-32'}`}
                                    >
                                        {/* Connection Line */}
                                        <div className={`absolute left-1/2 -translate-x-1/2 w-px bg-white/20 ${idx % 2 === 0 ? 'bottom-0 top-[calc(100%-4rem)]' : 'top-0 bottom-[calc(100%-4rem)]'}`} />

                                        {/* Point on the number line */}
                                        <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[#0A0A0B] z-10 ${getTypeDotColor(item.type)} ${idx % 2 === 0 ? 'bottom-[-0.5rem]' : 'top-[-0.5rem]'}`} />

                                        {/* Card */}
                                        <div className={`bg-gradient-to-b ${getTypeColor(item.type)} backdrop-blur-xl border rounded-[2rem] p-6 shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer`}>
                                            <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Clock className="h-3 w-3" /> {item.date}
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                            <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.1, y: -50 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-0 overflow-y-auto p-12 md:p-24 hide-scrollbar"
                        >
                            <div className="max-w-4xl mx-auto space-y-4">
                                {data.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`bg-gradient-to-r ${getTypeColor(item.type)} backdrop-blur-xl border p-6 rounded-3xl flex flex-col md:flex-row md:items-center gap-6 group hover:translate-x-2 transition-transform cursor-pointer`}
                                    >
                                        <div className="shrink-0 w-32 md:border-r border-white/10 md:pr-6">
                                            <div className="text-white/80 font-bold">{item.date}</div>
                                            <div className="text-xs text-white/40 uppercase tracking-widest mt-1">{item.type}</div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white/90 transition-colors">{item.title}</h3>
                                            <p className="text-white/50 text-sm">{item.description}</p>
                                        </div>
                                        <div className="shrink-0 hidden md:block">
                                            <ChevronRight className="h-6 w-6 text-white/20 group-hover:text-white/80 transition-colors" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Global Hide Scrollbar Styles */}
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
