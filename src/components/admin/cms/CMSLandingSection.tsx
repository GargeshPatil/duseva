import { motion, Variants } from "framer-motion";
import { FileText, ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CMSContent } from "@/types/admin";
import { STRUCTURED_EDITORS } from "@/components/admin/cms/CUET2026Editors";

interface CMSLandingSectionProps {
    landingSection: CMSContent[];
    itemVariants: Variants;
    handleUpdate: (id: string, value: string) => void;
    canEdit: (item: CMSContent) => boolean;
    handlePrefillLanding: () => void;
    saving: boolean;
}

export function CMSLandingSection({ landingSection, itemVariants, handleUpdate, canEdit, handlePrefillLanding, saving }: CMSLandingSectionProps) {
    return (
        <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
                <h3 className="font-bold text-white text-xl flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-purple" /> Landing Page Elements
                </h3>
                {landingSection.length < 1 && (
                    <Button
                        onClick={handlePrefillLanding}
                        disabled={saving}
                        variant="outline"
                        size="sm"
                        className="bg-brand-purple/10 text-brand-purple border border-brand-purple/20 hover:bg-brand-purple/20 transition-colors rounded-xl h-9"
                    >
                        <Zap className="h-3.5 w-3.5 mr-1.5" /> Prefill Data
                    </Button>
                )}
            </div>

            <div className="space-y-8">
                {landingSection.length > 0 ? landingSection.map(item => {
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
                                />
                            )}
                        </div>
                    );
                }) : (
                    <div className="text-center p-8 text-white/40 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                        No standalone landing content found.
                    </div>
                )}
            </div>
        </motion.div>
    );
}
