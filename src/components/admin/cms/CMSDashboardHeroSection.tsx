"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { LayoutDashboard, Save, Plus, X, Loader2, ShieldAlert } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { DashboardHeroConfig } from "@/types/admin";

interface CMSDashboardHeroSectionProps {
    initialConfig: DashboardHeroConfig;
    itemVariants: Variants;
    isAdmin: boolean;
}

export function CMSDashboardHeroSection({ initialConfig, itemVariants, isAdmin }: CMSDashboardHeroSectionProps) {
    const [config, setConfig] = useState<DashboardHeroConfig>({
        headline: initialConfig.headline ?? '',
        subtext: initialConfig.subtext ?? '',
        ctaLabel: initialConfig.ctaLabel ?? '',
        overrideMessage: initialConfig.overrideMessage ?? '',
        trustBadges: initialConfig.trustBadges ?? [],
    });
    const [newBadge, setNewBadge] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        if (!isAdmin) return;
        setSaving(true);
        const ok = await firestoreService.updateDashboardHeroConfig(config);
        setSaving(false);
        if (ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const addBadge = () => {
        const trimmed = newBadge.trim();
        if (trimmed && !(config.trustBadges ?? []).includes(trimmed)) {
            setConfig(prev => ({ ...prev, trustBadges: [...(prev.trustBadges ?? []), trimmed] }));
        }
        setNewBadge('');
    };

    const removeBadge = (badge: string) => {
        setConfig(prev => ({ ...prev, trustBadges: (prev.trustBadges ?? []).filter(b => b !== badge) }));
    };

    return (
        <motion.div
            variants={itemVariants}
            className="bg-surface-card/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/5 space-y-6"
        >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-bold text-white text-xl flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-cta-primary" /> Dashboard Hero
                </h3>
                {!isAdmin && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20">
                        <ShieldAlert className="h-3 w-3" /> Admin only
                    </span>
                )}
            </div>

            <div className={`space-y-5 ${!isAdmin ? "opacity-60 pointer-events-none" : ""}`}>

                {/* Headline */}
                <div>
                    <label className="block text-sm font-bold text-white/80 tracking-wide mb-2">
                        Headline <span className="text-white/30 font-normal">(leave blank for dynamic greeting)</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Ready to crack CUET 2026?"
                        value={config.headline ?? ''}
                        onChange={e => setConfig(p => ({ ...p, headline: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta-primary/50 transition-all placeholder:text-white/20"
                    />
                </div>

                {/* Subtext */}
                <div>
                    <label className="block text-sm font-bold text-white/80 tracking-wide mb-2">Subtext</label>
                    <input
                        type="text"
                        placeholder="e.g. Your journey to top colleges starts here"
                        value={config.subtext ?? ''}
                        onChange={e => setConfig(p => ({ ...p, subtext: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta-primary/50 transition-all placeholder:text-white/20"
                    />
                </div>

                {/* CTA Label */}
                <div>
                    <label className="block text-sm font-bold text-white/80 tracking-wide mb-2">
                        CTA Button Label <span className="text-white/30 font-normal">(defaults to "Start Test")</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Start Test"
                        value={config.ctaLabel ?? ''}
                        onChange={e => setConfig(p => ({ ...p, ctaLabel: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta-primary/50 transition-all placeholder:text-white/20"
                    />
                </div>

                {/* Override Message */}
                <div>
                    <label className="block text-sm font-bold text-white/80 tracking-wide mb-2">
                        Override / Broadcast Message <span className="text-white/30 font-normal">(shown as alert banner)</span>
                    </label>
                    <textarea
                        placeholder="e.g. CUET 2026 registration closes in 3 days. Attempt at least 2 full mocks before applying!"
                        value={config.overrideMessage ?? ''}
                        onChange={e => setConfig(p => ({ ...p, overrideMessage: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400/50 transition-all min-h-[80px] placeholder:text-white/20 custom-scrollbar"
                    />
                    <p className="text-xs text-white/30 mt-1">Leave blank to hide the broadcast banner.</p>
                </div>

                {/* Trust Badges */}
                <div>
                    <label className="block text-sm font-bold text-white/80 tracking-wide mb-2">Trust Badges</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {(config.trustBadges ?? []).map(badge => (
                            <span
                                key={badge}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-semibold"
                            >
                                {badge}
                                <button
                                    onClick={() => removeBadge(badge)}
                                    className="text-white/30 hover:text-red-400 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        {(config.trustBadges ?? []).length === 0 && (
                            <span className="text-white/20 text-xs">No badges added yet</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="e.g. 10K+ students"
                            value={newBadge}
                            onChange={e => setNewBadge(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addBadge()}
                            className="flex-1 px-4 py-2.5 bg-black/40 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta-primary/50 transition-all placeholder:text-white/20"
                        />
                        <button
                            onClick={addBadge}
                            className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-cta-primary hover:bg-cta-hover text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Hero Config'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
