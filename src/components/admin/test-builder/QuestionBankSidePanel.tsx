import React, { useState, useEffect } from "react";
import { Question } from "@/types/admin";
import { firestoreService } from "@/services/firestoreService";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AnimatePresence, motion } from "framer-motion";
import {
    X,
    Search,
    Loader2,
    Check,
    Plus,
    Library
} from "lucide-react";

interface QuestionBankSidePanelProps {
    open: boolean;
    onClose: () => void;
    onAddQuestions: (questions: Question[]) => void;
    existingIds: string[];
}

export function QuestionBankSidePanel({ open, onClose, onAddQuestions, existingIds }: QuestionBankSidePanelProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all');


    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && questions.length === 0) {
            loadQuestions();
        }
    }, [open]);

    async function loadQuestions() {
        setLoading(true);
        setError(null);
        try {
            console.log("QuestionBank: Loading questions...");
            const data = await firestoreService.getQuestions();
            setQuestions(data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Failed to load questions", err);
            setError(err.message || "Failed to load questions. Check console or permissions.");
        } finally {
            setLoading(false);
        }
    }

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
        const isAlreadyAdded = existingIds.includes(q.id);

        // Hide questions that are already in the test to prevent duplication
        return matchesSearch && matchesDifficulty && !isAlreadyAdded;
    });

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleAddSelected = () => {
        const selectedQuestions = questions.filter(q => selectedIds.includes(q.id));
        onAddQuestions(selectedQuestions);
        setSelectedIds([]);
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />
                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[800px] md:h-[600px] bg-surface-card rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-border"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-start bg-surface-elevated">
                            <div>
                                <div className="flex items-center gap-2 text-cta-primary mb-1">
                                    <Library className="h-5 w-5" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Question Bank</span>
                                </div>
                                <h2 className="text-xl font-bold text-text-primary">Add Questions from Bank</h2>
                                <p className="text-sm text-text-secondary mt-1">Select questions from your shared repository to add to this test.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-surface-elevated rounded-full transition-colors text-text-muted hover:text-text-primary">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Filters & Search */}
                        <div className="p-4 border-b border-border flex gap-4 bg-surface-card items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                                <Input
                                    placeholder="Search question text..."
                                    className="pl-9 bg-background border-border"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="px-3 py-2 bg-background border border-border rounded-md text-sm outline-none text-text-primary focus:border-cta-primary focus:ring-1 focus:ring-cta-primary"
                                value={filterDifficulty}
                                onChange={(e) => setFilterDifficulty(e.target.value)}
                            >
                                <option value="all">All Difficulties</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        {/* Question List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full text-text-muted gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-cta-primary" />
                                    <p>Loading questions...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full text-semantic-error gap-2 p-4 text-center">
                                    <div className="h-12 w-12 bg-semantic-error/10 rounded-full flex items-center justify-center mb-2">
                                        <X className="h-6 w-6 text-semantic-error" />
                                    </div>
                                    <p className="font-semibold">Error Loading Questions</p>
                                    <p className="text-sm text-text-secondary max-w-sm">{error}</p>
                                    <Button onClick={loadQuestions} variant="outline" size="sm" className="mt-4">
                                        Retry
                                    </Button>
                                </div>
                            ) : filteredQuestions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-text-muted gap-2">
                                    <Search className="h-8 w-8 text-border" />
                                    <p>No matching questions found.</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {filteredQuestions.map(q => {
                                        const isSelected = selectedIds.includes(q.id);
                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={q.id}
                                                onClick={() => toggleSelection(q.id)}
                                                className={`
                                                    p-4 rounded-xl border cursor-pointer transition-all relative group
                                                    ${isSelected
                                                        ? 'bg-cta-primary/5 border-cta-primary shadow-sm'
                                                        : 'bg-surface-card border-border hover:border-cta-primary/50 hover:shadow-md'}
                                                `}
                                            >
                                                <div className="pr-12">
                                                    <p className="text-sm font-medium text-text-primary line-clamp-2 mb-2 group-hover:text-text-primary">{q.text}</p>
                                                    <div className="flex gap-2">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${q.difficulty === 'Hard' ? 'bg-semantic-error/10 text-semantic-error border-semantic-error/30' :
                                                            q.difficulty === 'Easy' ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/30' :
                                                                'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/30'
                                                            }`}>
                                                            {q.difficulty || 'Medium'}
                                                        </span>
                                                        {q.subject && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-base text-text-secondary border border-border">
                                                                {q.subject}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`
                                                    absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                                    ${isSelected ? 'bg-cta-primary border-cta-primary scale-110' : 'border-border bg-background group-hover:border-cta-primary/50'}
                                                `}>
                                                    {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-surface-card border-t border-border flex justify-between items-center z-10">
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <span className="font-semibold text-text-primary">{selectedIds.length}</span> questions selected
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                                <Button
                                    onClick={handleAddSelected}
                                    disabled={selectedIds.length === 0}
                                    className="bg-cta-primary hover:bg-cta-hover text-white gap-2 px-6"
                                >
                                    <Plus className="h-4 w-4" /> Add Questions
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
