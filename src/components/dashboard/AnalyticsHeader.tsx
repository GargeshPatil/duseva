import { motion } from "framer-motion";
import { Activity, Bot, Sparkles } from "lucide-react";
import { getInsight } from "@/app/dashboard/analysis/aiInsights";

interface AnalyticsHeaderProps {
    attemptsLength: number;
    chartData: any[];
}

export function AnalyticsHeader({ attemptsLength, chartData }: AnalyticsHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2.5rem] bg-surface-card/60 border border-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-6">
                            <Activity className="h-4 w-4 text-purple-400" /> Deep Analytics
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight leading-tight">
                            Performance Engine
                        </h1>
                        <p className="mt-4 text-white/50 max-w-xl text-lg">
                            Subatomic breakdown of your mock test data to pinpoint exact areas of improvement.
                        </p>
                    </div>

                    {/* AI Mini Insight Summary - visible on large screens */}
                    <div className="hidden lg:flex bg-white/5 border border-white/10 rounded-2xl p-5 max-w-md backdrop-blur-md items-start gap-4">
                        <div className="bg-purple-500/20 p-2.5 rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                            <Bot className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                                AI Synopsis <Sparkles className="h-3 w-3 text-purple-400" />
                            </h4>
                            <p className="text-white/60 text-sm leading-relaxed">
                                {getInsight('score', attemptsLength, chartData)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
