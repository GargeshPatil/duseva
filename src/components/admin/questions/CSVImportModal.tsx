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
import { parseCSV, ParseResult, ParsedRow } from "@/utils/csvParser";
import { firestoreService } from "@/services/firestoreService";
import { Question } from "@/types/admin";
import { Loader2, CheckCircle, AlertCircle, Upload, FileDown, AlertTriangle } from "lucide-react";

interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
    const [step, setStep] = useState<"upload" | "validating" | "preview" | "uploading" | "result">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const [uploadStats, setUploadStats] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
    const [duplicates, setDuplicates] = useState<Partial<Question>[]>([]);
    const [duplicateAction, setDuplicateAction] = useState<"skip" | "allow" | "overwrite">("skip");
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
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
            "questionText", "optionA", "optionB", "optionC", "optionD",
            "correctAnswer", "explanation", "subjectTag", "topicTag",
            "difficulty", "marks", "negativeMarks", "streams"
        ];
        const dummyRow = [
            "What is the capital of France?", "London", "Berlin", "Paris", "Madrid",
            "C", "Paris is the capital of France.", "Geography", "World Capitals",
            "Easy", "5", "1", "Humanities"
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + dummyRow.join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "question_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            validRows = validRows.filter(r => !(r as any).isDuplicate);
        }

        const questionsToUpload = validRows.map(r => r.data);

        // "Overwrite" logic... (same comment)
        // ...

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
        setFile(null);
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
                                <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2 text-slate-600">
                                    <FileDown className="h-4 w-4" /> Download Template
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === "validating" && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                            <p className="text-slate-600">Validating CSV and checking for duplicates...</p>
                        </div>
                    )}

                    {step === "preview" && parseResult && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h3 className="text-sm font-medium">Preview Data</h3>
                                {duplicates.length > 0 && (
                                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded border border-amber-200">
                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                        <span className="text-xs font-medium text-amber-700">Duplicates Action:</span>
                                        <select
                                            value={duplicateAction}
                                            onChange={(e) => setDuplicateAction(e.target.value as "skip" | "allow" | "overwrite")}
                                            className="text-xs bg-white border border-amber-300 rounded px-2 py-0.5 outline-none text-slate-700"
                                        >
                                            <option value="skip">Skip Duplicates</option>
                                            <option value="allow">Allow (Create Copies)</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <QuestionPreviewTable parseResult={parseResult} />
                        </div>
                    )}

                    {step === "uploading" && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4 w-full max-w-md mx-auto">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                            <p className="text-slate-600 font-medium">Uploading questions...</p>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-400">{uploadProgress}% Complete</p>
                            <p className="text-sm text-slate-500 text-center">Please do not close this window.</p>
                        </div>
                    )}

                    {step === "result" && uploadStats && (
                        <div className="space-y-6 py-4">
                            <div className={`flex flex-col items-center justify-center p-6 rounded-lg ${uploadStats.success > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                {uploadStats.success > 0 ? (
                                    <CheckCircle className="h-12 w-12 text-green-600 mb-2" />
                                ) : (
                                    <AlertCircle className="h-12 w-12 text-red-600 mb-2" />
                                )}
                                <h3 className="text-lg font-bold text-slate-900">
                                    {uploadStats.success > 0 ? "Import Complete" : "Import Failed"}
                                </h3>
                                <p className="text-slate-600 text-center mt-1">
                                    Successfully imported <span className="font-bold text-slate-900">{uploadStats.success}</span> questions.
                                    {uploadStats.failed > 0 && (
                                        <span className="text-red-600 ml-1">({uploadStats.failed} failed/skipped)</span>
                                    )}
                                </p>
                            </div>

                            {uploadStats.errors.length > 0 && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                                    <h4 className="font-medium text-slate-900 mb-2 text-sm">Error Log</h4>
                                    <ul className="space-y-1 text-xs text-red-600 font-mono">
                                        {uploadStats.errors.map((err, idx) => (
                                            <li key={idx}>{err}</li>
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
                            <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!parseResult?.meta.validRows}
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Import Questions
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
