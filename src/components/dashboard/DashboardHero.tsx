import { motion, Variants } from "framer-motion";
import { Sparkles, Play } from "lucide-react";
import Link from "next/link";
import { Test, TestAttempt } from "@/types/admin";
import { User } from "firebase/auth";


interface DashboardHeroProps {
    userData: any;
    user: User | null;
    activeAttempt: TestAttempt | null;
    activeAttemptTest: Test | null;
    itemVariants: Variants;
}

export function DashboardHero({ userData, user, activeAttempt, activeAttemptTest, itemVariants }: DashboardHeroProps) {
    return (
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-surface-card/60 border border-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cta-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium">
                            <Sparkles className="h-4 w-4 text-yellow-400" /> Welcome back to your hub
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight leading-tight">
                        Ready to crush it,<br />
                        {userData?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Student'}?
                    </h1>
                </div>
                {activeAttempt && activeAttemptTest && (
                    <Link href={`/test/${activeAttempt.testId}`} className="group relative">
                        <div className="absolute inset-0 bg-cta-primary/20 blur-md rounded-2xl group-hover:bg-cta-primary/30 transition-colors" />
                        <div className="relative bg-surface-elevated/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl flex items-center gap-5 transition-transform group-hover:-translate-y-1">
                            <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0">
                                <Play className="h-5 w-5 fill-current ml-0.5" />
                            </div>
                            <div>
                                <p className="text-sm text-cta-primary font-bold mb-0.5 tracking-wide uppercase">Resume Test</p>
                                <p className="text-white font-semibold truncate max-w-[180px]">{activeAttemptTest.title}</p>
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </motion.div>
    );
}
