import { ParseResult } from "@/utils/csvParser";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface QuestionPreviewTableProps {
    parseResult: ParseResult;
}

export function QuestionPreviewTable({ parseResult }: QuestionPreviewTableProps) {
    const { rows, meta } = parseResult;

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

            <div className="border border-border rounded-xl overflow-hidden bg-surface-card shadow-sm">
                <div className="max-h-[400px] overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-elevated text-text-secondary font-semibold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 border-b border-border/50">Row</th>
                                <th className="px-4 py-3 border-b border-border/50">Status</th>
                                <th className="px-4 py-3 border-b border-border/50">Type</th>
                                <th className="px-4 py-3 border-b border-border/50">Question/Passage</th>
                                <th className="px-4 py-3 border-b border-border/50">Subject / Diff</th>
                                <th className="px-4 py-3 border-b border-border/50">Details / Ans</th>
                                <th className="px-4 py-3 border-b border-border/50">Marks</th>
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
                                    const { data, valid, errors, row: rowNum } = row;
                                    const q = data;

                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const isDuplicate = (row as any).isDuplicate;

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
                                        <tr key={rowNum} className={`hover:bg-surface-elevated/50 transition-colors ${!valid ? 'bg-semantic-error/5' : ''} ${isDuplicate ? 'bg-semantic-warning/5' : ''}`}>
                                            <td className="px-4 py-3 text-text-muted font-mono text-xs">{rowNum}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border ${!valid ? 'text-rose-400 bg-semantic-error/10 border-semantic-error/20' :
                                                        isDuplicate ? 'text-amber-400 bg-semantic-warning/10 border-semantic-warning/20' :
                                                            'text-emerald-400 bg-semantic-success/10 border-semantic-success/20'
                                                        }`}>
                                                        {statusIcon} {statusText}
                                                    </span>
                                                    {errors.length > 0 && (
                                                        <span className="text-[10px] text-rose-400/80 font-medium max-w-[200px] whitespace-normal">
                                                            {errors.join(", ")}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${q.questionType === 'match' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    q.questionType === 'passage' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-surface-elevated text-text-secondary border-border'
                                                    }`}>
                                                    {q.questionType || 'MCQ'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 max-w-[300px] truncate">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-text-primary text-sm" title={q.text}>{q.text || <span className="text-text-muted italic">Missing Text</span>}</span>
                                                    {q.questionType === 'passage' && (
                                                        <span className="text-[11px] text-blue-400/80 truncate" title={(q as any).passageText || q.passageId}>
                                                            Passage: {(q as any).passageText || q.passageId}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className="text-[11px] font-semibold tracking-wide uppercase text-text-secondary">{q.subject || "-"}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${q.difficulty === "Easy" ? "bg-semantic-success/10 text-emerald-400 border-semantic-success/20" :
                                                        q.difficulty === "Hard" ? "bg-semantic-error/10 text-rose-400 border-semantic-error/20" :
                                                            "bg-semantic-warning/10 text-amber-400 border-semantic-warning/20"
                                                        }`}>
                                                        {q.difficulty || "Med"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 font-mono text-xs">
                                                {q.questionType === 'match' ? (
                                                    <span className="text-purple-400 border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 rounded font-medium">{q.matchPairs?.length || 0} Pairs</span>
                                                ) : q.correctOption !== -1 ? (
                                                    <span className="bg-surface-elevated text-text-primary border border-border/50 px-2 py-0.5 rounded font-medium">Ans: {["A", "B", "C", "D"][q.correctOption!]}</span>
                                                ) : <span className="text-rose-400/50">-</span>}
                                            </td>

                                            <td className="px-4 py-3 text-xs font-medium">
                                                <span className="text-emerald-400">+{q.marks || 0}</span> <span className="text-text-muted mx-1">/</span> <span className="text-rose-400">-{q.negativeMarks || 0}</span>
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
