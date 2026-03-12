"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, Loader2, Plus, Library, Upload } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Test, Question, Passage } from "@/types/admin";
import Link from "next/link";

import { TestMetadata } from "@/components/admin/test-builder/TestMetadata";
import { TestQuestionList } from "@/components/admin/test-builder/TestQuestionList";
import { QuestionBankSidePanel } from "@/components/admin/test-builder/QuestionBankSidePanel";
import { CSVImportModal } from "@/components/admin/questions/CSVImportModal";

export default function TestBuilderPage() {
    const params = useParams();
    const router = useRouter();

    const testId = params.testId as string;
    const isNew = testId === 'new';

    // State
    const [test, setTest] = useState<Partial<Test>>({
        title: "",
        description: "",
        duration: 60,
        totalMarks: 200,
        difficulty: "Medium",
        category: "Subject",
        price: "free",
        status: "draft",
        questions: [],
        questionIds: [],
        streams: ["General"]
    });

    const [questions, setQuestions] = useState<Question[]>([]);
    const [passages, setPassages] = useState<Passage[]>([]);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [isBankOpen, setIsBankOpen] = useState(false);
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

    useEffect(() => {
        firestoreService.getPassages().then(setPassages).catch(console.error);
        if (!isNew) {
            loadTest();
        } else {
            setLoading(false);
        }
    }, [testId, isNew]);

    async function loadTest() {
        try {
            const found = await firestoreService.getTest(testId);
            if (found) {
                setTest(found);
                // Load questions
                if (found.questionIds && found.questionIds.length > 0) {
                    // Fetch questions maintaining order is tricky with where 'in' query.
                    // We'll fetch and resort.
                    const qs = await firestoreService.getQuestions({ ids: found.questionIds });
                    // Sort qs based on questionIds order
                    const sortedQs = found.questionIds.map(id => qs.find(q => q.id === id)).filter(Boolean) as Question[];
                    setQuestions(sortedQs);
                }
            } else {
                router.push("/admin/management?tab=tests");
            }
        } catch (error) {
            console.error("Failed to load test", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Save all questions first (Upsert)
            // We need to ensure new questions (temp IDs) get real IDs
            const finalQuestionIds: string[] = [];
            const savedQuestions: Question[] = [];

            for (const q of questions) {
                let savedQ = { ...q };
                // If it has a temp ID (starts with temp_) or is empty/null, create it as new
                if (!q.id || q.id.startsWith('temp_')) {
                    // Remove the temp ID so firestore generates one
                    const { id, ...qData } = q;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const newId = await firestoreService.createQuestion(qData as any);
                    if (newId) {
                        savedQ = { ...q, id: newId };
                    } else {
                        throw new Error("Failed to create question");
                    }
                } else {
                    // Update existing
                    await firestoreService.updateQuestion(q.id, q);
                }
                finalQuestionIds.push(savedQ.id);
                savedQuestions.push(savedQ);
            }

            // 2. Save Test with ordered IDs
            const payload = {
                ...test,
                questionIds: finalQuestionIds,
                questions: [] // Clear legacy embedded if any
            };

            if (isNew) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await firestoreService.createTest(payload as any);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await firestoreService.updateTest(testId, payload as any);
            }

            // Update local state with real IDs to prevent dupe creation on next save
            setQuestions(savedQuestions);

            // Redirect or Notify
            router.push("/admin/management?tab=tests");

        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save test. Check console.");
        } finally {
            setSaving(false);
        }
    };

    const addNewQuestion = () => {
        const newQ: Question = {
            id: `temp_${Date.now()}`,
            text: "",
            options: ["", "", "", ""],
            correctOption: 0,
            difficulty: "Medium",
            stream: "General",
            subject: ""
        };
        setQuestions([...questions, newQ]);
    };

    const addQuestionsFromBank = (selected: Question[]) => {
        setQuestions(prev => [...prev, ...selected]);
    };

    const addQuestionsFromCSV = (imported: Partial<Question>[]) => {
        const prepared = imported.map((q) => ({
            ...q,
            id: `temp_${Date.now()}_${Math.random()}`, // Assign temp IDs
        })) as Question[];
        setQuestions(prev => [...prev, ...prepared]);
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-cta-primary" />
                <span className="text-text-muted font-medium tracking-wider uppercase text-sm">Initializing Studio...</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20 selection:bg-cta-primary/30">
            {/* Top Bar - Glassmorphic fixed header */}
            <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-4 shadow-2xl">
                <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                        <Link href="/admin/management?tab=tests" className="shrink-0">
                            <Button variant="secondary" size="sm" className="gap-2 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all rounded-lg">
                                <ArrowLeft className="h-4 w-4" /> <span className="hidden md:inline">Back</span>
                            </Button>
                        </Link>
                        <div className="w-px h-6 bg-white/10 hidden md:block" />
                        <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 truncate min-w-0 flex-1 sm:max-w-md md:max-w-xl">
                            {test.title || "Untitled Test Content"}
                        </h1>
                        <span className={`shrink-0 hidden xs:inline-flex px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border
                            ${test.status === 'published'
                                ? 'bg-semantic-success/10 text-emerald-400 border-semantic-success/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                : 'bg-white/5 text-white/50 border-white/10'
                            }`}>
                            {test.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                            <span className="text-[11px] uppercase font-bold tracking-wider text-white/40 pl-2 hidden lg:inline">Status</span>
                            <select
                                className={`px-4 py-2 rounded-lg text-sm font-semibold outline-none transition-all cursor-pointer appearance-none text-center min-w-[110px]
                                ${test.status === 'published'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                                    }`}
                                value={test.status as any}
                                onChange={(e) => setTest({ ...test, status: e.target.value as 'draft' | 'published' })}
                            >
                                <option className="bg-surface-card text-white" value="draft">Draft</option>
                                <option className="bg-surface-card text-white" value="published">Published</option>
                            </select>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="gap-2 bg-cta-primary hover:bg-cta-hover text-white border border-transparent rounded-xl flex-1 sm:flex-none transition-all shadow-[0_0_15px_rgba(var(--cta-primary-rgb),0.3)]"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            <span className="font-bold">{saving ? "Saving..." : "Deploy"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 space-y-10">
                {/* 1. Metadata Section */}
                <section>
                    <TestMetadata test={test} onChange={setTest} />
                </section>

                {/* 2. Questions Builder Section */}
                <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Content Flow</span>
                            <span className="text-sm font-medium bg-white/10 border border-white/10 text-white/70 px-2.5 py-0.5 rounded-full">
                                {questions.length} elements
                            </span>
                        </h2>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button
                                variant="secondary"
                                onClick={() => setIsCSVModalOpen(true)}
                                className="flex-1 sm:flex-none gap-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all shadow-sm"
                            >
                                <Upload className="h-4 w-4" />
                                <span className="font-semibold">Import CSV</span>
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setIsBankOpen(true)}
                                className="flex-1 sm:flex-none gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-all shadow-sm"
                            >
                                <Library className="h-4 w-4" />
                                <span className="font-semibold">Bank</span>
                            </Button>
                        </div>
                    </div>

                    <TestQuestionList
                        questions={questions}
                        setQuestions={setQuestions}
                        passages={passages}
                    />

                    {/* Floating Add Button logic */}
                    <div
                        onClick={addNewQuestion}
                        className="group flex flex-col items-center justify-center p-10 bg-black/20 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-cta-primary/50 hover:bg-cta-primary/5 transition-all duration-300 relative overflow-hidden"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-cta-primary/10 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />

                        <div className="relative z-10 h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cta-primary group-hover:border-transparent group-hover:scale-110 transition-all duration-300 shadow-xl">
                            <Plus className="h-6 w-6 text-white/60 group-hover:text-white" />
                        </div>
                        <p className="relative z-10 mt-4 text-base font-bold tracking-wide text-white/50 group-hover:text-white transition-colors">
                            Compose Custom Question
                        </p>
                    </div>
                </section>
            </div>

            <QuestionBankSidePanel
                open={isBankOpen}
                onClose={() => setIsBankOpen(false)}
                onAddQuestions={addQuestionsFromBank}
                existingIds={questions.map(q => q.id)}
            />

            <CSVImportModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSuccess={() => setIsCSVModalOpen(false)} // Won't be called if prepopulating
                onPrepopulateFromCSV={addQuestionsFromCSV}
            />
        </div>
    );
}
