"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Save, AlertCircle, Loader2 } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { CMSContent } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { handlePrefillCUET2026Util, handlePrefillLandingUtil } from "./prefillUtils";
import { motion, Variants } from "framer-motion";
import { CMSHeroSection } from "@/components/admin/cms/CMSHeroSection";
import { CMSLandingSection } from "@/components/admin/cms/CMSLandingSection";
import { CMSCUET2026Section } from "@/components/admin/cms/CMSCUET2026Section";
import { CMSPricingSection } from "@/components/admin/cms/CMSPricingSection";
export default function CMSPage() {
    const { userData } = useAuth();
    const [content, setContent] = useState<CMSContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const isDeveloper = userData?.role === 'developer';

    useEffect(() => {
        async function loadContent() {
            setLoading(true);
            try {
                const data = await firestoreService.getCMSContent();
                setContent(data);
            } catch (error) {
                console.error("Failed to load CMS content:", error);
            } finally {
                setLoading(false);
            }
        }
        loadContent();
    }, []);

    async function handleUpdate(id: string, value: string) {
        const newContent = content.map(c => c.id === id ? { ...c, value } : c);
        setContent(newContent);
    }

    async function handleSave() {
        setSaving(true);
        let successCount = 0;
        try {
            for (const item of content) {
                if (item.editableBy === 'developer' && !isDeveloper) continue;
                const success = await firestoreService.updateCMSContent(item.id, item.value);
                if (success) successCount++;
            }
            if (successCount > 0) {
                alert(`Content updated successfully! (${successCount} items saved)`);
            }
        } catch (error) {
            console.error("Failed to save content", error);
            alert("An error occurred while saving content.");
        } finally {
            setSaving(false);
        }
    }

    const handlePrefillCUET2026 = () => handlePrefillCUET2026Util(content, setContent, setSaving);
    const handlePrefillLanding = () => handlePrefillLandingUtil(content, setContent, setSaving);

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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-cta-primary" />
            <span className="text-white/50 font-medium tracking-wide">Loading CMS Data...</span>
        </div>
    );

    const heroSection = content.filter(c => c.section === 'hero');
    const pricingSection = content.filter(c => c.section === 'pricing');
    const landingSection = content.filter(c => c.section === 'landing');
    const cuet2026Section = content.filter(c => c.section === 'cuet2026');

    const canEdit = (item: CMSContent) => {
        if (item.editableBy === 'developer') return isDeveloper;
        return true;
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-5xl pb-20"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Content Management</h1>
                    <p className="text-white/60 mt-1.5 text-lg">Manage landing pages and static content.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-cta-primary hover:bg-cta-hover text-white rounded-xl h-12 px-6 shadow-[0_0_20px_rgba(255,107,0,0.3)] gap-2 min-w-[140px] transition-all font-semibold"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-cta-primary/10 border border-cta-primary/20 rounded-2xl p-4 flex gap-3 text-cta-primary/90 text-sm backdrop-blur-xl">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="font-medium">Changes made here will be instantly visible on the live website. Be careful when saving structured content.</p>
            </motion.div>

            <CMSHeroSection heroSection={heroSection} itemVariants={itemVariants} handleUpdate={handleUpdate} canEdit={canEdit} />
            <CMSLandingSection landingSection={landingSection} itemVariants={itemVariants} handleUpdate={handleUpdate} canEdit={canEdit} handlePrefillLanding={handlePrefillLanding} saving={saving} />
            <CMSCUET2026Section cuet2026Section={cuet2026Section} itemVariants={itemVariants} handleUpdate={handleUpdate} canEdit={canEdit} handlePrefillCUET2026={handlePrefillCUET2026} saving={saving} />
            <CMSPricingSection pricingSection={pricingSection} itemVariants={itemVariants} handleUpdate={handleUpdate} canEdit={canEdit} />

            {content.length === 0 && !loading && (
                <motion.div variants={itemVariants} className="text-center p-16 text-white/40 bg-surface-card/60 backdrop-blur-xl rounded-3xl border border-white/10 border-dashed">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    No content found in Firestore 'content' collection. Run a seed script or add documents manually.
                </motion.div>
            )}
        </motion.div>
    );
}
