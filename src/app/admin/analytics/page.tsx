"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TrendingUp, Activity, Loader2, Download, Calendar } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { DashboardStats } from "@/types/admin";
import { motion, Variants } from "framer-motion";
import { KPICards } from "@/components/admin/analytics/KPICards";
import { RecentSignups } from "@/components/admin/analytics/RecentSignups";

export default function AnalyticsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadStats() {
        setLoading(true);
        try {
            const data = await firestoreService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStats();
    }, []);

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

    if (loading || !stats) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-cta-primary" />
            <span className="text-white/50 font-medium tracking-wide">Loading analytics engine...</span>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Overview</h1>
                    <p className="text-white/60 mt-1.5 text-lg">Deep dive into platform performance and user behavior.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <select className="pl-9 pr-8 h-11 w-full md:w-40 bg-white/5 border border-white/10 rounded-xl text-sm justify-between items-center outline-none text-white focus:ring-2 focus:ring-cta-primary/50 transition-all appearance-none cursor-pointer">
                            <option value="7" className="bg-surface-elevated text-white">Last 7 Days</option>
                            <option value="30" className="bg-surface-elevated text-white">Last 30 Days</option>
                            <option value="365" className="bg-surface-elevated text-white">This Year</option>
                        </select>
                    </div>
                    <Button
                        variant="secondary"
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-11 px-4 gap-2 transition-all shadow-sm flex-1 md:flex-initial justify-center"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <KPICards stats={stats} containerVariants={containerVariants} itemVariants={itemVariants} />

            {/* Charts Section */}
            <motion.div variants={containerVariants} className="grid lg:grid-cols-2 gap-8">
                <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/5 flex flex-col h-full">
                    <h3 className="font-bold text-white text-xl mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-cta-primary" /> User Growth Trend
                    </h3>
                    <div className="flex-1 min-h-[250px] flex items-center justify-center border-2 border-dashed border-white/10 bg-black/20 rounded-2xl">
                        <div className="text-center group">
                            <Activity className="h-8 w-8 text-white/20 mx-auto mb-3 group-hover:text-cta-primary/50 transition-colors" />
                            <p className="text-white/40 font-medium tracking-wide">Chart Engine Loaded</p>
                            <p className="text-white/20 text-xs mt-1">(Visual Mockup)</p>
                        </div>
                    </div>
                </motion.div>

                <RecentSignups stats={stats} itemVariants={itemVariants} />
            </motion.div>
        </motion.div>
    );
}
