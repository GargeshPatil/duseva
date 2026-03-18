"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Upload,
  Layers
} from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Question } from "@/types/admin";
import { Input } from "@/components/ui/Input";
import { CSVImportModal } from "@/components/admin/questions/CSVImportModal";
import { AddToTestModal } from "@/components/admin/questions/AddToTestModal";
import { QuestionEditorModal } from "./QuestionEditorModal";
import { motion, Variants } from "framer-motion";

export function QuestionsTab() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [streamFilter, setStreamFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

    // Selection State
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [isAddToTestModalOpen, setIsAddToTestModalOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);

    useEffect(() => {
        loadQuestions();
    }, []);

    async function loadQuestions() {
        setLoading(true);
        try {
            const data = await firestoreService.getQuestions();
            setQuestions(data);
        } catch (error) {
            console.error("Failed to load questions:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
            const success = await firestoreService.deleteQuestion(id);
            if (success) {
                loadQuestions();
                setSelectedQuestions(prev => prev.filter(qId => qId !== id));
            } else {
                alert("Failed to delete question. Please try again.");
            }
        }
    }

    async function handleBulkDelete() {
        if (confirm(`Are you sure you want to delete ${selectedQuestions.length} questions? This cannot be undone.`)) {
            setIsBulkDeleting(true);
            try {
                const success = await firestoreService.batchDeleteQuestions(selectedQuestions);
                if (success) {
                    await loadQuestions();
                    setSelectedQuestions([]);
                } else {
                    alert("Failed to delete some questions.");
                }
            } catch (error) {
                console.error("Bulk delete failed", error);
            } finally {
                setIsBulkDeleting(false);
            }
        }
    }

    async function handleMigrate() {
        if (confirm("This will scan and update all legacy questions to the new Mocks engine schema (assigning 'mcq' type, fixing empty options, etc). Continue?")) {
            setIsMigrating(true);
            try {
                const result = await firestoreService.runMigration();
                alert(`Migration Complete. Updated ${result.success} questions.`);
                loadQuestions();
            } catch (error) {
                console.error(error);
                alert("Migration encountered an error.");
            } finally {
                setIsMigrating(false);
            }
        }
    }

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = (q.text?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (q.testId?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesStream = streamFilter ? q.stream === streamFilter : true;
        const matchesSubject = subjectFilter ? (q.subject || "").toLowerCase().includes(subjectFilter.toLowerCase()) : true;

        return matchesSearch && matchesStream && matchesSubject;
    });

    const toggleSelectAll = () => {
        if (selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0) {
            setSelectedQuestions([]);
        } else {
            setSelectedQuestions(filteredQuestions.map(q => q.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedQuestions(prev =>
            prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
        );
    };

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
                        onClick={loadQuestions}
                        disabled={loading}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-11 px-4 gap-2 transition-all shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl h-11 px-4 gap-2 transition-all shadow-sm"
                    >
                        <Upload className="h-4 w-4" /> Import CSV
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleMigrate}
                        disabled={isMigrating}
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl h-11 px-4 gap-2 transition-all shadow-sm"
                    >
                        {isMigrating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />} Fix Existing Data
                    </Button>
                    <Button
                        onClick={() => setEditingQuestionId('new')}
                        className="bg-cta-primary hover:bg-cta-hover text-white border border-transparent rounded-xl h-11 px-4 gap-2 transition-all shadow-[0_0_15px_rgba(var(--cta-primary-rgb),0.3)]"
                    >
                        <PlusCircle className="h-4 w-4" /> Add Question
                    </Button>
                </div>
            </motion.div>

            <CSVImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    loadQuestions();
                }}
            />

            <AddToTestModal
                isOpen={isAddToTestModalOpen}
                onClose={() => setIsAddToTestModalOpen(false)}
                questionIds={selectedQuestions}
                onSuccess={() => {
                    setSelectedQuestions([]);
                    loadQuestions(); // Optional: Reload if we show test assignments in table
                }}
            />

            <QuestionEditorModal
                isOpen={editingQuestionId !== null}
                onClose={() => setEditingQuestionId(null)}
                questionId={editingQuestionId === 'new' ? null : editingQuestionId}
                onSuccess={() => {
                    setEditingQuestionId(null);
                    loadQuestions();
                }}
            />

            <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col relative">
                {/* Search & Filters */}
                <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 bg-surface-elevated/30">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <Input
                            placeholder="Search questions by text or test ID..."
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
                    </select>
                    <Input
                        placeholder="Subject filter..."
                        className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-cta-primary/50 rounded-xl w-full sm:w-48"
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                    />
                </div>

                {/* Bulk Actions Bar */}
                {selectedQuestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-indigo-500/10 border-b border-indigo-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                        <div className="text-sm text-indigo-300 font-bold flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            {selectedQuestions.length} question{selectedQuestions.length > 1 ? 's' : ''} selected
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setIsAddToTestModalOpen(true)}
                                className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all rounded-lg shadow-sm"
                            >
                                Add to Test
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="w-full sm:w-auto rounded-lg shadow-sm bg-semantic-error/80 border-transparent hover:bg-semantic-error text-white"
                            >
                                {isBulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Selected"}
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
                                        checked={selectedQuestions.length > 0 && selectedQuestions.length === filteredQuestions.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px] w-[50%] whitespace-normal">Question Text</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Test ID</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Type/Diff</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-cta-primary" />
                                            <span className="text-white/50 font-medium tracking-wide">Fetching questions...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredQuestions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 border border-white/10">
                                            <Search className="h-6 w-6 text-white/40" />
                                        </div>
                                        <div className="text-white/70 font-medium text-lg">No questions found</div>
                                        <div className="text-white/40 text-sm mt-1">Try adjusting your filters or search query.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredQuestions.map((q) => (
                                    <tr
                                        key={q.id}
                                        className={`hover:bg-white/5 transition-colors group ${selectedQuestions.includes(q.id) ? 'bg-indigo-500/10' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-white/20 bg-black/50 w-4 h-4 cursor-pointer accent-cta-primary focus:ring-cta-primary/50"
                                                checked={selectedQuestions.includes(q.id)}
                                                onChange={() => toggleSelect(q.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white/90 line-clamp-2 max-w-[400px] whitespace-normal" title={q.text}>
                                                {q.text}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[10px] text-white/60 bg-black/40 border border-white/10 px-2 py-1 rounded-md uppercase">
                                                {q.testId || "Unassigned"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/60 flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border
                                                    ${q.difficulty === 'Hard' ? 'bg-semantic-error/10 text-rose-400 border-semantic-error/30' :
                                                    q.difficulty === 'Easy' ? 'bg-semantic-success/10 text-emerald-400 border-semantic-success/30' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                                                {q.difficulty || 'Medium'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10" onClick={() => setEditingQuestionId(q.id)} title="Edit">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                                    onClick={() => handleDelete(q.id)}
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
                    ) : filteredQuestions.length === 0 ? (
                        <div className="px-6 py-12 text-center text-white/50">No questions found.</div>
                    ) : (
                        filteredQuestions.map((q) => (
                            <div key={q.id} className={`p-4 space-y-3 transition-colors ${selectedQuestions.includes(q.id) ? 'bg-indigo-500/5' : ''}`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-white/20 bg-black/50 mt-1 cursor-pointer accent-cta-primary"
                                        checked={selectedQuestions.includes(q.id)}
                                        onChange={() => toggleSelect(q.id)}
                                    />
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="pr-4">
                                                <p className="font-medium text-white/90 line-clamp-3 text-sm">{q.text}</p>
                                            </div>
                                            <div className="flex gap-1 shrink-0 bg-black/20 border border-white/5 rounded-lg p-1">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white" onClick={() => setEditingQuestionId(q.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-white/40 hover:text-rose-400"
                                                    onClick={() => handleDelete(q.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider text-white/60 flex-wrap">
                                            {q.stream && <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md">{q.stream}</span>}
                                            {q.subject && <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md">{q.subject}</span>}
                                            <span className={`px-2 py-1 rounded-md border
                                                    ${q.difficulty === 'Hard' ? 'bg-semantic-error/10 text-rose-400 border-semantic-error/30' :
                                                    q.difficulty === 'Easy' ? 'bg-semantic-success/10 text-emerald-400 border-semantic-success/30' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                                                {q.difficulty || 'Medium'}
                                            </span>
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
