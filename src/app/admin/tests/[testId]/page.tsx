"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, Loader2, Plus, Eye, Library } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Test, Question } from "@/types/admin";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { TestMetadata } from "@/components/admin/test-builder/TestMetadata";
import { TestQuestionList } from "@/components/admin/test-builder/TestQuestionList";
import { QuestionBankSidePanel } from "@/components/admin/test-builder/QuestionBankSidePanel";

export default function TestBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
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
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [isBankOpen, setIsBankOpen] = useState(false);

    useEffect(() => {
        if (!isNew) {
            loadTest();
        }
    }, [testId]);

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
                await firestoreService.createTest(payload as any);
            } else {
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

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-slate-600">Loading Test Builder...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 md:px-8 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/management?tab=tests">
                            <Button variant="outline" size="sm" className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-300">
                                <ArrowLeft className="h-4 w-4" /> Back to Tests
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">
                            {test.title || "Untitled Test"}
                        </h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${test.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {test.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Status:</span>
                            <select
                                className={`px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${test.status === 'published'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}
                                value={test.status}
                                onChange={(e) => setTest({ ...test, status: e.target.value as 'draft' | 'published' })}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        {/* <Button variant="outline" className="gap-2 hidden sm:flex">
                            <Eye className="h-4 w-4" /> Preview
                        </Button> */}
                        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Test"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
                {/* 1. Metadata Section */}
                <section>
                    <TestMetadata test={test} onChange={setTest} />
                </section>

                {/* 2. Questions Builder Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-800">Questions ({questions.length})</h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsBankOpen(true)}
                                className="gap-2 bg-white"
                            >
                                <Library className="h-4 w-4 text-blue-600" />
                                Add from Bank
                            </Button>
                        </div>
                    </div>

                    <TestQuestionList
                        questions={questions}
                        setQuestions={setQuestions}
                    />

                    {/* Floating Add Button logic or bottom block */}
                    <div
                        onClick={addNewQuestion}
                        className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all"
                    >
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <Plus className="h-6 w-6 text-blue-600 group-hover:text-white" />
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-600 group-hover:text-blue-700">Add New Question</p>
                    </div>
                </section>
            </div>

            <QuestionBankSidePanel
                open={isBankOpen}
                onClose={() => setIsBankOpen(false)}
                onAddQuestions={addQuestionsFromBank}
                existingIds={questions.map(q => q.id)}
            />
        </div>
    );
}

