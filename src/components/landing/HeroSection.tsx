"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PremiumGradient } from "@/components/ui/PremiumGradient";

export function HeroSection({ headline, subheadline }: { headline: string, subheadline: string }) {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
            {/* Premium Background Element */}
            <PremiumGradient variant="hero" />

            <div className="container relative z-10 px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Text Content */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cta-primary/10 border border-cta-primary/20 text-cta-primary text-sm font-semibold"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cta-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cta-hover"></span>
                            </span>
                            Updated for CUET 2026
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.1]"
                        >
                            Crack CUET with <br className="hidden lg:block" />
                            <span className="text-cta-primary">
                                Real Exam Mocks
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl text-text-secondary max-w-2xl leading-relaxed"
                        >
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            Boost your speed and accuracy with India's most realistic NTA-level mock test platform. Built by students from SRCC & Hindu College.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                        >
                            <Link href="/auth/signup">
                                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 shadow-xl shadow-cta-primary/20 hover:shadow-cta-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                                    Start Free Mock <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/pricing">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 border-border hover:bg-surface-elevated hover:text-text-primary transition-all duration-300">
                                    View Test Series
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex items-center gap-6 text-sm font-medium text-text-muted pt-4"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>No Credit Card Required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Instant Analysis</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Hero Image / Dashboard Preview */}
                    <div className="relative lg:h-[600px] w-full flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateX: 20, y: 50 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                            transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                            className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-full max-h-[500px] rounded-2xl bg-surface-base shadow-2xl shadow-indigo-900/10 ring-1 ring-border overflow-hidden"
                        >
                            {/* Abstract UI Representation if no image is available, or use a placeholder div */}
                            <div className="absolute inset-0 bg-surface-card flex items-center justify-center text-text-muted">
                                {/* Grid lines simulating a dashboard */}
                                <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-px bg-border/30">
                                    <div className="bg-surface-base" />
                                    <div className="bg-surface-base col-span-2 row-span-2" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-cta-primary/5 to-semantic-success/5" />

                                {/* Floating elements simulating UI cards */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-1/4 left-1/4 bg-surface-elevated/80 backdrop-blur-md border border-border/50 shadow-lg p-4 rounded-xl w-32 h-32"
                                />
                                <motion.div
                                    animate={{ y: [0, 15, 0] }}
                                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute bottom-1/3 right-1/4 bg-cta-primary/10 backdrop-blur-md border border-cta-primary/20 shadow-lg p-4 rounded-xl w-48 h-24"
                                />
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-surface-glass backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-border/50 text-text-primary font-semibold ring-1 ring-white/10">
                                    Trusted by 10,000+ Students
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
