import { motion, Variants } from "framer-motion";
import { LayoutTemplate, ShieldAlert } from "lucide-react";
import { CMSContent } from "@/types/admin";

interface CMSHeroSectionProps {
    heroSection: CMSContent[];
    itemVariants: Variants;
    handleUpdate: (id: string, value: string) => void;
    canEdit: (item: CMSContent) => boolean;
}

export function CMSHeroSection({ heroSection, itemVariants, handleUpdate, canEdit }: CMSHeroSectionProps) {
    if (heroSection.length === 0) return null;

    return (
        <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/5 space-y-6">
            <h3 className="font-bold text-white text-xl flex items-center gap-2 pb-4 border-b border-white/10">
                <LayoutTemplate className="h-5 w-5 text-indigo-400" /> Hero Section
            </h3>

            <div className="space-y-6">
                {heroSection.map(item => (
                    <div key={item.id} className={`transition-opacity ${canEdit(item) ? "" : "opacity-60 pointer-events-none"}`}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-white/80 capitalize tracking-wide">
                                {item.key.replace(/_/g, ' ')}
                            </label>
                            {!canEdit(item) && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20"><ShieldAlert className="h-3 w-3" /> Developer</span>}
                        </div>
                        <textarea
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta-primary/50 transition-all min-h-[100px] placeholder:text-white/20 custom-scrollbar"
                            value={item.value}
                            onChange={(e) => handleUpdate(item.id, e.target.value)}
                            disabled={!canEdit(item)}
                        />
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
