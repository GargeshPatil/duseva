"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { FileUploader } from "./FileUploader";
import { QuestionPreviewTable } from "./QuestionPreviewTable";
import { parseCSV, ParseResult, validateAndMapRow, ParsedRow } from "@/utils/csvParser";
import { firestoreService } from "@/services/firestoreService";
import { Question } from "@/types/admin";
import { Loader2, CheckCircle, AlertCircle, Upload, FileDown, AlertTriangle } from "lucide-react";

interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onPrepopulateFromCSV?: (questions: Partial<Question>[]) => void;
}

export function CSVImportModal({ isOpen, onClose, onSuccess, onPrepopulateFromCSV }: CSVImportModalProps) {
    const [step, setStep] = useState<"upload" | "validating" | "preview" | "uploading" | "result">("upload");

    const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const [uploadStats, setUploadStats] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
    const [duplicates, setDuplicates] = useState<Partial<Question>[]>([]);
    const [duplicateAction, setDuplicateAction] = useState<"skip" | "allow" | "overwrite">("skip");
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = async (selectedFile: File) => {

        try {
            setStep("validating");
            const result = await parseCSV(selectedFile);


            // Check for duplicates in DB
            const existingSignatures = await firestoreService.getQuestionSignatures();
            const dups: Partial<Question>[] = [];

            // Mark duplicates directly in the rows array
            result.rows.forEach(row => {
                if (!row.valid) return; // Skip checking invalid rows
                const q = row.data;
                const isDup = existingSignatures.some(ex =>
                    ex.text === (q.text || "").trim().toLowerCase() &&
                    (!q.subject || ex.subject === (q.subject || "").trim().toLowerCase())
                );

                if (isDup) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (row as any).isDuplicate = true;
                    dups.push(q);
                }
            });

            setDuplicates(dups);
            // result.duplicates = dups; // No longer needed on ParseResult directly if using rows

            setParseResult(result);
            setStep("preview");
        } catch (error) {
            console.error("Failed to parse CSV:", error);
            setStep("upload");
            // Could set error state here
        }
    };

    const handleDownloadTemplate = () => {
        const headers = [
            "questionType", "listA", "listB", "passageId", "passageText",
            "questionText", "optionA", "optionB", "optionC", "optionD",
            "correctAnswer", "explanation", "subjectTag", "topicTag",
            "difficulty", "marks", "negativeMarks", "streams"
        ];
        const dummyRow1 = [
            "mcq", "", "", "", "",
            "What is the capital of France?", "London", "Berlin", "Paris", "Madrid",
            "C", "Paris is the capital of France.", "Geography", "World Capitals",
            "Easy", "5", "1", "Humanities"
        ];
        // Match example
        const dummyRow2 = [
            "match", "A:Apple|B:Banana|C:Cherry", "1:Red|2:Yellow|3:Green", "", "",
            "Match the fruits with their colors.", "", "", "", "",
            "A-1, B-2, C-3", "Apples are red, bananas are yellow, cherries are green.", "Science", "Botany",
            "Medium", "5", "1", "Science"
        ];
        // Passage example (Using passageText leaves passageId blank. The system auto-generates passageId)
        const dummyRow3 = [
            "passage", "", "", "", "This is a sample passage text. System will auto-create passageId for it.",
            "According to the passage what is it?", "A sample", "A book", "A movie", "A song",
            "A", "The passage explicitly says it is a sample.", "English", "Reading Comprehension",
            "Hard", "5", "1", "General"
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + dummyRow1.map(val => `"${val}"`).join(",") + "\n"
            + dummyRow2.map(val => `"${val}"`).join(",") + "\n"
            + dummyRow3.map(val => `"${val}"`).join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "question_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpdateRow = (rowIndex: number, updatedRaw: any) => {
        if (!parseResult) return;

        const { valid, data, errors } = validateAndMapRow(updatedRaw);

        const newRows = parseResult.rows.map(r => {
            if (r.row === rowIndex) {
                // Re-check duplicate if valid
                let isDuplicate = false;
                if (valid) {
                    const existingSignatures = duplicates; // We rely on existing fetched dups loosely
                    isDuplicate = existingSignatures.some(ex =>
                        ex.text === (data.text || "").trim().toLowerCase() &&
                        (!data.subject || ex.subject === (data.subject || "").trim().toLowerCase())
                    );
                }
                
                return {
                    ...r,
                    data,
                    valid,
                    errors,
                    raw: updatedRaw,
                    isDuplicate
                } as ParsedRow & { raw: any, isDuplicate?: boolean };
            }
            return r;
        });

        const validRows = newRows.filter(r => r.valid).length;
        const invalidRows = newRows.length - validRows;

        setParseResult({
            ...parseResult,
            rows: newRows,
            meta: {
                ...parseResult.meta,
                validRows,
                invalidRows
            }
        });
    };

    const handleUpload = async () => {
        if (!parseResult || parseResult.rows.length === 0) return;

        // Filter valid questions
        let validRows = parseResult.rows.filter(r => r.valid);

        if (validRows.length === 0) return; // No valid data

        setStep("uploading");
        setUploadProgress(0);

        // Filter based on duplicate action
        if (duplicateAction === "skip") {
            // Remove those marked as duplicate
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validRows = validRows.filter(r => !(r as any).isDuplicate);
        }

        let questionsToUpload = validRows.map(r => r.data);

        // --- Handle Passage Creation ---
        // Group by passageText to avoid creating duplicates for the same passage in one CSV
        const passageTextMap = new Map<string, string>(); // text -> new passageId

        for (const q of questionsToUpload) {
            // we attached passageText temporally on q (which is Partial<Question> anyway and passes down)
            const passageText = (q as any).passageText;
            if (q.questionType === 'passage' && passageText && !q.passageId) {
                if (!passageTextMap.has(passageText)) {
                    // Create passage
                    const newId = await firestoreService.createPassage({ text: passageText });
                    if (newId) passageTextMap.set(passageText, newId);
                }
            }
        }

        // Assign created passageIds
        questionsToUpload = questionsToUpload.map(q => {
            const passageText = (q as any).passageText;
            if (q.questionType === 'passage' && passageText && !q.passageId) {
                const createdId = passageTextMap.get(passageText);
                if (createdId) {
                    q.passageId = createdId;
                }
            }
            // Clean up temporary property
            const finalQ = { ...q };
            delete (finalQ as any).passageText;
            return finalQ;
        });

        if (onPrepopulateFromCSV) {
            onPrepopulateFromCSV(questionsToUpload);
            resetModal();
            onClose();
            return;
        }

        const result = await firestoreService.batchCreateQuestions(
            questionsToUpload,
            (progress) => setUploadProgress(progress)
        );

        setUploadStats(result);
        setStep("result");
        if (result.success > 0) {
            onSuccess();
        }
    };

    const resetModal = () => {
        setStep("upload");

        setParseResult(null);
        setUploadStats(null);
        setDuplicates([]);
        setUploadProgress(0);
    };

    const handleClose = () => {
        if (step === "uploading") return;
        resetModal();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import Questions via CSV</DialogTitle>
                    <DialogDescription>
                        Bulk upload questions. Download the template to ensure correct formatting.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    {step === "upload" && (
                        <div className="space-y-4">
                            <FileUploader onFileSelect={handleFileSelect} />
                            <div className="flex justify-center">
                                <Button variant="secondary" size="sm" onClick={handleDownloadTemplate} className="gap-2 bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary">
                                    <FileDown className="h-4 w-4" /> Download Template
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === "validating" && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-cta-primary" />
                            <p className="text-text-secondary font-medium tracking-wide">Validating CSV data...</p>
                        </div>
                    )}

                    {step === "preview" && parseResult && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h3 className="text-sm font-medium">Preview Data</h3>
                                {duplicates.length > 0 && (
                                    <div className="flex items-center gap-2 bg-semantic-warning/10 px-3 py-1.5 rounded-lg border border-semantic-warning/30">
                                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                                        <span className="text-xs font-semibold text-amber-500/90">Duplicates Action:</span>
                                        <select
                                            value={duplicateAction}
                                            onChange={(e) => setDuplicateAction(e.target.value as "skip" | "allow" | "overwrite")}
                                            className="text-xs bg-surface-card border border-semantic-warning/20 rounded px-2 py-1 outline-none text-text-primary focus:ring-1 focus:ring-semantic-warning"
                                        >
                                            <option value="skip">Skip Duplicates</option>
                                            <option value="allow">Allow (Create Copies)</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <QuestionPreviewTable parseResult={parseResult} onUpdateRow={handleUpdateRow} />
                        </div>
                    )}

                    {step === "uploading" && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4 w-full max-w-md mx-auto">
                            <Loader2 className="h-10 w-10 animate-spin text-cta-primary" />
                            <p className="text-text-primary font-semibold tracking-wide">Uploading questions...</p>
                            <div className="w-full bg-background border border-border rounded-full h-3 overflow-hidden p-0.5">
                                <div
                                    className="bg-cta-primary h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(var(--cta-primary-rgb),0.5)]"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs font-medium text-cta-primary">{uploadProgress}% Complete</p>
                            <p className="text-sm text-text-muted text-center pt-2">Please do not close this window.</p>
                        </div>
                    )}

                    {step === "result" && uploadStats && (
                        <div className="space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className={`flex flex-col items-center justify-center p-8 rounded-2xl border ${uploadStats.success > 0 ? 'bg-semantic-success/5 border-semantic-success/20' : 'bg-semantic-error/5 border-semantic-error/20'}`}>
                                {uploadStats.success > 0 ? (
                                    <div className="h-16 w-16 bg-semantic-success/10 rounded-full flex items-center justify-center mb-4 border border-semantic-success/30">
                                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 bg-semantic-error/10 rounded-full flex items-center justify-center mb-4 border border-semantic-error/30">
                                        <AlertCircle className="h-8 w-8 text-rose-400" />
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-text-primary">
                                    {uploadStats.success > 0 ? "Import Complete" : "Import Failed"}
                                </h3>
                                <p className="text-text-secondary text-center mt-2 max-w-sm">
                                    Successfully imported <span className="font-bold text-text-primary px-1">{uploadStats.success}</span> questions.
                                    {uploadStats.failed > 0 && (
                                        <span className="text-rose-400 ml-1 font-medium bg-semantic-error/10 px-2 py-0.5 rounded-md">({uploadStats.failed} failed/skipped)</span>
                                    )}
                                </p>
                            </div>

                            {uploadStats.errors.length > 0 && (
                                <div className="bg-background border border-border rounded-xl p-4 max-h-48 overflow-y-auto custom-scrollbar">
                                    <h4 className="font-semibold text-text-primary mb-3 text-sm flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-rose-400" /> Error Log
                                    </h4>
                                    <ul className="space-y-2 text-xs text-rose-400 font-mono">
                                        {uploadStats.errors.map((err, idx) => (
                                            <li key={idx} className="bg-semantic-error/5 p-2 rounded border border-semantic-error/10">{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6 gap-2">
                    {(step === "upload" || step === "preview") && (
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    )}

                    {step === "preview" && (
                        <>
                            <Button variant="secondary" onClick={() => setStep("upload")} className="bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10">Back</Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!parseResult?.meta.validRows}
                                className="bg-cta-primary hover:bg-cta-hover text-white gap-2 shadow-[0_0_15px_rgba(var(--cta-primary-rgb),0.3)] transition-all font-semibold"
                            >
                                <Upload className="h-4 w-4" />
                                Execute Import
                            </Button>
                        </>
                    )}

                    {step === "result" && (
                        <Button onClick={handleClose}>Close</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
