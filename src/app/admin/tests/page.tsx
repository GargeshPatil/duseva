"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Loader2, RefreshCw } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Test } from "@/types/admin";
import Link from "next/link";
import { Input } from "@/components/ui/Input";

export default function TestManagementPage() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadTests();
    }, []);

    async function loadTests() {
        setLoading(true);
        const data = await firestoreService.getTests();
        setTests(data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
            const success = await firestoreService.deleteTest(id);
            if (success) {
                loadTests();
            } else {
                alert("Failed to delete test. Please try again.");
            }
        }
    }

    const filteredTests = tests.filter(test =>
        (test.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (test.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Test Management</h1>
                    <p className="text-slate-500 mt-1">Create, edit, and manage mock tests.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadTests} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Link href="/admin/tests/new">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <PlusCircle className="h-4 w-4" /> Create Test
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search tests..."
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
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Attempts</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                            Loading tests...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No tests found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredTests.map((test) => (
                                    <tr key={test.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{test.title}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-xs">{test.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                {test.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium ${test.price === 'paid' ? 'text-green-600' : 'text-slate-600'}`}>
                                                {test.price === 'paid' ? 'Paid' : 'Free'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`
                        flex items-center gap-1.5 text-xs font-medium
                        ${test.status === 'published' ? 'text-green-600' : 'text-slate-500'}
                      `}>
                                                <span className={`h-2 w-2 rounded-full ${test.status === 'published' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                                                {test.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {test.attempts}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/tests/${test.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                                                    onClick={() => handleDelete(test.id)}
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
            </div>
        </div>
    );
}
