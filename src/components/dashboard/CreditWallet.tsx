// src/components/dashboard/CreditWallet.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { Coins, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

interface CreditWalletProps {
    onAddCredits?: () => void;
    variant?: "default" | "nav";
}

export function CreditWallet({ onAddCredits, variant = "default" }: CreditWalletProps) {
    const { userData } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    
    // Default to 0, though new users get 10
    const credits = userData?.credits ?? 0;

    const handleAddCredits = onAddCredits || (() => {
        if (pathname === '/dashboard') {
            document.getElementById('credit-purchase-strip')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            router.push('/dashboard#credit-purchase-strip');
        }
    });

    const isNav = variant === "nav";

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center justify-between gap-3 ${isNav ? 'px-3 py-1.5 rounded-xl border-amber-500/30' : 'gap-4 px-4 py-2.5 rounded-2xl border-amber-500/20 shadow-amber-500/5'} bg-gradient-to-r from-amber-500/10 to-orange-500/10 border shadow-lg backdrop-blur-md group`}
        >
            <div className="flex items-center gap-2 sm:gap-3">
                <div className={`${isNav ? 'p-1.5 rounded-lg' : 'bg-amber-500/20 p-2 rounded-xl'} text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/30 transition-all duration-300`}>
                    <Coins className={isNav ? "h-4 w-4" : "h-5 w-5"} />
                </div>
                <div>
                    {!isNav && <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-0.5">Wallet Balance</h4>}
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        key={credits}
                        className={`text-white font-black leading-none flex items-center ${isNav ? 'text-sm gap-1' : 'text-xl gap-1.5'}`}
                    >
                        {credits} <span className="text-white/40 text-xs sm:text-sm font-medium">Credits</span>
                    </motion.div>
                </div>
            </div>
            
            <button
                onClick={handleAddCredits}
                className={`${isNav ? 'ml-1 p-1.5 rounded-lg' : 'ml-2 p-2.5 rounded-xl'} bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 hover:-translate-y-0.5`}
            >
                <Plus className={isNav ? "h-3.5 w-3.5" : "h-4 w-4"} />
            </button>
        </motion.div>
    );
}
