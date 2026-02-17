"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export function HeroSection({ headline, subheadline }: { headline: string, subheadline: string }) {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-50/50 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-slate-50/50 rounded-full blur-3xl opacity-60" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,black,transparent)] opacity-[0.03]" />
            </div>

            <div className="container relative z-10 px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Text Content */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Updated for CUET 2026
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
                        >
                            Crack CUET with <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Real Exam Mocks
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl text-slate-600 max-w-2xl leading-relaxed"
                        >
                            Boost your speed and accuracy with India's most realistic NTA-level mock test platform. Built by students from SRCC & Hindu College.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                        >
                            <Link href="/auth/signup">
                                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300">
                                    Start Free Mock <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/pricing">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300">
                                    View Test Series
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex items-center gap-6 text-sm font-medium text-slate-500 pt-4"
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
                            className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-full max-h-[500px] rounded-2xl bg-slate-900 shadow-2xl shadow-slate-900/40 ring-1 ring-slate-900/10 overflow-hidden"
                        >
                            {/* Abstract UI Representation if no image is available, or use a placeholder div */}
                            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-600">
                                {/* Grid lines simulating a dashboard */}
                                <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-px bg-slate-700/30">
                                    <div className="bg-slate-800" />
                                    <div className="bg-slate-800 col-span-2 row-span-2" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10" />

                                {/* Floating elements simulating UI cards */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-1/4 left-1/4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl w-32 h-32"
                                />
                                <motion.div
                                    animate={{ y: [0, 15, 0] }}
                                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute bottom-1/3 right-1/4 bg-blue-500/20 backdrop-blur-md border border-white/10 p-4 rounded-xl w-48 h-24"
                                />
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/50 text-slate-900 font-semibold">
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
