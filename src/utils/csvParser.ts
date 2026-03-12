
import { Question } from "@/types/admin";
import { normalizeTag } from "./tagNormalizer";

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
function validateAndMapRow(row: CSVRow): { valid: boolean; data: Partial<Question>; errors: string[] } {
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
            const listAItems = row.listA.split(',').map(s => s.trim()).filter(Boolean);
            const listBItems = row.listB.split(',').map(s => s.trim()).filter(Boolean);
            if (listAItems.length !== listBItems.length || listAItems.length === 0) {
                errors.push("Match 'List A' and 'List B' must have the same number of comma-separated items.");
            } else {
                matchPairs = listAItems.map((left, index) => ({ left, right: listBItems[index] }));
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

    if (validMap[ans] !== undefined) {
        correctOption = validMap[ans];
    } else if (ans) { // Only add specific error if ans is present but invalid
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

    // Store normalized streams
    question.streams = streams.map(s => normalizeTag(s));

    return { valid: errors.length === 0, data: question, errors };
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

            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                resolve({ rows: [], meta: { totalRows: 0, validRows: 0, invalidRows: 0 } });
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim());
            const parsedRows: ParsedRow[] = [];
            let validCount = 0;
            let invalidCount = 0;

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                // Simple CSV split logic (same as before)
                const rowValues: string[] = [];
                let current = '';
                let inQuote = false;

                for (let j = 0; j < line.length; j++) {
                    const char = line[j];
                    if (char === '"') {
                        inQuote = !inQuote;
                    } else if (char === ',' && !inQuote) {
                        rowValues.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                        current = '';
                    } else {
                        current += char;
                    }
                }
                rowValues.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

                if (rowValues.length < headers.length) {
                    if (rowValues.length === 1 && rowValues[0] === '') continue;
                }

                // Map to CSVRow object
                const rowObj: Record<string, string> = {};
                headers.forEach((h, index) => {
                    const cleanHeader = h.replace(/^"|"$/g, '').trim();
                    if (index < rowValues.length) {
                        rowObj[cleanHeader] = rowValues[index];
                    }
                });

                // Validate
                const { valid, data, errors } = validateAndMapRow(rowObj as unknown as CSVRow);

                parsedRows.push({
                    row: i + 1, // Logical CSV row
                    data,
                    valid,
                    errors
                });

                if (valid) validCount++;
                else invalidCount++;
            }

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
