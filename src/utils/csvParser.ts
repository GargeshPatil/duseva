import Papa from 'papaparse';
import { Question } from "@/types/admin";
import { normalizeTag } from "./tagNormalizer";
import { sanitizeObject } from "./sanitizeText";

export interface CSVRow {
    questionType?: string; // mcq, match, passage
    questionText?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer?: string;
    explanation?: string;
    subjectTag?: string;
    topicTag?: string;
    difficulty?: string;
    marks?: string;
    negativeMarks?: string;
    streams?: string;
    listA?: string; // For match questions
    listB?: string; // For match questions
    passage?: string; // For linking new passage
    subQuestionType?: string; // mcq, match (for passage subquestions)
}

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

// Ensure newline safety
function normalizeNewlines(text: string | null | undefined): string {
    if (!text) return "";
    let safeText = text;
    if (safeText.includes("\r")) {
        safeText = safeText.replace(/\r\n/g, "\n");
    }
    return safeText;
}

function validateQuestion(q: Partial<Question>): boolean {
    if (!q.text) return false;
    if (q.questionType === "match" && (!q.matchPairs || q.matchPairs.length === 0)) return false;
    return true;
}

function parseStringToJson(text?: string | null): any {
    if (!text) return null;
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    if (paragraphs.length === 0) return null;
    
    return {
        type: 'doc',
        content: paragraphs.map(p => ({
            type: 'paragraph',
            content: [{ type: 'text', text: p }]
        }))
    };
}

/**
 * Validates a single CSV row and maps it to a Question object.
 * Always returns data (best effort) even if invalid.
 */
export function validateAndMapRow(rawRow: Partial<CSVRow>): { valid: boolean; data: Partial<Question>; errors: string[] } {
    const row = sanitizeObject(rawRow);
    const errors: string[] = [];

    // Debug logging (TEMP — IMPORTANT)
    console.log("CSV ROW:", row);

    // Normalize newlines for all text fields
    const questionText = normalizeNewlines(row.questionText);
    const passageKey = normalizeNewlines(row.passage?.trim());

    // Normalization & Initial Types
    let qType = row.questionType?.trim().toLowerCase() as 'mcq' | 'match' | 'passage';
    
    if (!['mcq', 'match', 'passage'].includes(qType)) {
        errors.push(`Invalid Question Type '${row.questionType}'. Expected 'mcq' or 'match'.`);
        qType = 'mcq';
    }

    // Convert legacy passage type to its actual sub-question type, defaulting to mcq
    if (qType === 'passage') {
        qType = (row.subQuestionType?.trim().toLowerCase() as 'mcq' | 'match') || 'mcq';
    }

    if (!questionText) errors.push("Missing Question Text");

    if (!row.optionA?.trim() || !row.optionB?.trim() || !row.optionC?.trim() || !row.optionD?.trim()) {
        errors.push("Missing one or more Options (A-D)");
    }

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

    let correctOption = -1;
    const ans = row.correctAnswer?.trim().toUpperCase();
    const validMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, '1': 0, '2': 1, '3': 2, '4': 3 };

    if (ans && validMap[ans] !== undefined) {
        correctOption = validMap[ans];
    } else {
        errors.push(`Invalid Correct Answer '${ans}'. Expected A, B, C, D or 1, 2, 3, 4.`);
    }

    const difficulty = row.difficulty?.trim();
    if (difficulty && !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
        errors.push(`Invalid Difficulty '${difficulty}'. Expected Easy, Medium, or Hard.`);
    }

    const marks = row.marks ? parseFloat(row.marks) : undefined;
    if (row.marks && isNaN(marks!)) errors.push("Marks must be a number.");

    const negativeMarks = row.negativeMarks ? parseFloat(row.negativeMarks) : undefined;
    if (row.negativeMarks && isNaN(negativeMarks!)) errors.push("Negative Marks must be a number.");

    const streams = row.streams ? row.streams.split('|').map(s => s.trim()).filter(Boolean) : [];

    const parsedQuestionContent = parseStringToJson(questionText);

    const question: Partial<Question> = {
        questionType: qType,
        text: questionText,
        questionContent: parsedQuestionContent,
        options: [
            normalizeNewlines(row.optionA),
            normalizeNewlines(row.optionB),
            normalizeNewlines(row.optionC),
            normalizeNewlines(row.optionD)
        ],
        optionsContent: [
            parseStringToJson(normalizeNewlines(row.optionA)),
            parseStringToJson(normalizeNewlines(row.optionB)),
            parseStringToJson(normalizeNewlines(row.optionC)),
            parseStringToJson(normalizeNewlines(row.optionD))
        ],
        correctOption: correctOption,
        explanation: normalizeNewlines(row.explanation),
        explanationContent: parseStringToJson(normalizeNewlines(row.explanation)),
        subject: normalizeTag(row.subjectTag || ""),
        tags: row.topicTag ? [normalizeTag(row.topicTag || "")] : [],
        difficulty: (difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
        marks: marks,
        negativeMarks: negativeMarks,
        stream: streams.length > 0 ? (normalizeTag(streams[0]) as Question['stream']) : undefined,
        streams: streams.map(s => normalizeTag(s)),
        contentVersion: 3
    };

    if (qType === 'match' && matchPairs) {
        question.matchPairs = matchPairs;
    }

    if (passageKey) {
        question.passageText = passageKey;
        question.passageContent = parseStringToJson(passageKey);
        // Simple base64 encode for id generation (with fallback for unicode)
        try {
            question.passageId = "passage_" + btoa(encodeURIComponent(passageKey)).slice(0, 12);
        } catch(e) {
            question.passageId = "passage_" + Date.now().toString(36);
        }
    }

    // FINAL VALIDATION (STRICT)
    if (!validateQuestion(question)) {
        errors.push("Failed final data validation layer.");
    }
    
    console.log("PARSED QUESTION:", question);

    return { valid: errors.length === 0, data: question, errors };
}

/**
 * Parses a CSV file content string.
 */
export async function parseCSV(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
        Papa.parse<CSVRow>(file, {
            header: true,
            skipEmptyLines: false,
            newline: "\n",
            complete: (results: any) => {
                const rawRows = results.data;
                const normalQuestions: ParsedRow[] = [];
                let rowCounter = 2; // header is 1

                for (let i = 0; i < rawRows.length; i++) {
                    const rowObj = rawRows[i];
                    // Skip entirely empty lines
                    if (!rowObj.questionText && !rowObj.passage && Object.keys(rowObj).every(k => !rowObj[k as keyof CSVRow])) {
                        continue;
                    }

                    // For backward compatibility, ignore parent passage rows without questions entirely
                    // since we require all questions to be flat and independent
                    if ((!rowObj.questionText || rowObj.questionText.trim() === '') && rowObj.passage) {
                        continue;
                    }

                    const { valid, data, errors } = validateAndMapRow(rowObj);
                    
                    const newParsedRow = {
                        row: rowCounter,
                        data: { ...data },
                        valid,
                        errors,
                        raw: rowObj
                    } as ParsedRow & { raw: any };

                    normalQuestions.push(newParsedRow);
                    rowCounter++;
                }

                const validCount = normalQuestions.filter(r => r.valid).length;
                const invalidCount = normalQuestions.filter(r => !r.valid).length;

                resolve({
                    rows: normalQuestions,
                    meta: {
                        totalRows: validCount + invalidCount,
                        validRows: validCount,
                        invalidRows: invalidCount
                    }
                });
            },
            error: (error: Error) => {
                reject(error);
            }
        });
    });
}
