"use client";

import { ShieldCheck } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { SecuritySettings } from "@/components/dashboard/SecuritySettings";

export default function SettingsPage() {
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
        <div className="max-w-4xl mx-auto space-y-8 pb-20 overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative overflow-hidden rounded-[2.5rem] bg-surface-card/60 border border-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl flex flex-col justify-between"
            >
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cta-primary/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10 w-full flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-6">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Account Settings
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight leading-tight">
                            Command Center
                        </h1>
                        <p className="mt-4 text-white/50 max-w-xl text-lg">
                            Manage your profile, security, and preferences.
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-8"
            >
                <ProfileSettings itemVariants={itemVariants} />
                <SecuritySettings itemVariants={itemVariants} />
            </motion.div>
        </div>
    );
}
