"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlusCircle, Search, Edit, Trash2, Package, RefreshCw, Loader2 } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Bundle } from "@/types/admin";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { motion, Variants } from "framer-motion";

export function BundlesTab() {
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    async function loadBundles() {
        setLoading(true);
        try {
            const data = await firestoreService.getBundles();
            setBundles(data);
        } catch (error) {
            console.error("Failed to load bundles:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadBundles();
    }, []);

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to deactivate this bundle?")) {
            await firestoreService.updateBundle(id, { isActive: false });
            loadBundles();
        }
    }

    const filteredBundles = bundles.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-3 w-full sm:w-auto flex-wrap">
                    <Button
                        variant="secondary"
                        onClick={loadBundles}
                        disabled={loading}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-11 px-4 gap-2 transition-all shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Link href="/admin/bundles/new">
                        <Button className="bg-cta-primary hover:bg-cta-hover text-white border border-transparent rounded-xl h-11 px-4 gap-2 transition-all shadow-[0_0_15px_rgba(var(--cta-primary-rgb),0.3)]">
                            <PlusCircle className="h-4 w-4" /> Create New Bundle
                        </Button>
                    </Link>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col relative">
                {/* Filters */}
                <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 bg-surface-elevated/30">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <Input
                            placeholder="Search bundles by name..."
                            className="pl-11 h-12 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-cta-primary/50 rounded-xl w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-black/20 text-white/60 font-semibold border-b border-white/10">
                            <tr>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px] w-[50%]">Name & Description</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Included Tests</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Price</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Status</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-cta-primary" />
                                            <span className="text-white/50 font-medium tracking-wide">Fetching bundles...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBundles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 border border-white/10">
                                            <Package className="h-6 w-6 text-white/40" />
                                        </div>
                                        <div className="text-white/70 font-medium text-lg">No bundles found</div>
                                        <div className="text-white/40 text-sm mt-1">Try adjusting your filters or search query.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBundles.map((bundle) => (
                                    <tr key={bundle.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white tracking-wide">{bundle.name}</div>
                                            <div className="text-[11px] text-white/40 mt-1 max-w-sm truncate whitespace-normal">
                                                {bundle.description || "No description provided"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white/60">
                                            <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium">
                                                <Package className="h-3.5 w-3.5 text-cta-primary" />
                                                <span className="text-white font-bold">{bundle.includedTests?.length || 0}</span> Tests
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white tracking-tight">₹{bundle.price}</span>
                                                {bundle.originalPrice && (
                                                    <span className="text-xs text-white/30 line-through">₹{bundle.originalPrice}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border
                                                ${bundle.isActive
                                                    ? 'bg-semantic-success/10 text-emerald-400 border-semantic-success/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                                    : 'bg-white/5 text-white/50 border-white/10'
                                                }`}>
                                                {bundle.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/bundles/${bundle.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors border border-transparent hover:border-indigo-500/20" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                                    onClick={() => handleDelete(bundle.id)}
                                                    title="Deactivate"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="sm:hidden divide-y divide-white/5">
                    {loading ? (
                        <div className="px-6 py-12 text-center text-white/50">
                            <div className="flex justify-center items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-cta-primary" />
                                Loading...
                            </div>
                        </div>
                    ) : filteredBundles.length === 0 ? (
                        <div className="px-6 py-12 text-center text-white/50">No bundles found.</div>
                    ) : (
                        filteredBundles.map((bundle) => (
                            <div key={bundle.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-white">{bundle.name}</h3>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider mt-2 border
                                            ${bundle.isActive
                                                ? 'bg-semantic-success/10 text-emerald-400 border-semantic-success/20'
                                                : 'bg-white/5 text-white/50 border-white/10'
                                            }`}>
                                            {bundle.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 shrink-0 bg-black/20 border border-white/5 rounded-lg p-1">
                                        <Link href={`/admin/bundles/${bundle.id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-white/40 hover:text-rose-400"
                                            onClick={() => handleDelete(bundle.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-md text-white/60 text-xs font-medium">
                                        <Package className="h-3 w-3 text-cta-primary" />
                                        <span className="text-white font-bold">{bundle.includedTests?.length || 0}</span> Tests
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {bundle.originalPrice && (
                                            <span className="text-xs text-white/30 line-through">₹{bundle.originalPrice}</span>
                                        )}
                                        <span className="font-bold text-white">₹{bundle.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
