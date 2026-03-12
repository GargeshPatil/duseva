import { useState, useEffect } from 'react';
import { firestoreService } from "@/services/firestoreService";
import { Test, TestAttempt } from "@/types/admin";
import { User } from 'firebase/auth';

export interface DashboardStats {
    testsAttempted: number;
    avgAccuracy: number;
    avgSpeed: number; // minutes per question
    bestScore: number;
}

export interface PerformanceInsight {
    type: 'strength' | 'weakness' | 'neutral';
    message: string;
}

export function useDashboardData(user: User | null, authLoading: boolean) {
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

    useEffect(() => {
        async function loadDashboardData() {
            if (authLoading || !user) return; // Wait for auth state

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
                        newInsights.push({ type: 'strength', message: "Your accuracy is elite. Focus on shaving seconds off your reading time." });
                    } else if (avgAcc < 60) {
                        newInsights.push({ type: 'weakness', message: "Focus on precision. Don't rush—accuracy builds the foundation for speed." });
                    } else {
                        newInsights.push({ type: 'neutral', message: "Steady progress. Consistent practice will break through the plateau." });
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
                    setInsights([{ type: 'neutral', message: "Take your first mock test to unlock personalized AI insights!" }]);
                }

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, [user, authLoading]);

    return {
        stats,
        recommendedTests,
        recentAttempts,
        activeAttempt,
        activeAttemptTest,
        loading,
        insights
    };
}
