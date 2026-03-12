import { DashboardStats } from "@/types/admin";
import { Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

interface RecentRegistrationsListProps {
    stats: DashboardStats;
    itemVariants: Variants;
}

export function RecentRegistrationsList({ stats, itemVariants }: RecentRegistrationsListProps) {
    return (
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="bg-surface-card/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-400" /> Recent Registrations
                    </h2>
                    <Link href="/admin/users" className="text-sm text-cta-primary font-semibold hover:text-white transition-colors">
                        View All Users →
                    </Link>
                </div>

                {stats.recentRegistrations.length === 0 ? (
                    <div className="bg-surface-card/40 border border-white/5 rounded-2xl p-12 text-center">
                        <p className="text-white/50 font-medium">No recent registrations.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {stats.recentRegistrations.map((user) => (
                            <Link key={user.id} href={`/admin/users`} className="group block">
                                <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                    <div className="h-12 w-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-white/50 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white text-sm truncate mb-0.5">
                                            {user.name}
                                        </div>
                                        <div className="text-white/50 text-xs font-medium">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold px-2 py-1 bg-semantic-success/10 text-emerald-400 border border-emerald-500/20 rounded-full tracking-wider uppercase">
                                            New Student
                                        </span>
                                        <p className="text-xs text-white/40 mt-1">{user.joinedAt}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
