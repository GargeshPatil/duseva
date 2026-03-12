"use client";

import { useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { DashboardPrepResources } from "@/components/dashboard/DashboardPrepResources";
import { DashboardNextTargets } from "@/components/dashboard/DashboardNextTargets";
import { DashboardInsightsHistory } from "@/components/dashboard/DashboardInsightsHistory";
import { Target, Clock, Trophy, FileText, BrainCircuit } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
export default function DashboardPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();

    const {
        stats,
        recommendedTests,
        recentAttempts,
        activeAttempt,
        activeAttemptTest,
        loading,
        insights
    } = useDashboardData(user, authLoading);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    const statCards = [
        { title: "Tests Taken", value: stats.testsAttempted.toString(), icon: FileText, color: "from-blue-500/20 to-cyan-500/5", iconColor: "text-blue-400" },
        { title: "Avg Accuracy", value: `${stats.avgAccuracy}%`, icon: Target, color: "from-emerald-500/20 to-teal-500/5", iconColor: "text-emerald-400" },
        { title: "Avg Pace", value: `${stats.avgSpeed}m`, icon: Clock, color: "from-amber-500/20 to-orange-500/5", iconColor: "text-amber-400" },
        { title: "Best Score", value: stats.bestScore.toString(), icon: Trophy, color: "from-purple-500/20 to-pink-500/5", iconColor: "text-purple-400" },
    ];

    if (authLoading || loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-cta-primary/20 blur-xl rounded-full" />
                    <BrainCircuit className="h-12 w-12 text-cta-primary animate-pulse relative z-10" />
                </div>
                <p className="text-white/50 font-medium animate-pulse">Syncing neuronal pathways...</p>
            </div>
        );
    }

    if (!user) return null;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto pb-20"
        >
            {/* Header Hero */}
            <DashboardHero
                userData={userData}
                user={user}
                activeAttempt={activeAttempt}
                activeAttemptTest={activeAttemptTest}
                itemVariants={itemVariants}
            />

            {/* Stats Grid */}
            <DashboardStatsGrid statCards={statCards} itemVariants={itemVariants} />

            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left Column: Recommendations & Resources */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
                    <DashboardPrepResources />
                    <DashboardNextTargets recommendedTests={recommendedTests} userData={userData} />
                </motion.div>

                {/* Right Column: Insights & History */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <DashboardInsightsHistory insights={insights} recentAttempts={recentAttempts} />
                </motion.div>
            </div>
        </motion.div>
    );
}
