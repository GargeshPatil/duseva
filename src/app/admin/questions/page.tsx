"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlusCircle, Search, Edit, Trash2, Loader2, RefreshCw, Filter } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Question } from "@/types/admin";
import Link from "next/link";
import { Input } from "@/components/ui/Input";

export default function QuestionBankPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadQuestions();
    }, []);

    async function loadQuestions() {
        setLoading(true);
        const data = await firestoreService.getQuestions();
        setQuestions(data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
            const success = await firestoreService.deleteQuestion(id);
            if (success) {
                loadQuestions();
            } else {
                alert("Failed to delete question. Please try again.");
            }
        }
    }

    const [streamFilter, setStreamFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = (q.text?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (q.testId?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesStream = streamFilter ? q.stream === streamFilter : true;
        const matchesSubject = subjectFilter ? (q.subject || "").toLowerCase().includes(subjectFilter.toLowerCase()) : true;

        return matchesSearch && matchesStream && matchesSubject;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
                    <p className="text-slate-500 mt-1">Manage all questions across tests.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadQuestions} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    {/* Future: Import CSV */}
                    <Link href="/admin/questions/new">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <PlusCircle className="h-4 w-4" /> Add Question
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search questions..."
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
                    <Input
                        placeholder="Subject..."
                        className="w-full sm:w-40"
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                    />
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 w-[50%]">Question Text</th>
                                <th className="px-6 py-4">Test ID</th>
                                <th className="px-6 py-4">Options</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                            Loading questions...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredQuestions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No questions found.</td>
                                </tr>
                            ) : (
                                filteredQuestions.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 line-clamp-2" title={q.text}>
                                                {q.text}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                {q.testId || "Unassigned"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {q.options?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/questions/${q.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                                                    onClick={() => handleDelete(q.id)}
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
                    {loading ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                            <div className="flex justify-center items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                Loading...
                            </div>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">No questions found.</div>
                    ) : (
                        filteredQuestions.map((q) => (
                            <div key={q.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="pr-4">
                                        <p className="font-medium text-slate-900 line-clamp-3 text-sm">{q.text}</p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <Link href={`/admin/questions/${q.id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                            onClick={() => handleDelete(q.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-xs text-slate-500 flex-wrap">
                                    {q.stream && <span className="bg-slate-100 px-2 py-1 rounded">{q.stream}</span>}
                                    {q.subject && <span className="bg-slate-100 px-2 py-1 rounded">{q.subject}</span>}
                                    <span className={`px-2 py-1 rounded border ${q.difficulty === 'Hard' ? 'bg-red-50 text-red-700 border-red-100' : q.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                        {q.difficulty || 'Medium'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
