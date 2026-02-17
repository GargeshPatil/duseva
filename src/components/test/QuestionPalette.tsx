import React from 'react';
import { QuestionStatus } from '@/types/admin';

interface QuestionPaletteProps {
    totalQuestions: number;
    currentQuestionIndex: number; // 0-based
    questionStatus: Record<string, QuestionStatus>;
    questions: { id: string }[];
    onQuestionSelect: (index: number) => void;
}

export function QuestionPalette({
    totalQuestions,
    currentQuestionIndex,
    questionStatus,
    questions,
    onQuestionSelect
}: QuestionPaletteProps) {

    // Helper to determine status color based on NTA guidelines
    const getStatusClass = (idx: number) => {
        const qId = questions[idx]?.id;
        const statusObj = questionStatus[qId];
        const status = statusObj?.status || 'not_visited';
        const isCurrent = currentQuestionIndex === idx;

        // Current question always needs highlighting (often a border or distinct background)
        // NTA style: Current question might just have a ring, but the background color relies on status.
        // Actually NTA shows current question distinctly.

        let baseClass = "";

        switch (status) {
            case 'answered':
                baseClass = "bg-green-500 text-white border-green-600";
                break;
            case 'not_answered':
                baseClass = "bg-red-500 text-white border-red-600";
                break;
            case 'marked_for_review':
                baseClass = "bg-purple-100 text-purple-700 border-purple-300";
                break;
            case 'answered_marked_for_review':
                baseClass = "bg-purple-500 text-white border-purple-600 relative overflow-hidden";
                break;
            case 'not_visited':
            default:
                baseClass = "bg-slate-100 text-slate-600 border-slate-200";
                break;
        }

        if (isCurrent) {
            return `${baseClass} ring-2 ring-blue-500 ring-offset-2`;
        }
        return baseClass;
    };

    return (
        <div className="bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-30">
            <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Question Palette</h3>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">{questions.length} Qs</span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-slate-50/30">
                <div className="grid grid-cols-5 gap-2.5">
                    {Array.from({ length: totalQuestions }).map((_, idx) => {
                        const qNum = idx + 1;
                        const qId = questions[idx]?.id;
                        const isAnsweredMarked = questionStatus[qId]?.status === 'answered_marked_for_review';
                        const statusClass = getStatusClass(idx);

                        return (
                            <button
                                key={idx}
                                onClick={() => onQuestionSelect(idx)}
                                className={`
                                    h-9 w-9 flex items-center justify-center rounded-lg border text-sm font-bold transition-all duration-200
                                    ${statusClass}
                                    relative hover:scale-105 active:scale-95 shadow-sm
                                `}
                            >
                                {qNum}
                                {isAnsweredMarked && (
                                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white text-[11px] space-y-3 mt-auto shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
                <h4 className="font-semibold text-slate-700 mb-2 uppercase tracking-wider text-[10px]">Legend</h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded bg-green-500 text-white font-bold text-[10px] shadow-sm">5</span>
                        <span className="text-slate-600">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded bg-red-500 text-white font-bold text-[10px] shadow-sm">3</span>
                        <span className="text-slate-600">Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded bg-purple-100 text-purple-700 border border-purple-300 font-bold text-[10px] shadow-sm">7</span>
                        <span className="text-slate-600">Marked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 text-slate-500 border border-slate-200 font-bold text-[10px] shadow-sm">1</span>
                        <span className="text-slate-600">Not Visited</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-slate-100">
                        <div className="relative shrink-0">
                            <span className="w-5 h-5 flex items-center justify-center rounded bg-purple-500 text-white font-bold text-[10px] shadow-sm">9</span>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                        </div>
                        <span className="text-slate-600 leading-tight">Ans & Marked (Evaluated)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
