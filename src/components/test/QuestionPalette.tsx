import React from 'react';

interface QuestionPaletteProps {
    totalQuestions: number;
    currentQuestion: number;
    answers: Record<number, number>; // questionId -> optionIndex
    markedForReview: number[];
    visited: number[];
    onQuestionSelect: (index: number) => void;
}

export function QuestionPalette({
    totalQuestions,
    currentQuestion,
    answers,
    markedForReview,
    visited,
    onQuestionSelect
}: QuestionPaletteProps) {

    // Helper to determine status color
    const getStatusClass = (qNum: number) => {
        const isAnswered = answers[qNum] !== undefined;
        const isMarked = markedForReview.includes(qNum);
        const isVisited = visited.includes(qNum);
        const isCurrent = currentQuestion === qNum;

        if (isCurrent) return "ring-2 ring-blue-500 ring-offset-1 bg-white text-blue-600 border-blue-200";

        if (isMarked) {
            if (isAnswered) return "bg-purple-500 text-white border-purple-600";
            return "bg-purple-100 text-purple-700 border-purple-300";
        }

        if (isAnswered) return "bg-green-500 text-white border-green-600";

        if (isVisited) return "bg-red-50 text-red-600 border-red-200";

        return "bg-slate-100 text-slate-600 border-slate-200"; // Not Visited
    };

    return (
        <div className="bg-white border border-slate-200 rounded-lg flex flex-col h-full shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                Question Palette
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: totalQuestions }).map((_, idx) => {
                        const qNum = idx + 1;
                        return (
                            <button
                                key={qNum}
                                onClick={() => onQuestionSelect(qNum)}
                                className={`
                  h-10 w-10 flex items-center justify-center rounded-lg border font-medium text-sm transition-all
                  ${getStatusClass(qNum)}
                `}
                            >
                                {qNum}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs space-y-2 mt-auto">
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span> Answered
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-50 border border-red-200"></span> Not Answered
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-100 border border-purple-300"></span> Marked
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></span> Not Visited
                    </div>
                </div>
            </div>
        </div>
    );
}
