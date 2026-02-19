"use client";

import { useEffect, useState } from "react";
import { firestoreService } from "@/services/firestoreService";
import {
    Library,
    FileText,
    Package,
    TrendingUp,
    Activity,
    CheckCircle,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";

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
            // Parallel fetch for better performance
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

    const StatCard = ({ title, value, subtext, icon: Icon, color, onClick }: any) => (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                {subtext && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                        {subtext}
                    </span>
                )}
            </div>
            <h3 className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {loading ? "-" : value}
            </h3>
            <p className="text-slate-500 font-medium mt-1">{title}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Questions"
                    value={stats.questions}
                    icon={Library}
                    color="bg-blue-500"
                    onClick={() => onNavigate('questions')}
                />
                <StatCard
                    title="Total Tests"
                    value={stats.tests}
                    subtext={`${stats.publishedTests} Published`}
                    icon={FileText}
                    color="bg-indigo-500"
                    onClick={() => onNavigate('tests')}
                />
                <StatCard
                    title="Test Bundles"
                    value={stats.bundles}
                    subtext={`${stats.activeBundles} Active`}
                    icon={Package}
                    color="bg-purple-500"
                    onClick={() => onNavigate('bundles')}
                />
                <StatCard
                    title="Pricing Rules"
                    value="Manage"
                    icon={TrendingUp}
                    color="bg-emerald-500"
                    onClick={() => onNavigate('pricing')}
                />
            </div>

            {/* Quick Actions / Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            fullWidth
                            className="justify-start h-12 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                            onClick={() => window.location.href = '/admin/tests/new'}
                        >
                            <PlusCircleIcon className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-500" />
                            Create New Test
                        </Button>
                        <Button
                            variant="outline"
                            fullWidth
                            className="justify-start h-12 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                            onClick={() => window.location.href = '/admin/questions/new'}
                        >
                            <PlusCircleIcon className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-500" />
                            Add Question
                        </Button>
                        <Button
                            variant="outline"
                            fullWidth
                            className="justify-start h-12 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                            onClick={() => window.location.href = '/admin/bundles/new'}
                        >
                            <PlusCircleIcon className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-500" />
                            Create Bundle
                        </Button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl text-white shadow-lg">
                    <h3 className="text-lg font-bold mb-2">System Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-sm text-slate-300">Database Connection: <strong>Stable</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-slate-300">Pricing Engine: <strong>Active</strong></span>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-4">
                                Need to update global settings or maintenance mode?
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white w-full"
                                onClick={() => window.location.href = '/admin/settings'}
                            >
                                Go to Settings <ArrowRight className="h-3 w-3 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlusCircleIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
    );
}
