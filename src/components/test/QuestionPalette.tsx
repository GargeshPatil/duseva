import React from 'react';
import { useExamEngine } from '@/hooks/useExamEngine';

export function QuestionPalette({ engine }: { engine: ReturnType<typeof useExamEngine> }) {
    const { questions, questionStatus, currentQIndex, actions } = engine;

    const getStatusStyle = (idx: number) => {
        const qId = questions[idx]?.id;
        const status = questionStatus[qId]?.status || 'not_visited';

        // Base styles depending on state
        switch (status) {
            case 'answered':
                return {
                    background: '#4caf50',
                    color: 'white',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 100%, 0 100%, 0% 25%)',
                    border: 'none',
                };
            case 'not_answered':
                return {
                    background: '#ff5722',
                    color: 'white',
                    clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)',
                    border: 'none',
                };
            case 'marked_for_review':
                return {
                    background: '#673ab7',
                    color: 'white',
                    borderRadius: '50%',
                    border: 'none',
                };
            case 'answered_marked_for_review':
                return {
                    background: '#673ab7',
                    color: 'white',
                    borderRadius: '50%',
                    border: 'none',
                };
            case 'not_visited':
            default:
                return {
                    background: '#e0e0e0',
                    color: 'black',
                    borderRadius: '4px',
                    border: '1px solid #999',
                };
        }
    };

    // Calculate Dynamic Summary
    const summary = {
        answered: 0,
        not_answered: 0,
        not_visited: 0,
        marked: 0,
        answered_marked: 0
    };

    questions.forEach(q => {
        const s = questionStatus[q.id]?.status || 'not_visited';
        if (s === 'answered') summary.answered++;
        else if (s === 'not_answered') summary.not_answered++;
        else if (s === 'marked_for_review') summary.marked++;
        else if (s === 'answered_marked_for_review') summary.answered_marked++;
        else summary.not_visited++;
    });

    return (
        <div className="flex flex-col h-full bg-white p-3 pt-0">
            
            {/* Title */}
            <div className="bg-[#1D4E89] text-white text-[14px] font-bold py-2 px-3 shrink-0 mb-3 mt-3 shadow-sm border border-[#0b3360]">
                {engine.currentSection}
            </div>

            {/* Right Panel - Legend */}
            <div style={{ border: '2px dashed #ccc', padding: '15px', marginBottom: '10px' }} className="shrink-0">
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12px] font-medium text-black">
                    <div className="flex items-center gap-2">
                        <div style={{ width: '30px', height: '30px', background: '#e0e0e0', borderRadius: '4px', border: '1px solid #999' }} className="flex items-center justify-center font-bold">{summary.not_visited}</div>
                        <span className="leading-tight">Not Visited</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div style={{ width: '30px', height: '30px', background: '#ff5722', color: 'white', clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' }} className="flex items-center justify-center font-bold">{summary.not_answered}</div>
                        <span className="leading-tight">Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div style={{ width: '30px', height: '30px', background: '#4caf50', color: 'white', clipPath: 'polygon(50% 0%, 100% 25%, 100% 100%, 0 100%, 0% 25%)' }} className="flex items-center justify-center font-bold">{summary.answered}</div>
                        <span className="leading-tight">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div style={{ width: '30px', height: '30px', background: '#673ab7', color: 'white', borderRadius: '50%' }} className="flex items-center justify-center font-bold">{summary.marked}</div>
                        <span className="leading-tight">Marked for Review</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 mt-1">
                        <div className="relative shrink-0">
                            <div style={{ width: '30px', height: '30px', background: '#673ab7', color: 'white', borderRadius: '50%' }} className="flex items-center justify-center font-bold">{summary.answered_marked}</div>
                            {/* Tick Overlay */}
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#4caf50] rounded-full border border-white flex items-center justify-center">
                                <span className="text-white text-[9px] font-bold leading-none">✓</span>
                            </div>
                        </div>
                        <span className="leading-tight">Answered & Marked for Review (will be considered for evaluation)</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="p-3 flex-1 overflow-y-auto bg-[#cce5ff] border border-[#b8daff] custom-scrollbar">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                    {questions.map((q, idx) => {
                        const isAnsweredMarked = questionStatus[q.id]?.status === 'answered_marked_for_review';
                        const isCurrent = currentQIndex === idx;
                        const style = getStatusStyle(idx);
                        
                        return (
                            <div 
                                key={q.id}
                                onClick={() => actions.handleJump(idx)}
                                style={{
                                    ...style,
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    outline: isCurrent ? '2px solid #000' : 'none',
                                    position: 'relative',
                                }}
                                title={`Question ${idx + 1}`}
                            >
                                {idx + 1}
                                {isAnsweredMarked && (
                                     <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#4caf50] rounded-full border border-white flex items-center justify-center">
                                        <span className="text-white text-[9px] font-bold leading-none">✓</span>
                                     </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
