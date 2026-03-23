
import { Question } from "@/types/admin";
import { normalizeTag } from "./tagNormalizer";
import { sanitizeObject } from "./sanitizeText";

export interface CSVRow {
    questionType?: string; // mcq, match, passage
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation?: string;
    subjectTag?: string;
    topicTag?: string;
    difficulty?: string;
    marks?: string;
    negativeMarks?: string;
    streams?: string;
    listA?: string; // For match questions
    listB?: string; // For match questions
    passageId?: string; // For passage questions
    passageText?: string; // For linking new passage
}

// ... types updated below ...

export interface ParsedRow {
    row: number; // CSV row index (1-based)
    data: Partial<Question> & { passageText?: string };
    valid: boolean;
    errors: string[];
    isDuplicate?: boolean;
}

export interface ParseResult {
    rows: ParsedRow[];
    meta: {
        totalRows: number;
        validRows: number;
        invalidRows: number;
    };
}

export interface ParseError {
    row: number;
    message: string;
    column?: string;
}

/**
 * Validates a single CSV row and maps it to a Question object.
 * Always returns data (best effort) even if invalid.
 */
export function validateAndMapRow(rawRow: Partial<CSVRow>): { valid: boolean; data: Partial<Question>; errors: string[] } {
    const row = sanitizeObject(rawRow);
    const errors: string[] = [];

    // Question Type
    let qType: 'mcq' | 'match' | 'passage' = 'mcq';
    if (row.questionType) {
        const t = row.questionType.trim().toLowerCase();
        if (['mcq', 'match', 'passage'].includes(t)) {
            qType = t as 'mcq' | 'match' | 'passage';
        } else {
            errors.push(`Invalid Question Type '${t}'. Expected 'mcq', 'match', or 'passage'.`);
        }
    }

    // 1. Required Fields
    if (!row.questionText?.trim()) errors.push("Missing Question Text");
    if (!row.optionA?.trim() || !row.optionB?.trim() || !row.optionC?.trim() || !row.optionD?.trim()) {
        errors.push("Missing one or more Options (A-D)");
    }
    if (!row.correctAnswer?.trim()) errors.push("Missing Correct Answer");

    let matchPairs: { left: string, right: string }[] | undefined = undefined;
    if (qType === 'match') {
        if (!row.listA?.trim() || !row.listB?.trim()) {
            errors.push("Match questions require 'List A' and 'List B' columns.");
        } else {
            const listAItems = row.listA.split('|').map(s => s.trim()).filter(Boolean);
            const listBItems = row.listB.split('|').map(s => s.trim()).filter(Boolean);
            if (listAItems.length !== listBItems.length || listAItems.length === 0) {
                errors.push("Match 'List A' and 'List B' must have the same number of pipe-separated (|) items.");
            } else {
                matchPairs = listAItems.map((left, index) => {
                    const cleanLeft = left.replace(/^[A-Z]:/, '').trim();
                    const cleanRight = listBItems[index].replace(/^[0-9]+:/, '').trim();
                    return { left: cleanLeft, right: cleanRight };
                });
            }
        }
    }

    if (qType === 'passage') {
        if (!row.passageId?.trim() && !row.passageText?.trim()) {
            errors.push("Passage questions require either 'Passage ID' or 'Passage Text'.");
        }
    }

    // 2. Correct Answer Validation
    let correctOption = -1;
    const ans = row.correctAnswer?.trim().toUpperCase();
    const validMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, '1': 0, '2': 1, '3': 2, '4': 3 };

    if (ans && validMap[ans] !== undefined) {
        correctOption = validMap[ans];
    } else if (ans) {
        errors.push(`Invalid Correct Answer '${ans}'. Expected A, B, C, D or 1, 2, 3, 4.`);
    }

    // 3. Difficulty Validation
    const difficulty = row.difficulty?.trim();
    if (difficulty && !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
        errors.push(`Invalid Difficulty '${difficulty}'. Expected Easy, Medium, or Hard.`);
    }

    // 4. Numeric Validation
    const marks = row.marks ? parseFloat(row.marks) : undefined;
    if (row.marks && isNaN(marks!)) errors.push("Marks must be a number.");

    const negativeMarks = row.negativeMarks ? parseFloat(row.negativeMarks) : undefined;
    if (row.negativeMarks && isNaN(negativeMarks!)) errors.push("Negative Marks must be a number.");

    // 5. Streams Parsing
    const streams = row.streams ? row.streams.split('|').map(s => s.trim()).filter(Boolean) : [];

    // Map to Question Object (Best Effort)
    const question: Partial<Question> = {
        questionType: qType,
        text: row.questionText?.trim() || "",
        options: [
            row.optionA?.trim() || "",
            row.optionB?.trim() || "",
            row.optionC?.trim() || "",
            row.optionD?.trim() || ""
        ],
        correctOption: correctOption, // -1 if invalid
        explanation: row.explanation?.trim(),
        subject: normalizeTag(row.subjectTag || ""),
        tags: row.topicTag ? [normalizeTag(row.topicTag || "")] : [],
        difficulty: (difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
        marks: marks,
        negativeMarks: negativeMarks,
        // We will store the primary stream in 'stream' for backward compat.
        stream: streams.length > 0 ? (normalizeTag(streams[0]) as Question['stream']) : undefined,
    };

    if (qType === 'match' && matchPairs) {
        question.matchPairs = matchPairs;
    }
    if (qType === 'passage') {
        if (row.passageId?.trim()) {
            question.passageId = row.passageId.trim();
        } else if (row.passageText?.trim()) {
            // Store temporarily for the uploader Modal to process
            (question as any).passageText = row.passageText.trim();
        }
    }

    question.streams = streams.map(s => normalizeTag(s));

    return { valid: errors.length === 0, data: question, errors };
}

