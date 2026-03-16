"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Eye,
  Layers,
  RefreshCw,
  Loader2
} from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Test } from "@/types/admin";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { motion, Variants } from "framer-motion";

export function TestsTab() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [streamFilter, setStreamFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const { user, userData } = useAuth(); // Get auth context

    useEffect(() => {
        if (user && userData) {
            console.log("TestsTab: User:", user.uid, "Role:", userData.role);
            console.log("TestsTab: Loading tests...");
            loadTests();
        } else {
            console.log("TestsTab: Waiting for auth...");
        }
    }, [user, userData]);

    async function loadTests() {
        setLoading(true);
        try {
            const data = await firestoreService.getTests();
            console.log("TestsTab: Fetched tests:", data.length);
            setTests(data);
        } catch (err) {
            console.error("TestsTab: Permission Error?", err);
        }
        setLoading(false);
    }

    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    async function handleBulkAction(action: 'publish' | 'draft' | 'delete') {
        if (!confirm(`Are you sure you want to ${action} ${selectedTests.length} tests?`)) return;

        setIsBulkUpdating(true);
        try {
            const promises = selectedTests.map(id => {
                if (action === 'delete') return firestoreService.deleteTest(id);
                return firestoreService.updateTest(id, { status: action === 'publish' ? 'published' : 'draft' });
            });

            await Promise.all(promises);
            await loadTests();
            setSelectedTests([]); // Clear selection
        } catch (error) {
            console.error("Bulk action failed:", error);
            alert("Some items failed to update. Check console.");
        } finally {
            setIsBulkUpdating(false);
        }
    }

    const toggleSelectAll = () => {
        if (selectedTests.length === filteredTests.length && filteredTests.length > 0) {
            setSelectedTests([]);
        } else {
            setSelectedTests(filteredTests.map(t => t.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedTests(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to delete this test?")) {
            const success = await firestoreService.deleteTest(id);
            if (success) loadTests();
        }
    }

    const filteredTests = tests.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStream = streamFilter ? t.streams?.includes(streamFilter) : true;
        const matchesCategory = categoryFilter ? t.category === categoryFilter : true;
        return matchesSearch && matchesStream && matchesCategory;
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
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-3 w-full sm:w-auto flex-wrap">
                    <Button
                        variant="secondary"
                        onClick={loadTests}
                        disabled={loading}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-11 px-4 gap-2 transition-all shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Link href="/admin/tests/new">
                        <Button className="bg-cta-primary hover:bg-cta-hover text-white border border-transparent rounded-xl h-11 px-4 gap-2 transition-all shadow-[0_0_15px_rgba(var(--cta-primary-rgb),0.3)]">
                            <PlusCircle className="h-4 w-4" /> Create New Test
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
                            placeholder="Search tests..."
                            className="pl-11 h-12 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-cta-primary/50 rounded-xl w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-12 px-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none w-full sm:w-48 appearance-none focus:ring-2 focus:ring-cta-primary/50 transition-all cursor-pointer hover:bg-white/5"
                        value={streamFilter}
                        onChange={(e) => setStreamFilter(e.target.value)}
                    >
                        <option value="" className="bg-surface-card text-white">All Streams</option>
                        <option value="Science" className="bg-surface-card text-white">Science</option>
                        <option value="Commerce" className="bg-surface-card text-white">Commerce</option>
                        <option value="Humanities" className="bg-surface-card text-white">Humanities</option>
                        <option value="General" className="bg-surface-card text-white">General</option>
                        <option value="English" className="bg-surface-card text-white">English</option>
                    </select>
                    <select
                        className="h-12 px-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none w-full sm:w-48 appearance-none focus:ring-2 focus:ring-cta-primary/50 transition-all cursor-pointer hover:bg-white/5"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="" className="bg-surface-card text-white">All Categories</option>
                        <option value="Full Mock" className="bg-surface-card text-white">Full Mock</option>
                        <option value="Subject" className="bg-surface-card text-white">Subject Test</option>
                        <option value="General" className="bg-surface-card text-white">General Test</option>
                    </select>
                </div>

                {/* Bulk Actions Bar */}
                {selectedTests.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-indigo-500/10 border-b border-indigo-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                        <div className="text-sm text-indigo-300 font-bold flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            {selectedTests.length} test{selectedTests.length > 1 ? 's' : ''} selected
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleBulkAction('publish')}
                                disabled={isBulkUpdating}
                                className="w-full sm:w-auto bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all rounded-lg"
                            >
                                Publish
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleBulkAction('draft')}
                                disabled={isBulkUpdating}
                                className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all rounded-lg"
                            >
                                Unpublish
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleBulkAction('delete')}
                                disabled={isBulkUpdating}
                                className="w-full sm:w-auto rounded-lg shadow-sm bg-semantic-error/80 border-transparent hover:bg-semantic-error text-white"
                            >
                                {isBulkUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-black/20 text-white/60 font-semibold border-b border-white/10">
                            <tr>
                                <th className="px-6 py-5 w-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-white/20 bg-black/50 w-4 h-4 cursor-pointer accent-cta-primary focus:ring-cta-primary/50"
                                        checked={selectedTests.length > 0 && selectedTests.length === filteredTests.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px] w-[35%]">Title</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Streams</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Category</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Questions</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Status</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-cta-primary" />
                                            <span className="text-white/50 font-medium tracking-wide">Fetching tests...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 border border-white/10">
                                            <Search className="h-6 w-6 text-white/40" />
                                        </div>
                                        <div className="text-white/70 font-medium text-lg">No tests found</div>
                                        <div className="text-white/40 text-sm mt-1">Try adjusting your filters or search query.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTests.map((test) => (
                                    <tr key={test.id} className={`hover:bg-white/5 transition-colors group ${selectedTests.includes(test.id) ? 'bg-indigo-500/10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-white/20 bg-black/50 w-4 h-4 cursor-pointer accent-cta-primary focus:ring-cta-primary/50"
                                                checked={selectedTests.includes(test.id)}
                                                onChange={() => toggleSelect(test.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/tests/${test.id}`} className="font-bold text-white tracking-wide hover:text-cta-primary transition-colors inline-block">
                                                {test.title}
                                            </Link>
                                            <div className="text-[11px] text-white/40 mt-1 max-w-xs truncate font-medium">
                                                {test.description || "No description provided"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {test.streams?.map(s => (
                                                    <span key={s} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-white/70 uppercase tracking-wider font-bold">
                                                        {s}
                                                    </span>
                                                )) || <span className="text-white/40 italic">General</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs bg-black/40 border border-white/10 px-2 py-1 rounded-md text-white/60 font-medium">
                                                {test.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-white/80">
                                                {test.questions?.length || test.questionIds?.length || 0}
                                            </span>
                                            <span className="text-white/40 ml-1 text-xs">Qs</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border
                                                ${test.status === 'published'
                                                    ? 'bg-semantic-success/10 text-emerald-400 border-semantic-success/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                                    : 'bg-white/5 text-white/50 border-white/10'
                                                }`}>
                                                {test.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/test/${test.id}`} target="_blank">
                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10" title="Preview">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/tests/${test.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors border border-transparent hover:border-indigo-500/20" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
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
                <div className="sm:hidden divide-y divide-white/5">
                    {loading ? (
                        <div className="px-6 py-12 text-center text-white/50">
                            <div className="flex justify-center items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-cta-primary" />
                                Loading...
                            </div>
                        </div>
                    ) : filteredTests.length === 0 ? (
                        <div className="px-6 py-12 text-center text-white/50">No tests found.</div>
                    ) : (
                        filteredTests.map((test) => (
                            <div key={test.id} className={`p-4 space-y-3 transition-colors ${selectedTests.includes(test.id) ? 'bg-indigo-500/5' : ''}`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-white/20 bg-black/50 mt-1 cursor-pointer accent-cta-primary"
                                        checked={selectedTests.includes(test.id)}
                                        onChange={() => toggleSelect(test.id)}
                                    />
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Link href={`/admin/tests/${test.id}`}>
                                                    <h3 className="font-bold text-white hover:text-cta-primary transition-colors">{test.title}</h3>
                                                </Link>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider mt-2 border
                                                    ${test.status === 'published'
                                                        ? 'bg-semantic-success/10 text-emerald-400 border-semantic-success/20'
                                                        : 'bg-white/5 text-white/50 border-white/10'
                                                    }`}>
                                                    {test.status === 'published' ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                            <div className="flex gap-1 shrink-0 bg-black/20 border border-white/5 rounded-lg p-1">
                                                <Link href={`/admin/tests/${test.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-white/40 hover:text-rose-400"
                                                    onClick={() => handleDelete(test.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 text-[10px] uppercase tracking-wider font-bold text-white/60 overflow-x-auto pb-1">
                                            {test.streams?.map(s => (
                                                <span key={s} className="bg-white/5 border border-white/10 px-2 py-1 rounded-md shrink-0">{s}</span>
                                            )) || <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md shrink-0">General</span>}
                                            <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md shrink-0">{test.category}</span>
                                            <span className="bg-black/40 border border-white/10 px-2 py-1 rounded-md shrink-0">{test.questions?.length || test.questionIds?.length || 0} Qs</span>
                                        </div>
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
