import React from 'react';
import Image from 'next/image';

interface MatchQuestionProps {
    question: any;
    selectedOption: number | undefined;
    onOptionSelect: (idx: number) => void;
}

export function MatchQuestion({ question: q, selectedOption, onOptionSelect }: MatchQuestionProps) {
    if (!q.matchPairs || q.matchPairs.length === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* Question Text */}
            {q.text && (
                <div 
                    className="text-[16px] leading-relaxed text-black rich-text-content"
                    dangerouslySetInnerHTML={{ __html: q.text }}
                />
            )}

            {/* Render Image if exists */}
            {q.imageUrl && (
                <div className="w-full flex justify-center my-4">
                    <Image 
                        src={q.imageUrl} 
                        alt="Match Question Image"
                        width={600}
                        height={400}
                        className="object-contain"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </div>
            )}

            {/* Match Pairs Table - Strict Style */}
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
                        {q.matchPairs.map((pair: any, idx: number) => (
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

            {/* Options List */}
            <div className="flex flex-col gap-2 mb-10">
                {q.options?.map((optText: string, optIdx: number) => (
                    <label 
                        key={optIdx} 
                        className="flex items-start gap-2 p-2 cursor-pointer bg-white select-none hover:bg-[#f5f5f5]"
                    >
                        <div className="flex flex-col items-center mt-0.5">
                            <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={selectedOption === optIdx}
                                onChange={() => onOptionSelect(optIdx)}
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
    );
}
