"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTestEngine } from "@/hooks/useTestEngine";
import { TestInstructions } from "@/components/test/TestInstructions";
import { QuestionPalette } from "@/components/test/QuestionPalette";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/test/Timer";
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
        actions
    } = useTestEngine(testId);

    // Auth Protection
    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/auth/login?redirect=/test/${testId}`);
        }
    }, [authLoading, user, router, testId]);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        if (test && user) {
            const isPurchased = test.price === 'free' || !!(userData as any)?.purchasedTests?.[test.id];
            if (test.price === 'paid' && !isPurchased) {
                setAccessDenied(true);
                setShowPaymentModal(true);
            }
        }
    }, [test, user, userData]);

    if (authLoading || engineLoading || !test) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-medium">Loading Exam Environment...</p>
            </div>
        );
    }

    if (accessDenied) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="h-8 w-8 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Premium Test Locked</h1>
                    <p className="text-slate-500 mb-8">
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
                        className="mt-4 text-slate-500 hover:text-slate-800 text-sm font-medium"
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

    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

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
            className="flex flex-col h-screen bg-slate-50 overflow-hidden select-none"
            {...integrity.handlers}
            onContextMenu={(e) => {
                if (integrity.handlers.onContextMenu) integrity.handlers.onContextMenu(e);
            }}
        >
            {/* Integrity Warning Overlay */}
            {integrity.showTabWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center border-l-4 border-amber-500 animate-in fade-in zoom-in duration-200">
                        <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Exam Focus Warning</h3>
                        <p className="text-slate-600 mb-6">
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
            <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-6 shrink-0 shadow-sm z-30 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded border border-primary/20 whitespace-nowrap">CUET MOCK</div>
                    <h1 className="font-bold text-slate-800 truncate max-w-[120px] md:max-w-md text-sm md:text-lg">
                        {test.title}
                    </h1>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] md:text-[10px] text-slate-500 uppercase font-bold tracking-wider hidden sm:inline-block">Time Left</span>
                        <div className={`
                            font-mono text-lg md:text-xl font-bold rounded px-2 md:px-3 py-0.5 border transition-all duration-300 tabular-nums
                            ${timeRemaining < 300
                                ? "bg-red-50 text-red-600 border-red-200 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.2)]"
                                : "bg-slate-50 text-slate-900 border-slate-200"
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
                        className="lg:hidden h-9 w-9 p-0 rounded-full"
                        aria-label="Question Palette"
                    >
                        <div className="grid grid-cols-2 gap-0.5">
                            <div className="w-1 h-1 bg-slate-600 rounded-sm"></div>
                            <div className="w-1 h-1 bg-slate-600 rounded-sm"></div>
                            <div className="w-1 h-1 bg-slate-600 rounded-sm"></div>
                            <div className="w-1 h-1 bg-slate-600 rounded-sm"></div>
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
                        className="bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/10 font-bold px-4 h-9 hidden md:flex"
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 pb-4 border-b border-slate-100 gap-3">
                                <div className="flex items-center justify-between w-full sm:w-auto">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">Q{qNum}</span>
                                        <span className="text-xs md:text-sm font-medium text-slate-400">ID: {currentQuestion.id}</span>
                                    </div>
                                    {/* Mobile Submit Button (Header submit hidden on mobile) */}
                                    {/* We can keep one submit button. Header one is fine if we make it icon only or similar. 
                                         Let's add a small submit in header or drawer?
                                         Actually, let's keep it in header but maybe simpler?
                                         Or just add a Submit button in the Palette drawer?
                                      */}
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold">
                                    <span className="bg-green-50 text-green-700 px-2 md:px-2.5 py-1 rounded border border-green-200">+5 Marks</span>
                                    <span className="bg-red-50 text-red-700 px-2 md:px-2.5 py-1 rounded border border-red-200">-1 Mark</span>
                                </div>
                            </div>

                            {/* Question Text */}
                            <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-6 md:mb-8">
                                <h2 className="text-base md:text-xl font-medium text-slate-900 leading-relaxed select-text font-serif">
                                    {currentQuestion.text}
                                </h2>
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
                                                relative p-3 md:p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 md:gap-5 group
                                                ${isSelected
                                                    ? "border-primary bg-blue-50/50 shadow-md ring-1 ring-primary/20"
                                                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm"
                                                }
                                            `}
                                        >
                                            <div className={`
                                                shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center text-xs md:text-sm font-bold transition-all mt-0.5 md:mt-0
                                                ${isSelected
                                                    ? "bg-primary border-primary text-white scale-110"
                                                    : "border-slate-300 text-slate-500 group-hover:border-primary group-hover:text-primary"
                                                }
                                            `}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`text-sm md:text-lg leading-relaxed ${isSelected ? "text-primary-900 font-medium" : "text-slate-700"}`}>
                                                {opt}
                                            </span>

                                            {isSelected && (
                                                <div className="absolute top-3 right-3 md:top-4 md:right-4">
                                                    <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 md:p-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-20 safe-area-bottom">
                        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                            {/* Mobile: Split actions into two rows conceptually if needed, but flex-wrap handles it. 
                                 We want Mark/Clear on left, Prev/Next on right usually.
                             */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={actions.handleMarkForReview}
                                    variant="outline"
                                    size="sm"
                                    className={`
                                        flex-1 sm:flex-none h-10
                                        ${isMarked ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" : ""}
                                    `}
                                >
                                    <Flag className="h-4 w-4 mr-1.5" />
                                    {isMarked ? "Marked" : "Review"}
                                </Button>
                                <Button
                                    onClick={actions.handleClearResponse}
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 sm:flex-none h-10 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <RotateCcw className="h-4 w-4 mr-1.5" /> Clear
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={actions.handlePrev}
                                    disabled={currentQIndex === 0}
                                    variant="secondary"
                                    size="sm"
                                    className="pl-3 flex-1 sm:flex-none h-10"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                </Button>
                                <Button
                                    onClick={actions.handleNext}
                                    disabled={currentQIndex === questions.length - 1}
                                    size="sm"
                                    className="bg-primary hover:bg-blue-700 text-white pr-4 pl-6 shadow-lg shadow-blue-500/20 w-full sm:w-auto font-bold h-10"
                                >
                                    Save & Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right: Question Palette (Desktop) */}
                <aside className="w-80 border-l border-slate-200 bg-white hidden lg:flex flex-col h-full z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
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
                    <SheetContent onClose={() => setIsPaletteOpen(false)} className="bg-slate-50 sm:max-w-xs w-[85vw]">
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
                            <div className="p-4 border-t border-slate-200 bg-white">
                                <Button
                                    onClick={() => {
                                        setIsPaletteOpen(false);
                                        if (confirm("Are you sure you want to finish the test? You cannot return once submitted.")) {
                                            actions.submitTest();
                                        }
                                    }}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
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
function PaletteHeader({ user, userData, integrity, mobile }: any) {
    return (
        <div className={`p-4 border-b border-slate-200 font-bold text-slate-700 bg-slate-50 flex items-center gap-2 ${mobile ? 'pt-12' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                <span className="text-slate-500 font-bold">
                    {(userData?.name || user?.displayName || 'C').charAt(0).toUpperCase()}
                </span>
            </div>
            <div className="overflow-hidden">
                <p className="truncate text-sm">{userData?.name || user?.displayName || 'Candidate'}</p>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500">ID: {user?.uid?.substring(0, 8)}...</p>
                </div>
                {integrity.tabSwitches > 0 && (
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                        Warnings: {integrity.tabSwitches}
                    </span>
                )}
            </div>
        </div>
    );
}
