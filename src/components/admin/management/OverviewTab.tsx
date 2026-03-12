"use client";

import { useEffect, useState } from "react";
import { firestoreService } from "@/services/firestoreService";
import {
    Library,
    FileText,
    Package,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Activity,
    PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, Variants } from "framer-motion";

interface OverviewTabProps {
    onNavigate: (tab: string) => void;
}

export function OverviewTab({ onNavigate }: OverviewTabProps) {
    const [stats, setStats] = useState({
        tests: 0,
        questions: 0,
        bundles: 0,
        activeBundles: 0,
        publishedTests: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        try {
            const [tests, questions, bundles] = await Promise.all([
                firestoreService.getTests(),
                firestoreService.getQuestions(),
                firestoreService.getBundles()
            ]);

            setStats({
                tests: tests.length,
                publishedTests: tests.filter(t => t.status === 'published').length,
                questions: questions.length,
                bundles: bundles.length,
                activeBundles: bundles.filter(b => b.isActive).length
            });
        } catch (error) {
            console.error("Failed to load stats", error);
        } finally {
            setLoading(false);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const StatCard = ({ title, value, subtext, icon: Icon, color, onClick }: any) => (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -5 }}
            className="relative overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md rounded-[1.5rem] p-6 cursor-pointer group shadow-lg"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    {subtext && (
                        <span className="text-xs font-bold text-white/70 bg-white/10 px-2.5 py-1 rounded-full border border-white/5 tracking-wider uppercase">
                            {subtext}
                        </span>
                    )}
                </div>
                <h3 className="text-4xl font-black text-white tracking-tight mb-1 group-hover:text-cta-primary transition-colors">
                    {loading ? "-" : value}
                </h3>
                <p className="text-white/50 font-medium text-sm">{title}</p>
            </div>
        </motion.div>
    );

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
            className="space-y-8"
        >
            {/* Key Metrics */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Questions"
                    value={stats.questions}
                    icon={Library}
                    color="from-blue-500/20 to-cyan-500/5"
                    onClick={() => onNavigate('questions')}
                />
                <StatCard
                    title="Total Tests"
                    value={stats.tests}
                    subtext={`${stats.publishedTests} Published`}
                    icon={FileText}
                    color="from-indigo-500/20 to-purple-500/5"
                    onClick={() => onNavigate('tests')}
                />
                <StatCard
                    title="Test Bundles"
                    value={stats.bundles}
                    subtext={`${stats.activeBundles} Active`}
                    icon={Package}
                    color="from-purple-500/20 to-pink-500/5"
                    onClick={() => onNavigate('bundles')}
                />
                <StatCard
                    title="Pricing Rules"
                    value="Manage"
                    icon={TrendingUp}
                    color="from-emerald-500/20 to-teal-500/5"
                    onClick={() => onNavigate('pricing')}
                />
            </motion.div>

            {/* Quick Actions / System Status */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cta-primary/10 rounded-full blur-[60px] pointer-events-none -mr-10 -mt-10" />

                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                        <Activity className="h-5 w-5 text-cta-primary" />
                        Quick Actions
                    </h3>

                    <div className="space-y-4 relative z-10 flex-1">
                        <Button
                            variant="secondary"
                            className="w-full justify-start h-14 bg-black/20 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all rounded-xl focus:ring-0 gap-3"
                            onClick={() => window.location.href = '/admin/tests/new'}
                        >
                            <PlusCircle className="h-5 w-5 text-indigo-400" />
                            <span className="font-semibold">Create New Test</span>
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full justify-start h-14 bg-black/20 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all rounded-xl focus:ring-0 gap-3"
                            onClick={() => window.location.href = '/admin/questions/new'}
                        >
                            <PlusCircle className="h-5 w-5 text-emerald-400" />
                            <span className="font-semibold">Add Content to Bank</span>
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full justify-start h-14 bg-black/20 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all rounded-xl focus:ring-0 gap-3"
                            onClick={() => window.location.href = '/admin/bundles/new'}
                        >
                            <PlusCircle className="h-5 w-5 text-purple-400" />
                            <span className="font-semibold">Create Test Bundle</span>
                        </Button>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl flex flex-col h-full relative overflow-hidden group">
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/30 transition-colors" />

                    <h3 className="text-xl font-bold text-white mb-6 relative z-10">System Integration Status</h3>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </div>
                            <span className="text-white font-medium">Database Connection: <strong className="text-emerald-400 ml-1">Stable</strong></span>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                            <span className="text-white font-medium">Pricing & Bundle Engine: <strong className="text-emerald-400 ml-1">Active</strong></span>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10">
                            <p className="text-sm font-medium text-white/50 mb-5">
                                Need to pause operations or update global policies?
                            </p>
                            <Button
                                variant="outline"
                                className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 h-12 rounded-xl transition-all font-semibold"
                                onClick={() => window.location.href = '/admin/settings'}
                            >
                                Open Global Settings <ArrowRight className="h-4 w-4 ml-2 text-white/50" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
