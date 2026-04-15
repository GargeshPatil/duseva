"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { TrendingUp, Target, Lightbulb, Heart } from "lucide-react";

const insights = [
    {
        icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
        title: "Score breakdown, question by question",
        desc: "Know exactly which questions you got right, wrong, or skipped — and why."
    },
    {
        icon: <Target className="h-5 w-5 text-rose-400" />,
        title: "Your weak spots, pinpointed",
        desc: "We highlight the topics where you're losing marks so you study smarter, not harder."
    },
    {
        icon: <Lightbulb className="h-5 w-5 text-amber-400" />,
        title: "Gentle, actionable suggestions",
        desc: "No scary red marks. Just calm, clear guidance on what to work on next."
    },
    {
        icon: <Heart className="h-5 w-5 text-pink-400 fill-pink-400" />,
        title: "Progress tracking that feels good",
        desc: "Watch your percentile climb over time. Every test is a step forward, not a judgment."
    },
];

export function AnalyticsPreviewSection() {
    return (
        <section className="py-24 relative px-6 overflow-hidden">
            {/* Background accent — opposite side from ExamPreview */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -translate-y-1/2" />
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Eyebrow */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold mb-4">
                        <TrendingUp className="h-4 w-4" />
                        Post-Test Analytics
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                        We tell you exactly where you went wrong.
                    </h2>
                    <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto">
                        Not just a score. A real picture of where you stand — and a clear path to where you want to be.
                    </p>
                </motion.div>

                {/* 2-column — text left, screenshot right (alternates from ExamPreview) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Feature bullets */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col gap-6"
                    >
                        {insights.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                                className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors"
                            >
                                <div className="mt-0.5 p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base mb-1">{item.title}</h3>
                                    <p className="text-sm text-white/55 leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Right: Analysis screenshot */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                        className="relative"
                    >
                        {/* Glow */}
                        <div className="absolute -inset-4 bg-emerald-500/10 blur-[50px] rounded-3xl pointer-events-none" />

                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(16,185,129,0.08)]">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/90 border-b border-white/10">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="flex-1 mx-3 flex items-center gap-2 bg-slate-700/60 rounded-md px-3 py-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/70 shrink-0" />
                                    <span className="text-xs text-white/35 font-mono truncate">duseva.com/dashboard/analysis</span>
                                </div>
                            </div>

                            <Image
                                src="/Analysis.png"
                                alt="DU Seva post-test analytics dashboard"
                                width={1536}
                                height={776}
                                className="w-full object-cover object-top"
                            />

                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                        </div>

                        {/* Floating badge */}
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-4 -left-4 flex items-center gap-2.5 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2.5 rounded-2xl shadow-lg"
                        >
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm font-bold text-white">Instant after every test</span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
