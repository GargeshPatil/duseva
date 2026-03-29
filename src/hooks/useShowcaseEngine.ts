import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Test,
  Question,
  QuestionStatus,
  TestResult
} from '@/types/admin';

export function useShowcaseEngine() {
    const router = useRouter();

    // Core State
    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    
    // UI State
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [currentSection, setCurrentSection] = useState<string>('General'); 

    // Exam Data State
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [questionStatus, setQuestionStatus] = useState<Record<string, QuestionStatus>>({});
    const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
    const lastEntryTimeRef = useRef<number>(Date.now());
    
    // Exam Session State
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<string | null>(null);

    // Integrity State (Dummy for Showcase)
    const [tabSwitches, setTabSwitches] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);

    // Refs for intervals and safe state access
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const submittedRef = useRef(false);
    const stateRef = useRef({
        answers,
        questionStatus,
        timeRemaining,
        currentQIndex,
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
            status: isTestStarted ? 'in_progress' : 'idle',
            tabSwitches,
            timeSpent
        };
    }, [answers, questionStatus, timeRemaining, currentQIndex, isTestStarted, tabSwitches, timeSpent]);

    // --- Initialization ---
    useEffect(() => {
        async function init() {
            try {
                // Fetch random showcase from our dedicated public API
                const res = await fetch('/api/test/showcase', {
                    cache: 'no-store'
                });

                if (!res.ok) throw new Error("Failed to load showcase test");

                const data = await res.json();
                
                if (data.test && data.questions) {
                    setTest(data.test);
                    setCurrentSection(data.test.streams?.[0] || 'General');
                    let qs: Question[] = data.questions;

                    const savedSession = sessionStorage.getItem(`showcase_session`);
                    let orderedQs = [...qs];

                    if (savedSession) {
                        const session = JSON.parse(savedSession);
                        if (session.status === 'submitted' || session.status === 'completed') {
                            router.replace(`/test/showcase/result`);
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
                        setStartTime(session.startTime);
                        setTabSwitches(session.tabSwitches || 0);

                        if (session.startTime) {
                            const start = new Date(session.startTime).getTime();
                            const elapsedSeconds = Math.floor((Date.now() - start) / 1000);
                            const remaining = Math.max(0, (data.test.duration * 60) - elapsedSeconds);
                            setTimeRemaining(remaining);

                            if (remaining > 0) {
                                setIsTestStarted(true);
                                lastEntryTimeRef.current = Date.now();
                                startTick(start, data.test.duration * 60);
                            } else {
                                setTimeRemaining(0);
                                setIsTestStarted(true);
                            }
                        }
                    } else if (data.test.shuffleQuestions) {
                        for (let i = orderedQs.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [orderedQs[i], orderedQs[j]] = [orderedQs[j], orderedQs[i]];
                        }
                    }

                    setQuestions(orderedQs);
                }
            } catch (err) {
                console.error("Test Init Error:", err);
                setError("Network error fetching showcase test.");
            } finally {
                setLoading(false);
            }
        }
        init();

        return () => stopTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stopTimers = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const startTick = useCallback((startTimestamp: number, totalDurationSeconds: number) => {
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTimestamp) / 1000);
            const remaining = Math.max(0, totalDurationSeconds - elapsed);

            setTimeRemaining(remaining);
            
            if (remaining <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
            }
        }, 1000);
    }, []);

    const saveLocal = useCallback(() => {
        if (!test) return;

        const session = {
            testId: test.id,
            ...stateRef.current,
            startTime,
            lastUpdated: Date.now(),
            shuffledQuestionIds: questions.map(q => q.id),
            timeSpent: stateRef.current.timeSpent
        };
        sessionStorage.setItem(`showcase_session`, JSON.stringify(session));
    }, [test, startTime, questions]);


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
        if (!test) return;
        setLoading(true);

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

        sessionStorage.setItem(`showcase_session`, JSON.stringify({
            testId: test.id,
            startTime: now,
            answers: {},
            questionStatus: initialStatus,
            timeRemaining: totalSeconds,
            status: 'in_progress',
            tabSwitches: 0,
            timeSpent: {},
            shuffledQuestionIds: questions.map(q => q.id)
        }));
        
        setLoading(false);
    };

    // --- NTA Specific Interactions ---

    useEffect(() => {
        if (!isTestStarted || questions.length === 0) return;
        const currentQ = questions[currentQIndex];
        if (!currentQ) return;

        const qId = currentQ.id;
        setQuestionStatus(prev => {
            const currentStat = prev[qId]?.status;
            if (!currentStat || currentStat === 'not_visited') {
                return {
                    ...prev,
                    [qId]: { ...prev[qId], questionId: qId, status: 'not_answered', visited: true }
                };
            }
            return prev;
        });
    }, [currentQIndex, isTestStarted, questions]);

    const handleOptionSelect = (answerPayload: any) => {
        const qId = questions[currentQIndex].id;
        setAnswers(prev => ({ ...prev, [qId]: answerPayload }));
    };

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

    const markForReviewAndNext = () => {
        const qId = questions[currentQIndex].id;
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
        if (isSubmitting || !test) return;
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
            attemptId: 'showcase_temp',
            userId: 'showcase_user',
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

        // NO FIRESTORE SUBMISSION
        // Save to sessionStorage instead
        sessionStorage.setItem(`showcase_session`, JSON.stringify({
            ...current,
            status: 'submitted',
            resultData
        }));

        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen().catch(err => console.log(err));
            }
        } catch (e) {
            console.log(e);
        }

        router.replace(`/test/showcase/result`);
    };

    const handleAutoSubmit = useCallback(async () => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        
        await performSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [performSubmission, router]);

    useEffect(() => {
        if (isTestStarted && timeRemaining <= 0) {
            handleAutoSubmit();
        }
    }, [timeRemaining, isTestStarted, handleAutoSubmit]);

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
        currentQIndex,
        currentQuestion: questions[currentQIndex],
        answers,
        questionStatus,
        timeRemaining,
        isTestStarted,
        loading,
        error,
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
            submitTest: handleAutoSubmit
        }
    };
}
