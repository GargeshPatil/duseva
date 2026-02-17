"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlusCircle, Search, Edit, Trash2, Eye, Play, BarChart2, Filter } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Test } from "@/types/admin";
import Link from "next/link";
import { Input } from "@/components/ui/Input";

export default function TestsPage() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [streamFilter, setStreamFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

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
        if (confirm("Are you sure you want to delete this test?")) {
            const success = await firestoreService.deleteTest(id);
            if (success) loadTests();
        }
    }

    const filteredTests = tests.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStream = streamFilter ? t.stream === streamFilter : true;
        const matchesCategory = categoryFilter ? t.category === categoryFilter : true;
        return matchesSearch && matchesStream && matchesCategory;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Test Management</h1>
                    <p className="text-slate-500 mt-1">Create, edit, and organize assessments.</p>
                </div>
                <Link href="/admin/tests/new">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200">
                        <PlusCircle className="h-4 w-4" /> Create New Test
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                {/* Filters */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search tests..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none w-full sm:w-auto"
                        value={streamFilter}
                        onChange={(e) => setStreamFilter(e.target.value)}
                    >
                        <option value="">All Streams</option>
                        <option value="Science">Science</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Humanities">Humanities</option>
                        <option value="General">General</option>
                    </select>
                    <select
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none w-full sm:w-auto"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="Full Mock">Full Mock</option>
                        <option value="Subject">Subject Test</option>
                        <option value="General">General Test</option>
                    </select>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Stream</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Questions</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        {loading ? "Loading tests..." : "No tests found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredTests.map((test) => (
                                    <tr key={test.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{test.title}</div>
                                            <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">
                                                {test.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                                                {test.stream || "General"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {test.category}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {test.questions?.length || test.questionIds?.length || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${test.status === 'published'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {test.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/test/${test.id}`} target="_blank">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600" title="Preview">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/tests/${test.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                                    onClick={() => handleDelete(test.id)}
                                                    title="Delete"
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
                    {filteredTests.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                            {loading ? "Loading tests..." : "No tests found."}
                        </div>
                    ) : (
                        filteredTests.map((test) => (
                            <div key={test.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-slate-900">{test.title}</h3>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${test.status === 'published'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {test.status === 'published' ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Link href={`/admin/tests/${test.id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                            onClick={() => handleDelete(test.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-xs text-slate-500">
                                    <span className="bg-slate-100 px-2 py-1 rounded">{test.stream || "General"}</span>
                                    <span className="bg-slate-100 px-2 py-1 rounded">{test.category}</span>
                                    <span className="bg-slate-100 px-2 py-1 rounded">{test.questions?.length || test.questionIds?.length || 0} Qs</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
