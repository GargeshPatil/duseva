"use client";

import { useEffect, useState } from "react";
import { firestoreService } from "@/services/firestoreService";
import { TestAttempt } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { Target, Clock, Trophy, TrendingUp, AlertTriangle, X, MessageSquare, Bot } from "lucide-react";

type MetricType = 'tests' | 'score' | 'accuracy' | 'time' | null;

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

    // AI Insight Generator
    const getInsight = (metric: MetricType) => {
        if (attempts.length < 2) return "Keep taking tests to unlock detailed trend analysis!";

        const last = chartData[chartData.length - 1];
        const prev = chartData[chartData.length - 2];

        switch (metric) {
            case 'score':
                return last.score > prev.score
                    ? `Great job! Your score improved by ${last.score - prev.score} points in the last test. You're on an upward trend!`
                    : `Your score dipped slightly by ${prev.score - last.score} points. Review your incorrect answers to bounce back.`;
            case 'accuracy':
                return last.accuracy > 80
                    ? "Your accuracy is excellent! You're minimizing improved negative marking effectively."
                    : "Focus on accuracy. Try to skip questions you're unsure about to avoid negative marking.";
            case 'time':
                return "You're managing time well. Try to maintain this pace while improving accuracy.";
            case 'tests':
                return "Consistency is key! Try to take at least one mock test every 3 days to stay sharp.";
            default:
                return "Select a metric to see detailed insights.";
        }
    };

    // SVG Chart Logic
    const Chart = ({ dataKey = 'score', color = '#3b82f6' }: { dataKey?: 'score' | 'accuracy' | 'time', color?: string }) => {
        if (chartData.length < 2) return <div className="h-64 flex items-center justify-center text-slate-400">Not enough data for chart</div>;

        const width = 100; // viewBox units
        const height = 50;
        const maxVal = Math.max(...chartData.map(d => d[dataKey] as number), 10) * 1.1;

        const points = chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * width;
            const y = height - ((d[dataKey] as number) / maxVal) * height;
            return `${x},${y}`;
        }).join(" ");

        return (
            <div className="w-full aspect-[2/1] bg-white rounded-lg p-4">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1="0" y1="0" x2={width} y2="0" stroke="#f1f5f9" strokeWidth="0.5" />
                    <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#f1f5f9" strokeWidth="0.5" />
                    <line x1="0" y1={height} x2={width} y2={height} stroke="#f1f5f9" strokeWidth="0.5" />

                    {/* Line */}
                    <polyline fill="none" stroke={color} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />

                    {/* Points */}
                    {chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * width;
                        const y = height - ((d[dataKey] as number) / maxVal) * height;
                        return (
                            <circle key={i} cx={x} cy={y} r="2" fill="white" stroke={color} strokeWidth="1" className="hover:r-4 transition-all" vectorEffect="non-scaling-stroke">
                                <title>{`Test ${i + 1}: ${d[dataKey]}`}</title>
                            </circle>
                        );
                    })}
                </svg>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>{chartData[0]?.date}</span>
                    <span>{chartData[chartData.length - 1]?.date}</span>
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;

    return (
        <div className="space-y-8 relative">
            <h1 className="text-2xl font-bold text-slate-900">Performance Analytics</h1>

            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tests Taken"
                    value={totalTests.toString()}
                    icon={Target}
                    trend="Total"
                    trendUp={true}
                    onClick={() => setSelectedMetric('tests')}
                />
                <StatCard
                    title="Avg. Score"
                    value={avgScore.toString()}
                    icon={TrendingUp}
                    trend="Marks"
                    trendUp={true}
                    onClick={() => setSelectedMetric('score')}
                />
                <StatCard
                    title="Avg. Accuracy"
                    value={avgAccuracy + "%"}
                    icon={AlertTriangle}
                    trend={avgAccuracy < 60 ? "Improvement Needed" : "Good"}
                    trendUp={avgAccuracy >= 60}
                    onClick={() => setSelectedMetric('accuracy')}
                />
                <StatCard
                    title="Hours Practiced"
                    value={totalTimeHours + "h"}
                    icon={Clock}
                    trend="Time"
                    trendUp={true}
                    onClick={() => setSelectedMetric('time')}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-6">Score Progression</h3>
                    <Chart dataKey="score" color="#3b82f6" />
                </div>

                {/* Insights / Weakness */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Subject Performance</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">General Test</span>
                                    <span className="font-medium text-slate-900">75%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-3/4"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">English</span>
                                    <span className="font-medium text-slate-900">82%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[82%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Detail Overlay */}
            {selectedMetric && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end">
                    <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-900 capitalize">
                                {selectedMetric === 'tests' ? 'Test History' :
                                    selectedMetric === 'score' ? 'Score Analysis' :
                                        selectedMetric === 'accuracy' ? 'Accuracy Trend' : 'Time Analysis'}
                            </h2>
                            <button
                                onClick={() => setSelectedMetric(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Chart in Details */}
                        <div className="mb-8 border rounded-xl p-4 bg-slate-50">
                            <Chart
                                dataKey={selectedMetric === 'tests' ? 'score' : selectedMetric}
                                color={selectedMetric === 'accuracy' ? '#10b981' : selectedMetric === 'time' ? '#f59e0b' : '#3b82f6'}
                            />
                        </div>

                        {/* Recent Values */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                            <h3 className="font-semibold text-slate-900 mb-2">Recent History</h3>
                            {chartData.slice().reverse().map((d, i) => (
                                <div key={i} className="flex justify-between items-center p-3 border-b border-slate-100">
                                    <span className="text-sm text-slate-500">{d.date}</span>
                                    <span className="font-medium text-slate-900">
                                        {selectedMetric === 'tests' ? `Test #${d.index}` :
                                            selectedMetric === 'score' ? `${d.score} Marks` :
                                                selectedMetric === 'accuracy' ? `${d.accuracy}%` :
                                                    `${d.time.toFixed(1)} mins`}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Chat Bot Comment */}
                        <div className="mt-auto bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <Bot className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-blue-800 mb-1">AI Insight</p>
                                    <p className="text-sm text-blue-700 leading-relaxed">
                                        {getInsight(selectedMetric)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
