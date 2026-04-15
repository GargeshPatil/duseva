import { motion, Variants } from "framer-motion";

interface StatCardProps {
    title: string;
    value: string;
    icon: any;
    color: string;
    iconColor: string;
}

interface DashboardStatsGridProps {
    statCards: StatCardProps[];
    itemVariants: Variants;
}

export function DashboardStatsGrid({ statCards, itemVariants }: DashboardStatsGridProps) {
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
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
}
