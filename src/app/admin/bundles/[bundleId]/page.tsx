"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Bundle, Test } from "@/types/admin";
import Link from "next/link";
import { BundleBasicInfo } from "@/components/admin/bundles/BundleBasicInfo";
import { BundleTestSelection } from "@/components/admin/bundles/BundleTestSelection";
import { BundlePricing } from "@/components/admin/bundles/BundlePricing";


export default function BundleEditorPage() {
    const params = useParams();
    const router = useRouter();

    const bundleId = params.bundleId as string;
    const isNew = bundleId === 'new';

    const [bundle, setBundle] = useState<Partial<Bundle>>({
        name: "",
        description: "",
        includedTests: [],
        price: 0,
        originalPrice: 0,
        isActive: false
    });

    const [allTests, setAllTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, [bundleId]);

    async function loadData() {
        setLoading(true);
        // Load all tests for selection
        const tests = await firestoreService.getTests();
        setAllTests(tests);

        if (!isNew) {
            const found = await firestoreService.getBundle(bundleId);
            if (found) {
                setBundle(found);
            } else {
                router.push("/admin/management?tab=bundles");
            }
        }
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        try {
            if (isNew) {
                await firestoreService.createBundle(bundle);
            } else {
                await firestoreService.updateBundle(bundleId, bundle);
            }
            router.push("/admin/management?tab=bundles");
        } catch (error) {
            console.error("Failed to save bundle:", error);
            alert("Failed to save bundle. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    function toggleTestSelection(testId: string) {
        const currentSelected = bundle.includedTests || [];
        const isSelected = currentSelected.includes(testId);

        let newSelected;
        if (isSelected) {
            newSelected = currentSelected.filter(id => id !== testId);
        } else {
            newSelected = [...currentSelected, testId];
        }

        setBundle({ ...bundle, includedTests: newSelected });
    }

    if (loading) return (
        <div className="p-8 flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" /> Loading...
        </div>
    );

    const filteredTests = allTests.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/management?tab=bundles">
                        <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isNew ? "Create New Bundle" : `Edit ${bundle.name}`}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={bundle.isActive ? "primary" : "outline"}
                        className={bundle.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                        onClick={() => setBundle({ ...bundle, isActive: !bundle.isActive })}
                    >
                        {bundle.isActive ? 'Active' : 'Inactive'}
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Bundle"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <BundleBasicInfo bundle={bundle} setBundle={setBundle} />

                    {/* Test Selection */}
                    <BundleTestSelection
                        bundle={bundle}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filteredTests={filteredTests}
                        toggleTestSelection={toggleTestSelection}
                    />
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <BundlePricing bundle={bundle} setBundle={setBundle} />
                </div>
            </div>
        </div>
    );
}
