import { Target, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { Test } from "@/types/admin";

interface DashboardNextTargetsProps {
    recommendedTests: Test[];
    userData: any;
}

export function DashboardNextTargets({ recommendedTests, userData }: DashboardNextTargetsProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Target className="h-6 w-6 text-cta-primary" /> Next Targets
                </h2>
                <Link href="/dashboard/tests" className="text-sm text-cta-primary font-semibold hover:text-white transition-colors">
                    View Vault →
                </Link>
            </div>

            {recommendedTests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                    {recommendedTests.map((test) => {
                        return (
                            <Link key={test.id} href={`/test/${test.id}`} className="block group">
                                <div className="relative h-full bg-surface-card/60 backdrop-blur-xl border border-white/10 p-4 md:p-6 lg:p-8 rounded-[2rem] hover:border-white/20 transition-all duration-300 overflow-hidden flex flex-col shadow-lg">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110" />

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${test.difficulty === 'Hard' ? 'bg-semantic-error/20 text-semantic-error border border-semantic-error/30' :
                                            test.difficulty === 'Easy' ? 'bg-semantic-success/20 text-emerald-400 border border-emerald-500/30' :
                                                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            }`}>
                                            {test.difficulty || 'Medium'}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-white text-xl leading-tight mb-4 relative z-10 group-hover:text-cta-primary transition-colors">
                                        {test.title}
                                    </h3>

                                    <div className="mt-auto flex items-center gap-4 text-sm text-white/60 font-medium relative z-10">
                                        <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                                            <Clock className="h-4 w-4" /> {test.duration}m
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                                            <FileText className="h-4 w-4" /> {test.questions?.length || 0}Q
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-surface-card/40 border border-white/5 rounded-[2rem] p-12 text-center backdrop-blur-xl">
                    <p className="text-white/50 font-medium">No active recommendations right now.</p>
                </div>
            )}
        </div>
    );
}
