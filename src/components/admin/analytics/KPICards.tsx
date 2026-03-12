import { motion, Variants } from "framer-motion";
import { TrendingUp, Users, Clock, DollarSign, Activity } from "lucide-react";
import { DashboardStats } from "@/types/admin";

interface KPICardsProps {
    stats: DashboardStats;
    containerVariants: Variants;
    itemVariants: Variants;
}

export function KPICards({ stats, containerVariants, itemVariants }: KPICardsProps) {
    return (
        <motion.div variants={containerVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                {
                    title: "Avg. Session",
                    value: "45m",
                    icon: Clock,
                    trend: "+12% vs last week",
                    color: "text-blue-400",
                    bgColor: "bg-blue-500/10",
                    borderColor: "hover:border-blue-500/50"
                },
                {
                    title: "Active Tests",
                    value: stats.activeTests,
                    icon: Activity,
                    trend: "Live now",
                    color: "text-purple-400",
                    bgColor: "bg-purple-500/10",
                    borderColor: "hover:border-purple-500/50"
                },
                {
                    title: "Revenue Today",
                    value: `₹${stats.revenue}`,
                    icon: DollarSign,
                    trend: "All-time high",
                    color: "text-emerald-400",
                    bgColor: "bg-emerald-500/10",
                    borderColor: "hover:border-emerald-500/50"
                },
                {
                    title: "Total Users",
                    value: stats.totalUsers,
                    icon: Users,
                    trend: "Permissions stable",
                    color: "text-amber-400",
                    bgColor: "bg-amber-500/10",
                    borderColor: "hover:border-amber-500/50"
                }
            ].map((kpi, index) => (
                <motion.div key={index} variants={itemVariants} className={`bg-surface-card/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/5 ${kpi.borderColor} transition-all duration-300 group`}>
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-white/60 font-medium text-sm tracking-wide">{kpi.title}</p>
                        <div className={`p-3 rounded-2xl ${kpi.bgColor} ring-1 ring-inset ring-white/10`}>
                            <kpi.icon className={`h-5 w-5 ${kpi.color} group-hover:scale-110 transition-transform`} />
                        </div>
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tight mb-2">{kpi.value}</h3>
                    <div className={`flex items-center text-xs font-semibold ${index === 3 ? 'text-white/40' : 'text-emerald-400'}`}>
                        {index !== 3 && <TrendingUp className="h-3.5 w-3.5 mr-1" />}
                        {kpi.trend}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
