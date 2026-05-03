"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Zap, Coins } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCreditModal } from "@/context/CreditModalContext";
import { useAuth } from "@/context/AuthContext";
import { firestoreService } from "@/services/firestoreService";
import { CreditPackage, SiteSettings } from "@/types/admin";
import { Loader2 } from "lucide-react";

export function CreditModal() {
    const { isOpen, closeModal, handleBuyPackage } = useCreditModal();
    const { userData } = useAuth();

    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState(false);

    // Load packages once on first open
    useEffect(() => {
        if (!isOpen || packages.length > 0) return;
        async function load() {
            try {
                const settings = await firestoreService.getSettings() as SiteSettings;
                if (settings?.creditPackages?.length) {
                    const sorted = [...settings.creditPackages].sort((a, b) => a.credits - b.credits);
                    setPackages(sorted);
                    const popular = sorted.find(p => p.isPopular);
                    setSelectedPkgId(popular?.id ?? sorted[0].id);
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [isOpen, packages.length]);

    // ESC key closes
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, closeModal]);

    const selectedPkg = packages.find(p => p.id === selectedPkgId) ?? packages[0];
    const basePricePerCredit = packages.length ? Math.max(...packages.map(p => p.price / p.credits)) : 0;
    const savings = selectedPkg ? Math.round((basePricePerCredit * selectedPkg.credits) - selectedPkg.price) : 0;

    const onPay = async () => {
        if (!selectedPkg) return;
        setIsPaying(true);
        try {
            if (handleBuyPackage) await handleBuyPackage(selectedPkg);
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeModal}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.94, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 24 }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="relative w-full max-w-md bg-surface-card border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Ambient glow */}
                            <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-cta-primary/10 rounded-full blur-[60px] pointer-events-none" />

                            {/* Header */}
                            <div className="relative z-10 flex items-start justify-between p-6 pb-4 border-b border-white/10">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-5 w-5 text-amber-400" />
                                        <h2 className="text-xl font-black text-white">Buy Credits</h2>
                                    </div>
                                    {userData && (
                                        <div className="flex items-center gap-1.5 text-sm text-white/50">
                                            <Coins className="h-3.5 w-3.5" />
                                            Current balance: <span className="text-white font-bold">{userData.credits} credit{userData.credits !== 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="relative z-10 p-6 space-y-5">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-6 w-6 text-cta-primary animate-spin" />
                                    </div>
                                ) : packages.length === 0 ? (
                                    <p className="text-center text-white/40 py-6">No credit packages configured. Contact admin.</p>
                                ) : (
                                    <>
                                        {/* Package grid */}
                                        <div>
                                            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">Select a package</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {packages.map(pkg => {
                                                    const isSelected = pkg.id === selectedPkgId;
                                                    return (
                                                        <button
                                                            key={pkg.id}
                                                            onClick={() => setSelectedPkgId(pkg.id)}
                                                            className={`relative py-3 px-2 rounded-2xl font-bold text-center transition-all duration-200 border ${isSelected
                                                                ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-slate-900 border-transparent shadow-lg shadow-amber-500/20 scale-105'
                                                                : 'bg-white/5 text-white border-white/10 hover:border-white/20 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            <div className="text-xl font-black">{pkg.credits}</div>
                                                            <div className={`text-[10px] font-semibold ${isSelected ? 'text-slate-700' : 'text-white/40'}`}>credits</div>
                                                            {pkg.isPopular && !isSelected && (
                                                                <div className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Selected package detail */}
                                        {selectedPkg && (
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                                                {selectedPkg.isPopular && (
                                                    <div className="inline-block text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 px-2.5 py-0.5 rounded-full">
                                                        Best Value
                                                    </div>
                                                )}
                                                <div className="flex items-end gap-2">
                                                    <span className="text-3xl font-black text-white">₹{selectedPkg.price}</span>
                                                    <span className="text-white/40 text-sm mb-1">for {selectedPkg.credits} credits</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-white/40">Per credit</span>
                                                    <span className="text-white font-semibold">₹{Math.round(selectedPkg.price / selectedPkg.credits)}</span>
                                                </div>
                                                {savings > 0 && (
                                                    <div className="flex items-center justify-between text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-emerald-400">
                                                        <span className="flex items-center gap-1.5 font-medium"><Zap className="h-3.5 w-3.5" /> You save</span>
                                                        <span className="font-bold">₹{savings}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <Button
                                            disabled={isPaying || !selectedPkg}
                                            onClick={onPay}
                                            className="w-full h-12 text-base font-bold tracking-wide bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 border-none shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {isPaying ? (
                                                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                                            ) : (
                                                `Proceed to Pay — ₹${selectedPkg?.price ?? ''}`
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
