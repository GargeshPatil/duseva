import React from 'react';
import Image from 'next/image';
import { MatchQuestion } from './MatchQuestion';
import { PassageBlock } from './PassageBlock';

interface QuestionRendererProps {
    question: any;
    engine: any;
    selectedOption: number | undefined;
    onOptionSelect: (idx: number) => void;
}

export function QuestionRenderer({ question, engine, selectedOption, onOptionSelect }: QuestionRendererProps) {
    const isMatch = question.type === "match" || 
                    question.questionType === "match" || 
                    question.questionType === "MATCH" || 
                    (question.matchPairs && question.matchPairs.length > 0);

    if (isMatch && question.matchPairs && question.matchPairs.length > 0) {
        return <MatchQuestion question={question} selectedOption={selectedOption} onOptionSelect={onOptionSelect} />;
    }

    if (question.type === "passage" || question.questionType === "passage") {
        return <PassageBlock question={question} engine={engine} selectedOption={selectedOption} onOptionSelect={onOptionSelect} />;
    }

    // Default MCQ Rendering
    return (
        <div className="flex flex-col gap-4 mb-4">
            {/* Render Text */}
            {question.text && (
                <div 
                    className="text-[16px] leading-relaxed text-black rich-text-content"
                    dangerouslySetInnerHTML={{ __html: question.text }}
                />
            )}

            {/* Render Image if exists */}
            {question.imageUrl && (
                <div className="w-full flex justify-center my-4">
                    <Image 
                        src={question.imageUrl} 
                        alt={`Question`}
                        width={600}
                        height={400}
                        className="object-contain"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </div>
            )}

            {/* Options List */}
            <div className="flex flex-col gap-2 mb-10">
                {question.options?.map((optText: string, optIdx: number) => (
                    <label 
                        key={optIdx} 
                        className="flex items-start gap-2 p-2 cursor-pointer bg-white select-none hover:bg-[#f5f5f5]"
                    >
                        <div className="flex flex-col items-center mt-0.5">
                            <input
                                type="radio"
                                name={`q-${question.id}`}
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
