import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreService } from '@/services/firestoreService';
import { Test, Question, QuestionStatus, TestAttempt, TestResult } from '@/types/admin';

export function useTestEngine(testId: string) {
    const router = useRouter();
    const { user } = useAuth();

    // Core State
    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [questionStatus, setQuestionStatus] = useState<Record<string, QuestionStatus>>({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<string | null>(null);

    // Integrity State
    const [tabSwitches, setTabSwitches] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);

    // Refs for intervals and safe state access
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const syncRef = useRef<NodeJS.Timeout | null>(null);
    const stateRef = useRef({
        answers,
        questionStatus,
        timeRemaining,
        currentQIndex,
        attemptId,
        status: 'in_progress',
        tabSwitches
    });

    // Sync stateRef
    useEffect(() => {
        stateRef.current = {
            answers,
            questionStatus,
            timeRemaining,
            currentQIndex,
            attemptId,
            status: isTestStarted ? 'in_progress' : 'idle',
            tabSwitches
        };
    }, [answers, questionStatus, timeRemaining, currentQIndex, attemptId, isTestStarted, tabSwitches]);

    // --- Integrity: Tab Switching & Visibility ---
    useEffect(() => {
        if (!isTestStarted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                incrementTabSwitch();
            }
        };

        const incrementTabSwitch = () => {
            setTabSwitches(prev => {
                const newVal = prev + 1;
                if (newVal > 0) setShowTabWarning(true);
                return newVal;
            });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isTestStarted]);

    // --- Integrity: Navigation Guard (BeforeUnload) ---
    useEffect(() => {
        if (!isTestStarted) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = ''; // Standard browser dialog trigger
            return '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isTestStarted]);

    // --- Initialization ---
    useEffect(() => {
        async function init() {
            if (!testId || !user) return;

            try {
                // 1. Fetch Test Details
                const allTests = await firestoreService.getTests(true);
                const foundTest = allTests.find(t => t.id === testId);

                if (foundTest) {
                    setTest(foundTest);
                    const qs = await firestoreService.getQuestions(testId);
                    setQuestions(qs);

                    // 2. Recovery Logic
                    const savedSession = localStorage.getItem(`test_session_${testId}_${user.uid}`);

                    if (savedSession) {
                        const session = JSON.parse(savedSession);
                        if (session.status === 'submitted' || session.status === 'completed') {
                            router.replace(`/analysis/${testId}`);
                            return;
                        }

                        setAnswers(session.answers || {});
                        setQuestionStatus(session.questionStatus || {});
                        setCurrentQIndex(session.currentQIndex || 0);
                        setAttemptId(session.attemptId);
                        setStartTime(session.startTime);
                        setTabSwitches(session.tabSwitches || 0);

                        // Calculate Time Remaining based on Server Start Time
                        if (session.startTime) {
                            const start = new Date(session.startTime).getTime();
                            const now = Date.now();
                            const elapsedSeconds = Math.floor((now - start) / 1000);
                            const totalSeconds = foundTest.duration * 60;
                            const remaining = Math.max(0, totalSeconds - elapsedSeconds);
                            setTimeRemaining(remaining);

                            if (remaining > 0) {
                                setIsTestStarted(true);
                                startTick(start, totalSeconds);
                            } else {
                                setTimeRemaining(0);
                                setIsTestStarted(true);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Test Init Error:", err);
            } finally {
                setLoading(false);
            }
        }
        init();

        return () => {
            stopTimers();
        };
    }, [testId, user]);

    const stopTimers = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (syncRef.current) clearInterval(syncRef.current);
    };

    // --- Timer Logic (Server Time Based) ---
    const startTick = useCallback((startTimestamp: number, totalDurationSeconds: number) => {
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTimestamp) / 1000);
            const remaining = Math.max(0, totalDurationSeconds - elapsed);

            setTimeRemaining(remaining);

            if (remaining <= 0) {
                clearInterval(timerRef.current!);
                handleAutoSubmit();
            }
        }, 1000);

        // Auto-Sync to Firestore every 30s
        if (syncRef.current) clearInterval(syncRef.current);
        syncRef.current = setInterval(() => {
            syncToFirestore();
        }, 30000);

    }, []);

    // --- Hybrid Sync ---
    // 1. Local Storage (Instant)
    const saveLocal = useCallback(() => {
        if (!user || !testId || !stateRef.current.attemptId) return;

        const session = {
            testId,
            userId: user.uid,
            ...stateRef.current,
            startTime,
            lastUpdated: Date.now()
        };
        localStorage.setItem(`test_session_${testId}_${user.uid}`, JSON.stringify(session));
    }, [testId, user, startTime]);

    // 2. Firestore Sync (Periodic)
    const syncToFirestore = async () => {
        const current = stateRef.current;
        if (!current.attemptId) return;

        // console.log("Syncing progress to Firestore...");
        await firestoreService.updateTestAttempt(current.attemptId, {
            answers: current.answers,
            questionStatus: current.questionStatus,
            timeRemaining: current.timeRemaining,
            currentQuestionIndex: current.currentQIndex,
            tabSwitches: current.tabSwitches
        });
    };

    // --- Actions ---
    const requestFullScreen = () => {
        const elem = document.documentElement as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
        };
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch((err: unknown) => console.log(err));
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    };

    const startTest = async () => {
        if (!test || !user) return;
        setLoading(true);

        const activeAttemptId = await firestoreService.startTestAttempt(user.uid, test.id, test.duration);

        if (activeAttemptId) {
            setAttemptId(activeAttemptId);
            const now = new Date().toISOString();
            setStartTime(now);

            const totalSeconds = test.duration * 60;
            setTimeRemaining(totalSeconds);
            setIsTestStarted(true);

            // Try Full Screen
            requestFullScreen();

            if (Object.keys(questionStatus).length === 0) {
                const initStatus: Record<string, QuestionStatus> = {};
                questions.forEach(q => {
                    initStatus[q.id] = { questionId: q.id, status: 'not_visited', visited: false };
                });
                setQuestionStatus(initStatus);
            }

            startTick(Date.now(), totalSeconds);

            localStorage.setItem(`test_session_${testId}_${user.uid}`, JSON.stringify({
                testId,
                userId: user.uid,
                attemptId: activeAttemptId,
                startTime: now,
                answers: {},
                questionStatus: {},
                timeRemaining: totalSeconds,
                status: 'in_progress',
                tabSwitches: 0
            }));
        }
        setLoading(false);
    };


    // --- NTA Status Logic ---

    // 1. Auto-mark "not_answered" when visiting a "not_visited" question
    useEffect(() => {
        if (!isTestStarted || questions.length === 0) return;
        const currentQ = questions[currentQIndex];
        if (!currentQ) return;

        const qId = currentQ.id;
        setQuestionStatus(prev => {
            const currentStat = prev[qId]?.status;
            // Only update if currently 'not_visited'
            if (currentStat === 'not_visited') {
                return {
                    ...prev,
                    [qId]: { ...prev[qId], status: 'not_answered', visited: true }
                };
            }
            return prev;
        });
    }, [currentQIndex, isTestStarted, questions]);

    const handleOptionSelect = (optionIdx: number) => {
        const qId = questions[currentQIndex].id;
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
        // NTA: Selecting an option makes it "Answered" (Green)
        updateStatus(qId, 'answered');
    };

    const updateStatus = (qId: string, statusType: QuestionStatus['status']) => {
        setQuestionStatus(prev => ({
            ...prev,
            [qId]: { ...prev[qId], status: statusType, visited: true }
        }));
    };

    // Effect to save local
    useEffect(() => {
        if (isTestStarted) saveLocal();
    }, [answers, questionStatus, currentQIndex, isTestStarted, tabSwitches, saveLocal]);


    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQIndex > 0) {
            setCurrentQIndex(prev => prev - 1);
        }
    };

    const handleJump = (index: number) => {
        setCurrentQIndex(index);
    };

    const handleMarkForReview = () => {
        const qId = questions[currentQIndex].id;
        const isAnswered = answers[qId] !== undefined;
        // NTA: If answered -> "Answered & Marked for Review" (Purple with Green dot)
        //      If not answered -> "Marked for Review" (Purple)
        updateStatus(qId, isAnswered ? 'answered_marked_for_review' : 'marked_for_review');
        handleNext(); // Usually moves to next
    };

    const handleClearResponse = () => {
        const qId = questions[currentQIndex].id;
        const newAnswers = { ...answers };
        delete newAnswers[qId];
        setAnswers(newAnswers);
        // NTA: Clearing response reverts to "Not Answered" (Red)
        updateStatus(qId, 'not_answered');
    };

    // Robust Submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    const performSubmission = async () => {
        if (isSubmitting || !attemptId || !test) return;
        setIsSubmitting(true);
        stopTimers();

        const current = stateRef.current;

        // Calculate Score
        let score = 0;
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;

        questions.forEach(q => {
            const ans = current.answers[q.id];
            if (ans === undefined) {
                unanswered++;
            } else if (ans === q.correctOption) {
                score += 5;
                correct++;
            } else {
                score -= 1;
                incorrect++;
            }
        });

        const resultData: Omit<TestResult, 'id'> = {
            attemptId,
            userId: user!.uid,
            testId: test.id,
            score,
            totalQuestions: questions.length,
            correctAnswers: correct,
            incorrectAnswers: incorrect,
            unanswered,
            accuracy: (correct / (correct + incorrect) * 100) || 0,
            timeTaken: (test.duration * 60) - current.timeRemaining,
            completedAt: new Date().toISOString()
        };

        // --- Improvement Logic ---
        try {
            // Fetch the LAST completed attempt for this test (before this current one)
            const previousAttempt = await firestoreService.getLastTestAttempt(user!.uid, test.id);
            if (previousAttempt && previousAttempt.resultData) {
                const prev = previousAttempt.resultData;

                // Normalize previous accuracy if it was stored as 0-1 (legacy bug)
                const prevAccuracy = prev.accuracy <= 1 ? prev.accuracy * 100 : prev.accuracy;

                resultData.improvement = {
                    scoreDiff: resultData.score - prev.score,
                    accuracyDiff: resultData.accuracy - prevAccuracy,
                    timeDiff: prev.timeTaken - resultData.timeTaken // Positive means we were FASTER
                };
            }
        } catch (err) {
            console.error("Error calculating improvement:", err);
            // Non-critical, continue submission
        }

        const success = await firestoreService.submitTestAttempt(
            attemptId,
            resultData,
            current.answers,
            current.questionStatus
        );

        if (success) {
            localStorage.setItem(`test_session_${testId}_${user!.uid}`, JSON.stringify({
                ...current,
                status: 'submitted'
            }));

            // Exit Full Screen if active
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log(err));
            }

            router.replace(`/analysis/${testId}`);
        } else {
            alert("Submission failed. Please check connection and try again.");
            setIsSubmitting(false);
        }
    };

    const handleAutoSubmit = () => {
        performSubmission();
    };

    const integrityHandlers = {
        onContextMenu: (e: React.MouseEvent) => {
            if (isTestStarted) e.preventDefault();
        },
        onCopy: (e: React.ClipboardEvent) => {
            if (isTestStarted) {
                e.preventDefault();
                alert("Copying is disabled during the exam.");
            }
        },
        onCut: (e: React.ClipboardEvent) => {
            if (isTestStarted) e.preventDefault();
        },
        onPaste: (e: React.ClipboardEvent) => {
            // Optional: allow pasting? Typically blocked.
            if (isTestStarted) e.preventDefault();
        }
    };

    return {
        test,
        questions,
        currentQIndex,
        currentQuestion: questions[currentQIndex],
        answers,
        questionStatus,
        timeRemaining,
        isTestStarted,
        loading,
        integrity: {
            tabSwitches,
            showTabWarning,
            dismissTabWarning: () => setShowTabWarning(false),
            handlers: integrityHandlers
        },
        actions: {
            startTest,
            handleOptionSelect,
            handleNext,
            handlePrev,
            handleJump,
            handleMarkForReview,
            handleClearResponse,
            submitTest: performSubmission
        }
    };
}
