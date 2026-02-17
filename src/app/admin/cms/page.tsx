"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save, AlertCircle, Loader2 } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { CMSContent } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function CMSPage() {
    const { userData } = useAuth();
    const [content, setContent] = useState<CMSContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // If user is developer, they can edit everything. 
    // If admin, they can only edit items that are NOT restricted to developer.
    // However, the interface property 'editableBy' can explicitly set permissions.
    const isDeveloper = userData?.role === 'developer';

    useEffect(() => {
        async function loadContent() {
            setLoading(true);
            const data = await firestoreService.getCMSContent();
            setContent(data);
            setLoading(false);
        }
        loadContent();
    }, []);

    async function handleUpdate(id: string, value: string) {
        const newContent = content.map(c => c.id === id ? { ...c, value } : c);
        setContent(newContent);
    }

    async function handleSave() {
        setSaving(true);

        // Find changed items (in a real app check dirty state)
        // For now, save all or just the ones we modified in state.
        // Optimization: track dirty fields?
        // Simpler: Just save all visible inputs for now, or just iterate.

        let successCount = 0;
        for (const item of content) {
            // Basic permission check on client side for UI feedback
            if (item.editableBy === 'developer' && !isDeveloper) continue;

            const success = await firestoreService.updateCMSContent(item.id, item.value);
            if (success) successCount++;
        }

        setSaving(false);
        if (successCount > 0) {
            alert("Content updated successfully!");
        }
    }

    if (loading) return (
        <div className="p-8 flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" /> Loading CMS data...
        </div>
    );

    const heroSection = content.filter(c => c.section === 'hero');
    const pricingSection = content.filter(c => c.section === 'pricing');

    // Helper to check if current user can edit specific item
    const canEdit = (item: CMSContent) => {
        if (item.editableBy === 'developer') return isDeveloper;
        // logic: if editableBy is 'admin' (default if undefined), both admin and developer can edit.
        return true;
    };

    return (
        <div className="space-y-6 animate-in fade-in max-w-4xl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
                    <p className="text-slate-500 mt-1">Edit website content directly.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>Changes made here will be instantly visible on the live website.</p>
            </div>

            {/* Hero Section */}
            {heroSection.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Hero Section</h3>

                    {heroSection.map(item => (
                        <div key={item.id} className={canEdit(item) ? "" : "opacity-50 pointer-events-none"}>
                            <div className="flex justify-between">
                                <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                                    {item.key}
                                </label>
                                {!canEdit(item) && <span className="text-xs text-slate-400">Developer Only</span>}
                            </div>
                            <textarea
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[80px]"
                                value={item.value}
                                onChange={(e) => handleUpdate(item.id, e.target.value)}
                                disabled={!canEdit(item)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Pricing Section */}
            {pricingSection.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Pricing Section</h3>

                    {pricingSection.map(item => (
                        <div key={item.id} className={canEdit(item) ? "" : "opacity-50 pointer-events-none"}>
                            <div className="flex justify-between">
                                <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                                    {item.key}
                                </label>
                                {!canEdit(item) && <span className="text-xs text-slate-400">Developer Only</span>}
                            </div>
                            <Input
                                value={item.value}
                                onChange={(e) => handleUpdate(item.id, e.target.value)}
                                disabled={!canEdit(item)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {content.length === 0 && (
                <div className="text-center p-12 text-slate-500">
                    No content found in Firestore 'content' collection. run a seed script or add documents manually.
                </div>
            )}
        </div>
    );
}
