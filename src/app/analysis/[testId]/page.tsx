"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { firestoreService } from '@/services/firestoreService';
import { Test, Question, TestAttempt, TestResult } from "@/types/admin";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Trophy,
  Target,
  BarChart2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

export default function AnalysisPage() {
  const params = useParams();
  const testId = params.testId as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<Test | null>(null);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<Partial<TestResult> | null>(null);

  // UI State
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/analysis/${testId}`);
      return;
    }

    async function fetchData() {
      if (!user || !testId) return;

      try {
        // Parallel fetch
        const [fetchedTest, fetchedQuestions, fetchedAttempt] = await Promise.all([
          firestoreService.getTest(testId),
          firestoreService.getQuestions(testId),
          firestoreService.getLastTestAttempt(user.uid, testId)
        ]);

        setTest(fetchedTest);
        setQuestions(fetchedQuestions);
        setAttempt(fetchedAttempt);

        if (fetchedAttempt && fetchedAttempt.resultData) {
          setResult(fetchedAttempt.resultData);
        } else if (fetchedAttempt) {
          // Fallback calculation if resultData is missing (shouldn't happen with new logic)
          // But useful for older attempts or robustness
          let score = 0;
          let correct = 0;
          let incorrect = 0;
          let unanswered = 0;

          fetchedQuestions.forEach(q => {
            const ans = fetchedAttempt.answers[q.id];
            if (ans === undefined) unanswered++;
            else if (ans === q.correctOption) {
              score += 5;
              correct++;
            } else {
              score -= 1;
              incorrect++;
            }
          });

          setResult({
            score,
            correctAnswers: correct,
            incorrectAnswers: incorrect,
            unanswered,
            accuracy: correct / (correct + incorrect) * 100 || 0,
            timeTaken: (fetchedTest?.duration || 0) * 60 - fetchedAttempt.timeRemaining
          });
        }

      } catch (error) {
        console.error("Error loading analysis:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchData();
  }, [user, testId, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Analyzing Performance...</p>
      </div>
    );
  }

  if (!attempt || !test) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Result Found</h2>
        <p className="text-slate-500 mb-6">We couldn&apos;t find a completed attempt for this test.</p>
        <Link href="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // derived for display
  const accuracy = result?.accuracy ? Math.round(result.accuracy * 100) / 100 : 0;
  const timeDisplay = result?.timeTaken
    ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s`
    : "N/A";

  // Insights Logic
  const weakAreas = [];
  if (accuracy < 50) weakAreas.push("Overall Accuracy is low. Focus on core concepts.");
  if (result?.incorrectAnswers && result.incorrectAnswers > (result.correctAnswers || 0)) weakAreas.push("High negative marking impact. Avoid guessing.");

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Test Analysis</h1>
            <p className="text-slate-500">{test.title} • Attempted on {new Date(attempt.startTime).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button
              onClick={() => {
                // Clear local session to allow new attempt
                localStorage.removeItem(`test_session_${testId}_${user!.uid}`);
                router.push(`/test/${testId}`);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Re-attempt Test
            </Button>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Trophy className="h-40 w-40 text-yellow-500" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {/* Total Score */}
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Score</p>
              <div className="text-3xl font-bold text-slate-900 flex items-end gap-2">
                {result?.score} <span className="text-lg text-slate-400 font-medium">/ {test.totalMarks}</span>
              </div>
              {result?.improvement && (
                <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${result.improvement.scoreDiff > 0 ? 'text-green-600' : result.improvement.scoreDiff < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {result.improvement.scoreDiff > 0 ? <TrendingUp className="h-3 w-3" /> : result.improvement.scoreDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {result.improvement.scoreDiff > 0 ? '+' : ''}{result.improvement.scoreDiff} vs last attempt
                </div>
              )}
            </div>

            {/* Rank */}
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Rank</p>
              <div className="text-3xl font-bold text-slate-900">--</div>
              <div className="text-sm text-slate-400 font-medium">Coming Soon</div>
            </div>

            {/* Time Taken */}
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Time Taken</p>
              <div className="text-3xl font-bold text-indigo-600">{timeDisplay}</div>
              {result?.improvement && (
                <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${result.improvement.timeDiff > 0 ? 'text-green-600' : result.improvement.timeDiff < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {result.improvement.timeDiff > 0 ? <TrendingUp className="h-3 w-3" /> : result.improvement.timeDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {result.improvement.timeDiff > 0 ? 'Faster' : 'Slower'} by {Math.abs(Math.round(result.improvement.timeDiff / 60))}m
                </div>
              )}
            </div>

            {/* Accuracy */}
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Accuracy</p>
              <div className={`text-3xl font-bold ${accuracy >= 80 ? 'text-green-600' : accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {accuracy}%
              </div>
              {result?.improvement && (
                <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${result.improvement.accuracyDiff > 0 ? 'text-green-600' : result.improvement.accuracyDiff < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {result.improvement.accuracyDiff > 0 ? <TrendingUp className="h-3 w-3" /> : result.improvement.accuracyDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {result.improvement.accuracyDiff > 0 ? '+' : ''}{Math.round(result.improvement.accuracyDiff * 100)}% vs last attempt
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Question Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" /> Question Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Correct
                </div>
                <span className="font-bold text-slate-900">{result?.correctAnswers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <XCircle className="h-4 w-4 text-red-500" /> Incorrect
                </div>
                <span className="font-bold text-slate-900">{result?.incorrectAnswers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <AlertCircle className="h-4 w-4 text-slate-400" /> Skipped
                </div>
                <span className="font-bold text-slate-900">{result?.unanswered}</span>
              </div>
            </div>
          </div>

          {/* Improvement Areas */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-orange-500" /> Improvement Insights
            </h3>
            <div className="space-y-3">
              {weakAreas.length > 0 ? (
                weakAreas.map((area, i) => (
                  <div key={i} className="bg-amber-50 text-amber-800 px-4 py-3 rounded-lg text-sm border border-amber-100 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    {area}
                  </div>
                ))
              ) : (
                <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg text-sm border border-green-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Great job! Keep practicing to maintain this performance.
                </div>
              )}
              <div className="text-xs text-slate-400 mt-4">
                * More detailed insights regarding specific topics will appear here as you take more tests.
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Detailed Question Review</h2>

          {questions.map((q, index) => {
            const userAnswerIdx = attempt.answers[q.id];
            const isSkipped = userAnswerIdx === undefined;
            const isCorrect = userAnswerIdx === q.correctOption;

            const statusColor = isSkipped
              ? "border-slate-200 bg-white"
              : isCorrect
                ? "border-green-200 bg-green-50/30"
                : "border-red-200 bg-red-50/30";

            const isExpanded = expandedQuestion === q.id;

            return (
              <div key={q.id} className={`rounded-xl border ${statusColor} overflow-hidden transition-all duration-200`}>
                <div
                  className="p-4 md:p-6 flex items-start gap-4 cursor-pointer hover:bg-slate-50/50"
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                >
                  <div className={`
                                        shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                        ${isSkipped ? 'bg-slate-100 text-slate-500' : isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                    `}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-slate-900 pr-8">{q.text}</h3>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </div>

                    {!isExpanded && (
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className={`${isCorrect ? 'text-green-600' : isSkipped ? 'text-slate-500' : 'text-red-600'} font-medium`}>
                          {isSkipped ? 'Skipped' : isCorrect ? 'Correct (+5)' : 'Incorrect (-1)'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 md:px-6 pb-6 pt-0 border-t border-slate-100/50">
                    <div className="mt-4 space-y-3">
                      {q.options.map((opt, i) => {
                        const isSelected = i === userAnswerIdx;
                        const isCorrectOpt = i === q.correctOption;

                        let optClass = "border-slate-200 text-slate-700 hover:bg-slate-50";
                        if (isCorrectOpt) optClass = "border-green-500 bg-green-50 text-green-900 font-medium";
                        else if (isSelected && !isCorrectOpt) optClass = "border-red-500 bg-red-50 text-red-900";

                        return (
                          <div key={i} className={`p-3 rounded border text-sm flex items-center gap-3 ${optClass}`}>
                            <div className="w-6 h-6 rounded-full border flex items-center justify-center text-xs opacity-70">
                              {String.fromCharCode(65 + i)}
                            </div>
                            {opt}
                            {isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />}
                            {isSelected && !isCorrectOpt && <XCircle className="h-4 w-4 text-red-600 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-4 bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                        <span className="font-bold block mb-1">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Ready for the next challenge?</h2>
          <p className="text-blue-100 mb-6">
            Consistent practice is the key to success. Try another mock test now.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard/tests">
              <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                Practice Other Tests
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 border-none"
              onClick={() => {
                localStorage.removeItem(`test_session_${testId}_${user!.uid}`);
                router.push(`/test/${testId}`);
              }}
            >
              Re-attempt This Test
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
