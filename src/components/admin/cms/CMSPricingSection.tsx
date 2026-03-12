import { motion, Variants } from "framer-motion";
import { FileText, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { CMSContent } from "@/types/admin";

interface CMSPricingSectionProps {
    pricingSection: CMSContent[];
    itemVariants: Variants;
    handleUpdate: (id: string, value: string) => void;
    canEdit: (item: CMSContent) => boolean;
}

export function CMSPricingSection({ pricingSection, itemVariants, handleUpdate, canEdit }: CMSPricingSectionProps) {
    if (pricingSection.length === 0) return null;
    return (
        <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/5 space-y-6">
            <h3 className="font-bold text-white text-xl flex items-center gap-2 pb-4 border-b border-white/10">
                <FileText className="h-5 w-5 text-blue-400" /> Pricing Section Copy
            </h3>

            <div className="space-y-6">
                {pricingSection.map(item => (
                    <div key={item.id} className={`transition-opacity ${canEdit(item) ? "" : "opacity-60 pointer-events-none"}`}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-white/80 capitalize tracking-wide">
                                {item.key.replace(/_/g, ' ')}
                            </label>
                            {!canEdit(item) && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20"><ShieldAlert className="h-3 w-3" /> Developer</span>}
                        </div>
                        <Input
                            value={item.value}
                            onChange={(e) => handleUpdate(item.id, e.target.value)}
                            disabled={!canEdit(item)}
                            className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus-visible:ring-cta-primary/50"
                        />
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
