"use client";

import { useEffect, useState } from "react";
import { firestoreService } from "@/services/firestoreService";
import { TestAttempt } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { SubjectMastery } from "@/components/dashboard/SubjectMastery";
import { MetricDetailOverlay } from "@/components/dashboard/MetricDetailOverlay";
import { AnalyticsKpiCards } from "@/components/dashboard/AnalyticsKpiCards";
import { AnalyticsHeader } from "@/components/dashboard/AnalyticsHeader";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export type MetricType = 'tests' | 'score' | 'accuracy' | 'time' | null;

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState<TestAttempt[]>([]);
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
        </div>
    );
}
