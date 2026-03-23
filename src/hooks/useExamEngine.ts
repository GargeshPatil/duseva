import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreService } from '@/services/firestoreService';
import {
  Test,
  Question,
  QuestionStatus,
  TestResult,
  Passage
} from '@/types/admin';

export function useExamEngine(testId: string) {
    const router = useRouter();
    const { user } = useAuth();

    // Core State
    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [passages, setPassages] = useState<Record<string, Passage>>({});
    
    // UI State
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [currentSection, setCurrentSection] = useState<string>('General'); // or first stream/section

    // Exam Data State
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [questionStatus, setQuestionStatus] = useState<Record<string, QuestionStatus>>({});
    const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
    const lastEntryTimeRef = useRef<number>(Date.now());
    
    // Exam Session State
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
        tabSwitches,
        timeSpent
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
            tabSwitches,
            timeSpent
        };
    }, [answers, questionStatus, timeRemaining, currentQIndex, attemptId, isTestStarted, tabSwitches, timeSpent]);

    // --- Integrity: Tab Switching & Visibility ---
    useEffect(() => {
        if (!isTestStarted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => {
                    const newVal = prev + 1;
                    if (newVal > 0) setShowTabWarning(true);
                    return newVal;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
                const allTests = await firestoreService.getTests(true); // Must be published
                const foundTest = allTests.find(t => t.id === testId);

                if (foundTest) {
                    setTest(foundTest);
                    setCurrentSection(foundTest.streams?.[0] || 'General');

                    let qs: Question[] = [];
                    if (foundTest.questionIds && foundTest.questionIds.length > 0) {
                        qs = await firestoreService.getQuestions({ ids: foundTest.questionIds });
                    } else {
                        qs = await firestoreService.getQuestions({ testId });
                    }
                    
                    // Separate questions by their subject or stream if mock supports sections
                    // NTA interface has section tabs. We will use `question.subject` if available or `stream`
                    setQuestions(qs);

                    // Fetch associated passages
                    const passageIds = Array.from(new Set(qs.filter(q => q.passageId).map(q => q.passageId as string)));
                    if (passageIds.length > 0) {
                        const fetchedPassages: Record<string, Passage> = {};
                        await Promise.all(passageIds.map(async id => {
                            const p = await firestoreService.getPassage(id);
                            if (p) fetchedPassages[id] = p;
                        }));
                        setPassages(fetchedPassages);
                    }

                    // 2. Recovery Logic
                    const savedSession = localStorage.getItem(`exam_session_${testId}_${user.uid}`);
                    let orderedQs = [...qs];

                    if (savedSession) {
                        const session = JSON.parse(savedSession);
                        if (session.status === 'submitted' || session.status === 'completed') {
                            router.replace(`/dashboard/analysis/${session.attemptId}`);
                            return;
                        }

                        if (session.shuffledQuestionIds && Array.isArray(session.shuffledQuestionIds)) {
                            const idMap = new Map(qs.map(q => [q.id, q]));
                            orderedQs = session.shuffledQuestionIds.map((id: string) => idMap.get(id)).filter(Boolean) as Question[];
                        }

                        setAnswers(session.answers || {});
                        setQuestionStatus(session.questionStatus || {});
                        setTimeSpent(session.timeSpent || {});
                        setCurrentQIndex(session.currentQIndex || 0);
                        setAttemptId(session.attemptId);
                        setStartTime(session.startTime);
                        setTabSwitches(session.tabSwitches || 0);

                        if (session.startTime) {
                            const start = new Date(session.startTime).getTime();
                            const elapsedSeconds = Math.floor((Date.now() - start) / 1000);
                            const remaining = Math.max(0, (foundTest.duration * 60) - elapsedSeconds);
                            setTimeRemaining(remaining);

                            if (remaining > 0) {
                                setIsTestStarted(true);
                                lastEntryTimeRef.current = Date.now();
                                startTick(start, foundTest.duration * 60);
                            } else {
                                setTimeRemaining(0);
                                setIsTestStarted(true);
                            }
                        }
                    } else if (foundTest.shuffleQuestions) {
                        // Fresh start shuffling
                        for (let i = orderedQs.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [orderedQs[i], orderedQs[j]] = [orderedQs[j], orderedQs[i]];
                        }
                    }

                    setQuestions(orderedQs);
                }
            } catch (err) {
                console.error("Test Init Error:", err);
            } finally {
                setLoading(false);
            }
        }
        init();

        return () => stopTimers();
    }, [testId, user]);

    const stopTimers = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (syncRef.current) clearInterval(syncRef.current);
    };

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

        if (syncRef.current) clearInterval(syncRef.current);
        syncRef.current = setInterval(() => {
            syncToFirestore();
        }, 30000);

    }, []);

    const saveLocal = useCallback(() => {
        if (!user || !testId || !stateRef.current.attemptId) return;

        const session = {
            testId,
            userId: user.uid,
            ...stateRef.current,
            startTime,
            lastUpdated: Date.now(),
            shuffledQuestionIds: questions.map(q => q.id),
            timeSpent: stateRef.current.timeSpent
        };
        localStorage.setItem(`exam_session_${testId}_${user.uid}`, JSON.stringify(session));
    }, [testId, user, startTime, questions]);

    const syncToFirestore = async () => {
        const current = stateRef.current;
        if (!current.attemptId) return;

        await firestoreService.updateTestAttempt(current.attemptId, {
            answers: current.answers,
            questionStatus: current.questionStatus,
            timeRemaining: current.timeRemaining,
            currentQuestionIndex: current.currentQIndex,
            tabSwitches: current.tabSwitches,
            timeSpent: current.timeSpent
        });
    };

    const requestFullScreen = () => {
        const elem = document.documentElement as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
        };
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch((err: unknown) => console.log(err));
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
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
            lastEntryTimeRef.current = Date.now();

            requestFullScreen();

            const initialStatus = { ...questionStatus };
            if (Object.keys(initialStatus).length === 0) {
                questions.forEach(q => {
                    initialStatus[q.id] = { questionId: q.id, status: 'not_visited', visited: false };
                });
                
                // Immediately mark the first question as visited
                if (questions.length > 0) {
                    initialStatus[questions[0].id].status = 'not_answered';
                    initialStatus[questions[0].id].visited = true;
                }
                setQuestionStatus(initialStatus);
            }

            startTick(Date.now(), totalSeconds);

            localStorage.setItem(`exam_session_${testId}_${user.uid}`, JSON.stringify({
                testId,
                userId: user.uid,
                attemptId: activeAttemptId,
                startTime: now,
                answers: {},
                questionStatus: initialStatus,
                timeRemaining: totalSeconds,
                status: 'in_progress',
                tabSwitches: 0,
                timeSpent: {},
                shuffledQuestionIds: questions.map(q => q.id)
            }));
        }
        setLoading(false);
    };

    // --- NTA Specific Interactions ---

    // Any time we visit a new question by index logically (e.g. from palette)
    useEffect(() => {
        if (!isTestStarted || questions.length === 0) return;
        const currentQ = questions[currentQIndex];
        if (!currentQ) return;

        const qId = currentQ.id;
        setQuestionStatus(prev => {
            const currentStat = prev[qId]?.status;
            // If it's never been visited, mark it as 'not_answered'
            if (!currentStat || currentStat === 'not_visited') {
                return {
                    ...prev,
                    [qId]: { ...prev[qId], questionId: qId, status: 'not_answered', visited: true }
                };
            }
            return prev;
        });
    }, [currentQIndex, isTestStarted, questions]);

    // Just selecting an option locally. DOES NOT change NTA status! Status changes ONLY on Action Button clicks.
    const handleOptionSelect = (answerPayload: any) => {
        const qId = questions[currentQIndex].id;
        setAnswers(prev => ({ ...prev, [qId]: answerPayload }));
    };

    // NTA Action: Clear Response
    const clearResponse = () => {
        const qId = questions[currentQIndex].id;
        const newAnswers = { ...answers };
        delete newAnswers[qId];
        setAnswers(newAnswers);
        
        setQuestionStatus(prev => ({
            ...prev,
            [qId]: { ...prev[qId], status: 'not_answered', visited: true }
        }));
    };

    const updateTimeSpent = useCallback(() => {
        if (!isTestStarted || questions.length === 0) return;
        const currentQ = questions[currentQIndex];
        if (!currentQ) return;
        
        const now = Date.now();
        const spent = Math.max(0, Math.floor((now - lastEntryTimeRef.current) / 1000));
        
        setTimeSpent(prev => ({
            ...prev,
            [currentQ.id]: (prev[currentQ.id] || 0) + spent
        }));
        
        lastEntryTimeRef.current = now;
    }, [currentQIndex, isTestStarted, questions]);

    const moveToNextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            updateTimeSpent();
            setCurrentQIndex(prev => prev + 1);
        }
    };

    // NTA Action: Save & Next
    const saveAndNext = () => {
        const qId = questions[currentQIndex].id;
        const hasAnswer = answers[qId] !== undefined && answers[qId] !== null && answers[qId] !== "";
        
        setQuestionStatus(prev => ({
            ...prev,
            [qId]: { 
                ...prev[qId], 
                status: hasAnswer ? 'answered' : 'not_answered', 
                visited: true 
            }
        }));
        moveToNextQuestion();
    };

    // NTA Action: Save & Mark for Review
    const saveAndMarkForReview = () => {
        const qId = questions[currentQIndex].id;
        const hasAnswer = answers[qId] !== undefined && answers[qId] !== null && answers[qId] !== "";
        
        setQuestionStatus(prev => ({
            ...prev,
            [qId]: { 
                ...prev[qId], 
                status: hasAnswer ? 'answered_marked_for_review' : 'marked_for_review', 
                visited: true 
            }
        }));
        moveToNextQuestion();
    };

    // NTA Action: Mark for Review & Next
    const markForReviewAndNext = () => {
        const qId = questions[currentQIndex].id;
        // Even if there's an answer selected locally, we mark it purely as marked_for_review
        // In NTA, if you don't Save it, the answer won't be evaluated.
        setQuestionStatus(prev => ({
            ...prev,
            [qId]: { 
                ...prev[qId], 
                status: 'marked_for_review', 
                visited: true 
            }
        }));
        moveToNextQuestion();
    };

    const handleJump = (index: number) => {
        if (index >= 0 && index < questions.length) {
            updateTimeSpent();
            setCurrentQIndex(index);
        }
    };

    useEffect(() => {
        if (isTestStarted) saveLocal();
    }, [answers, questionStatus, currentQIndex, isTestStarted, tabSwitches, saveLocal]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const performSubmission = async () => {
        if (isSubmitting || !attemptId || !test) return;
        setIsSubmitting(true);
        stopTimers();

        const current = stateRef.current;

        let score = 0;
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;

        questions.forEach(q => {
            const ans = current.answers[q.id];
            const status = current.questionStatus[q.id]?.status;

            // NTA evaluation logic: only evaluate 'answered' AND 'answered_marked_for_review'
            if (status === 'answered' || status === 'answered_marked_for_review') {
                if (ans !== undefined && ans === q.correctOption) {
                    score += 5;
                    correct++;
                } else {
                    score -= 1;
                    incorrect++;
                }
            } else {
                unanswered++;
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
            accuracy: (correct / Math.max(1, correct + incorrect)) * 100,
            timeTaken: (test.duration * 60) - current.timeRemaining,
            completedAt: new Date().toISOString()
        };

        // Final time tracking update before submit
        if (questions[currentQIndex]) {
            const now = Date.now();
            const spent = Math.floor((now - lastEntryTimeRef.current) / 1000);
            const finalQId = questions[currentQIndex].id;
            current.timeSpent = { ...current.timeSpent, [finalQId]: (current.timeSpent[finalQId] || 0) + spent };
        }

        const success = await firestoreService.submitTestAttempt(
            attemptId,
            resultData,
            current.answers,
            current.questionStatus,
            current.timeSpent
        );

        if (success) {
            localStorage.setItem(`exam_session_${testId}_${user!.uid}`, JSON.stringify({
                ...current,
                status: 'submitted'
            }));

            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log(err));
            }

            router.replace(`/dashboard/analysis/${attemptId}`);
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
            if (isTestStarted) e.preventDefault();
        }
    };

    return {
        test,
        questions,
        passages,
        currentQIndex,
        currentQuestion: questions[currentQIndex],
        answers,
        questionStatus,
        timeRemaining,
        isTestStarted,
        loading,
        currentSection,
        setCurrentSection,
        integrity: {
            tabSwitches,
            showTabWarning,
            dismissTabWarning: () => setShowTabWarning(false),
            handlers: integrityHandlers
        },
        actions: {
            startTest,
            handleOptionSelect,
            handleJump,
            saveAndNext,
            saveAndMarkForReview,
            markForReviewAndNext,
            clearResponse,
            submitTest: performSubmission
        }
    };
}
