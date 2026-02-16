"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2, Users, FileText, DollarSign, TrendingUp, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { firestoreService } from "@/services/firestoreService";
import { DashboardStats } from "@/types/admin";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const data = await firestoreService.getDashboardStats();
            setStats(data);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading || !stats) return (
        <div className="p-8 flex justify-center items-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back. Here's what's happening today.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/tests/new">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <FileText className="h-4 w-4" /> Create New Test
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 font-medium text-sm">Total Students</p>
                        <Users className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.totalUsers}</h3>
                    <div className="flex items-center text-xs font-medium text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" /> +{stats.recentRegistrations.length} this week
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-purple-300 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 font-medium text-sm">Active Tests</p>
                        <FileText className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.activeTests}</h3>
                    <div className="flex items-center text-xs font-medium text-slate-500 mt-1">
                        Across 3 categories
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-green-300 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 font-medium text-sm">Total Revenue</p>
                        <DollarSign className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">₹{stats.revenue}</h3>
                    <div className="flex items-center text-xs font-medium text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" /> +8% vs last month
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-orange-300 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 font-medium text-sm">Active Users</p>
                        <Activity className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.activeUsers}</h3>
                    <div className="flex items-center text-xs font-medium text-red-500 mt-1">
                        30-day active count
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Recent Registrations</h3>
                        <Link href="/admin/users">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                View All
                            </Button>
                        </Link>
                    </div>
                    <div className="p-2 flex-1">
                        {stats.recentRegistrations.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No recent activity.</div>
                        ) : (
                            <div className="space-y-1">
                                {stats.recentRegistrations.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                New Student
                                            </span>
                                            <p className="text-xs text-slate-400 mt-1">{user.joinedAt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-900 rounded-xl shadow-lg text-white p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-xl mb-2">Developer Tools</h3>
                        <p className="text-slate-300 text-sm mb-6">Manage global settings, content, and audit logs.</p>

                        <div className="space-y-3">
                            <Link href="/admin/settings">
                                <Button variant="secondary" className="w-full justify-between bg-white/10 hover:bg-white/20 text-white border-0">
                                    Global Settings <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/admin/cms">
                                <Button variant="secondary" className="w-full justify-between bg-white/10 hover:bg-white/20 text-white border-0">
                                    Content CMS <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <FileText className="h-64 w-64 rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
}
