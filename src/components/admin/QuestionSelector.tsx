"use client";

import { useState, useEffect } from "react";
import { Question } from "@/types/admin";
import { firestoreService } from "@/services/firestoreService";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, CheckSquare, Square, Loader2 } from "lucide-react";

interface QuestionSelectorProps {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onClose?: () => void;
}

export function QuestionSelector({ selectedIds, onSelectionChange, onClose }: QuestionSelectorProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [streamFilter, setStreamFilter] = useState<string>("");
    const [subjectFilter, setSubjectFilter] = useState<string>("");

    // Local selection state to avoid parent re-renders on every click if performance matters
    // But for simplicity, we can use parent state or local buffer. 
    // Let's use local buffer for "Confirm" action pattern usually, but real-time is fine too.
    // Let's use a local buffer so we can "Save" selection.
    const [localSelected, setLocalSelected] = useState<Set<string>>(new Set(selectedIds));

    async function loadQuestions() {
        setLoading(true);
        // Fetch all for now. scaling might need pagination later.
        const data = await firestoreService.getQuestions();
        setQuestions(data);
        setLoading(false);
    }

    useEffect(() => {
        loadQuestions();
    }, []);

    // Sync prop changes to local state
    useEffect(() => {
        setLocalSelected(new Set(selectedIds));
    }, [selectedIds]);

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = (q.text?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesStream = streamFilter ? q.stream === streamFilter : true;
        const matchesSubject = subjectFilter ? (q.subject === subjectFilter || !q.subject) : true;
        return matchesSearch && matchesStream && matchesSubject;
    });

    const toggleSelection = (id: string) => {
        const newSet = new Set(localSelected);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setLocalSelected(newSet);
    };

    const handleConfirm = () => {
        onSelectionChange(Array.from(localSelected));
        if (onClose) onClose();
    };

    const streams = ["Science", "Commerce", "Humanities", "General"];

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Select Questions</h3>
                    <div className="flex gap-2">
                        <span className="text-sm text-slate-500 self-center mr-2">
                            {localSelected.size} selected
                        </span>
                        <Button size="sm" onClick={handleConfirm} className="bg-blue-600 text-white">
                            Confirm
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search questions..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <select
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none"
                            value={streamFilter}
                            onChange={(e) => setStreamFilter(e.target.value)}
                        >
                            <option value="">All Streams</option>
                            {streams.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Input
                            placeholder="Subject..."
                            className="w-32"
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        No questions found.
                    </div>
                ) : (
                    filteredQuestions.map(q => {
                        const isSelected = localSelected.has(q.id);
                        return (
                            <div
                                key={q.id}
                                onClick={() => toggleSelection(q.id)}
                                className={`
                                    p-3 rounded-lg border cursor-pointer flex items-start gap-3 transition-colors
                                    ${isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-slate-50 border-slate-200"}
                                `}
                            >
                                <div className={`mt-1 shrink-0 ${isSelected ? "text-blue-600" : "text-slate-300"}`}>
                                    {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${isSelected ? "text-blue-900" : "text-slate-900"} line-clamp-2`}>
                                        {q.text}
                                    </p>
                                    <div className="flex gap-2 mt-1.5">
                                        {q.stream && (
                                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                                {q.stream}
                                            </span>
                                        )}
                                        {q.subject && (
                                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                                {q.subject}
                                            </span>
                                        )}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${q.difficulty === 'Hard' ? 'bg-red-50 text-red-600 border-red-100' : q.difficulty === 'Easy' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                                            {q.difficulty || 'Medium'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