function parseCSVString(text: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                currentCell += '"';
                i++; // skip escaped quote
            } else if (char === '"') {
                inQuotes = false;
            } else {
                currentCell += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentCell.trim());
                currentCell = '';
            } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
                currentRow.push(currentCell.trim());
                if (currentRow.some(c => c !== '')) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentCell = '';
                if (char === '\r') i++; // skip \n
            } else {
                currentCell += char;
            }
        }
    }
    
    // Add the last cell and row if not empty
    if (currentCell !== '' || inQuotes) {
        currentRow.push(currentCell.trim());
    }
    if (currentRow.length > 0 && currentRow.some(c => c !== '')) {
        rows.push(currentRow);
    }
    
    return rows;
}

/**
 * Parses a CSV file content string.
 */
export async function parseCSV(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) {
                resolve({ rows: [], meta: { totalRows: 0, validRows: 0, invalidRows: 0 } });
                return;
            }

            const rawRows = parseCSVString(text);
            if (rawRows.length < 2) {
                resolve({ rows: [], meta: { totalRows: 0, validRows: 0, invalidRows: 0 } });
                return;
            }

            const headers = rawRows[0].map(h => h.trim());
            const parsedRows: ParsedRow[] = [];
            let currentPassageRow: (ParsedRow & { raw: any }) | null = null;

            for (let i = 1; i < rawRows.length; i++) {
                const rowValues = rawRows[i];

                // Map to CSVRow object
                let rowObj: Record<string, string> = {};
                headers.forEach((h, index) => {
                    if (index < rowValues.length) {
                        rowObj[h] = rowValues[index];
                    }
                });

                // Validate
                const { valid, data, errors } = validateAndMapRow(rowObj as unknown as CSVRow);

                const newParsedRow = {
                    row: i + 1, // Logical CSV row
                    data,
                    valid,
                    errors,
                    raw: rowObj // Store raw for inline editing
                } as ParsedRow & { raw: any };

                // Grouping Logic
                if (data.questionType === 'passage') {
                    newParsedRow.data.subQuestions = [];
                    // If it has its own question text, treat it as the first sub-question
                    if (data.text && data.text.trim() !== '') {
                        newParsedRow.data.subQuestions.push({
                            id: 'sq_' + Date.now() + i,
                            type: 'mcq',
                            text: data.text,
                            options: data.options || [],
                            correctOption: data.correctOption || 0,
                            explanation: data.explanation
                        });
                        // Clear the top-level text so it acts purely as a container
                        newParsedRow.data.text = '';
                    }
                    currentPassageRow = newParsedRow;
                    parsedRows.push(newParsedRow);
                } else if ((data.questionType === 'mcq' || data.questionType === 'match') && ((rowObj as any).passageText || (rowObj as any).passageId)) {
                    // It references a passage.
                    if (currentPassageRow && 
                       (((rowObj as any).passageText && (rowObj as any).passageText === (currentPassageRow.raw as any).passageText) || 
                        ((rowObj as any).passageId && (rowObj as any).passageId === (currentPassageRow.raw as any).passageId))) {
                        
                        currentPassageRow.data.subQuestions!.push({
                            id: 'sq_' + Date.now() + i,
                            type: data.questionType,
                            text: data.text || '',
                            options: data.options || [],
                            correctOption: data.correctOption || 0,
                            explanation: data.explanation,
                            matchPairs: data.matchPairs
                        });
                        
                        // Absorb row. If invalid, invalidate parent.
                        if (!valid) {
                            currentPassageRow.valid = false;
                            currentPassageRow.errors.push(`Sub-question at row ${i+1} invalid: ${errors.join(', ')}`);
                        }
                    } else {
                        // Independent question
                        currentPassageRow = null;
                        parsedRows.push(newParsedRow);
                    }
                } else {
                    currentPassageRow = null;
                    parsedRows.push(newParsedRow);
                }
            }

            // Recalculate valid/invalid counts due to grouping
            const validCount = parsedRows.filter(r => r.valid).length;
            const invalidCount = parsedRows.filter(r => !r.valid).length;

            resolve({
                rows: parsedRows,
                meta: {
                    totalRows: validCount + invalidCount,
                    validRows: validCount,
                    invalidRows: invalidCount
                }
            });
        };
        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };
        reader.readAsText(file);
    });
}
