import { motion, Variants } from "framer-motion";
import { Users } from "lucide-react";
import { DashboardStats } from "@/types/admin";

interface RecentSignupsProps {
    stats: DashboardStats;
    itemVariants: Variants;
}

export function RecentSignups({ stats, itemVariants }: RecentSignupsProps) {
    return (
        <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/5 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-xl flex items-center gap-2">
                    <Users className="h-5 w-5 text-brand-purple" /> Recent Signups
                </h3>
                <span className="text-xs font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-wider">Live</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {stats.recentRegistrations.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                        <Users className="h-10 w-10 text-white/10 mb-3" />
                        <p className="text-white/60 font-medium">No recent signups</p>
                    </div>
                ) : (
                    stats.recentRegistrations.map(user => (
                        <div key={user.id} className="group flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cta-primary/20 to-brand-purple/20 flex items-center justify-center text-white font-bold text-lg ring-1 ring-white/10 group-hover:ring-cta-primary/50 transition-all">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-white tracking-wide">{user.name}</p>
                                    <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">{user.email}</p>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-white/40 bg-black/40 px-3 py-1.5 rounded-lg whitespace-nowrap hidden sm:block">
                                {user.joinedAt}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
