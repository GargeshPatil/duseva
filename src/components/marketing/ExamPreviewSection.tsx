"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Clock, LayoutGrid, BarChart3, ShieldCheck } from "lucide-react";

const features = [
    {
        icon: <ShieldCheck className="h-5 w-5 text-indigo-400" />,
        title: "Exact NTA Interface",
        desc: "Same layout, same question palette, same timer — zero surprises on exam day."
    },
    {
        icon: <Clock className="h-5 w-5 text-purple-400" />,
        title: "Real-time Countdown",
        desc: "Practise under actual time pressure so you build exam-day composure."
    },
    {
        icon: <LayoutGrid className="h-5 w-5 text-blue-400" />,
        title: "Question Palette",
        desc: "Navigate, flag, and review questions exactly as you will in the real CUET."
    },
    {
        icon: <BarChart3 className="h-5 w-5 text-emerald-400" />,
        title: "Instant Post-Test Analysis",
        desc: "Deep-dive into your accuracy, speed, and weak areas the moment you submit."
    },
];

export function ExamPreviewSection() {
    return (
        <section className="py-24 relative px-6 overflow-hidden">
            {/* Background accent */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2" />
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold mb-4">
                        <CheckCircle2 className="h-4 w-4" />
                        NTA-Replica Test Engine
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                        The real deal. Before the real deal.
                    </h2>
                    <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto">
                        Our test engine is a pixel-perfect replica of the NTA CUET interface — built by students who appeared in the exam.
                    </p>
                </motion.div>

                {/* 2-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Screenshot */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Glow */}
                        <div className="absolute -inset-4 bg-indigo-500/15 blur-[50px] rounded-3xl pointer-events-none" />

                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(99,102,241,0.12)]">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/90 border-b border-white/10">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="flex-1 mx-3 flex items-center gap-2 bg-slate-700/60 rounded-md px-3 py-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/70 shrink-0" />
                                    <span className="text-xs text-white/35 font-mono truncate">duseva.com/test/exam</span>
                                </div>
                            </div>

                            <Image
                                src="/exam-preview.png"
                                alt="DU Seva CUET Mock Test Interface — NTA Replica"
                                width={1536}
                                height={776}
                                className="w-full object-cover object-top"
                            />

                            {/* Subtle bottom fade */}
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                        </div>

                        {/* Floating badge */}
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-4 -right-4 flex items-center gap-2.5 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2.5 rounded-2xl shadow-lg"
                        >
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-sm font-bold text-white">Live Test Mode</span>
                        </motion.div>
                    </motion.div>

                    {/* Right: Feature list */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                        className="flex flex-col gap-6"
                    >
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                                className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors"
                            >
                                <div className="mt-0.5 p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                                    {f.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base mb-1">{f.title}</h3>
                                    <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}

                        <Link
                            href="/test/showcase"
                            className="group mt-2 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors text-sm"
                        >
                            Try a free mock test now
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
