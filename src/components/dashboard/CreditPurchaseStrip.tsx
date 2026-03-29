"use client";

import { useEffect, useState } from "react";
import { firestoreService } from "@/services/firestoreService";
import { CreditPackage, SiteSettings } from "@/types/admin";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface CreditPurchaseStripProps {
    onBuyPackage?: (pkg: CreditPackage) => void;
}

export function CreditPurchaseStrip({ onBuyPackage }: CreditPurchaseStripProps) {
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);

    useEffect(() => {
        async function loadPackages() {
            try {
                const settings = await firestoreService.getSettings() as SiteSettings;
                if (settings?.creditPackages && settings.creditPackages.length > 0) {
                    const sorted = settings.creditPackages.sort((a, b) => a.credits - b.credits);
                    setPackages(sorted);
                    const popular = sorted.find(p => p.isPopular);
                    setSelectedPkgId(popular ? popular.id : sorted[0].id);
                }
            } catch (error) {
                console.error("Failed to load credit packages:", error);
            } finally {
                setLoading(false);
            }
        }
        loadPackages();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 text-cta-primary animate-spin" />
            </div>
        );
    }

    if (packages.length === 0) {
        return (
            <div className="w-full relative overflow-hidden rounded-[2rem] bg-surface-elevated/40 backdrop-blur-xl border border-white/10 p-6 sm:p-8" id="credit-purchase-strip">
                <div className="text-center py-10 max-w-md mx-auto relative z-10">
                    <Sparkles className="h-10 w-10 text-amber-500/50 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Refuel Your Preparation</h3>
                    <p className="text-white/60 mb-6 font-medium">
                        Credit packages are currently being configured. Check back soon or contact your administrator to set up the default credit packages.
                    </p>
                </div>
            </div>
        );
    }

    const basePricePerCredit = Math.max(...packages.map(p => p.price / p.credits));
    const selectedPkg = packages.find(p => p.id === selectedPkgId) || packages[0];
    const savings = Math.round((basePricePerCredit * selectedPkg.credits) - selectedPkg.price);

    return (
        <div className="w-full relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-500/5 to-indigo-500/5 backdrop-blur-3xl border border-white/10 p-6 sm:p-8 group" id="credit-purchase-strip">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cta-primary/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                {/* Left: Text & Strip */}
                <div className="flex-1 w-full flex flex-col justify-center items-start">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-amber-400" />
                        Refuel Your Preparation
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed mb-6">
                        Unlock unlimited testing. Buy credits today!
                    </p>
                    
                    {/* The Animated Strip */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                        <span className="font-semibold text-white/50 whitespace-nowrap hidden sm:block">Buy Credits →</span>
                        <span className="font-semibold text-white/50 whitespace-nowrap block sm:hidden">Buy Credits:</span>
                        <div className="flex flex-wrap items-center gap-3">
                            {packages.map(pkg => {
                                const isSelected = pkg.id === selectedPkgId;
                                return (
                                    <button
                                        key={pkg.id}
                                        onClick={() => setSelectedPkgId(pkg.id)}
                                        className={`relative px-5 py-3 rounded-xl font-bold text-lg transition-all duration-300 overflow-hidden outline-none hover:ring-2 hover:ring-white/20
                                            ${isSelected 
                                                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-slate-900 shadow-xl shadow-amber-500/20 scale-[1.05] border-transparent ring-2 ring-amber-500/50' 
                                                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        {pkg.credits}
                                        {pkg.isPopular && !isSelected && (
                                            <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full m-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Floating/Sticky CTA Area */}
                <div className="w-full lg:w-[340px] shrink-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedPkg.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="w-full bg-white/5 backdrop-blur-md border border-white/20 rounded-[1.5rem] p-6 relative overflow-hidden shadow-2xl"
                        >
                            {selectedPkg.isPopular && (
                                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-slate-900 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-xl shadow-lg">
                                    Best Value
                                </div>
                            )}
                            <h3 className="text-2xl font-black text-white mb-1">
                                {selectedPkg.credits} Credits
                            </h3>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 mb-5">
                                ₹{selectedPkg.price}
                            </div>
                            
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center justify-between text-sm text-white/60">
                                    <span>Price per credit</span>
                                    <span className="font-semibold text-white">₹{Math.round(selectedPkg.price / selectedPkg.credits)}</span>
                                </div>
                                {savings > 0 && (
                                    <div className="flex items-center justify-between text-sm text-emerald-400 font-medium bg-emerald-500/10 px-3 py-2 rounded-lg">
                                        <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> You save</span>
                                        <span>₹{savings}</span>
                                    </div>
                                )}
                            </div>

                            <Button 
                                className="w-full h-12 text-base font-bold tracking-wide shadow-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 border-none transition-all hover:scale-[1.02]"
                                onClick={() => onBuyPackage?.(selectedPkg)}
                            >
                                Proceed to Pay
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
