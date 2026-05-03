"use client";

import { useEffect, useState, useMemo } from "react";
import { firestoreService } from "@/services/firestoreService";
import { TestAttempt, Test } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { AnalyticsKpiCards } from "@/components/dashboard/AnalyticsKpiCards";
import { AnalyticsHeader } from "@/components/dashboard/AnalyticsHeader";
import { MetricDetailOverlay } from "@/components/dashboard/MetricDetailOverlay";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BookOpen, TrendingUp, BarChart3, Clock, ChevronRight, X, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export type MetricType = 'tests' | 'score' | 'accuracy' | 'time' | null;

// ─── Data helpers ───────────────────────────────────────────────────────────

interface SubjectStat {
    subject: string;
    attempts: number;
    totalScore: number;
    totalAccuracy: number;
    bestScore: number;
    maxMarks: number;
}

interface TypeStat {
    count: number;
    totalScore: number;
    totalAccuracy: number;
}

interface GranularStat {
    label: string;
    count: number;
    totalScore: number;
    totalAccuracy: number;
    bestScore: number;
    maxMarks: number;
}

// ─── Small Components ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg font-bold text-white/80 uppercase tracking-widest text-xs">{children}</h2>
            <div className="flex-1 h-px bg-white/10" />
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/10">
            <Activity className="h-8 w-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">{message}</p>
        </div>
    );
}

