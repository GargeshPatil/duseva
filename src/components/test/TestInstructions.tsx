import React, { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface TestInstructionsProps {
    testTitle: string;
    durationMinutes: number;
    totalQuestions: number;
    totalMarks: number;
    onStartTest: () => void;
}

export function TestInstructions({
    testTitle,
    durationMinutes,
    totalQuestions,
    totalMarks,
    onStartTest
}: TestInstructionsProps) {
    const [agreed, setAgreed] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="h-16 bg-blue-600 text-white flex items-center px-6 shadow-md shrink-0">
                <h1 className="text-xl font-bold">General Instructions</h1>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">
                        {testTitle}
                    </h2>

                    <div className="flex flex-wrap gap-6 mb-8 text-sm font-medium text-slate-700 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Duration:</span>
                            <span className="text-slate-900">{durationMinutes} Minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Maximum Marks:</span>
                            <span className="text-slate-900">{totalMarks}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Total Questions:</span>
                            <span className="text-slate-900">{totalQuestions}</span>
                        </div>
                    </div>

                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <section>
                            <h3 className="font-bold text-slate-900 mb-3 text-lg">1. General Instructions:</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>The clock has been set at the server and the countdown timer at the top right corner of your screen will display the time remaining for you to complete the exam.</li>
                                <li>The question palette at the right of screen shows one of the following statuses of each of the questions numbered:</li>
                            </ul>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 mb-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-8 h-8 flex items-center justify-center bg-slate-100 border border-slate-300 rounded text-slate-600 font-medium">1</div>
                                    <span>Not Visited</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded font-medium">3</div>
                                    <span>Not Answered</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded font-medium">5</div>
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-700 border border-purple-300 rounded font-medium">7</div>
                                    <span>Marked for Review</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-8 h-8 flex items-center justify-center bg-purple-500 text-white rounded font-medium">9</div>
                                    <span>Answered & Marked for Review</span>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold text-slate-900 mb-3 text-lg">2. Navigating to a Question:</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Click on the question number on the question palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li>
                                <li>Click on <strong>Save & Next</strong> to save answer to current question and to go to the next question in sequence.</li>
                                <li>Click on <strong>Mark for Review & Next</strong> to save answer to current question, mark it for review, and to go to the next question in sequence.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-bold text-slate-900 mb-3 text-lg">3. Answering a Question:</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>To select your answer, click on one of the option buttons.</li>
                                <li>To change your answer, click the another desired option button.</li>
                                <li>To save your answer, you MUST click on <strong>Save & Next</strong>.</li>
                                <li>To deselect a chosen answer, click on the chosen option again or click on the <strong>Clear Response</strong> button.</li>
                            </ul>
                        </section>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                            <div className="flex gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Questions marked for review will trigger a warning before submission, but answers marked for review WILL BE considered for evaluation if left unmarked.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Action */}
            <footer className="bg-white border-t border-slate-200 flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-4 md:py-0 md:h-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] gap-4">
                <div className="flex items-start md:items-center gap-3 w-full md:w-auto">
                    <input
                        type="checkbox"
                        id="agree"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 md:mt-0 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="agree" className="text-sm md:text-base font-medium text-slate-700 cursor-pointer select-none leading-tight">
                        I have read and understood the instructions.
                    </label>
                </div>

                <Button
                    size="lg"
                    onClick={onStartTest}
                    disabled={!agreed}
                    className={`
                        w-full md:w-auto min-w-[180px] font-bold text-lg transition-all h-12 md:h-11
                        ${agreed ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20" : "bg-slate-300 cursor-not-allowed"}
                    `}
                >
                    Start Test <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </footer>
        </div>
    );
}
