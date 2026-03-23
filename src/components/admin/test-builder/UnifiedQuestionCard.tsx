import React, { useState } from "react";
import { Question, Passage } from "@/types/admin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trash2, GripVertical, Check, Copy, X, ChevronDown, ChevronUp, Image as ImageIcon, Loader2 } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { uploadImage } from "@/services/storageService";
import { SubQuestionEditor } from "./SubQuestionEditor";

interface UnifiedQuestionCardProps {
    question: Question;
    index?: number; // Optional if not in a list
    onChange: (updated: Question) => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    passages: Passage[]; // For passage selection
    isDragDisabled?: boolean; // True when rendered outside a reorder list
}

export function UnifiedQuestionCard({
    question,
    index,
    onChange,
    onDelete,
    onDuplicate,
    isExpanded,
    onToggleExpand,
    passages,
    isDragDisabled
}: UnifiedQuestionCardProps) {
    const dragControls = useDragControls();

    const [isCreatingPassage, setIsCreatingPassage] = useState(false);
    const [newPassageText, setNewPassageText] = useState("");
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (field: keyof Question, value: any) => {
        onChange({ ...question, [field]: value });
    };

    const handleOptionChange = (optIndex: number, text: string) => {
        const newOptions = [...(question.options || [])];
        newOptions[optIndex] = text;
        handleChange('options', newOptions);
    };

    const addOption = () => {
        handleChange('options', [...(question.options || []), ""]);
    };

    const removeOption = (optIndex: number) => {
        const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
        handleChange('options', newOptions);
        if (question.correctOption === optIndex) {
            handleChange('correctOption', 0);
        } else if (question.correctOption > optIndex) {
            handleChange('correctOption', question.correctOption - 1);
        }
    };

    const handleNewPassageChange = (text: string) => {
        setNewPassageText(text);
        // Note: Actual passage creation needs to be handled on save by the parent
        // For inline editing, it's easier if we store a temporary prop or rely on parent
        handleChange('passageText' as any, text);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const timestamp = Date.now();
            const path = `questions/images/${question.id || "temp"}_${timestamp}_${file.name}`;
            const url = await uploadImage(file, path);
            handleChange('imageUrl', url);
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("Failed to upload image.");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const cardContent = (
        <div className={`bg-surface-card rounded-xl shadow-sm border p-4 transition-all ${isExpanded ? 'border-cta-primary/50 ring-1 ring-cta-primary/20 z-50 relative' : 'border-border hover:border-cta-primary/30'} ${isDragDisabled ? 'w-full' : ''}`}>

            {/* Header/Summary View */}
            <div className="flex items-center gap-3">
                {!isDragDisabled && (
                    <div className="cursor-move text-text-muted hover:text-text-secondary p-1 touch-none" onPointerDown={(e) => dragControls.start(e)}>
                        <GripVertical className="h-5 w-5" />
                    </div>
                )}

                <div
                    className="flex-1 cursor-pointer flex items-center justify-between"
                    onClick={onToggleExpand}
                >
                    <div className="flex items-center gap-3 truncate">
                        {index !== undefined && <span className="text-xs font-bold text-text-muted bg-surface-elevated px-2 py-1 rounded">Q{index + 1}</span>}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${question.questionType === 'match' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            question.questionType === 'passage' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-surface-elevated text-text-secondary border-border'
                            }`}>
                            {question.questionType?.toUpperCase() || 'MCQ'}
                        </span>
                        <span className="text-sm font-medium text-text-primary truncate max-w-[300px] md:max-w-[500px]">
                            {question.text || "New Empty Question"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] border hidden sm:inline-block 
                            ${question.difficulty === "Easy" ? "bg-semantic-success/10 text-emerald-400 border-semantic-success/20" :
                                question.difficulty === "Hard" ? "bg-semantic-error/10 text-rose-400 border-semantic-error/20" :
                                    "bg-semantic-warning/10 text-amber-400 border-semantic-warning/20"
                            }`}>
                            {question.difficulty || "Medium"}
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-1 ml-2">
                    {onDuplicate && (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDuplicate(); }} title="Duplicate">
                            <Copy className="h-4 w-4 text-text-muted hover:text-cta-primary" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete">
                            <Trash2 className="h-4 w-4 text-text-muted hover:text-semantic-error" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Expanded Edit View */}
            {isExpanded && (
                <div className="mt-6 pl-0 sm:pl-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">

                            {/* Question Type Selection */}
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Question Type</label>
                                <select
                                    className="w-full sm:w-1/2 px-3 py-2 bg-surface-base border border-border rounded-lg text-sm"
                                    value={question.questionType || "mcq"}
                                    onChange={(e) => handleChange('questionType', e.target.value)}
                                >
                                    <option value="mcq">Standard MCQ</option>
                                    <option value="match">Match the Following</option>
                                    <option value="passage">Passage-based</option>
                                </select>
                            </div>

                            {/* Passage Selection/Creation */}
                            {question.questionType === "passage" && (
                                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-4">
                                    <h4 className="font-medium text-blue-400 text-sm">Passage Configuration</h4>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={!isCreatingPassage}
                                                onChange={() => setIsCreatingPassage(false)}
                                                className="text-cta-primary focus:ring-cta-primary h-4 w-4"
                                            />
                                            Select Existing
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={isCreatingPassage}
                                                onChange={() => setIsCreatingPassage(true)}
                                                className="text-cta-primary focus:ring-cta-primary h-4 w-4"
                                            />
                                            Create New
                                        </label>
                                    </div>

                                    {!isCreatingPassage ? (
                                        <select
                                            className="w-full px-3 py-2 bg-surface-card border border-border rounded-lg text-sm"
                                            value={question.passageId || ""}
                                            onChange={(e) => handleChange('passageId', e.target.value)}
                                        >
                                            <option value="">-- Select a Passage --</option>
                                            {passages.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.text.length > 80 ? p.text.substring(0, 80) + "..." : p.text}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div>
                                            <textarea
                                                className="w-full px-3 py-2 bg-surface-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-cta-primary min-h-[120px]"
                                                value={newPassageText || (question as any).passageText || ""}
                                                onChange={(e) => handleNewPassageChange(e.target.value)}
                                                placeholder="Enter passage text here. It will be created when you save."
                                            />
                                            <p className="text-[10px] text-text-muted mt-1">Note: The passage is created when the question/test is saved.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sub-Questions Editor for Passage type */}
                            {question.questionType === "passage" && (
                                <div className="p-4 bg-surface-base border border-border rounded-lg">
                                    <SubQuestionEditor 
                                        subQuestions={question.subQuestions || []} 
                                        onChange={(sqs) => handleChange('subQuestions', sqs)} 
                                    />
                                </div>
                            )}

                            {/* Legacy Question Fields (Only shown if NOT a passage, OR a passage with 0 subquestions) */}
                            {(!(question.questionType === "passage" && question.subQuestions && question.subQuestions.length > 0)) && (
                                <>
                                    {/* Question Text */}
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                                    {question.questionType === "passage" ? "Question Text related to Passage" : "Question Text"}
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 bg-surface-base border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-cta-primary transition-all min-h-[80px] resize-y"
                                    value={question.text}
                                    onChange={(e) => handleChange('text', e.target.value)}
                                    placeholder="Type the question here..."
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="p-4 bg-surface-elevated border border-border rounded-lg space-y-3">
                                <label className="block text-xs font-semibold text-text-secondary uppercase">Attached Image (Optional)</label>
                                {question.imageUrl ? (
                                    <div className="relative inline-block border border-border rounded-lg overflow-hidden bg-background">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={question.imageUrl} alt="Question" className="max-h-48 object-contain" />
                                        <button
                                            onClick={() => handleChange('imageUrl', null)}
                                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-semantic-error transition"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploadingImage}
                                            className="max-w-[300px] text-xs h-9 cursor-pointer"
                                        />
                                        {isUploadingImage && <Loader2 className="h-4 w-4 animate-spin text-text-muted" />}
                                    </div>
                                )}
                            </div>

                            {/* Match Pairs Builder */}
                            {question.questionType === "match" && (
                                <div className="p-4 bg-surface-elevated border border-border rounded-lg space-y-4">
                                    <h4 className="font-medium text-text-primary text-sm flex items-center justify-between">
                                        Match Pairs
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => {
                                                const newPairs = [...(question.matchPairs || [])];
                                                newPairs.push({ left: "", right: "" });
                                                handleChange('matchPairs', newPairs);
                                            }}
                                        >
                                            + Add Pair
                                        </Button>
                                    </h4>
                                    <div className="space-y-2">
                                        {(question.matchPairs || []).map((pair, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-text-muted w-6 text-center">{String.fromCharCode(65 + idx)}.</span>
                                                <Input
                                                    className="h-8 text-sm"
                                                    value={pair.left}
                                                    onChange={(e) => {
                                                        const newPairs = [...(question.matchPairs || [])];
                                                        newPairs[idx].left = e.target.value;
                                                        handleChange('matchPairs', newPairs);
                                                    }}
                                                    placeholder="List I Item"
                                                />
                                                <span className="text-xs font-bold text-text-muted w-6 text-center text-red">{"= "}</span>
                                                <Input
                                                    className="h-8 text-sm"
                                                    value={pair.right}
                                                    onChange={(e) => {
                                                        const newPairs = [...(question.matchPairs || [])];
                                                        newPairs[idx].right = e.target.value;
                                                        handleChange('matchPairs', newPairs);
                                                    }}
                                                    placeholder="List II Item"
                                                />
                                                {(question.matchPairs || []).length > 2 && (
                                                    <button
                                                        onClick={() => {
                                                            const newPairs = (question.matchPairs || []).filter((_, i) => i !== idx);
                                                            handleChange('matchPairs', newPairs);
                                                        }}
                                                        className="text-text-muted hover:text-semantic-error p-1"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-text-muted">Fill the options below with standard codes like A-I, B-II, C-III...</p>
                                </div>
                            )}

                            {/* Options */}
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Answers</label>
                                {(question.options || []).map((opt, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div
                                            className={`
                                                w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors
                                                ${question.correctOption === i ? 'bg-semantic-success border-semantic-success text-white' : 'border-border hover:border-border-strong'}
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
                                            className={`flex-1 h-9 ${question.correctOption === i ? 'bg-semantic-success/10 border-semantic-success/30' : ''}`}
                                        />
                                        {(question.options || []).length > 2 && (
                                            <button
                                                onClick={() => removeOption(i)}
                                                className="text-text-muted hover:text-semantic-error p-1"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {(question.options || []).length < 6 && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={addOption}
                                            className="text-xs text-cta-primary hover:text-cta-hover font-medium py-1 px-2 hover:bg-cta-primary/10 rounded mt-1"
                                        >
                                            + Add Option
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                        )}
                        </div>

                        {/* Right Column: Meta */}
                        <div className="bg-surface-base p-4 rounded-lg border border-border h-fit space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Explanation</label>
                                <textarea
                                    className="w-full px-3 py-2 bg-surface-card border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-cta-primary min-h-[100px] resize-y"
                                    value={question.explanation || ""}
                                    onChange={(e) => handleChange('explanation', e.target.value)}
                                    placeholder="Explain the correct answer..."
                                />
                            </div>

                            <hr className="border-border" />

                            <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Difficulty</label>
                                <select
                                    className="w-full px-2 py-1.5 bg-surface-card border border-border rounded text-sm outline-none focus:ring-1 focus:ring-cta-primary"
                                    value={question.difficulty || "Medium"}
                                    onChange={(e) => handleChange('difficulty', e.target.value)}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Stream</label>
                                <select
                                    className="w-full px-2 py-1.5 bg-surface-card border border-border rounded text-sm outline-none focus:ring-1 focus:ring-cta-primary"
                                    value={question.stream || "General"}
                                    onChange={(e) => handleChange('stream', e.target.value)}
                                >
                                    <option value="General">General</option>
                                    <option value="Science">Science</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Humanities">Humanities</option>
                                    <option value="English">English</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Category (Subject)</label>
                                <Input
                                    className="h-8 text-sm bg-surface-card focus:bg-background"
                                    value={question.subject || ""}
                                    onChange={(e) => handleChange('subject', e.target.value)}
                                    placeholder="e.g. Physics"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-semibold text-text-secondary uppercase mb-1">Marks (+)</label>
                                    <Input
                                        type="number"
                                        className="h-8 text-sm"
                                        value={question.marks || 5}
                                        onChange={(e) => handleChange('marks', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-text-secondary uppercase mb-1">Negative (-)</label>
                                    <Input
                                        type="number"
                                        className="h-8 text-sm"
                                        value={question.negativeMarks || 1}
                                        onChange={(e) => handleChange('negativeMarks', Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (isDragDisabled) {
        return cardContent;
    }

    return (
        <Reorder.Item value={question} id={question.id} dragListener={false} dragControls={dragControls} className="relative z-0 group">
            {/* The blurry overlay that appears behind everything else when THIS card is expanded, targeting sibling dimming */}
            {isExpanded && (
                <div className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40 transition-all pointer-events-auto" onClick={onToggleExpand}></div>
            )}
            <div className={`relative ${isExpanded ? 'z-50' : 'z-10'}`}>
                {cardContent}
            </div>
        </Reorder.Item>
    );
}
