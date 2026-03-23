import React from 'react';
import { SubQuestion } from '@/types/admin';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trash2, GripVertical, Check, X } from 'lucide-react';

interface SubQuestionEditorProps {
    subQuestions: SubQuestion[];
    onChange: (subQuestions: SubQuestion[]) => void;
}

export function SubQuestionEditor({ subQuestions, onChange }: SubQuestionEditorProps) {
    const addSubQuestion = () => {
        const newSq: SubQuestion = {
            id: 'sq_' + Date.now(),
            type: 'mcq',
            text: '',
            options: ['', '', '', ''],
            correctOption: 0
        };
        onChange([...subQuestions, newSq]);
    };

    const updateSubQuestion = (idx: number, updates: Partial<SubQuestion>) => {
        const newArr = [...subQuestions];
        newArr[idx] = { ...newArr[idx], ...updates };
        onChange(newArr);
    };

    const removeSubQuestion = (idx: number) => {
        onChange(subQuestions.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-4 col-span-1 md:col-span-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">Sub-Questions ({subQuestions.length})</h3>
                <Button variant="outline" size="sm" onClick={addSubQuestion} className="text-xs">
                    + Add Sub-Question
                </Button>
            </div>

            {subQuestions.length === 0 && (
                <div className="p-4 text-center border border-dashed border-border rounded-lg text-text-muted text-xs">
                    No sub-questions added. (Legacy mode: Will use main question fields below)
                </div>
            )}

            <div className="space-y-4">
                {subQuestions.map((sq, sIdx) => (
                    <div key={sq.id} className="p-4 bg-surface-base border border-border rounded-lg relative">
                        <button 
                            onClick={() => removeSubQuestion(sIdx)}
                            className="absolute top-2 right-2 text-text-muted hover:text-semantic-error p-1 bg-surface-elevated rounded"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 pr-8">
                            <div>
                                <label className="block text-[10px] font-semibold text-text-secondary uppercase mb-1">Type</label>
                                <select
                                    className="w-full px-2 py-1.5 bg-surface-card border border-border rounded text-sm"
                                    value={sq.type}
                                    onChange={(e) => updateSubQuestion(sIdx, { type: e.target.value as 'mcq' | 'match' })}
                                >
                                    <option value="mcq">MCQ</option>
                                    <option value="match">Match the Following</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="block text-[10px] font-semibold text-text-secondary uppercase mb-1">Question Text</label>
                            <textarea
                                className="w-full px-3 py-2 bg-surface-card border border-border rounded-lg text-sm min-h-[60px]"
                                value={sq.text}
                                onChange={(e) => updateSubQuestion(sIdx, { text: e.target.value })}
                                placeholder="Sub-question text..."
                            />
                        </div>

                        {sq.type === 'match' && (
                            <div className="p-3 bg-surface-elevated border border-border rounded-lg mb-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-semibold uppercase text-text-secondary">Match Pairs</span>
                                    <Button
                                        variant="ghost" size="sm" className="h-5 text-[10px] py-0"
                                        onClick={() => {
                                            const newPairs = [...(sq.matchPairs || [])];
                                            newPairs.push({ left: "", right: "" });
                                            updateSubQuestion(sIdx, { matchPairs: newPairs });
                                        }}
                                    >+ Pair</Button>
                                </div>
                                <div className="space-y-2">
                                    {(sq.matchPairs || []).map((pair, pIdx) => (
                                        <div key={pIdx} className="flex gap-2 items-center">
                                            <span className="text-xs font-bold w-4">{String.fromCharCode(65 + pIdx)}.</span>
                                            <Input className="h-7 text-xs" value={pair.left} onChange={e => {
                                                const newPairs = [...(sq.matchPairs || [])];
                                                newPairs[pIdx].left = e.target.value;
                                                updateSubQuestion(sIdx, { matchPairs: newPairs });
                                            }} placeholder="Left" />
                                            <span className="text-xs font-bold w-4">=</span>
                                            <Input className="h-7 text-xs" value={pair.right} onChange={e => {
                                                const newPairs = [...(sq.matchPairs || [])];
                                                newPairs[pIdx].right = e.target.value;
                                                updateSubQuestion(sIdx, { matchPairs: newPairs });
                                            }} placeholder="Right" />
                                            <button onClick={() => {
                                                const newPairs = (sq.matchPairs || []).filter((_, i) => i !== pIdx);
                                                updateSubQuestion(sIdx, { matchPairs: newPairs });
                                            }}><X className="h-3 w-3 text-semantic-error" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[10px] font-semibold text-text-secondary uppercase mb-1">Options</label>
                            {(sq.options || []).map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                    <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer flex-shrink-0
                                            ${sq.correctOption === oIdx ? 'bg-semantic-success border-semantic-success text-white' : 'border-border'}`}
                                        onClick={() => updateSubQuestion(sIdx, { correctOption: oIdx })}
                                    >
                                        {sq.correctOption === oIdx && <Check className="h-2 w-2" />}
                                    </div>
                                    <Input
                                        className="h-7 text-xs flex-1"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...sq.options];
                                            newOpts[oIdx] = e.target.value;
                                            updateSubQuestion(sIdx, { options: newOpts });
                                        }}
                                    />
                                    <button onClick={() => {
                                            const newOpts = sq.options.filter((_, i) => i !== oIdx);
                                            updateSubQuestion(sIdx, { 
                                                options: newOpts,
                                                correctOption: sq.correctOption === oIdx ? 0 : (sq.correctOption > oIdx ? sq.correctOption - 1 : sq.correctOption)
                                            });
                                        }}><X className="h-3 w-3 text-semantic-error" /></button>
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" className="h-5 text-[10px] py-0" onClick={() => {
                                const newOpts = [...sq.options, ""];
                                updateSubQuestion(sIdx, { options: newOpts });
                            }}>+ Add Option</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
