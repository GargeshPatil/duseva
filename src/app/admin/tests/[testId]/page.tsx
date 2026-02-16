"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Test, Question } from "@/types/admin";
import Link from "next/link";

export default function TestEditorPage() {
    const params = useParams();
    const router = useRouter();
    const testId = params.testId as string;
    const isNew = testId === 'new';

    const [test, setTest] = useState<Partial<Test>>({
        title: "",
        description: "",
        duration: 60,
        totalMarks: 200,
        difficulty: "Medium",
        category: "Subject",
        price: "free",
        status: "draft",
        questions: []
    });

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isNew) {
            loadTest();
        }
    }, [testId]);

    async function loadTest() {
        // In a real app, we'd fetch specific test. MockDb returns all, so we filter.
        // Optimization: Add getTest(id) to service later. For now, reusing getTests is inefficient but works.
        const tests = await firestoreService.getTests();
        const found = tests.find(t => t.id === testId);
        if (found) {
            setTest(found);
        } else {
            router.push("/admin/tests");
        }
        setLoading(false);
        loadQuestions();
    }

    async function loadQuestions() {
        setLoadingQuestions(true);
        if (!isNew && testId) {
            const qs = await firestoreService.getQuestions(testId);
            setQuestions(qs);
        }
        setLoadingQuestions(false);
    }

    async function handleSave() {
        setSaving(true);
        if (isNew) {
            await firestoreService.createTest(test as any);
        } else {
            await firestoreService.updateTest(testId, test as any);
        }
        setSaving(false);
        router.push("/admin/tests");
    }

    if (loading) return (
        <div className="p-8 flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" /> Loading...
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/tests">
                        <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isNew ? "Create New Test" : `Edit ${test.title}`}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setTest({ ...test, status: test.status === 'published' ? 'draft' : 'published' })}
                    >
                        {test.status === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Test"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Basic Information</h3>

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Test Title</label>
                                <Input
                                    value={test.title}
                                    onChange={(e) => setTest({ ...test, title: e.target.value })}
                                    placeholder="e.g., Mathematics Mock 1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px]"
                                    value={test.description}
                                    onChange={(e) => setTest({ ...test, description: e.target.value })}
                                    placeholder="What topics does this test cover?"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-900">Questions ({questions.length})</h3>
                            <Link href={`/admin/questions/new?testId=${testId}`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Question
                                </Button>
                            </Link>
                        </div>

                        {loadingQuestions ? (
                            <div className="text-center py-8 text-slate-500">Loading questions...</div>
                        ) : questions.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
                                No questions added yet. Click "Add Question" to start.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {questions.map((q, idx) => (
                                    <div key={q.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 flex justify-between items-start group">
                                        <div className="flex gap-3">
                                            <span className="font-mono text-xs text-slate-400 mt-1">Q{idx + 1}</span>
                                            <div>
                                                <p className="font-medium text-slate-900 line-clamp-2">{q.text}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                                        {q.options.length} options
                                                    </span>
                                                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">
                                                        Ans: {q.options[q.correctOption]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/admin/questions/${q.id}`}>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600">
                                                    <ArrowLeft className="h-3 w-3 rotate-180" /> {/* Edit Icon replacement if needed or just use edit */}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                                    value={test.category}
                                    onChange={(e) => setTest({ ...test, category: e.target.value as any })}
                                >
                                    <option value="Subject">Subject Test</option>
                                    <option value="General">General Test</option>
                                    <option value="Full Mock">Full Mock</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                                <select
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                                    value={test.difficulty}
                                    onChange={(e) => setTest({ ...test, difficulty: e.target.value as any })}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
                                <Input
                                    type="number"
                                    value={test.duration}
                                    onChange={(e) => setTest({ ...test, duration: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Total Marks</label>
                                <Input
                                    type="number"
                                    value={test.totalMarks}
                                    onChange={(e) => setTest({ ...test, totalMarks: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Access</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="price"
                                            checked={test.price === 'free'}
                                            onChange={() => setTest({ ...test, price: 'free' })}
                                        />
                                        <span className="text-sm">Free</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="price"
                                            checked={test.price === 'paid'}
                                            onChange={() => setTest({ ...test, price: 'paid' })}
                                        />
                                        <span className="text-sm">Paid</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
