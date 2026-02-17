"use client";

import { useEffect, useState } from 'react';
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import {
    Clock,
    Target,
    Trophy,
    ArrowRight,
    Play,
    FileText,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { firestoreService } from "@/services/firestoreService";
import { Test, TestAttempt } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { TestCard } from "@/components/dashboard/TestCard";
import { useRouter } from "next/navigation";
import { PaymentModal } from "@/components/dashboard/PaymentModal";

interface DashboardStats {
    testsAttempted: number;
    avgAccuracy: number;
    avgSpeed: number; // minutes per question
    bestScore: number;
}

interface PerformanceInsight {
    type: 'strength' | 'weakness' | 'neutral';
    message: string;
}

export default function DashboardPage() {
    const { user, userData } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        testsAttempted: 0,
        avgAccuracy: 0,
        avgSpeed: 0,
        bestScore: 0
    });

    const [recommendedTests, setRecommendedTests] = useState<Test[]>([]);
    const [recentAttempts, setRecentAttempts] = useState<TestAttempt[]>([]);
    const [activeAttempt, setActiveAttempt] = useState<TestAttempt | null>(null);
    const [activeAttemptTest, setActiveAttemptTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<PerformanceInsight[]>([]);
    const router = useRouter();
    const [selectedTestToUnlock, setSelectedTestToUnlock] = useState<Test | null>(null);

    const handleUnlock = (test: Test) => {
        setSelectedTestToUnlock(test);
    };

    const onPaymentSuccess = () => {
        setSelectedTestToUnlock(null);
        window.location.reload();
    };

    useEffect(() => {
        async function loadDashboardData() {
            if (!user) return;

            try {
                setLoading(true);

                // Parallel fetching
                const [tests, attempts, active] = await Promise.all([
                    firestoreService.getTests(true),
                    firestoreService.getUserAttempts(user.uid, 'completed'),
                    firestoreService.getActiveAttempt(user.uid)
                ]);

                // 1. Process Recommended Tests (Logic: Top 3 for now)
                setRecommendedTests(tests.slice(0, 3));

                // 2. Process Active Attempt
                if (active) {
                    setActiveAttempt(active);
                    const testDetails = tests.find(t => t.id === active.testId) || await firestoreService.getTest(active.testId);
                    setActiveAttemptTest(testDetails);
                }

                // 3. Process Recent Attempts
                setRecentAttempts(attempts.slice(0, 3)); // show top 3 recent

                // 4. Compute Stats
                if (attempts.length > 0) {
                    const totalAttempts = attempts.length;
                    let totalAccuracy = 0;
                    let totalTimePerQ = 0; // seconds
                    let maxScore = 0;
                    let totalQs = 0;

                    attempts.forEach(att => {
                        const result = att.resultData;
                        if (result) {
                            totalAccuracy += result.accuracy || 0;
                            if (result.score > maxScore) maxScore = result.score;

                            // Estimate speed? Time Taken / Total Questions
                            if (result.totalQuestions > 0 && result.timeTaken) {
                                totalTimePerQ += (result.timeTaken / result.totalQuestions);
                                totalQs++;
                            }
                        }
                    });

                    const avgTimePerQuestionMin = totalQs > 0
                        ? (totalTimePerQ / totalQs) / 60
                        : 0;

                    setStats({
                        testsAttempted: totalAttempts,
                        avgAccuracy: Math.round(totalAccuracy / totalAttempts),
                        avgSpeed: Number(avgTimePerQuestionMin.toFixed(1)),
                        bestScore: maxScore
                    });

                    // 5. Generate Insights (Simple Rule-based)
                    const newInsights: PerformanceInsight[] = [];
                    const avgAcc = totalAccuracy / totalAttempts;

                    if (avgAcc >= 80) {
                        newInsights.push({ type: 'strength', message: "Great accuracy! Push for speed now." });
                    } else if (avgAcc < 60) {
                        newInsights.push({ type: 'weakness', message: "Focus on accuracy before speed." });
                    } else {
                        newInsights.push({ type: 'neutral', message: "Consistent performance. Keep practicing." });
                    }

                    setInsights(newInsights);

                } else {
                    // No attempts
                    setStats({
                        testsAttempted: 0,
                        avgAccuracy: 0,
                        avgSpeed: 0,
                        bestScore: 0
                    });
                    setInsights([{ type: 'neutral', message: "Take your first test to get insights!" }]);
                }

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, [user]);

    const statCards = [
        { title: "Tests Attempted", value: stats.testsAttempted.toString(), icon: FileText, trend: "Total", trendUp: true },
        { title: "Avg. Accuracy", value: `${stats.avgAccuracy}%`, icon: Target, trend: "Overall", trendUp: stats.avgAccuracy > 70 },
        { title: "Avg. Speed", value: `${stats.avgSpeed} m/qn`, icon: Clock, trend: "Pace", trendUp: true },
        { title: "Best Score", value: stats.bestScore.toString(), icon: Trophy, trend: "All Time", trendUp: true },
    ];

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-500 mt-1">Welcome back, {userData?.name || user?.displayName || 'Student'}! Here's your progress.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Performance / Insights */}
                    {insights.length > 0 && (
                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex items-start gap-4 shadow-sm">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900">Performance Insight</h3>
                                <p className="text-blue-700 text-sm mt-1 leading-relaxed">{insights[0].message}</p>
                            </div>
                        </div>
                    )}

                    {/* Recommended Tests */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Recommended Tests</h2>
                            <Link href="/dashboard/tests" className="text-sm text-primary font-medium hover:underline">
                                View All
                            </Link>
                        </div>

                        {recommendedTests.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {recommendedTests.map((test) => (
                                    <TestCard
                                        key={test.id}
                                        test={test}
                                        isPurchased={test.price === 'free' || !!userData?.purchasedTests?.[test.id]}
                                        onUnlock={(t) => router.push('/dashboard/tests')}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="font-medium">No recommended tests available right now.</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Attempts List */}
                    {recentAttempts.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900">Recent History</h2>
                            <div className="space-y-3">
                                {recentAttempts.map((attempt) => (
                                    <div key={attempt.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-100 transition-colors shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">
                                                    {new Date(attempt.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="text-slate-500 text-xs">
                                                    Score: <span className="font-medium text-slate-900">{attempt.resultData?.score ?? '-'}</span> • Accuracy: {attempt.resultData?.accuracy ?? 0}%
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/dashboard/analysis/${attempt.testId}`}>
                                            <Button size="sm" variant="outline" className="h-8 text-xs">View Analysis</Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* Continue Learning Widget */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Continue Learning</h2>
                        {activeAttempt ? (
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-xl ring-1 ring-slate-900/5">
                                <div className="mb-6">
                                    <h3 className="font-semibold text-lg mb-1">{activeAttemptTest?.title || 'Unknown Test'}</h3>
                                    <p className="text-slate-300 text-sm flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5" /> Resuming from Q. {activeAttempt.currentQuestionIndex + 1}
                                    </p>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-xs text-slate-300">
                                        <span>Progress</span>
                                        <span>{Math.round(((activeAttempt.currentQuestionIndex + 1) / (activeAttemptTest?.questions?.length || 100)) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${((activeAttempt.currentQuestionIndex + 1) / (activeAttemptTest?.questions?.length || 100)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <Link href={`/test/${activeAttempt.testId}`}>
                                    <Button fullWidth className="bg-white text-slate-900 hover:bg-blue-50 border-0 shadow-lg">
                                        Resume Test <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-8 border border-dashed border-slate-200 text-center shadow-sm">
                                <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500 ring-1 ring-blue-100">
                                    <Trophy className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-slate-900">All Caught Up!</h3>
                                <p className="text-slate-500 text-sm mt-1 mb-6">You have no pending tests. Why not start a new challenge?</p>
                                <Link href="/dashboard/tests">
                                    <Button size="sm" variant="outline" className="w-full">Browse Tests</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {selectedTestToUnlock && (
                <PaymentModal
                    isOpen={!!selectedTestToUnlock}
                    onClose={() => setSelectedTestToUnlock(null)}
                    test={selectedTestToUnlock}
                    onUnlock={onPaymentSuccess}
                />
            )}
        </div>
    );
}
