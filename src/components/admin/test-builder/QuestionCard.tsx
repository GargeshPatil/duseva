import React from "react";
import { Question } from "@/types/admin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trash2, GripVertical, Check, Copy, X } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";

interface QuestionCardProps {
    question: Question;
    index: number;
    onChange: (updated: Question) => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

export function QuestionCard({ question, index, onChange, onDelete, onDuplicate }: QuestionCardProps) {
    const dragControls = useDragControls();

    const handleChange = (field: keyof Question, value: any) => {
        onChange({ ...question, [field]: value });
    };

    const handleOptionChange = (optIndex: number, text: string) => {
        const newOptions = [...question.options];
        newOptions[optIndex] = text;
        handleChange('options', newOptions);
    };

    const addOption = () => {
        handleChange('options', [...question.options, ""]);
    };

    const removeOption = (optIndex: number) => {
        const newOptions = question.options.filter((_, i) => i !== optIndex);
        handleChange('options', newOptions);
        // Adjust correct option if needed
        if (question.correctOption === optIndex) {
            handleChange('correctOption', 0);
        } else if (question.correctOption > optIndex) {
            handleChange('correctOption', question.correctOption - 1);
        }
    };

    return (
        <Reorder.Item value={question} id={question.id} dragListener={false} dragControls={dragControls}>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group transition-all hover:border-blue-300">
                {/* Drag Handle & Header */}
                <div className="absolute left-2 top-6 cursor-move text-slate-300 hover:text-slate-600 p-2 touch-none" onPointerDown={(e) => dragControls.start(e)}>
                    <GripVertical className="h-5 w-5" />
                </div>

                <div className="pl-8 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                                Question {index + 1}
                            </label>
                            <textarea
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[60px] resize-y"
                                value={question.text}
                                onChange={(e) => handleChange('text', e.target.value)}
                                placeholder="Type the question text here..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate">
                                <Copy className="h-4 w-4 text-slate-400 hover:text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onDelete} title="Delete">
                                <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                            </Button>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                        {question.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div
                                    className={`
                                        w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors
                                        ${question.correctOption === i ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-slate-400'}
                                    `}
                                    onClick={() => handleChange('correctOption', i)}
                                    title="Mark as correct"
                                >
                                    {question.correctOption === i && <Check className="h-3 w-3" />}
                                </div>
                                <Input
                                    value={opt}
                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                    placeholder={`Option ${i + 1}`}
                                    className={`flex-1 ${question.correctOption === i ? 'bg-green-50/50 border-green-200' : ''}`}
                                />
                                {question.options.length > 2 && (
                                    <button
                                        onClick={() => removeOption(i)}
                                        className="text-slate-300 hover:text-red-500 p-1"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {question.options.length < 6 && (
                            <div className="flex items-center gap-3 pl-8">
                                <button
                                    onClick={addOption}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium py-1 px-2 hover:bg-blue-50 rounded"
                                >
                                    + Add Option
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer: Explanation & Meta */}
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Explanation (Solution)</label>
                            <textarea
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                                value={question.explanation || ""}
                                onChange={(e) => handleChange('explanation', e.target.value)}
                                placeholder="Explain the correct answer..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Difficulty</label>
                                <select
                                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                                    value={question.difficulty || "Medium"}
                                    onChange={(e) => handleChange('difficulty', e.target.value)}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Stream</label>
                                <select
                                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                                    value={question.stream || "General"}
                                    onChange={(e) => handleChange('stream', e.target.value)}
                                >
                                    <option value="General">General</option>
                                    <option value="Science">Science</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Humanities">Humanities</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Category (Subject)</label>
                                <Input
                                    className="h-8 text-xs"
                                    value={question.subject || ""}
                                    onChange={(e) => handleChange('subject', e.target.value)}
                                    placeholder="e.g. Physics"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Reorder.Item>
    );
}
