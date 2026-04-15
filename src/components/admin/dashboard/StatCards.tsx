import { DashboardStats } from "@/types/admin";
import { Users, FileText, DollarSign, Activity } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface StatCardsProps {
    stats: DashboardStats;
    itemVariants: Variants;
}

export function StatCards({ stats, itemVariants }: StatCardsProps) {
    const statCards = [
        { title: "Total Students", value: stats.totalUsers || 0, icon: Users, color: "from-blue-500/20 to-cyan-500/5", iconColor: "text-blue-400", subtext: `+${stats.recentRegistrations?.length || 0} this week` },
        { title: "Active Tests", value: stats.activeTests || 0, icon: FileText, color: "from-indigo-500/20 to-purple-500/5", iconColor: "text-indigo-400", subtext: "Across platform" },
        { title: "Total Revenue", value: `₹${stats.revenue || 0}`, icon: DollarSign, color: "from-emerald-500/20 to-teal-500/5", iconColor: "text-emerald-400", subtext: "+8% vs last month" },
        { title: "Active Users", value: stats.activeUsers || 0, icon: Activity, color: "from-amber-500/20 to-orange-500/5", iconColor: "text-amber-400", subtext: "30-day active count" },
    ];

    return (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {statCards.map((stat, i) => (
                <div key={i} className="group relative overflow-hidden bg-surface-card/60 border border-white/10 backdrop-blur-xl rounded-[2rem] p-4 md:p-6 lg:p-8 hover:border-white/20 transition-all duration-300 shadow-lg">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-start justify-between mb-8">
                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner ${stat.iconColor}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-text-secondary font-medium text-sm md:text-base lg:text-lg mb-1">{stat.title}</h3>
                            <div className="text-3xl md:text-4xl font-black text-white tracking-tight">{stat.value}</div>
                            <div className="text-xs font-medium text-white/40 mt-2">
                                {stat.subtext}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
}
