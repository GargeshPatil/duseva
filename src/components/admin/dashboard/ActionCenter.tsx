import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion, Variants } from "framer-motion";

interface ActionCenterProps {
    itemVariants: Variants;
}

export function ActionCenter({ itemVariants }: ActionCenterProps) {
    return (
        <motion.div variants={itemVariants} className="space-y-6">
            <div className="group relative overflow-hidden bg-surface-card/60 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-lg h-full">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform" />

                <div className="relative z-10 flex flex-col h-full">
                    <h3 className="font-bold text-xl mb-2 text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-400" /> Action Center
                    </h3>
                    <p className="text-white/50 text-sm mb-8 leading-relaxed">
                        Manage global settings, content, and audit logs to keep the platform running smoothly.
                    </p>

                    <div className="space-y-3 mt-auto">
                        <Link href="/admin/settings">
                            <Button variant="secondary" className="w-full justify-between h-12 bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all rounded-xl focus:ring-0">
                                Global Settings <ArrowRight className="h-4 w-4 text-white/40" />
                            </Button>
                        </Link>
                        <Link href="/admin/cms">
                            <Button variant="secondary" className="w-full justify-between h-12 bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all rounded-xl focus:ring-0">
                                Content CMS <ArrowRight className="h-4 w-4 text-white/40" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
