"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Save, Loader2, DollarSign, Package, FileText, RefreshCw } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Test, Bundle } from "@/types/admin";
import { motion, Variants } from "framer-motion";

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
        try {
            const [tests, bundles] = await Promise.all([
                firestoreService.getTests(),
                firestoreService.getBundles()
            ]);

            // Filter for paid items or items that can have price
            const paidTests = tests.filter(t => t.price === 'paid');

            // Combine them into a uniform list
            const combined = [...paidTests, ...bundles];
            setItems(combined);
        } catch (error) {
            console.error("Failed to load pricing data:", error);
        } finally {
            setLoading(false);
        }
    }

    const handlePriceChange = (id: string, field: 'price' | 'originalPrice', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) && value !== '') return;

        setEdits(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value === '' ? 0 : numValue
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

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-center gap-4">
                <Button
                    variant="secondary"
                    onClick={loadData}
                    disabled={loading}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-11 px-4 gap-2 transition-all shadow-sm"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
                </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col relative">
                <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 bg-surface-elevated/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <Input
                            placeholder="Search paid tests and bundles..."
                            className="pl-11 h-12 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-cta-primary/50 rounded-xl w-full transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                        <thead className="bg-black/20 text-white/60 font-semibold border-b border-white/10">
                            <tr>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px] w-[40%]">Item Name</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Type</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px] w-32">Price (₹)</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px] w-32">Original (₹)</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-cta-primary" />
                                            <span className="text-white/50 font-medium tracking-wide">Loading pricing data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 border border-white/10">
                                            <DollarSign className="h-6 w-6 text-white/40" />
                                        </div>
                                        <div className="text-white/70 font-medium text-lg">No paid items found</div>
                                        <div className="text-white/40 text-sm mt-1">Try adjusting your search query.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const isTest = 'title' in item;
                                    const currentPrice = edits[item.id]?.price ?? (isTest ? ((item as Test).priceAmount || 0) : ((item as Bundle).price || 0));
                                    const currentOriginal = edits[item.id]?.originalPrice ?? (isTest ? 0 : ((item as Bundle).originalPrice || 0));
                                    const hasChanges = !!edits[item.id];

                                    return (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white tracking-wide truncate max-w-[300px]" title={isTest ? (item as Test).title : (item as Bundle).name}>
                                                    {isTest ? (item as Test).title : (item as Bundle).name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border
                                                    ${isTest ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                                                    {isTest ? <FileText className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                                                    {isTest ? 'Test' : 'Bundle'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative flex items-center">
                                                    <span className="absolute left-3 font-semibold text-white/40">₹</span>
                                                    <Input
                                                        type="number"
                                                        className={`pl-8 h-10 w-28 bg-black/40 border-white/10 text-white font-bold rounded-xl focus-visible:ring-emerald-500/50 transition-colors ${hasChanges ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
                                                        value={currentPrice}
                                                        onChange={(e) => handlePriceChange(item.id, 'price', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {!isTest ? (
                                                    <div className="relative flex items-center">
                                                        <span className="absolute left-3 font-semibold text-white/40">₹</span>
                                                        <Input
                                                            type="number"
                                                            className={`pl-8 h-10 w-28 bg-black/40 border-white/10 text-white/70 rounded-xl focus-visible:ring-white/20 transition-colors ${hasChanges && edits[item.id]?.originalPrice !== undefined ? 'border-indigo-500/50 bg-indigo-500/5' : ''}`}
                                                            value={currentOriginal}
                                                            onChange={(e) => handlePriceChange(item.id, 'originalPrice', e.target.value)}
                                                            placeholder="-"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-white/20 ml-4">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end min-h-[40px] items-center">
                                                    {hasChanges ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => savePrice(item)}
                                                            disabled={savingId === item.id}
                                                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl px-4 gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                                        >
                                                            {savingId === item.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Save className="h-4 w-4" /> Save
                                                                </>
                                                            )}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-white/20 text-xs italic px-2">Up to date</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
