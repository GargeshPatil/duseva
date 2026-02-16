import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import {
    BarChart,
    Clock,
    Target,
    Trophy,
    ArrowRight,
    Play,
    FileText
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const stats = [
        { title: "Tests Attempted", value: "12", icon: FileText, trend: "+2 this week", trendUp: true },
        { title: "Avg. Accuracy", value: "84%", icon: Target, trend: "+5%", trendUp: true },
        { title: "Avg. Speed", value: "1.2 min/qn", icon: Clock, trend: "-10s", trendUp: true },
        { title: "Best Rank", value: "#142", icon: Trophy, trend: "Top 5%", trendUp: true },
    ];

    const recommendedTests = [
        { id: 1, title: "English Language - Mock 5", questions: 50, time: "45 mins", difficulty: "Medium" },
        { id: 2, title: "General Test - Mock 3", questions: 60, time: "60 mins", difficulty: "Hard" },
        { id: 3, title: "Physics Domain - Mock 8", questions: 40, time: "60 mins", difficulty: "Medium" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back, John! Here's your progress.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Recommended Tests</h2>
                        <Link href="/dashboard/tests" className="text-sm text-secondary font-medium hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recommendedTests.map((test) => (
                            <div key={test.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
                                <div>
                                    <h3 className="font-semibold text-slate-900">{test.title}</h3>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                        <span>{test.questions} Qns</span>
                                        <span>•</span>
                                        <span>{test.time}</span>
                                        <span>•</span>
                                        <span className={`
                      px-2 py-0.5 rounded-full 
                      ${test.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}
                    `}>
                                            {test.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <Link href={`/test/${test.id}`}>
                                    <Button size="sm" variant="outline" className="gap-2">
                                        Start <Play className="h-3 w-3" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Continue Learning</h2>
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
                        <div className="mb-4">
                            <h3 className="font-semibold text-lg">Mathematics - Mock 4</h3>
                            <p className="text-slate-300 text-sm">Stopped at Q. 15</p>
                        </div>

                        <div className="w-full bg-slate-700 h-2 rounded-full mb-4">
                            <div className="bg-blue-500 h-2 rounded-full w-[40%]"></div>
                        </div>

                        <Link href="/test/1">
                            <Button fullWidth className="bg-white text-slate-900 hover:bg-blue-50">
                                Resume Test <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
