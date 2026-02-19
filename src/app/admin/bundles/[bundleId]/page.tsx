"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Save, Loader2, Check } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Bundle, Test } from "@/types/admin";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function BundleEditorPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
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
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Basic Information</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Bundle Name</label>
                                <Input
                                    value={bundle.name}
                                    onChange={(e) => setBundle({ ...bundle, name: e.target.value })}
                                    placeholder="e.g., Complete Science Mock Package"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px]"
                                    value={bundle.description}
                                    onChange={(e) => setBundle({ ...bundle, description: e.target.value })}
                                    placeholder="What does this bundle include?"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Test Selection */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h3 className="font-semibold text-slate-900">Included Tests</h3>
                            <span className="text-sm text-slate-500">{bundle.includedTests?.length || 0} selected</span>
                        </div>

                        <div className="relative">
                            <Input
                                placeholder="Search tests to include..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mb-4"
                            />
                        </div>

                        <div className="max-h-[400px] overflow-y-auto space-y-2 border border-slate-100 rounded-lg p-2">
                            {filteredTests.map(test => {
                                const isSelected = bundle.includedTests?.includes(test.id);
                                return (
                                    <div
                                        key={test.id}
                                        onClick={() => toggleTestSelection(test.id)}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border ${isSelected
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                                            }`}
                                    >
                                        <div>
                                            <p className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{test.title}</p>
                                            <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                                                <span>{test.questions?.length || 0} Qs</span>
                                                <span>•</span>
                                                <span>{test.category}</span>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="bg-blue-600 rounded-full p-1 text-white">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {filteredTests.length === 0 && (
                                <p className="text-center text-slate-500 py-4 text-sm">No tests found matching search.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Pricing</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                <Input
                                    type="number"
                                    value={bundle.price}
                                    onChange={(e) => setBundle({ ...bundle, price: parseFloat(e.target.value) })}
                                    min={0}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Original Price (₹)</label>
                                <Input
                                    type="number"
                                    value={bundle.originalPrice}
                                    onChange={(e) => setBundle({ ...bundle, originalPrice: parseFloat(e.target.value) })}
                                    min={0}
                                    placeholder="Optional (for strike-through)"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
