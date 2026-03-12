import { motion, Variants } from "framer-motion";
import { Database, ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CMSContent } from "@/types/admin";
import { STRUCTURED_EDITORS } from "@/components/admin/cms/CUET2026Editors";

interface CMSCUET2026SectionProps {
    cuet2026Section: CMSContent[];
    itemVariants: Variants;
    handleUpdate: (id: string, value: string) => void;
    canEdit: (item: CMSContent) => boolean;
    handlePrefillCUET2026: () => void;
    saving: boolean;
}

export function CMSCUET2026Section({ cuet2026Section, itemVariants, handleUpdate, canEdit, handlePrefillCUET2026, saving }: CMSCUET2026SectionProps) {
    return (
        <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
                <h3 className="font-bold text-white text-xl flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-400" /> CUET 2026 Content
                </h3>
                {cuet2026Section.length < 4 && (
                    <Button
                        onClick={handlePrefillCUET2026}
                        disabled={saving}
                        variant="outline"
                        size="sm"
                        className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors rounded-xl h-9"
                    >
                        <Zap className="h-3.5 w-3.5 mr-1.5" /> Prefill Missing Data
                    </Button>
                )}
            </div>

            <div className="space-y-8">
                {cuet2026Section.length > 0 ? (
                    cuet2026Section.map(item => {
                        const EditorComponent = STRUCTURED_EDITORS[item.key];
                        return (
                            <div key={item.id} className={`transition-opacity ${canEdit(item) ? "" : "opacity-60 pointer-events-none"}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-bold text-white/80 capitalize tracking-wide">
                                        {item.key.replace(/_/g, ' ')}
                                    </label>
                                    {!canEdit(item) && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20"><ShieldAlert className="h-3 w-3" /> Developer</span>}
                                </div>
                                {EditorComponent ? (
                                    <div className="bg-black/20 p-4 border border-white/10 rounded-2xl">
                                        <EditorComponent
                                            value={item.value}
                                            onChange={(v: string) => handleUpdate(item.id, v)}
                                            disabled={!canEdit(item)}
                                        />
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta-primary/50 transition-all min-h-[150px] font-mono placeholder:text-white/20 custom-scrollbar"
                                        value={item.value}
                                        onChange={(e) => handleUpdate(item.id, e.target.value)}
                                        disabled={!canEdit(item)}
                                        placeholder="Supports structured data..."
                                    />
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center p-8 text-white/40 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                        No content uploaded for CUET 2026 yet. Click "Prefill Missing Data" to initialize.
                    </div>
                )}
            </div>
        </motion.div>
    );
}
