"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlusCircle, Search, Edit, Trash2, Package } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Bundle } from "@/types/admin";
import Link from "next/link";
import { Input } from "@/components/ui/Input";

export function BundlesTab() {
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadBundles();
    }, []);

    async function loadBundles() {
        setLoading(true);
        const data = await firestoreService.getBundles();
        setBundles(data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to deactivate this bundle?")) {
            await firestoreService.updateBundle(id, { isActive: false });
            loadBundles();
        }
    }

    const filteredBundles = bundles.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto">
                    <Link href="/admin/bundles/new">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200">
                            <PlusCircle className="h-4 w-4" /> Create New Bundle
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                {/* Filters */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search bundles..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Tests Included</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBundles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        {loading ? "Loading bundles..." : "No bundles found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredBundles.map((bundle) => (
                                    <tr key={bundle.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{bundle.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">
                                                {bundle.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                                                <Package className="h-3 w-3" />
                                                {bundle.includedTests?.length || 0} Tests
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            ₹{bundle.price}
                                            {bundle.originalPrice && (
                                                <span className="text-xs text-slate-400 line-through ml-2">₹{bundle.originalPrice}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bundle.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {bundle.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/bundles/${bundle.id}`}>
                                                    <Button variant="outline" size="sm" className="h-9 w-9 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border-slate-200" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 border-slate-200"
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
                <div className="sm:hidden divide-y divide-slate-100">
                    {filteredBundles.map((bundle) => (
                        <div key={bundle.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-slate-900">{bundle.name}</h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${bundle.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {bundle.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <Link href={`/admin/bundles/${bundle.id}`}>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                        onClick={() => handleDelete(bundle.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>{bundle.includedTests?.length || 0} Tests</span>
                                <span className="font-medium text-slate-900">₹{bundle.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
