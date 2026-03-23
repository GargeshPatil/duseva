import React from 'react';
import Image from 'next/image';

interface PassageBlockProps {
    question: any;
    engine: any;
    selectedOption: number | undefined;
    onOptionSelect: (idx: number) => void;
}

export function PassageBlock({ question: q, engine, selectedOption, onOptionSelect }: PassageBlockProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* Passage Text Block */}
            {q.passageId && engine.passages[q.passageId] && (
                <div className="border border-[#ddd] p-[10px] mb-[15px] bg-[#fafafa] text-[14px] text-black">
                    <div className="font-bold mb-2 uppercase text-xs">Read the following passage:</div>
                    <div dangerouslySetInnerHTML={{ __html: engine.passages[q.passageId].text }} />
                </div>
            )}

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
                        alt="Passage Question Image"
                        width={600}
                        height={400}
                        className="object-contain"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </div>
            )}

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
