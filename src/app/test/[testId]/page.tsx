"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTestEngine } from "@/hooks/useTestEngine";
import { TestInstructions } from "@/components/test/TestInstructions";
import { QuestionPalette } from "@/components/test/QuestionPalette";
import { Button } from "@/components/ui/Button";
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    RotateCcw,
    AlertTriangle,
    Loader2,
    Lock
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PaymentModal } from "@/components/dashboard/PaymentModal";

export default function TestPage() {
    const params = useParams();
    const testId = params.testId as string;
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();

    const {
        test,
        questions,
        currentQIndex,
        currentQuestion,
        answers,
        questionStatus,
        timeRemaining,
        isTestStarted,
        loading: engineLoading,
        integrity,
        actions,
        passages
    } = useTestEngine(testId);

    // Auth Protection
    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/auth/login?redirect=/test/${testId}`);
        }
    }, [authLoading, user, router, testId]);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    useEffect(() => {
        if (test && user) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isPurchased = test.price === 'free' || !!(userData as any)?.purchasedTests?.[test.id];
            if (test.price === 'paid' && !isPurchased) {
                setTimeout(() => {
                    setAccessDenied(true);
                    setShowPaymentModal(true);
                }, 0);
            }
        }
    }, [test, user, userData]);

    if (authLoading || engineLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-cta-primary mb-4" />
                <p className="text-text-secondary font-medium">Loading Exam Environment...</p>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                <AlertTriangle className="h-16 w-16 text-semantic-warning mb-4" />
                <h1 className="text-2xl font-bold text-text-primary mb-2">Test Not Found</h1>
                <p className="text-text-secondary mb-6">The exam you are looking for does not exist or has been removed.</p>
                <Button onClick={() => router.push('/dashboard/tests')} variant="primary">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    if (accessDenied) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-background p-4">
                <div className="bg-surface-card p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-border">
                    <div className="w-16 h-16 bg-semantic-warning/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="h-8 w-8 text-semantic-warning" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Premium Test Locked</h1>
                    <p className="text-text-secondary mb-8">
                        This test is part of our premium collection. Unlock it to start your attempt.
                    </p>
                    <Button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        size="lg"
                    >
                        Unlock Now
                    </Button>
                    <button
                        onClick={() => router.push('/dashboard/tests')}
                        className="mt-4 text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {test && (
                    <PaymentModal
                        isOpen={showPaymentModal}
                        onClose={() => {
                            // If they close without paying, we keep them on denied screen or redirect?
                            // Better UX: keep on denied screen, modal just toggles visibility
                            setShowPaymentModal(false);
                        }}
                        test={test}
                        onUnlock={() => {
                            setAccessDenied(false); // Optimistic unlock
                            // Reload to sync state properly
                            window.location.reload();
                        }}
                    />
                )}
            </div>
        );
    }



    // ... existing auth checks ...

    if (!isTestStarted) {
        return (
            <TestInstructions
                testTitle={test.title}
                durationMinutes={test.duration}
                totalQuestions={questions.length}
                totalMarks={test.totalMarks}
                onStartTest={actions.startTest}
            />
        );
    }

    const qNum = currentQIndex + 1;
    const isMarked = questionStatus[currentQuestion.id]?.status.includes('marked');

    return (
        <div
            className="flex flex-col h-screen bg-background overflow-hidden select-none"
            {...integrity.handlers}
            onContextMenu={(e) => {
                if (integrity.handlers.onContextMenu) integrity.handlers.onContextMenu(e);
            }}
        >
            {/* Integrity Warning Overlay */}
            {integrity.showTabWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface-card rounded-lg shadow-xl max-w-md w-full p-6 text-center border-l-4 border-semantic-warning animate-in fade-in zoom-in duration-200">
                        <div className="mx-auto w-12 h-12 bg-semantic-warning/20 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-semantic-warning" />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">Exam Focus Warning</h3>
                        <p className="text-text-secondary mb-6">
                            You have moved away from the test window. This action has been recorded.
                            Please stay on the exam screen to avoid disqualification.
                        </p>
                        <Button
                            onClick={integrity.dismissTabWarning}
                            className="bg-amber-600 hover:bg-amber-700 text-white w-full"
                        >
                            I Understand, Return to Test
                        </Button>
                    </div>
                </div>
            )}

            {/* Top Bar - Fixed */}
            <header className="h-14 md:h-16 bg-surface-card border-b border-border/60 flex items-center justify-between px-3 md:px-6 shrink-0 z-30 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="bg-surface-elevated text-cta-primary text-[10px] md:text-xs font-semibold px-2 py-0.5 md:px-2.5 md:py-1 rounded-md border border-border/50 whitespace-nowrap hidden sm:block">CUET MOCK</div>
                    <h1 className="font-semibold text-text-primary truncate max-w-[120px] md:max-w-md text-sm md:text-base">
                        {test.title}
                    </h1>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-text-muted font-medium tracking-wide hidden sm:inline-block">Time Left</span>
                        <div className={`
                            font-mono text-lg md:text-xl font-semibold rounded-md px-2 md:px-3 py-0.5 border border-border/50 transition-all duration-300 tabular-nums shadow-sm
                            ${timeRemaining < 300
                                ? "bg-semantic-error/10 text-semantic-error border-semantic-error/30 animate-pulse"
                                : "bg-surface-base text-text-primary"
                            }
                        `}>
                            {String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:
                            {String(timeRemaining % 60).padStart(2, '0')}
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsPaletteOpen(true)}
                        variant="outline"
                        size="sm"
                        className="lg:hidden h-9 w-9 p-0 rounded-full border-border bg-surface-card"
                        aria-label="Question Palette"
                    >
                        <div className="grid grid-cols-2 gap-0.5">
                            <div className="w-1 h-1 bg-text-secondary rounded-sm"></div>
                            <div className="w-1 h-1 bg-text-secondary rounded-sm"></div>
                            <div className="w-1 h-1 bg-text-secondary rounded-sm"></div>
                            <div className="w-1 h-1 bg-text-secondary rounded-sm"></div>
                        </div>
                    </Button>

                    <Button
                        onClick={() => {
                            if (confirm("Are you sure you want to finish the test? You cannot return once submitted.")) {
                                actions.submitTest();
                            }
                        }}
                        variant="primary"
                        size="sm"
                        className="bg-semantic-success hover:bg-emerald-600 shadow-md shadow-emerald-500/10 font-bold px-4 h-9 hidden md:flex text-white"
                    >
                        Submit Test
                    </Button>
                </div>
            </header>

            {/* Main Content Areas */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Left: Question Area */}
                <main className="flex-1 flex flex-col h-full relative z-0">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
                        <div className="max-w-4xl mx-auto">
                            {/* Question Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 pb-4 border-b border-border/50 gap-3">
                                <div className="flex items-center justify-between w-full sm:w-auto">
                                    <div className="flex items-center gap-3">
                                        <span className="text-base font-semibold text-text-primary bg-surface-elevated px-3 py-1 rounded-lg border border-border/50 shadow-sm">Q{qNum}</span>
                                        <span className="text-xs font-medium text-text-muted">ID: {currentQuestion.id}</span>
                                    </div>
                                    {/* Mobile Submit Button (Header submit hidden on mobile) */}
                                    {/* We can keep one submit button. Header one is fine if we make it icon only or similar. 
                                         Let's add a small submit in header or drawer?
                                         Actually, let's keep it in header but maybe simpler?
                                         Or just add a Submit button in the Palette drawer?
                                      */}
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 text-xs font-medium">
                                    <span className="bg-semantic-success/10 text-semantic-success px-2.5 py-1 rounded-md border border-semantic-success/20">+5 Marks</span>
                                    <span className="bg-semantic-error/10 text-semantic-error px-2.5 py-1 rounded-md border border-semantic-error/20">-1 Mark</span>
                                </div>
                            </div>

                            {/* Passage Container */}
                            {currentQuestion.questionType === 'passage' && currentQuestion.passageId && passages[currentQuestion.passageId] && (
                                <div className="bg-surface-elevated p-5 md:p-8 rounded-2xl shadow-sm border border-border/60 mb-6">
                                    <h3 className="text-sm font-semibold text-text-primary mb-3">Read the following passage carefully:</h3>
                                    <div className="text-sm md:text-base text-text-secondary leading-relaxed md:leading-loose font-serif whitespace-pre-wrap">
                                        {passages[currentQuestion.passageId].text}
                                    </div>
                                </div>
                            )}

                            {/* Question Text */}
                            <div className="bg-surface-card p-5 md:p-8 rounded-2xl shadow-sm border border-border/60 mb-6 md:mb-8">
                                <h2 className="text-base md:text-xl font-medium text-text-primary leading-relaxed md:leading-loose select-text font-serif">
                                    {currentQuestion.text}
                                </h2>

                                {/* Match Pairs Table */}
                                {currentQuestion.questionType === 'match' && currentQuestion.matchPairs && currentQuestion.matchPairs.length > 0 && (
                                    <div className="mt-6 border border-border/60 rounded-xl overflow-hidden shadow-sm">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-surface-elevated border-b border-border text-text-secondary">
                                                <tr>
                                                    <th className="px-4 py-2 font-semibold w-12 text-center">#</th>
                                                    <th className="px-4 py-2 font-semibold border-r border-border w-1/2">List I</th>
                                                    <th className="px-4 py-2 font-semibold w-12 text-center">#</th>
                                                    <th className="px-4 py-2 font-semibold w-1/2">List II</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border text-text-primary">
                                                {currentQuestion.matchPairs.map((pair, idx) => (
                                                    <tr key={idx} className="bg-surface-card hover:bg-surface-elevated transition-colors">
                                                        <td className="px-4 py-3 text-center font-bold text-text-secondary">
                                                            {String.fromCharCode(65 + idx)}.
                                                        </td>
                                                        <td className="px-4 py-3 border-r border-border leading-relaxed">{pair.left}</td>
                                                        <td className="px-4 py-3 text-center font-bold text-text-secondary">
                                                            I{(idx === 1 ? 'I' : idx === 2 ? 'II' : idx === 3 ? 'V' : '') /* Basic Roman numeral logic for up to 5 items, mostly exams use I, II, III, IV */}{
                                                                idx === 0 ? '' : idx === 1 ? '' : idx === 2 ? '' : idx === 3 ? '' : idx === 4 ? 'V' : (idx + 1)
                                                            }.
                                                        </td>
                                                        <td className="px-4 py-3 leading-relaxed">{pair.right}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Options */}
                            <div className="grid gap-3 md:gap-4">
                                {currentQuestion.options.map((opt, idx) => {
                                    const isSelected = answers[currentQuestion.id] === idx;
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => actions.handleOptionSelect(idx)}
                                            className={`
                                                relative p-3 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 md:gap-5 group shadow-sm
                                                ${isSelected
                                                    ? "border-cta-primary bg-cta-primary/5 ring-4 ring-cta-primary/10"
                                                    : "border-border/60 hover:border-text-secondary hover:bg-surface-elevated bg-surface-card"
                                                }
                                            `}
                                        >
                                            <div className={`
                                                shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all mt-0.5 md:mt-0
                                                ${isSelected
                                                    ? "bg-cta-primary border-cta-primary text-white"
                                                    : "border-border/80 text-text-secondary group-hover:border-text-secondary group-hover:text-text-primary"
                                                }
                                            `}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`text-base md:text-lg leading-relaxed pt-0.5 ${isSelected ? "text-text-primary font-medium" : "text-text-secondary group-hover:text-text-primary"}`}>
                                                {opt}
                                            </span>

                                            {isSelected && (
                                                <div className="absolute top-4 right-4">
                                                    <div className="w-2.5 h-2.5 bg-cta-primary rounded-full ring-2 ring-cta-primary/20"></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-surface-card/90 backdrop-blur-md border-t border-border/60 p-3 md:p-4 z-20 safe-area-bottom">
                        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={actions.handleMarkForReview}
                                    variant="secondary"
                                    size="md"
                                    className={`
                                        flex-1 sm:flex-none
                                        ${isMarked ? "bg-cta-primary/10 text-cta-primary border-cta-primary/30 hover:bg-cta-primary/20" : ""}
                                    `}
                                >
                                    <Flag className="h-4 w-4 mr-2" />
                                    {isMarked ? "Marked" : "Review"}
                                </Button>
                                <Button
                                    onClick={actions.handleClearResponse}
                                    variant="ghost"
                                    size="md"
                                    className="flex-1 sm:flex-none text-text-muted hover:text-semantic-error hover:bg-semantic-error/10"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" /> Clear
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={actions.handlePrev}
                                    disabled={currentQIndex === 0}
                                    variant="secondary"
                                    size="md"
                                    className="flex-1 sm:flex-none"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                </Button>
                                <Button
                                    onClick={actions.handleNext}
                                    disabled={currentQIndex === questions.length - 1}
                                    variant="primary"
                                    size="md"
                                    className="w-full sm:w-auto px-8"
                                >
                                    Save & Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right: Question Palette (Desktop) */}
                <aside className="w-80 border-l border-border bg-surface-card hidden lg:flex flex-col h-full z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
                    <PaletteHeader user={user} userData={userData} integrity={integrity} />
                    <div className="flex-1 overflow-hidden">
                        <QuestionPalette
                            totalQuestions={questions.length}
                            currentQuestionIndex={currentQIndex}
                            questions={questions}
                            questionStatus={questionStatus}
                            onQuestionSelect={actions.handleJump}
                        />
                    </div>
                </aside>

                {/* Mobile Palette Sheet */}
                <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
                    <SheetContent onClose={() => setIsPaletteOpen(false)} className="bg-surface-base border-l border-border sm:max-w-xs w-[85vw]">
                        <div className="flex flex-col h-full">
                            {/* Reusing Palette Logic */}
                            <PaletteHeader user={user} userData={userData} integrity={integrity} mobile />
                            <div className="flex-1 overflow-y-auto px-4 pb-4">
                                <QuestionPalette
                                    totalQuestions={questions.length}
                                    currentQuestionIndex={currentQIndex}
                                    questions={questions}
                                    questionStatus={questionStatus}
                                    onQuestionSelect={(idx) => {
                                        actions.handleJump(idx);
                                        setIsPaletteOpen(false);
                                    }}
                                />
                            </div>
                            {/* Mobile Submit in Palette */}
                            <div className="p-4 border-t border-border bg-surface-card">
                                <Button
                                    onClick={() => {
                                        setIsPaletteOpen(false);
                                        if (confirm("Are you sure you want to finish the test? You cannot return once submitted.")) {
                                            actions.submitTest();
                                        }
                                    }}
                                    className="w-full bg-semantic-success hover:bg-emerald-600 text-white font-bold"
                                >
                                    Submit Test
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}

// Helper component to avoid code duplication
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PaletteHeader({ user, userData, integrity, mobile }: any) {
    return (
        <div className={`p-4 border-b border-border/60 bg-surface-card flex items-center gap-3 ${mobile ? 'pt-12' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border/60 flex items-center justify-center overflow-hidden">
                <span className="text-text-primary font-semibold">
                    {(userData?.name || user?.displayName || 'C').charAt(0).toUpperCase()}
                </span>
            </div>
            <div className="overflow-hidden">
                <p className="truncate text-sm font-medium text-text-primary">{userData?.name || user?.displayName || 'Candidate'}</p>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-text-muted">ID: {user?.uid?.substring(0, 8)}...</p>
                </div>
                {integrity.tabSwitches > 0 && (
                    <span className="text-[10px] text-semantic-warning font-semibold bg-semantic-warning/10 px-1.5 py-0.5 rounded border border-semantic-warning/20 mt-1 inline-block">
                        Warnings: {integrity.tabSwitches}
                    </span>
                )}
            </div>
        </div>
    );
}
