import React from "react";
import { Question } from "@/types/admin";
import { QuestionCard } from "./QuestionCard";
import { Reorder } from "framer-motion";

interface TestQuestionListProps {
    questions: Question[];
    setQuestions: (questions: Question[]) => void;
}

export function TestQuestionList({ questions, setQuestions }: TestQuestionListProps) {
    const handleQuestionChange = (index: number, updated: Question) => {
        const newQuestions = [...questions];
        newQuestions[index] = updated;
        setQuestions(newQuestions);
    };

    const handleDelete = (index: number) => {
        if (window.confirm("Are you sure you want to remove this question?")) {
            const newQuestions = questions.filter((_, i) => i !== index);
            setQuestions(newQuestions);
        }
    };

    const handleDuplicate = (index: number) => {
        const source = questions[index];
        const copy: Question = {
            ...source,
            id: `temp_${Date.now()}_${Math.random()}`, // Temp ID, will be replaced on save
            text: `${source.text} (Copy)`
        };
        const newQuestions = [...questions];
        newQuestions.splice(index + 1, 0, copy);
        setQuestions(newQuestions);
    };

    return (
        <div className="space-y-6">
            <Reorder.Group axis="y" values={questions} onReorder={setQuestions} className="space-y-6">
                {questions.map((q, index) => (
                    <QuestionCard
                        key={q.id} // Important: Must be unique and stable. Temp IDs needed for new questions.
                        index={index}
                        question={q}
                        onChange={(updated) => handleQuestionChange(index, updated)}
                        onDelete={() => handleDelete(index)}
                        onDuplicate={() => handleDuplicate(index)}
                    />
                ))}
            </Reorder.Group>

            {questions.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                    <p>No questions added yet.</p>
                    <p className="text-sm mt-1">Click "Add Question" to start building your test.</p>
                </div>
            )}
        </div>
    );
}
