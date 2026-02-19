"use client";

import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    isLoading?: boolean;
}

export function FileUploader({ onFileSelect, isLoading }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEvent = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const validateAndSelectFile = (file: File) => {
        setError(null);
        if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
            setError("Please upload a valid CSV file.");
            return;
        }
        onFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSelectFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSelectFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}
                ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                onDragEnter={handleDragEvent}
                onDragOver={handleDragEvent}
                onDragLeave={handleDragEvent}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="bg-blue-100 p-4 rounded-full mb-3">
                        <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="mb-2 text-sm text-slate-500">
                        <span className="font-semibold text-slate-700">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">CSV files only (Max 5MB)</p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleChange}
                />
            </div>

            {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <div className="mt-4 text-sm text-slate-500">
                <p className="font-medium mb-1">Expected CSV columns:</p>
                <code className="block bg-slate-100 p-2 rounded text-xs overflow-x-auto border border-slate-200">
                    questionText, optionA, optionB, optionC, optionD, correctAnswer, explanation, subjectTag, topicTag, difficulty, marks, negativeMarks, streams
                </code>
            </div>
        </div>
    );
}
