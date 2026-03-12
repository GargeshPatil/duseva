"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StrategyStep } from "@/components/admin/cms/CUET2026Editors";
import * as Icons from "lucide-react";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";

export function StrategyGuide({ data }: { data: StrategyStep[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextStep = () => setCurrentIndex(prev => (prev + 1) % data.length);
    const prevStep = () => setCurrentIndex(prev => (prev - 1 + data.length) % data.length);

    if (!data.length) return null;

    const currentData = data[currentIndex];
    const IconComponent = (Icons as any)[currentData.icon] || Target;

    return (
        <div className="h-full flex flex-col items-center justify-center bg-[#0A0A0B] relative overflow-hidden p-6 md:p-12">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Stepper Dots */}
            <div className="flex items-center gap-3 mb-12 relative z-10 w-full max-w-sm justify-center">
                {data.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-12 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'
                            }`}
                        aria-label={`Go to step ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Main Interactive Playbook */}
            <div className="relative w-full max-w-2xl flex items-center justify-center min-h-[400px]">
                {/* Navigation Arrows */}
                <button
                    onClick={prevStep}
                    className="absolute left-0 md:-left-16 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all z-20"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={nextStep}
                    className="absolute right-0 md:-right-16 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all z-20"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full h-full flex flex-col items-center text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl relative"
                    >
                        <div className="absolute -top-12 w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl rotate-12 shadow-[0_0_40px_rgba(168,85,247,0.4)] flex items-center justify-center">
                            <IconComponent className="h-10 w-10 text-white -rotate-12" />
                        </div>

                        <div className="mt-12 text-purple-400 font-bold tracking-widest uppercase text-sm mb-4">
                            Step {currentIndex + 1} of {data.length}
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            {currentData.title}
                        </h2>

                        <p className="text-lg text-white/60 leading-relaxed max-w-lg mx-auto">
                            {currentData.description}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
