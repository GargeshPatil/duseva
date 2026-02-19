"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Save, Loader2, DollarSign } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Test, Bundle } from "@/types/admin";

export function PricingTab() {
    const [items, setItems] = useState<(Test | Bundle)[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [savingId, setSavingId] = useState<string | null>(null);

    // Local edit state
    const [edits, setEdits] = useState<Record<string, { price: number; originalPrice?: number }>>({});

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [tests, bundles] = await Promise.all([
            firestoreService.getTests(),
            firestoreService.getBundles()
        ]);

        // Filter for paid items or items that can have price
        const paidTests = tests.filter(t => t.price === 'paid');

        // Combine them into a uniform list
        const combined = [...paidTests, ...bundles];
        setItems(combined);
        setLoading(false);
    }

    const handlePriceChange = (id: string, field: 'price' | 'originalPrice', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        setEdits(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: numValue
            }
        }));
    };

    const savePrice = async (item: Test | Bundle) => {
        const updates = edits[item.id];
        if (!updates) return;

        setSavingId(item.id);
        try {
            if ('title' in item) { // It's a Test
                await firestoreService.updateTest(item.id, {
                    priceAmount: updates.price,
                    // Tests don't have originalPrice in my schema yet, but Bundles do. 
                    // Ignoring originalPrice for tests unless schema updated.
                });
            } else { // It's a Bundle
                await firestoreService.updateBundle(item.id, {
                    price: updates.price,
                    originalPrice: updates.originalPrice
                });
            }
            alert("Price updated!");
            // Clear edit state for this item or reload? 
            // Reloading ensures sync
            loadData();
            setEdits(prev => {
                const newEdits = { ...prev };
                delete newEdits[item.id];
                return newEdits;
            });
        } catch (error) {
            console.error("Failed to update price", error);
            alert("Failed to update price.");
        } finally {
            setSavingId(null);
        }
    };

    const filteredItems = items.filter(item => {
        const name = 'title' in item ? item.title : item.name;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search paid tests and bundles..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Item Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 w-32">Price (₹)</th>
                                <th className="px-6 py-4 w-32">Original (₹)</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading pricing data...</td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No paid items found.</td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const isTest = 'title' in item;
                                    const currentPrice = edits[item.id]?.price ?? (isTest ? (item as Test).priceAmount : (item as Bundle).price);
                                    const currentOriginal = edits[item.id]?.originalPrice ?? (isTest ? 0 : (item as Bundle).originalPrice);
                                    const hasChanges = !!edits[item.id];

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {isTest ? (item as Test).title : (item as Bundle).name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${isTest ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {isTest ? 'Test' : 'Bundle'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-2.5 h-3 w-3 text-slate-400" />
                                                    <Input
                                                        type="number"
                                                        className="pl-6 h-8 w-24"
                                                        value={currentPrice || 0}
                                                        onChange={(e) => handlePriceChange(item.id, 'price', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {!isTest && (
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-2 top-2.5 h-3 w-3 text-slate-400" />
                                                        <Input
                                                            type="number"
                                                            className="pl-6 h-8 w-24"
                                                            value={currentOriginal || 0}
                                                            onChange={(e) => handlePriceChange(item.id, 'originalPrice', e.target.value)}
                                                            placeholder="-"
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {hasChanges && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => savePrice(item)}
                                                        disabled={savingId === item.id}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        {savingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
