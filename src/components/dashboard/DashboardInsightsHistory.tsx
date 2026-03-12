import { TrendingUp, Activity, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TestAttempt } from "@/types/admin";

interface PerformanceInsight {
    type: 'strength' | 'weakness' | 'neutral';
    message: string;
}

interface DashboardInsightsHistoryProps {
    insights: PerformanceInsight[];
    recentAttempts: TestAttempt[];
}

export function DashboardInsightsHistory({ insights, recentAttempts }: DashboardInsightsHistoryProps) {
    return (
        <div className="space-y-6">
            {/* Glowing AI Insight Card */}
            {insights.length > 0 && (
                <div className="relative group perspective-1000">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur-md opacity-30 group-hover:opacity-40 transition-opacity" />
                    <div className="relative bg-surface-card/80 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-6 sm:p-8 transform transition-transform preserve-3d shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl text-white shadow-lg">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-white text-lg">AI Performance Insight</h3>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed font-medium">
                            {insights[0].message}
                        </p>
                    </div>
                </div>
            )}

            {/* Minimalist History List */}
            <div className="bg-surface-card/60 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-400" /> History
                    </h2>
                </div>

                {recentAttempts.length > 0 ? (
                    <div className="space-y-4">
                        {recentAttempts.map((attempt) => (
                            <Link key={attempt.id} href={`/dashboard/analysis/${attempt.testId}`} className="group block">
                                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                    <div className="h-12 w-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-white/50 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                        <Trophy className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white text-sm truncate mb-0.5">
                                            Score: {attempt.resultData?.score ?? '-'} / {attempt.resultData?.totalQuestions ? attempt.resultData.totalQuestions * 5 : '-'}
                                        </div>
                                        <div className="text-white/50 text-xs font-medium">
                                            {new Date(attempt.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {attempt.resultData?.accuracy ?? 0}% Acc
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-white/30 text-sm">No recent activity.</div>
                )}
            </div>
        </div>
    );
}
