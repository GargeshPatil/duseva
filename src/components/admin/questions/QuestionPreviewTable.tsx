// ... imports
import { ParseResult } from "@/utils/csvParser";
import { Question } from "@/types/admin";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface QuestionPreviewTableProps {
    parseResult: ParseResult;
}

export function QuestionPreviewTable({ parseResult }: QuestionPreviewTableProps) {
    const { rows, meta } = parseResult;

    // Rows can now be valid, invalid, or duplicate (marked via isDuplicate prop on ParsedRow if we add it, othewise checks)
    // Actually, duplicate check happens in Modal. Modal should ideally update the `rows` state?
    // Or Modal passes `duplicates` array separately.
    // Let's assume Modal passes `duplicates` prop? No, props are fixed here.
    // The Modal uses `setDuplicates` but doesn't modify `parseResult`.
    // Wait, I need to pass `duplicates` as a separate prop or attach it to `parseResult`.
    // In Modal I did `result.duplicates = dups`. But `duplicates` is a `Partial<Question>[]`.
    // It's hard to map back to specific rows if questions are identical.
    // But duplicate check uses text+subject.

    // BETTER: Modal should pass `duplicates` prop to this component, AND we match by content.
    // OR we accept that `parseResult` is the source of truth for rows.

    // Let's rely on text matching for duplicates rendering here too. 
    // BUT we need access to the `duplicates` list from parent.
    // Parent should pass it. I will update Props.

    return (
        <div className="space-y-4">
            {/* Stats Header */}
            <div className="flex gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    <span className="font-medium">Total: {meta.totalRows}</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">{meta.validRows} Valid</span>
                </div>
                {meta.invalidRows > 0 && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">{meta.invalidRows} Errors</span>
                    </div>
                )}
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3">Row</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Question</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Difficulty</th>
                                <th className="px-4 py-3">Correct Ans</th>
                                <th className="px-4 py-3">Marks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                        No data to display.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => {
                                    const { data, valid, errors, row: rowNum } = row;
                                    const q = data;

                                    // Check if duplicate (passed via extended interface or we infer?)
                                    // For now, let's rely on parent modification or simple check
                                    // The duplicate check in modal attaches `isDuplicate` to row?
                                    // I'll update Modal to do that.
                                    const isDuplicate = (row as any).isDuplicate;

                                    let statusColor = "bg-green-50";
                                    let statusText = "Valid";
                                    let statusIcon = <CheckCircle className="h-3 w-3" />;

                                    if (!valid) {
                                        statusColor = "bg-red-50";
                                        statusText = "Error";
                                        statusIcon = <AlertCircle className="h-3 w-3" />;
                                    } else if (isDuplicate) {
                                        statusColor = "bg-amber-50";
                                        statusText = "Duplicate";
                                        statusIcon = <AlertTriangle className="h-3 w-3" />;
                                    }

                                    return (
                                        <tr key={rowNum} className={`hover:bg-slate-50 ${!valid ? 'bg-red-50/30' : ''} ${isDuplicate ? 'bg-amber-50/30' : ''}`}>
                                            <td className="px-4 py-2 text-slate-400 font-mono text-xs">{rowNum}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${!valid ? 'text-red-700 bg-red-100 border-red-200' :
                                                            isDuplicate ? 'text-amber-700 bg-amber-100 border-amber-200' :
                                                                'text-green-700 bg-green-100 border-green-200'
                                                        }`}>
                                                        {statusIcon} {statusText}
                                                    </span>
                                                    {errors.length > 0 && (
                                                        <span className="text-[10px] text-red-600 font-medium max-w-[200px] whitespace-normal">
                                                            {errors.join(", ")}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 max-w-[300px] truncate">
                                                <span title={q.text}>{q.text || <span className="text-slate-300 italic">Missing Text</span>}</span>
                                            </td>
                                            <td className="px-4 py-2">{q.subject || "-"}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-0.5 rounded text-xs border ${q.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-100" :
                                                        q.difficulty === "Hard" ? "bg-red-50 text-red-700 border-red-100" :
                                                            "bg-yellow-50 text-yellow-700 border-yellow-100"
                                                    }`}>
                                                    {q.difficulty || "Med"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 font-mono">
                                                {q.correctOption !== -1 ? ["A", "B", "C", "D"][q.correctOption!] : <span className="text-red-400">-</span>}
                                            </td>
                                            <td className="px-4 py-2">
                                                {q.marks !== undefined ? `+${q.marks}` : '-'} / {q.negativeMarks !== undefined ? `-${q.negativeMarks}` : '-'}
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
