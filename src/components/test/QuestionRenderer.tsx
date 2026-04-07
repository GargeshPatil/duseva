import React from 'react';
import Image from 'next/image';
import { MatchQuestion } from './MatchQuestion';
import { sanitizeText } from '@/utils/sanitizeText';
import { RenderContent } from './RenderContent';

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

    const passageText = question.passageText || question.parentPassage;
    const questionText = question.text || question.questionText;
    const hasPassage = !!question.passageContent || !!passageText;
    const hasQuestion = !!question.questionContent || !!questionText;

    return (
        <div className="question-container flex flex-col gap-4 mb-4">
            {/* PASSAGE BLOCK */}
            {hasPassage && (
                <div
                    className="passage-block"
                    style={{
                        maxHeight: "220px",
                        overflowY: "auto",
                        padding: "12px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        marginBottom: "16px",
                        background: "#fafafa",
                        color: "black",
                        fontSize: "14px"
                    }}
                >
                    <RenderContent 
                        content={question.passageContent} 
                        fallback={sanitizeText(passageText || "")} 
                    />
                </div>
            )}

            {/* IMAGE */}
            {question.imageUrl && (
                <div className="w-full flex justify-center my-4">
                    <img 
                        src={question.imageUrl} 
                        alt="question"
                        style={{
                            maxWidth: "100%",
                            maxHeight: "300px",
                            objectFit: "contain",
                            marginBottom: "12px"
                        }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                </div>
            )}

            {/* QUESTION */}
            {hasQuestion && (
                <div className="question-text text-[16px] leading-relaxed text-black rich-text-content">
                    <RenderContent 
                        content={question.questionContent} 
                        fallback={sanitizeText(questionText || "")}
                    />
                </div>
            )}

            {/* OPTIONS */}
            {isMatch && question.matchPairs && question.matchPairs.length > 0 ? (
                <MatchQuestion question={question} selectedOption={selectedOption} onOptionSelect={onOptionSelect} />
            ) : (
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
                                <div className="text-[15px] text-black mt-0.5">
                                    <RenderContent 
                                        content={question.optionsContent && question.optionsContent[optIdx]} 
                                        fallback={sanitizeText(optText || "")}
                                    />
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
