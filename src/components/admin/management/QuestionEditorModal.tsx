import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { UnifiedQuestionCard } from "@/components/admin/test-builder/UnifiedQuestionCard";
import { Question } from "@/types/admin";
import { firestoreService } from "@/services/firestoreService";
import { Loader2 } from "lucide-react";

interface QuestionEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionId: string | null; // null means 'new'
    onSuccess: () => void;
}

export function QuestionEditorModal({ isOpen, onClose, questionId, onSuccess }: QuestionEditorModalProps) {
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setQuestion(null);
            return;
        }

        loadData();
    }, [isOpen, questionId]);

    const loadData = async () => {
        setLoading(true);
        try {

            if (questionId) {
                // To fetch a single question reliably, we could fetch all and find, or just use getQuestions
                const allQs = await firestoreService.getQuestions();
                const found = allQs.find(q => q.id === questionId);
                if (found) {
                    setQuestion({
                        ...found,
                        questionType: found.questionType || "mcq",
                        matchPairs: found.matchPairs || [{ left: "", right: "" }]
                    });
                }
            } else {
                setQuestion({
                    id: `temp_${Date.now()}`,
                    text: "",
                    options: ["", "", "", ""],
                    correctOption: 0,
                    difficulty: "Medium",
                    stream: "General",
                    subject: "",
                    questionType: "mcq",
                    matchPairs: [{ left: "", right: "" }, { left: "", right: "" }, { left: "", right: "" }, { left: "", right: "" }]
                } as Question);
            }
        } catch (error) {
            console.error("Failed to load question details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!question) return;

        // Validation
        const hasQuestionText = question.text || question.questionContent;
        if (!hasQuestionText || (question.options?.length && question.options.some((o, i) => !o && !(question.optionsContent && question.optionsContent[i])))) {
            alert("Please fill in question text and all options.");
            return;
        }

        if (question.questionType === "match") {
            if (question.matchPairs?.some(p => !p.left || !p.right)) {
                alert("Please fill in all match pairs.");
                return;
            }
        }
        let generatedPassageId = null;
        if (question.passageText && question.passageText.trim() !== "") {
            try {
                generatedPassageId = "passage_" + btoa(encodeURIComponent(question.passageText.trim())).slice(0, 12);
            } catch(e) {
                generatedPassageId = "passage_" + Date.now().toString(36);
            }
        }

        setSaving(true);
        try {
            const payload: any = {
                ...question,
                contentVersion: question.contentVersion || 1,
                matchPairs: question.questionType === "match" ? question.matchPairs : null,
                passageText: question.passageText?.trim() || null,
                passageId: generatedPassageId
            };

            if (questionId) {
                await firestoreService.updateQuestion(question.id, payload);
            } else {
                delete payload.id; // Let Firestore generate the ID
                await firestoreService.createQuestion(payload);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save the question. Check console.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto w-full p-0 gap-0">
                <div className="p-6 border-b border-border">
                    <DialogHeader>
                        <DialogTitle>{questionId ? "Edit Question" : "Add New Question"}</DialogTitle>
                        <DialogDescription>
                            Modify the details below to update the question in the global repository.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 bg-surface-card min-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center items-center py-12 text-text-muted">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...
                        </div>
                    ) : question ? (
                        <div className="w-full">
                            {/* We re-use UnifiedQuestionCard with isDragDisabled=true so it displays full-width and permanently expanded essentially */}
                                <UnifiedQuestionCard
                                    question={question}
                                    onChange={setQuestion}
                                    isExpanded={true}
                                    onToggleExpand={() => { }} // Disabled toggle for modal
                                    isDragDisabled={true}
                                />
                        </div>
                    ) : (
                        <div className="text-center py-12 text-semantic-error">Failed to load question</div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-border bg-surface-elevated/50">
                    <Button variant="outline" onClick={onClose} disabled={saving} className="border-border text-text-secondary hover:bg-white/5">Cancel</Button>
                    <Button onClick={handleSave} disabled={saving || !question} className="bg-cta-primary hover:bg-cta-hover text-white min-w-[140px]">
                        {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Question"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
