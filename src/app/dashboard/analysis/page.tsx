"use client";

import { useEffect, useState } from "react";
import { firestoreService } from "@/services/firestoreService";
import { TestAttempt, Test } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { SubjectMastery } from "@/components/dashboard/SubjectMastery";
import { MetricDetailOverlay } from "@/components/dashboard/MetricDetailOverlay";
import { AnalyticsKpiCards } from "@/components/dashboard/AnalyticsKpiCards";
import { AnalyticsHeader } from "@/components/dashboard/AnalyticsHeader";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import Link from "next/link";

export type MetricType = 'tests' | 'score' | 'accuracy' | 'time' | null;

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState<TestAttempt[]>([]);
    const [testsData, setTestsData] = useState<Record<string, Test>>({});
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<MetricType>(null);

    useEffect(() => {
        async function loadData() {
            if (!user) return;
            try {
                // Fetch only completed for analytics
                const completedAttempts = await firestoreService.getUserAttempts(user.uid, 'completed');
                // Sort by date ascending for chart
                completedAttempts.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                setAttempts(completedAttempts);

                // Fetch associated test data
                const testIds = Array.from(new Set(completedAttempts.map(a => a.testId)));
                const testPromises = testIds.map(id => firestoreService.getTest(id));
                const fetchedTests = await Promise.all(testPromises);
                
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

    // Compute Stats
    const totalTests = attempts.length;
    let totalScore = 0;
    let totalAccuracy = 0;
    let totalTime = 0; // minutes
    let maxScore = 0;

    const chartData = attempts.map((att, index) => {
        const score = att.resultData?.score || 0;
        const accuracy = att.resultData?.accuracy || 0;
        const time = (att.resultData?.timeTaken || 0) / 60;

        totalScore += score;
        totalAccuracy += accuracy;
        totalTime += time;
        if (score > maxScore) maxScore = score;

        return {
            index: index + 1,
            score,
            accuracy,
            time,
            date: new Date(att.startTime).toLocaleDateString()
        };
    });

    const avgScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;
    const avgAccuracy = totalTests > 0 ? Math.round(totalAccuracy / totalTests) : 0;
    const totalTimeHours = (totalTime / 60).toFixed(1);



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



    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20 overflow-x-hidden">
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

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-surface-card/60 rounded-[2rem] border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
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

                <SubjectMastery />
            </div>

            {/* Metric Detail Overlay (Glassmorphic Slider) */}
            <MetricDetailOverlay selectedMetric={selectedMetric} setSelectedMetric={setSelectedMetric} chartData={chartData} attemptsLength={attempts.length} />

            {/* Test-wise Analysis Section */}
            <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Test-wise Analysis</h2>
                        <p className="text-white/40 mt-1">Deep dive into your progression across specific tests.</p>
                    </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(
                        attempts.reduce((acc, attempt) => {
                            if (!acc[attempt.testId]) {
                                acc[attempt.testId] = {
                                    testId: attempt.testId,
                                    title: testsData[attempt.testId]?.title || 'Unknown Test',
                                    attemptsCount: 0,
                                    bestScore: 0,
                                    totalAccuracy: 0,
                                    maxMarks: testsData[attempt.testId]?.totalMarks || 0,
                                };
                            }
                            const score = attempt.resultData?.score || 0;
                            const accuracy = attempt.resultData?.accuracy || 0;
                            
                            acc[attempt.testId].attemptsCount += 1;
                            if (score > acc[attempt.testId].bestScore) acc[attempt.testId].bestScore = score;
                            acc[attempt.testId].totalAccuracy += accuracy;
                            
                            return acc;
                        }, {} as Record<string, any>)
                    ).map((testStats: any) => {
                        const avgTestAccuracy = Math.round(testStats.totalAccuracy / testStats.attemptsCount);
                        
                        return (
                            <Link 
                                href={`/dashboard/analysis/test/${testStats.testId}`} 
                                key={testStats.testId}
                                className="bg-surface-card/60 rounded-2xl border border-white/10 p-6 backdrop-blur-xl hover:bg-white/[0.05] transition-all group hover:-translate-y-1 hover:shadow-2xl hover:shadow-cta-primary/10 overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                                
                                <h3 className="font-bold text-lg text-white mb-4 line-clamp-1 group-hover:text-cta-primary transition-colors">
                                    {testStats.title}
                                </h3>
                                
                                <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-center">
                                        <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Attempts</div>
                                        <div className="font-bold text-white">{testStats.attemptsCount}</div>
                                    </div>
                                    <div className="text-center border-l border-white/10">
                                        <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Best Score</div>
                                        <div className="font-bold text-emerald-400">{testStats.bestScore}<span className="text-[10px] text-white/30 ml-0.5">/{testStats.maxMarks}</span></div>
                                    </div>
                                    <div className="text-center border-l border-white/10">
                                        <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Avg Acc.</div>
                                        <div className="font-bold text-blue-400">{avgTestAccuracy}%</div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                {attempts.length === 0 && (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                        <Activity className="h-12 w-12 text-white/20 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No tests taken yet</h3>
                        <p className="text-white/50">Complete a test to unlock detailed progression analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
