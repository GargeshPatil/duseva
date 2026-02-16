"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/test/Timer";
import { QuestionPalette } from "@/components/test/QuestionPalette";
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Save,
    RotateCcw,
    AlertTriangle
} from "lucide-react";

// Mock Data
const MOCK_QUESTIONS = [
    { id: 1, text: "The concept of 'judicial review' in India is borrowed from which constitution?", options: ["UK", "USA", "Germany", "Japan"], correct: 1 },
    { id: 2, text: "Which of the following is NOT a fundamental right?", options: ["Right to Equality", "Right to Property", "Right to Freedom", "Right against Exploitation"], correct: 1 },
    { id: 3, text: "Who is known as the father of the Indian Constitution?", options: ["Jawaharlal Nehru", "B.R. Ambedkar", "Mahatma Gandhi", "Sardar Patel"], correct: 1 },
    { id: 4, text: "The Preamble to the Indian Constitution was amended by which Amendment Act?", options: ["42nd Amendment", "44th Amendment", "86th Amendment", "None of the above"], correct: 0 },
    { id: 5, text: "Which article deals with the 'Right to Education'?", options: ["Article 21A", "Article 19", "Article 32", "Article 14"], correct: 0 },
];

export default function TestPage() {
    const router = useRouter();

    // State
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({}); // qId -> optionIndex
    const [markedForReview, setMarkedForReview] = useState<number[]>([]);
    const [visited, setVisited] = useState<number[]>([1]); // 1-based IDs

    const currentQ = MOCK_QUESTIONS[currentQIndex];
    const qNum = currentQIndex + 1;

    // Mark visited when changing questions
    useEffect(() => {
        if (!visited.includes(qNum)) {
            setVisited(prev => [...prev, qNum]);
        }
    }, [qNum, visited]);

    // Handlers
    const handleOptionSelect = (optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [qNum]: optionIndex }));
    };

    const handleNext = () => {
        if (currentQIndex < MOCK_QUESTIONS.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQIndex > 0) {
            setCurrentQIndex(prev => prev - 1);
        }
    };

    const handleMarkReview = () => {
        setMarkedForReview(prev => {
            if (prev.includes(qNum)) return prev.filter(id => id !== qNum);
            return [...prev, qNum];
        });
    };

    const handleClear = () => {
        const newAnswers = { ...answers };
        delete newAnswers[qNum];
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        if (confirm("Are you sure you want to submit the test?")) {
            router.push(`/analysis/1`);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Top Bar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                <h1 className="font-bold text-lg text-slate-800">General Test - Mock 3</h1>
                <div className="flex items-center gap-4">
                    <Timer durationInSeconds={3600} onTimeUp={handleSubmit} />
                    <Button onClick={handleSubmit} variant="primary" className="bg-green-600 hover:bg-green-700">Submit Test</Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Question Area */}
                <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Question {qNum} of {MOCK_QUESTIONS.length}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-green-600">+5 Marks</span>
                                <span className="text-sm font-medium text-red-500">-1 Mark</span>
                            </div>
                        </div>

                        {/* Question Text */}
                        <h2 className="text-xl md:text-2xl font-medium text-slate-900 mb-8 leading-relaxed">
                            {currentQ.text}
                        </h2>

                        {/* Options */}
                        <div className="space-y-4">
                            {currentQ.options.map((opt, idx) => {
                                const isSelected = answers[qNum] === idx;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`
                      p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 group
                      ${isSelected
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                            }
                    `}
                                    >
                                        <div className={`
                      w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold
                      ${isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-slate-400 text-slate-500 group-hover:border-blue-400 group-hover:text-blue-500"}
                    `}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className={`text-lg ${isSelected ? "text-blue-900 font-medium" : "text-slate-700"}`}>
                                            {opt}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Bar */}
                        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 py-6 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleMarkReview}
                                    variant="outline"
                                    className={markedForReview.includes(qNum) ? "bg-purple-50 text-purple-700 border-purple-200" : ""}
                                >
                                    <Flag className="h-4 w-4 mr-2" />
                                    {markedForReview.includes(qNum) ? "Unmark Review" : "Mark for Review"}
                                </Button>
                                <Button onClick={handleClear} variant="ghost" className="text-slate-500 hover:text-red-600">
                                    <RotateCcw className="h-4 w-4 mr-2" /> Clear Response
                                </Button>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button onClick={handlePrev} disabled={currentQIndex === 0} variant="secondary">
                                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                                </Button>
                                <Button onClick={handleNext} disabled={currentQIndex === MOCK_QUESTIONS.length - 1}>
                                    Save & Next <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sidebar Palette */}
                <aside className="w-80 border-l border-slate-200 bg-slate-50 p-4 hidden lg:block overflow-y-auto">
                    <QuestionPalette
                        totalQuestions={MOCK_QUESTIONS.length}
                        currentQuestion={qNum}
                        answers={answers}
                        markedForReview={markedForReview}
                        visited={visited}
                        onQuestionSelect={(n) => setCurrentQIndex(n - 1)}
                    />
                </aside>
            </div>
        </div>
    );
}
