import React, { useRef } from 'react';
import { useExamEngine } from '@/hooks/useExamEngine';
import Image from 'next/image';
import { ArrowUp, ArrowDown } from 'lucide-react';

export function QuestionPanel({ engine }: { engine: ReturnType<typeof useExamEngine> }) {
    const { 
        currentQuestion: q, 
        currentQIndex, 
        questions, 
        answers, 
        actions 
    } = engine;

    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollByAmount = (amount: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ top: amount, behavior: 'smooth' });
        }
    };

    if (!q) return <div className="p-8 text-center text-gray-500">Loading Question...</div>;

    const selectedOption = answers[q.id];

    return (
        <div className="flex flex-col h-full bg-white relative">
            
            {/* Top Bar for Question Info (Simplified) */}
            <div className="flex justify-between items-center px-4 py-2 bg-white shrink-0">
                {/* The header is empty except maybe instructions or language switch handled globally */}
                <div className="flex gap-4 text-sm font-semibold text-black">
                    {/* Often NTA has internal +5 / -1 markers per section, or nothing */}
                </div>
            </div>

            {/* Scrollable Question Content */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-2 flex flex-col custom-scrollbar text-black relative"
            >
                <div className="border-t border-[#ccc] pt-2 mb-4">
                    <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>
                        Question {currentQIndex + 1}:
                    </div>
                </div>

                {/* Passage / Instructions (If any) */}
                {q.passageId && engine.passages[q.passageId] && (
                    <div className="border border-[#ccc] p-3 text-[14px] text-black mb-4 bg-[#f9f9f9]">
                        <div className="font-bold mb-2 uppercase text-xs">Read the following passage:</div>
                        <div dangerouslySetInnerHTML={{ __html: engine.passages[q.passageId].text }} />
                    </div>
                )}

                {/* Question Details */}
                <div className="flex flex-col gap-4 mb-4">
                    {/* Render Text */}
                    {q.text && (
                        <div 
                            className="text-[16px] leading-relaxed text-black"
                            dangerouslySetInnerHTML={{ __html: q.text }}
                        />
                    )}

                    {/* Render Image if exists */}
                    {q.imageUrl && (
                        <div className="w-full flex justify-center my-4">
                            <Image 
                                src={q.imageUrl} 
                                alt={`Question ${currentQIndex + 1}`}
                                width={600}
                                height={400}
                                className="object-contain" // no rounding, no shadow
                                style={{ maxWidth: '100%', height: 'auto' }}
                            />
                        </div>
                    )}
                </div>

                {/* Match Pairs Table - Strict Style */}
                {q.questionType === 'match' && q.matchPairs && q.matchPairs.length > 0 && (
                    <div className="mb-6 border border-[#ccc]">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-[#f5f5f5] text-black border-b border-[#ccc]">
                                <tr>
                                    <th className="px-2 py-1 border-r border-[#ccc] w-10 text-center">#</th>
                                    <th className="px-2 py-1 border-r border-[#ccc] w-1/2">List I</th>
                                    <th className="px-2 py-1 border-r border-[#ccc] w-10 text-center">#</th>
                                    <th className="px-2 py-1 w-1/2">List II</th>
                                </tr>
                            </thead>
                            <tbody>
                                {q.matchPairs.map((pair, idx) => (
                                    <tr key={idx} className="border-b border-[#ccc] last:border-0 bg-white">
                                        <td className="px-2 py-1 text-center font-bold border-r border-[#ccc]">
                                            {String.fromCharCode(65 + idx)}.
                                        </td>
                                        <td className="px-2 py-1 border-r border-[#ccc]">{pair.left}</td>
                                        <td className="px-2 py-1 text-center font-bold border-r border-[#ccc]">
                                            I{idx === 0 ? '' : idx === 1 ? 'I' : idx === 2 ? 'II' : idx === 3 ? 'V' : ''}.
                                        </td>
                                        <td className="px-2 py-1">{pair.right}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Options List */}
                <div className="flex flex-col gap-2 mb-10">
                    {q.options?.map((optText, optIdx) => (
                        <label 
                            key={optIdx} 
                            className="flex items-start gap-2 p-2 cursor-pointer bg-white select-none hover:bg-[#f5f5f5]"
                        >
                            <div className="flex flex-col items-center mt-0.5">
                                <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    checked={selectedOption === optIdx}
                                    onChange={() => actions.handleOptionSelect(optIdx)}
                                    className="w-4 h-4 cursor-pointer mt-0.5"
                                />
                                <span className="text-[12px] font-bold text-black mt-1">({optIdx + 1})</span>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <span className="text-[15px] text-black mt-0.5" dangerouslySetInnerHTML={{ __html: optText }} />
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Scroll Buttons Overlay */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
                <button 
                    onClick={() => scrollByAmount(-200)}
                    className="w-10 h-10 rounded-full bg-blue-50/80 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm hover:bg-blue-100 transition-colors"
                >
                    <ArrowUp size={20} />
                </button>
                <button 
                    onClick={() => scrollByAmount(200)}
                    className="w-10 h-10 rounded-full bg-blue-50/80 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm hover:bg-blue-100 transition-colors"
                >
                    <ArrowDown size={20} />
                </button>
            </div>

            {/* Bottom Action Bar (Strict NTA Style) */}
            <div className="bg-white px-4 py-3 flex flex-col gap-2 shrink-0 border-t border-[#ccc]">
                {/* Main EXAM action buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <button 
                        onClick={actions.saveAndNext}
                        className="bg-[#4caf50] hover:bg-[#388e3c] text-white px-4 py-2 text-[14px] font-medium border border-[#2e7d32]"
                    >
                        SAVE & NEXT
                    </button>
                    <button 
                        onClick={actions.clearResponse}
                        className="bg-[#e0e0e0] hover:bg-[#bdbdbd] text-black px-4 py-2 text-[14px] font-medium border border-[#9e9e9e]"
                    >
                        CLEAR
                    </button>
                    <button 
                        onClick={actions.saveAndMarkForReview}
                        className="bg-[#ff9800] hover:bg-[#f57c00] text-white px-4 py-2 text-[14px] font-medium border border-[#ef6c00]"
                    >
                        SAVE & MARK FOR REVIEW
                    </button>
                    <button 
                        onClick={actions.markForReviewAndNext}
                        className="bg-[#1976d2] hover:bg-[#1565c0] text-white px-4 py-2 text-[14px] font-medium border border-[#0d47a1]"
                    >
                        MARK FOR REVIEW & NEXT
                    </button>
                </div>

                {/* Navigation and Submit Buttons */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#eee]">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => actions.handleJump(currentQIndex - 1)}
                            disabled={currentQIndex === 0}
                            className="bg-[#eeeeee] hover:bg-[#e0e0e0] text-black px-4 py-1.5 text-[14px] font-medium border border-[#999] disabled:opacity-50"
                        >
                            &lt;&lt; BACK
                        </button>
                        <button 
                            onClick={() => actions.handleJump(currentQIndex + 1)}
                            disabled={currentQIndex === questions.length - 1}
                            className="bg-[#eeeeee] hover:bg-[#e0e0e0] text-black px-4 py-1.5 text-[14px] font-medium border border-[#999] disabled:opacity-50"
                        >
                            NEXT &gt;&gt;
                        </button>
                    </div>

                    <button 
                        onClick={() => {
                            if(confirm('Are you sure you want to submit the exam? This cannot be undone.')) {
                                actions.submitTest();
                            }
                        }}
                        className="bg-[#4caf50] hover:bg-[#388e3c] text-white px-5 py-2 text-[14px] font-semibold border-none"
                    >
                        SUBMIT
                    </button>
                </div>
            </div>
        </div>
    );
}
