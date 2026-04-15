import { ArrowRight, BookOpen, Target, Sparkles } from "lucide-react";
import Link from "next/link";

export function DashboardPrepResources() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-indigo-400" /> Prep Resources
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                <Link href="/dashboard/cuet-2026" className="group">
                    <div className="h-full bg-surface-card/60 backdrop-blur-xl border border-indigo-500/20 p-4 md:p-6 rounded-[2rem] hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform" />
                        <div className="p-3 bg-indigo-500/20 text-indigo-300 w-fit rounded-xl mb-4">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-white text-xl mb-2">CUET 2026 Master Guide</h3>
                        <p className="text-white/60 text-sm mb-4">Everything you need to know about the exam pattern, strategy, and important dates.</p>
                        <span className="text-indigo-400 font-semibold text-sm mt-auto flex items-center gap-1 group-hover:gap-2 transition-all">Explore Guide <ArrowRight className="h-4 w-4" /></span>
                    </div>
                </Link>

                <Link href="/dashboard/syllabus" className="group">
                    <div className="h-full bg-surface-card/60 backdrop-blur-xl border border-purple-500/20 p-4 md:p-6 rounded-[2rem] hover:bg-purple-500/10 hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform" />
                        <div className="p-3 bg-purple-500/20 text-purple-300 w-fit rounded-xl mb-4">
                            <Target className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-white text-xl mb-2">Syllabus & Roadmap</h3>
                        <p className="text-white/60 text-sm mb-4">Track your progress across official domains and map out your study plan.</p>
                        <span className="text-purple-400 font-semibold text-sm mt-auto flex items-center gap-1 group-hover:gap-2 transition-all">View Syllabus <ArrowRight className="h-4 w-4" /></span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
