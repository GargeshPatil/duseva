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
                baseClass = "bg-semantic-success text-white border-semantic-success";
                break;
            case 'not_answered':
                baseClass = "bg-semantic-error text-white border-semantic-error";
                break;
            case 'marked_for_review':
                baseClass = "bg-cta-primary/10 text-cta-primary border-cta-primary/30";
                break;
            case 'answered_marked_for_review':
                baseClass = "bg-cta-primary text-white border-cta-hover relative overflow-hidden";
                break;
            case 'not_visited':
            default:
                baseClass = "bg-surface-elevated text-text-secondary border-border/60";
                break;
        }

        if (isCurrent) {
            return `${baseClass} ring-2 ring-cta-primary/50 ring-offset-1 dark:ring-offset-surface-base`;
        }
        return baseClass;
    };

    return (
        <div className="bg-surface-card border-l border-border/60 flex flex-col h-full shadow-lg z-30">
            <div className="p-4 bg-surface-base border-b border-border/60 flex items-center justify-between">
                <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wide">Question Palette</h3>
                <span className="text-xs bg-surface-elevated text-text-secondary px-2 py-0.5 rounded-full font-medium border border-border">{questions.length} Qs</span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-surface-base">
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
                                    h-9 w-9 flex items-center justify-center rounded-[10px] border text-sm font-semibold transition-all duration-200
                                    ${statusClass}
                                    relative hover:scale-105 active:scale-95 shadow-sm
                                `}
                            >
                                {qNum}
                                {isAnsweredMarked && (
                                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-semantic-success rounded-full border-2 border-surface-card"></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 border-t border-border/60 bg-surface-card text-[11px] space-y-3 mt-auto shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
                <h4 className="font-semibold text-text-primary mb-2 uppercase tracking-wider text-[10px]">Legend</h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded-[6px] bg-semantic-success text-white font-semibold text-[10px] shadow-sm">5</span>
                        <span className="text-text-secondary">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded-[6px] bg-semantic-error text-white font-semibold text-[10px] shadow-sm">3</span>
                        <span className="text-text-secondary">Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded-[6px] bg-cta-primary/10 text-cta-primary border border-cta-primary/30 font-semibold text-[10px] shadow-sm">7</span>
                        <span className="text-text-secondary">Marked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded-[6px] bg-surface-elevated text-text-secondary border border-border/60 font-semibold text-[10px] shadow-sm">1</span>
                        <span className="text-text-secondary">Not Visited</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-border/60">
                        <div className="relative shrink-0">
                            <span className="w-5 h-5 flex items-center justify-center rounded-[6px] bg-cta-primary text-white font-semibold text-[10px] shadow-sm">9</span>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-semantic-success rounded-full border border-surface-card"></span>
                        </div>
                        <span className="text-text-secondary leading-tight">Ans & Marked (Evaluated)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
