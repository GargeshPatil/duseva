"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { BarChart, TrendingUp, Users, Clock, DollarSign, Activity, Loader2 } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { DashboardStats } from "@/types/admin";

export default function AnalyticsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        setLoading(true);
        const data = await firestoreService.getDashboardStats();
        setStats(data);
        setLoading(false);
    }

    if (loading || !stats) return (
        <div className="p-8 flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" /> Loading analytics engine...
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics Overview</h1>
                    <p className="text-slate-500 mt-1">Deep dive into platform performance and user behavior.</p>
                </div>
                <div className="flex gap-2">
                    <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                    <Button variant="outline" className="gap-2">
                        Export Report
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 font-medium text-sm">Avg. Session</p>
                        <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">45m</h3>
                    <div className="flex items-center text-xs font-medium text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" /> +12% vs last week
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 font-medium text-sm">Active Tests</p>
                        <Activity className="h-5 w-5 text-purple-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.activeTests}</h3>
                    <div className="flex items-center text-xs font-medium text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" /> Live now
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 font-medium text-sm">Revenue Today</p>
                        <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">₹{stats.revenue}</h3>
                    <div className="flex items-center text-xs font-medium text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" /> All-time high
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 font-medium text-sm">Total Users</p>
                        <Users className="h-5 w-5 text-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.totalUsers}</h3>
                    <div className="flex items-center text-xs font-medium text-slate-500 mt-1">
                        Permissions stable
                    </div>
                </div>
            </div>

            {/* Charts Section (Visual Mockup - connected to live numbers partially) */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-6">User Growth Trend</h3>
                    <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 bg-slate-50 rounded-lg text-slate-400">
                        Chart Engine Loaded (Mock Visual)
                        {/* Implementing real Recharts or similar is out of scope for this step, keeping mock visual logic or placeholder */}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-6">Recent Registrations</h3>
                    <div className="space-y-4">
                        {stats.recentRegistrations.length === 0 ? (
                            <p className="text-slate-500 text-sm">No recent signups.</p>
                        ) : (
                            stats.recentRegistrations.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">{user.joinedAt}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
