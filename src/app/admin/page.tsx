"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
    FileText,
    ShieldCheck,
    BrainCircuit
} from "lucide-react";
import Link from "next/link";
import { firestoreService } from "@/services/firestoreService";
import { DashboardStats } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { motion, Variants } from "framer-motion";
import { StatCards } from "@/components/admin/dashboard/StatCards";
import { RecentRegistrationsList } from "@/components/admin/dashboard/RecentRegistrationsList";
import { ActionCenter } from "@/components/admin/dashboard/ActionCenter";
export default function AdminDashboardPage() {
    const { user, userData } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const data = await firestoreService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load admin stats", error);
            } finally {
                setLoading(false);
            }
        }
        if (user && userData && ['admin', 'developer'].includes(userData.role)) {
            loadData();
        }
    }, [user, userData]);



    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-cta-primary/20 blur-xl rounded-full" />
                    <BrainCircuit className="h-12 w-12 text-cta-primary animate-pulse relative z-10" />
                </div>
                <p className="text-white/50 font-medium animate-pulse">Gathering platform metrics...</p>
            </div>
        );
    }

    if (!stats) return null;

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
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-surface-card/60 border border-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cta-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-6">
                            <ShieldCheck className="h-4 w-4 text-rose-400" /> Platform Command Center
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight leading-tight mb-2">
                            Overview,<br />
                            Administrator
                        </h1>
                        <p className="text-white/60 font-medium max-w-lg">
                            Monitor platform health, track user engagement, and manage content across the entire DU Seva ecosystem.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/admin/tests/new" className="group">
                            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md rounded-2xl h-12 px-6 gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                <FileText className="h-4 w-4" /> Create Test
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <StatCards stats={stats} itemVariants={itemVariants} />

            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Space for Left Column Content */}
                <RecentRegistrationsList stats={stats} itemVariants={itemVariants} />

                {/* Right Column: Quick Actions */}
                <ActionCenter itemVariants={itemVariants} />
            </div>
        </motion.div>
    );
}
