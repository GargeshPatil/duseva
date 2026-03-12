import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Shield, LogOut } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface SecuritySettingsProps {
    itemVariants: Variants;
}

export function SecuritySettings({ itemVariants }: SecuritySettingsProps) {
    const { logout } = useAuth();

    return (
        <motion.div variants={itemVariants} className="bg-surface-card/60 rounded-[2rem] border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />

            <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-6 relative z-10">
                <Shield className="h-6 w-6 text-blue-400" /> Security & Access
            </h3>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 gap-4 relative z-10 hover:bg-white/[0.07] transition-colors">
                <div>
                    <p className="font-bold text-white text-lg">Password</p>
                    <p className="text-sm text-white/50 mt-1">Last changed: Security logs unavailable</p>
                </div>
                <Button variant="outline" className="w-full sm:w-auto shrink-0 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white">
                    Update Password
                </Button>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 relative z-10">
                <button
                    onClick={logout}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-bold group"
                >
                    <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    End Active Session
                </button>
            </div>
        </motion.div>
    );
}
