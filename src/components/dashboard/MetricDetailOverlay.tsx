import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Sparkles } from "lucide-react";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { getInsight } from "@/app/dashboard/analysis/aiInsights";

interface MetricDetailOverlayProps {
    selectedMetric: any;
    setSelectedMetric: (val: any) => void;
    chartData: any[];
    attemptsLength: number;
}

export function MetricDetailOverlay({ selectedMetric, setSelectedMetric, chartData, attemptsLength }: MetricDetailOverlayProps) {
    if (!selectedMetric) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 transition-opacity"
                onClick={() => setSelectedMetric(null)}
            />
            <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-md bg-surface-card border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 sm:p-8 flex flex-col z-[60] overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-black text-white capitalize tracking-tight">
                            {selectedMetric === 'tests' ? 'Test Archive' :
                                selectedMetric === 'score' ? 'Score Analysis' :
                                    selectedMetric === 'accuracy' ? 'Accuracy Trend' : 'Time Analysis'}
                        </h2>
                        <p className="text-white/40 text-sm mt-1">Deep dive into this metric.</p>
                    </div>
                    <button
                        onClick={() => setSelectedMetric(null)}
                        className="p-2.5 hover:bg-white/10 rounded-full transition-colors bg-white/5 border border-white/10 text-white/50 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Chart in Details */}
                <div className="mb-8 rounded-2xl p-5 bg-white/[0.02] border border-white/5 relative z-10">
                    <PerformanceChart
                        chartData={chartData}
                        dataKey={selectedMetric === 'tests' ? 'score' : selectedMetric}
                        color={
                            selectedMetric === 'accuracy' ? '#10b981' :
                                selectedMetric === 'time' ? '#f59e0b' :
                                    selectedMetric === 'tests' ? '#a855f7' : '#3b82f6'
                        }
                    />
                </div>

                {/* Recent Values */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-6 relative z-10 scrollbar-none pr-2">
                    <h3 className="font-semibold text-white/80 mb-4 sticky top-0 bg-surface-card/90 backdrop-blur py-2">Historical Log</h3>
                    {chartData.slice().reverse().map((d, i) => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                            <span className="text-sm font-medium text-white/40 group-hover:text-white/60 transition-colors uppercase tracking-wider">{d.date}</span>
                            <span className="font-bold text-white">
                                {selectedMetric === 'tests' ? `Test #${d.index}` :
                                    selectedMetric === 'score' ? `${d.score} Marks` :
                                        selectedMetric === 'accuracy' ? `${d.accuracy}%` :
                                            `${d.time.toFixed(1)} mins`}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Chat Bot Comment */}
                <div className="mt-auto bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-5 rounded-2xl border border-white/10 relative z-10 shadow-lg">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.05] to-transparent pointer-events-none rounded-2xl"></div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                Arjuna AI <Sparkles className="h-3 w-3 text-purple-400" />
                            </p>
                            <p className="text-sm text-white/90 leading-relaxed font-medium">
                                {getInsight(selectedMetric, attemptsLength, chartData)}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
