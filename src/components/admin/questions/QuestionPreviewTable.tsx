import React, { useState } from "react";
import { ParseResult, validateAndMapRow } from "@/utils/csvParser";
import { AlertCircle, CheckCircle, AlertTriangle, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QuestionPreviewTableProps {
    parseResult: ParseResult;
    onUpdateRow?: (rowIndex: number, updatedRaw: any) => void;
}

export function QuestionPreviewTable({ parseResult, onUpdateRow }: QuestionPreviewTableProps) {
    const { rows, meta } = parseResult;
    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            {/* Stats Header */}
            <div className="flex gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2 text-text-secondary bg-surface-elevated px-3 py-1 rounded-full border border-border">
                    <span className="font-semibold tracking-wide">Total: {meta.totalRows}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 bg-semantic-success/10 px-3 py-1 rounded-full border border-semantic-success/20">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-semibold tracking-wide">{meta.validRows} Valid</span>
                </div>
                {meta.invalidRows > 0 && (
                    <div className="flex items-center gap-2 text-rose-400 bg-semantic-error/10 px-3 py-1 rounded-full border border-semantic-error/20">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-semibold tracking-wide">{meta.invalidRows} Errors</span>
                    </div>
                )}
            </div>

            <div className="border border-border rounded-xl bg-surface-card shadow-sm">
                <div className="max-h-[500px] overflow-auto custom-scrollbar relative">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-elevated text-text-secondary font-semibold sticky top-0 z-10 shadow-sm outline outline-1 outline-border/50">
                            <tr>
                                <th className="px-4 py-3 border-b border-border/50 w-16">Row</th>
                                <th className="px-4 py-3 border-b border-border/50 w-32">Status</th>
                                <th className="px-4 py-3 border-b border-border/50 min-w-[250px]">Question/Passage details</th>
                                <th className="px-4 py-3 border-b border-border/50">Subject / Diff</th>
                                <th className="px-4 py-3 border-b border-border/50">Details / Ans</th>
                                <th className="px-4 py-3 border-b border-border/50 w-24">Marks</th>
                                <th className="px-4 py-3 border-b border-border/50 w-16">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-text-muted font-medium">
                                        No data to display.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => {
                                    const { data: q, valid, errors, row: rowNum } = row;
                                    
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const isDuplicate = (row as any).isDuplicate;
                                    
                                    if (editingRowIndex === rowNum) {
                                        return (
                                            <EditRowForm 
                                                key={`edit-${rowNum}`} 
                                                row={row} 
                                                onSave={(updatedRaw) => {
                                                    if (onUpdateRow) onUpdateRow(rowNum, updatedRaw);
                                                    setEditingRowIndex(null);
                                                }}
                                                onCancel={() => setEditingRowIndex(null)}
                                            />
                                        );
                                    }

                                    let statusText = "Valid";
                                    let statusIcon = <CheckCircle className="h-3 w-3" />;

                                    if (!valid) {
                                        statusText = "Error";
                                        statusIcon = <AlertCircle className="h-3 w-3" />;
                                    } else if (isDuplicate) {
                                        statusText = "Duplicate";
                                        statusIcon = <AlertTriangle className="h-3 w-3" />;
                                    }

                                    return (
                                        <tr key={`view-${rowNum}`} className={`hover:bg-surface-elevated/50 transition-colors ${!valid ? 'bg-semantic-error/5' : ''} ${isDuplicate ? 'bg-semantic-warning/5' : ''}`}>
                                            <td className="px-4 py-3 text-text-muted font-mono text-xs">{rowNum}</td>
                                            <td className="px-4 py-3 align-top">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border ${!valid ? 'text-rose-400 bg-semantic-error/10 border-semantic-error/20' :
                                                        isDuplicate ? 'text-amber-400 bg-semantic-warning/10 border-semantic-warning/20' :
                                                            'text-emerald-400 bg-semantic-success/10 border-semantic-success/20'
                                                        }`}>
                                                        {statusIcon} {statusText}
                                                    </span>
                                                    {errors.length > 0 && (
                                                        <span className="text-[10px] text-rose-400/90 font-medium max-w-[200px] whitespace-normal leading-tight mt-1">
                                                            {errors.join(", ")}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 max-w-[350px]">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border shrink-0 ${q.questionType === 'match' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                            'bg-surface-elevated text-text-secondary border-border'
                                                            }`}>
                                                            {q.questionType || 'MCQ'}
                                                        </span>
                                                        <span className="text-text-primary text-sm truncate" title={q.text}>{q.text || <span className="text-text-muted italic">Missing Text</span>}</span>
                                                    </div>
                                                    
                                                    {(q as any).passageText && (
                                                        <div className="flex flex-col gap-1 items-start mt-0.5">
                                                            <span className="text-[10px] text-blue-400/80 truncate block text-left max-w-full" title={(q as any).passageText}>
                                                                <span className="font-semibold uppercase mr-1">Passage Context:</span> {(q as any).passageText}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className="text-[10px] font-semibold tracking-wide uppercase text-text-secondary truncate max-w-[100px]" title={q.subject}>{q.subject || "-"}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase border ${q.difficulty === "Easy" ? "bg-semantic-success/10 text-emerald-400 border-semantic-success/20" :
                                                        q.difficulty === "Hard" ? "bg-semantic-error/10 text-rose-400 border-semantic-error/20" :
                                                            "bg-semantic-warning/10 text-amber-400 border-semantic-warning/20"
                                                        }`}>
                                                        {q.difficulty || "Medium"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 font-mono text-xs">
                                                {q.questionType === 'match' ? (
                                                    <span className="text-purple-400 border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 rounded font-medium text-[11px]">{q.matchPairs?.length || 0} Pairs</span>
                                                ) : q.correctOption !== -1 ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="bg-surface-elevated text-text-primary border border-border/50 px-2 py-0.5 rounded font-medium text-[11px] w-fit">Ans: {["A", "B", "C", "D"][q.correctOption!]}</span>
                                                    </div>
                                                ) : <span className="text-rose-400/50">-</span>}
                                            </td>

                                            <td className="px-4 py-3 text-xs font-medium">
                                                <span className="text-emerald-400">+{q.marks || 5}</span> <span className="text-text-muted mx-1">/</span> <span className="text-rose-400">-{q.negativeMarks || 1}</span>
                                            </td>
                                            
                                            <td className="px-4 py-3">
                                                {(!valid || onUpdateRow) && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => setEditingRowIndex(rowNum)}
                                                        className="h-7 w-7 p-0 text-text-muted hover:text-cta-primary hover:bg-cta-primary/10"
                                                        title="Edit Row"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Inline editing component
function EditRowForm({ row, onSave, onCancel }: { row: any, onSave: (r: any) => void, onCancel: () => void }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [raw, setRaw] = useState<any>(row.raw || {});
    
    // Live validation
    const { valid, errors } = validateAndMapRow(raw);

    const handleChange = (field: string, value: string) => {
        setRaw({ ...raw, [field]: value });
    };

    const isMatch = raw.questionType?.toLowerCase() === 'match';
    const isPassage = raw.questionType?.toLowerCase() === 'passage';

    return (
        <tr className="bg-surface-elevated/50 border-y-2 border-cta-primary/30 relative shadow-inner">
            <td colSpan={7} className="p-4">
                <div className="flex flex-col gap-4 max-w-4xl whitespace-normal relative">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-text-primary text-sm flex items-center gap-2">
                                <Edit2 className="h-4 w-4 text-cta-primary" />
                                Editing Row {row.row}
                            </span>
                            {valid ? (
                                <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20">
                                    <CheckCircle className="h-3 w-3" /> Fixes applied, row is valid!
                                </span>
                            ) : (
                                <span className="text-rose-400 text-xs font-semibold bg-rose-500/10 px-2 py-0.5 rounded flex items-center gap-1 border border-rose-500/20">
                                    <AlertCircle className="h-3 w-3" /> Still contains {errors.length} errors
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 text-xs text-text-muted hover:text-white">Cancel</Button>
                            <Button 
                                size="sm" 
                                onClick={() => onSave(raw)} 
                                className="h-7 text-xs bg-cta-primary text-white gap-1.5 shadow-[0_0_10px_rgba(var(--cta-primary-rgb),0.3)] hover:bg-cta-hover"
                            >
                                <Save className="h-3.5 w-3.5" /> Save Changes
                            </Button>
                        </div>
                    </div>
                    
                    {/* Error display inside edit window */}
                    {!valid && (
                        <div className="bg-semantic-error/10 border border-semantic-error/20 p-2.5 rounded-lg text-xs">
                            <ul className="list-disc list-inside text-rose-400 font-medium space-y-0.5">
                                {errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* Unified Form Grid */}
                    <div className="grid grid-cols-12 gap-x-4 gap-y-3">
                        <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Question Type</label>
                            <select 
                                value={raw.questionType || "mcq"} 
                                onChange={(e) => handleChange('questionType', e.target.value)}
                                className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 focus:ring-1 focus:ring-cta-primary outline-none"
                            >
                                <option value="mcq">MCQ</option>
                                <option value="match">Match the Following</option>
                            </select>
                        </div>
                        
                        <div className="col-span-12">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Question Text</label>
                            <textarea 
                                value={raw.questionText || ""} 
                                onChange={(e) => handleChange('questionText', e.target.value)}
                                className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 focus:ring-1 focus:ring-cta-primary outline-none min-h-[60px] resize-y"
                                style={{ whiteSpace: "pre-wrap" }}
                                placeholder="Enter the main question text..."
                            />
                        </div>

                        {/* Passage Specifics */}
                        <div className="col-span-12 bg-blue-500/5 p-3 rounded border border-blue-500/20">
                            <div>
                                <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1">Optional Passage Text</label>
                                <textarea 
                                    value={raw.passageText || ""} 
                                    onChange={(e) => handleChange('passageText', e.target.value)}
                                    className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 focus:ring-1 focus:ring-cta-primary outline-none min-h-[60px]"
                                    style={{ whiteSpace: "pre-wrap" }}
                                    placeholder="Enter passage context here if this query links to a passage..."
                                />
                            </div>
                        </div>

                        {/* Match Specifics */}
                        {isMatch && (
                            <div className="col-span-12 grid grid-cols-2 gap-4 bg-purple-500/5 p-3 rounded border border-purple-500/20">
                                <div>
                                    <label className="block text-[10px] font-bold text-purple-400 uppercase mb-1">List A Items (e.g. A:Apple|B:Banana)</label>
                                    <input 
                                        value={raw.listA || ""} 
                                        onChange={(e) => handleChange('listA', e.target.value)}
                                        className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 focus:ring-1 focus:ring-cta-primary outline-none"
                                        placeholder="Separated by pipe '|'"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-purple-400 uppercase mb-1">List B Items (e.g. 1:Red|2:Yellow)</label>
                                    <input 
                                        value={raw.listB || ""} 
                                        onChange={(e) => handleChange('listB', e.target.value)}
                                        className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 focus:ring-1 focus:ring-cta-primary outline-none"
                                        placeholder="Separated by pipe '|'"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Options */}
                        <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Option A</label>
                            <input value={raw.optionA || ""} onChange={(e) => handleChange('optionA', e.target.value)} className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 outline-none" />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Option B</label>
                            <input value={raw.optionB || ""} onChange={(e) => handleChange('optionB', e.target.value)} className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 outline-none" />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Option C</label>
                            <input value={raw.optionC || ""} onChange={(e) => handleChange('optionC', e.target.value)} className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 outline-none" />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Option D</label>
                            <input value={raw.optionD || ""} onChange={(e) => handleChange('optionD', e.target.value)} className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 outline-none" />
                        </div>

                        {/* Answers & Meta */}
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Ans (A/B/C/D)</label>
                            <input value={raw.correctAnswer || ""} onChange={(e) => handleChange('correctAnswer', e.target.value)} className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 outline-none" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Difficulty</label>
                            <input value={raw.difficulty || ""} onChange={(e) => handleChange('difficulty', e.target.value)} className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 outline-none" placeholder="Medium" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Subject</label>
                            <input value={raw.subjectTag || ""} onChange={(e) => handleChange('subjectTag', e.target.value)} className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 outline-none" />
                        </div>
                        <div className="col-span-6">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Explanation</label>
                            <input value={raw.explanation || ""} onChange={(e) => handleChange('explanation', e.target.value)} className="w-full text-sm bg-surface-card border border-border rounded px-2 py-1.5 outline-none" />
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
}
