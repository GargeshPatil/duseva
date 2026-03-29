"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Save, Plus, Trash2, Loader2, Check } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Question } from "@/types/admin";
import Link from "next/link";

export default function QuestionEditorPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const prefillTestId = searchParams.get('testId');

    const questionId = params.questionId as string; // 'new' or actual ID
    const isNew = questionId === 'new';

    const [question, setQuestion] = useState<Partial<Question>>({
        questionType: "mcq",
        text: "",
        options: ["", "", "", ""],
        correctOption: 0,
        explanation: "",
        testId: prefillTestId || "",
        matchPairs: [{ left: "", right: "" }, { left: "", right: "" }, { left: "", right: "" }, { left: "", right: "" }],
        passageText: ""
    });

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [tests, setTests] = useState<{ id: string, title: string }[]>([]);

    useEffect(() => {
         
        loadData();
    }, []);

    async function loadData() {
        // Load tests for dropdown
        try {
            const t = await firestoreService.getTests();
            setTests(t.map(test => ({ id: test.id, title: test.title })));
        } catch (e) {
            console.error("Failed to load tests", e);
        }

        if (!isNew) {
            // Load specific question (inefficiently from list for now)
            const qs = await firestoreService.getQuestions();
            const found = qs.find(q => q.id === questionId);
            if (found) {
                setQuestion({
                    ...found,
                    questionType: found.questionType || "mcq",
                    matchPairs: found.matchPairs || [{ left: "", right: "" }, { left: "", right: "" }, { left: "", right: "" }, { left: "", right: "" }]
                });
            } else {
                router.push("/admin/management?tab=questions");
            }
        }
        setLoading(false);
    }

    async function handleSave() {
        if (!question.text || question.options?.some(o => !o)) {
            alert("Please fill in question text and all options.");
            return;
        }

        if (question.questionType === "match") {
            if (question.matchPairs?.some(p => !p.left || !p.right)) {
                alert("Please fill in all match pairs.");
                return;
            }
        }

        setSaving(true);
        try {
            let generatedPassageId = null;
            if (question.passageText && question.passageText.trim() !== "") {
                try {
                    generatedPassageId = "passage_" + btoa(encodeURIComponent(question.passageText.trim())).slice(0, 12);
                } catch(e) {
                    generatedPassageId = "passage_" + Date.now().toString(36);
                }
            }

            const questionDataToSave: any = {
                ...question,
                matchPairs: question.questionType === "match" ? question.matchPairs : null,
                passageText: question.passageText?.trim() || null,
                passageId: generatedPassageId
            };

            if (isNew) {
                await firestoreService.createQuestion(questionDataToSave);
            } else {
                await firestoreService.updateQuestion(questionId, questionDataToSave);
            }
            router.push("/admin/management?tab=questions");
        } catch (e) {
            console.error(e);
            alert("Failed to save the question.");
        } finally {
            setSaving(false);
        }
    }

    function handleOptionChange(index: number, value: string) {
        const newOptions = [...(question.options || [])];
        newOptions[index] = value;
        setQuestion({ ...question, options: newOptions });
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
                    <Link href="/admin/management?tab=questions">
                        <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isNew ? "Add Question" : "Edit Question"}
                    </h1>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Question"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Question Details</h3>

                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
                                <select
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                                    value={question.questionType || "mcq"}
                                    onChange={(e) => setQuestion({ ...question, questionType: e.target.value as "mcq" | "match" })}
                                >
                                    <option value="mcq">Standard MCQ</option>
                                    <option value="match">Match the Following</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-4">
                            <h4 className="font-medium text-blue-900 text-sm">Optional Passage Text</h4>
                            <textarea
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px]"
                                value={question.passageText || ""}
                                onChange={(e) => setQuestion({ ...question, passageText: e.target.value })}
                                placeholder="Enter passage context here if this query links to a passage..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Question Text
                            </label>
                            <textarea
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px]"
                                value={question.text || ""}
                                onChange={(e) => setQuestion({ ...question, text: e.target.value })}
                                placeholder="Enter the question here..."
                            />
                        </div>

                        {question.questionType === "match" && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                                <h4 className="font-medium text-slate-900 text-sm">Match Pairs</h4>
                                <div className="space-y-3">
                                    {(question.matchPairs || []).map((pair, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <Input
                                                value={pair.left}
                                                onChange={(e) => {
                                                    const newPairs = [...(question.matchPairs || [])];
                                                    newPairs[idx].left = e.target.value;
                                                    setQuestion({ ...question, matchPairs: newPairs });
                                                }}
                                                placeholder={`List A Item ${idx + 1}`}
                                                className="flex-1"
                                            />
                                            <span className="text-slate-400 font-bold">&#x2194;</span>
                                            <Input
                                                value={pair.right}
                                                onChange={(e) => {
                                                    const newPairs = [...(question.matchPairs || [])];
                                                    newPairs[idx].right = e.target.value;
                                                    setQuestion({ ...question, matchPairs: newPairs });
                                                }}
                                                placeholder={`List B Item ${idx + 1}`}
                                                className="flex-1"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 px-2 flex-shrink-0"
                                                onClick={() => {
                                                    const newPairs = [...(question.matchPairs || [])];
                                                    newPairs.splice(idx, 1);
                                                    setQuestion({ ...question, matchPairs: newPairs });
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() => {
                                            const newPairs = [...(question.matchPairs || []), { left: "", right: "" }];
                                            setQuestion({ ...question, matchPairs: newPairs });
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Add Pair
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
                            <div className="space-y-3">
                                {question.options?.map((option, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div
                                            className={`
                                                flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-colors
                                                ${question.correctOption === idx
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-slate-300 text-slate-400 hover:border-slate-400'}
                                            `}
                                            onClick={() => setQuestion({ ...question, correctOption: idx })}
                                            title="Mark as correct answer"
                                        >
                                            {question.correctOption === idx && <Check className="h-3 w-3" />}
                                        </div>
                                        <Input
                                            value={option}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Option ${idx + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-2 ml-9">Click the circle to mark the correct answer.</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Explanation</h3>
                        <textarea
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[80px]"
                            value={question.explanation}
                            onChange={(e) => setQuestion({ ...question, explanation: e.target.value })}
                            placeholder="Explain why the answer is correct (optional)..."
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Association</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Test</label>
                            <select
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                                value={question.testId || ""}
                                onChange={(e) => setQuestion({ ...question, testId: e.target.value })}
                            >
                                <option value="">-- Unassigned --</option>
                                {tests.map(t => (
                                    <option key={t.id} value={t.id}>{t.title}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Which test does this belong to?</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