function StatPill({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
    return (
        <div className="text-center">
            <div className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">{label}</div>
            <div className={`font-bold text-sm ${color}`}>{value}</div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState<TestAttempt[]>([]);
    const [testsData, setTestsData] = useState<Record<string, Test>>({});
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<MetricType>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            if (!user) return;
            try {
                const completedAttempts = await firestoreService.getUserAttempts(user.uid, 'completed');
                // Sort ascending for chart
                completedAttempts.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                setAttempts(completedAttempts);

                const testIds = Array.from(new Set(completedAttempts.map(a => a.testId)));
                const fetchedTests = await Promise.all(testIds.map(id => firestoreService.getTest(id)));
                const testRecord: Record<string, Test> = {};
                fetchedTests.forEach(test => {
                    if (test) testRecord[test.id] = test;
                });
                setTestsData(testRecord);
            } catch (error) {
                console.error("Error loading analytics:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user]);

    // ── Derived Stats ─────────────────────────────────────────────────────

    const chartData = useMemo(() =>
        attempts.map((att, index) => ({
            index: index + 1,
            score: att.resultData?.score || 0,
            accuracy: att.resultData?.accuracy || 0,
            time: (att.resultData?.timeTaken || 0) / 60,
            date: new Date(att.startTime).toLocaleDateString(),
        })),
        [attempts]
    );

    const totalTests = attempts.length;
    const avgScore = totalTests > 0 ? Math.round(chartData.reduce((s, d) => s + d.score, 0) / totalTests) : 0;
    const avgAccuracy = totalTests > 0 ? Math.round(chartData.reduce((s, d) => s + d.accuracy, 0) / totalTests) : 0;
    const totalTimeHours = (chartData.reduce((s, d) => s + d.time, 0) / 60).toFixed(1);

    // Subject Summary
    const subjectStats = useMemo(() => {
        const acc: Record<string, SubjectStat> = {};
        attempts.forEach(att => {
            const test = testsData[att.testId];
            const subject = test?.subject || 'General Test';
            if (!acc[subject]) {
                acc[subject] = { subject, attempts: 0, totalScore: 0, totalAccuracy: 0, bestScore: 0, maxMarks: test?.totalMarks || 0 };
            }
            const score = att.resultData?.score || 0;
            acc[subject].attempts++;
            acc[subject].totalScore += score;
            acc[subject].totalAccuracy += (att.resultData?.accuracy || 0);
            if (score > acc[subject].bestScore) acc[subject].bestScore = score;
            if ((test?.totalMarks || 0) > acc[subject].maxMarks) acc[subject].maxMarks = test?.totalMarks || 0;
        });
        return Object.values(acc).sort((a, b) => b.attempts - a.attempts);
    }, [attempts, testsData]);

    // PYQ vs Mock split
    const typeStats = useMemo(() => {
        const stats: Record<string, TypeStat> = { PYQ: { count: 0, totalScore: 0, totalAccuracy: 0 }, Mock: { count: 0, totalScore: 0, totalAccuracy: 0 } };
        attempts.forEach(att => {
            const test = testsData[att.testId];
            const key = test?.tier2Category === 'PYQ' ? 'PYQ' : 'Mock';
            stats[key].count++;
            stats[key].totalScore += att.resultData?.score || 0;
            stats[key].totalAccuracy += att.resultData?.accuracy || 0;
        });
        return stats;
    }, [attempts, testsData]);

    // Granular breakdown for selected subject
    const granularStats = useMemo((): GranularStat[] => {
        if (!selectedSubject) return [];
        const acc: Record<string, GranularStat> = {};
        attempts.forEach(att => {
            const test = testsData[att.testId];
            const subj = test?.subject || 'General Test';
            if (subj !== selectedSubject) return;
            const label = test?.tier3Category || test?.category || 'Full Mock';
            if (!acc[label]) acc[label] = { label, count: 0, totalScore: 0, totalAccuracy: 0, bestScore: 0, maxMarks: 0 };
            const score = att.resultData?.score || 0;
            acc[label].count++;
            acc[label].totalScore += score;
            acc[label].totalAccuracy += att.resultData?.accuracy || 0;
            if (score > acc[label].bestScore) acc[label].bestScore = score;
            if ((test?.totalMarks || 0) > acc[label].maxMarks) acc[label].maxMarks = test?.totalMarks || 0;
        });
        return Object.values(acc).sort((a, b) => b.count - a.count);
    }, [selectedSubject, attempts, testsData]);

    // Test History (recent first — attempts was sorted asc for chart, so reverse here)
    const recentAttempts = useMemo(() => [...attempts].reverse(), [attempts]);

    // ── Loading ───────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-cta-primary/20 blur-xl rounded-full" />
                    <Activity className="h-12 w-12 text-cta-primary animate-pulse relative z-10" />
                </div>
                <p className="text-white/50 font-medium animate-pulse">Analyzing Performance Data...</p>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div className="space-y-10 max-w-[1600px] mx-auto pb-20 overflow-x-hidden">
            <AnalyticsHeader attemptsLength={attempts.length} chartData={chartData} />

            {/* KPI Cards */}
            <AnalyticsKpiCards
                totalTests={totalTests}
                avgScore={avgScore}
                avgAccuracy={avgAccuracy}
                totalTimeHours={totalTimeHours}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
            />

            {/* Trajectory Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface-card/60 rounded-[2rem] border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-cta-primary/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <h3 className="font-bold text-white text-xl">Trajectory</h3>
                        <p className="text-white/40 text-sm mt-1">Your overall progression across all parameters.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide text-white/50 uppercase">
                        Global Trend
                    </div>
                </div>
                <PerformanceChart chartData={chartData} dataKey="score" color="#8b5cf6" />
            </motion.div>

            {/* Metric Detail Overlay */}
            <MetricDetailOverlay selectedMetric={selectedMetric} setSelectedMetric={setSelectedMetric} chartData={chartData} attemptsLength={attempts.length} />

            {/* ── SECTION 1: Subject Summary ─────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionLabel>Subject Summary</SectionLabel>
                {subjectStats.length === 0 ? (
                    <EmptyState message="Complete a test to see your subject-wise summary." />
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjectStats.map(stat => {
                            const avgAcc = stat.attempts > 0 ? Math.round(stat.totalAccuracy / stat.attempts) : 0;
                            const avgScoreSubj = stat.attempts > 0 ? Math.round(stat.totalScore / stat.attempts) : 0;
                            const isSelected = selectedSubject === stat.subject;
                            return (
                                <button
                                    key={stat.subject}
                                    onClick={() => setSelectedSubject(isSelected ? null : stat.subject)}
                                    className={`text-left w-full bg-surface-card/60 rounded-2xl border p-5 backdrop-blur-xl transition-all duration-200 group hover:-translate-y-0.5 ${isSelected
                                        ? 'border-cta-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                                        : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-base leading-tight line-clamp-1 transition-colors ${isSelected ? 'text-cta-primary' : 'text-white group-hover:text-cta-primary'}`}>
                                                {stat.subject}
                                            </p>
                                            <p className="text-white/40 text-xs mt-0.5">{stat.attempts} attempt{stat.attempts !== 1 ? 's' : ''}</p>
                                        </div>
                                        <div className={`ml-2 mt-0.5 transition-all ${isSelected ? 'text-cta-primary' : 'text-white/30 group-hover:text-white/60'}`}>
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <StatPill label="Best" value={`${stat.bestScore}/${stat.maxMarks}`} color="text-emerald-400" />
                                        <StatPill label="Avg Score" value={String(avgScoreSubj)} />
                                        <StatPill label="Avg Acc" value={`${avgAcc}%`} color="text-blue-400" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* ── Granular Side Panel ──────────────────────────────────────── */}
            <AnimatePresence>
                {selectedSubject && (
                    <>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setSelectedSubject(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 cursor-pointer"
                        />
                        <motion.div
                            key="panel"
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
                            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface-card/95 backdrop-blur-2xl border-l border-white/10 z-50 shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="flex items-start justify-between p-6 border-b border-white/10 shrink-0">
                                <div>
                                    <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Subject Breakdown</p>
                                    <h3 className="text-xl font-black text-white">{selectedSubject}</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedSubject(null)}
                                    className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors mt-0.5"
                                    aria-label="Close panel"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {granularStats.length === 0 ? (
                                    <div className="text-center py-12">
                                        <BarChart3 className="h-10 w-10 text-white/20 mx-auto mb-3" />
                                        <p className="text-white/40 text-sm">No granular data yet for this subject.</p>
                                    </div>
                                ) : (
                                    granularStats.map(stat => {
                                        const avgAcc = stat.count > 0 ? Math.round(stat.totalAccuracy / stat.count) : 0;
                                        const avgScoreG = stat.count > 0 ? Math.round(stat.totalScore / stat.count) : 0;
                                        const pct = stat.maxMarks > 0 ? Math.round((stat.bestScore / stat.maxMarks) * 100) : 0;
                                        return (
                                            <div key={stat.label} className="bg-white/5 rounded-2xl border border-white/10 p-5">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <BarChart3 className="h-4 w-4 text-cta-primary shrink-0" />
                                                        <p className="font-bold text-white text-sm">{stat.label}</p>
                                                    </div>
                                                    <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{stat.count} test{stat.count !== 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs text-white/40 mb-1.5">
                                                        <span>Best score</span>
                                                        <span className="text-emerald-400 font-bold">{stat.bestScore}/{stat.maxMarks}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="text-center p-2 bg-white/5 rounded-xl">
                                                        <div className="text-[10px] text-white/30 mb-0.5">Avg Score</div>
                                                        <div className="text-white font-bold text-sm">{avgScoreG}</div>
                                                    </div>
                                                    <div className="text-center p-2 bg-white/5 rounded-xl">
                                                        <div className="text-[10px] text-white/30 mb-0.5">Accuracy</div>
                                                        <div className={`font-bold text-sm ${avgAcc >= 70 ? 'text-emerald-400' : avgAcc >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{avgAcc}%</div>
                                                    </div>
                                                    <div className="text-center p-2 bg-white/5 rounded-xl">
                                                        <div className="text-[10px] text-white/30 mb-0.5">Tests</div>
                                                        <div className="text-white font-bold text-sm">{stat.count}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div className="pt-2">
                                    <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-3">Recent Attempts</p>
                                    {attempts
                                        .filter(att => (testsData[att.testId]?.subject || 'General Test') === selectedSubject)
                                        .slice().reverse().slice(0, 8)
                                        .map(att => {
                                            const test = testsData[att.testId];
                                            const sc = att.resultData?.score ?? 0;
                                            const ac = att.resultData?.accuracy ?? 0;
                                            return (
                                                <a key={att.id} href={`/dashboard/analysis/test/${att.testId}`}
                                                    className="flex items-center gap-3 py-2.5 border-b border-white/5 hover:bg-white/5 px-2 rounded-lg transition-colors group">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white/80 text-sm font-medium truncate group-hover:text-cta-primary transition-colors">{test?.title ?? 'Test'}</p>
                                                        <p className="text-white/30 text-xs">{new Date(att.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <div className="text-white font-bold text-sm">{sc}</div>
                                                        <div className={`text-xs font-medium ${ac >= 70 ? 'text-emerald-400' : ac >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{ac}%</div>
                                                    </div>
                                                    <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 shrink-0 transition-colors" />
                                                </a>
                                            );
                                        })}
                                </div>
                            </div>
                            <div className="p-4 border-t border-white/10 shrink-0">
                                <a
                                    href={`/dashboard/tests`}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-cta-primary/10 hover:bg-cta-primary/20 text-cta-primary font-bold rounded-xl transition-colors text-sm"
                                >
                                    View all {selectedSubject} tests <ArrowRight className="h-4 w-4" />
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── SECTION 2: PYQ vs Mock Split ───────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionLabel>PYQ vs Mock Comparison</SectionLabel>
                {totalTests === 0 ? (
                    <EmptyState message="Complete tests to see your PYQ vs Mock breakdown." />
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {(['PYQ', 'Mock'] as const).map(type => {
                            const stat = typeStats[type];
                            const avgAcc = stat.count > 0 ? Math.round(stat.totalAccuracy / stat.count) : 0;
                            const avgScoreT = stat.count > 0 ? Math.round(stat.totalScore / stat.count) : 0;
                            const isPYQ = type === 'PYQ';
                            return (
                                <div key={type} className={`bg-surface-card/60 rounded-2xl border backdrop-blur-xl p-6 relative overflow-hidden ${isPYQ ? 'border-amber-500/20' : 'border-cta-primary/20'}`}>
                                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 ${isPYQ ? 'bg-amber-500' : 'bg-cta-primary'}`} />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-5">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${isPYQ ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-cta-primary/10 text-cta-primary border border-cta-primary/20'}`}>
                                                {type}
                                            </div>
                                            <span className="text-white/40 text-sm">{stat.count} attempt{stat.count !== 1 ? 's' : ''}</span>
                                        </div>
                                        {stat.count === 0 ? (
                                            <p className="text-white/30 text-sm">No {type} tests attempted yet.</p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-white/40 mb-1">Avg Score</p>
                                                    <p className="text-2xl font-black text-white">{avgScoreT}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-white/40 mb-1">Avg Accuracy</p>
                                                    <p className={`text-2xl font-black ${avgAcc >= 70 ? 'text-emerald-400' : avgAcc >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{avgAcc}%</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* ── SECTION 3: Test History ─────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <SectionLabel>Test History</SectionLabel>
                {recentAttempts.length === 0 ? (
                    <EmptyState message="No tests completed yet. Complete a test to see your history here." />
                ) : (
                    <div className="bg-surface-card/60 rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden">
                        {/* Header row */}
                        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 border-b border-white/5 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                            <span className="col-span-4">Test</span>
                            <span className="col-span-2 text-center">Score</span>
                            <span className="col-span-2 text-center">Accuracy</span>
                            <span className="col-span-2 text-center">Time</span>
                            <span className="col-span-2 text-center">Date</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {recentAttempts.map((att) => {
                                const test = testsData[att.testId];
                                const score = att.resultData?.score || 0;
                                const acc = att.resultData?.accuracy || 0;
                                const minutes = Math.round((att.resultData?.timeTaken || 0) / 60);
                                const date = new Date(att.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                                return (
                                    <Link
                                        href={`/dashboard/analysis/test/${att.testId}`}
                                        key={att.id}
                                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.03] transition-colors group"
                                    >
                                        <div className="col-span-8 sm:col-span-4 min-w-0">
                                            <p className="font-semibold text-white/90 text-sm group-hover:text-cta-primary transition-colors line-clamp-1">
                                                {test?.title || 'Unknown Test'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                {test?.tier2Category && (
                                                    <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full">{test.tier2Category}</span>
                                                )}
                                                {test?.subject && (
                                                    <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full">{test.subject}</span>
                                                )}
                                                <span className="sm:hidden text-[10px] text-white/30">{date}</span>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block col-span-2 text-center font-bold text-white text-sm">
                                            {score}<span className="text-white/30 text-[10px] ml-0.5">/{test?.totalMarks || '?'}</span>
                                        </div>
                                        <div className="hidden sm:block col-span-2 text-center">
                                            <span className={`font-bold text-sm ${acc >= 70 ? 'text-emerald-400' : acc >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{acc}%</span>
                                        </div>
                                        <div className="hidden sm:flex col-span-2 items-center justify-center gap-1 text-white/50 text-xs">
                                            <Clock className="h-3 w-3" />
                                            {minutes}m
                                        </div>
                                        <div className="hidden sm:block col-span-2 text-center text-white/40 text-xs">{date}</div>
                                        <div className="col-span-4 sm:hidden flex justify-end">
                                            <span className={`font-bold text-sm ${acc >= 70 ? 'text-emerald-400' : acc >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{acc}%</span>
                                        </div>
                                        <ExternalLink className="hidden sm:block text-white/20 group-hover:text-white/50 h-3 w-3 absolute right-6 transition-colors" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
