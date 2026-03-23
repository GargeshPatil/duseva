"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { firestoreService } from '@/services/firestoreService';
import { Test, Question, TestAttempt, TestResult } from "@/types/admin";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { QuestionReview } from "@/components/analysis/QuestionReview";
import {
  Trophy,
  Target,
  BarChart2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

export default function AnalysisPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<Test | null>(null);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<Partial<TestResult> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/dashboard/analysis/${attemptId}`);
      return;
    }

    async function fetchData() {
      if (!user || !attemptId) return;

      try {
        const fetchedAttempt = await firestoreService.getTestAttempt(attemptId);
        if (!fetchedAttempt) {
            setLoading(false);
            return;
        }

        const testId = fetchedAttempt.testId;

        // Fetch test first to check for questionIds
        const fetchedTest = await firestoreService.getTest(testId);
        
        // Fetch questions conditionally
        let fetchedQuestions: Question[] = [];
        if (fetchedTest?.questionIds && fetchedTest.questionIds.length > 0) {
            fetchedQuestions = await firestoreService.getQuestions({ ids: fetchedTest.questionIds });
        } else {
            fetchedQuestions = await firestoreService.getQuestions({ testId });
        }

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
  }, [user, attemptId, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-cta-primary mb-4" />
        <p className="text-white/50 font-medium animate-pulse">Analyzing Performance...</p>
      </div>
    );
  }

  if (!attempt || !test) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-12 w-12 text-white/40 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Result Found</h2>
        <p className="text-white/50 mb-6">We couldn&apos;t find a completed attempt for this test.</p>
        <Link href="/dashboard">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">Return to Dashboard</Button>
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
  const insights = [];
  if (accuracy >= 80) insights.push({ type: 'success', text: "Excellent accuracy! You have a strong grasp of the concepts." });
  else if (accuracy < 50) insights.push({ type: 'warning', text: "Overall Accuracy is low. Focus on core concepts before attempting more tests." });
  
  if (result?.incorrectAnswers && result.incorrectAnswers > (result.correctAnswers || 0)) {
     insights.push({ type: 'danger', text: "High negative marking impact. Avoid guessing to improve your score." });
  }

  // Time insight
  const avgTimePerQuestion = result?.timeTaken ? result.timeTaken / (questions.length || 1) : 0;
  if (avgTimePerQuestion > 120) {
      insights.push({ type: 'warning', text: "You are spending too long on average per question. Work on time management." });
  } else if (avgTimePerQuestion < 30 && accuracy < 60) {
      insights.push({ type: 'danger', text: "You are rushing through questions leading to mistakes. Take your time to read carefully." });
  }

  // Skipped insight
  if (result?.unanswered && result.unanswered > questions.length * 0.3) {
      insights.push({ type: 'warning', text: "You skipped a large portion of the test. Identify if this is due to lack of time or knowledge gaps." });
  }

  if (insights.length === 0) {
      insights.push({ type: 'success', text: "Great job! Keep practicing to maintain this solid performance." });
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Test Analysis</h1>
            <p className="text-white/50">{test.title} • Attempted on {new Date(attempt.startTime).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">Back to Dashboard</Button>
            </Link>
            <Button
              onClick={() => {
                if (!test) return;
                router.push(`/test/${test.id}/start?reattempt=true`);
              }}
              className="bg-cta-primary hover:bg-cta-hover text-white shadow-lg shadow-cta-primary/30 border-none"
            >
              Re-attempt Test
            </Button>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white/5 rounded-2xl shadow-xl shadow-black/20 border border-white/10 p-6 mb-8 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Trophy className="h-40 w-40 text-yellow-500" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {/* Total Score */}
            <div>
              <p className="text-sm font-medium text-white/50 mb-1">Total Score</p>
              <div className="text-3xl font-bold text-white flex items-end gap-2">
                {result?.score} <span className="text-lg text-white/30 font-medium">/ {test.totalMarks}</span>
              </div>
              {result?.improvement && (
                <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${result.improvement.scoreDiff > 0 ? 'text-emerald-400' : result.improvement.scoreDiff < 0 ? 'text-red-400' : 'text-white/40'}`}>
                  {result.improvement.scoreDiff > 0 ? <TrendingUp className="h-3 w-3" /> : result.improvement.scoreDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {result.improvement.scoreDiff > 0 ? '+' : ''}{result.improvement.scoreDiff} vs last attempt
                </div>
              )}
            </div>

            {/* Rank */}
            <div>
              <p className="text-sm font-medium text-white/50 mb-1">Rank</p>
              <div className="text-3xl font-bold text-white">--</div>
              <div className="text-sm text-white/30 font-medium">Coming Soon</div>
            </div>

            {/* Time Taken */}
            <div>
              <p className="text-sm font-medium text-white/50 mb-1">Time Taken</p>
              <div className="text-3xl font-bold text-blue-400">{timeDisplay}</div>
              {result?.improvement && (
                <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${result.improvement.timeDiff > 0 ? 'text-emerald-400' : result.improvement.timeDiff < 0 ? 'text-red-400' : 'text-white/40'}`}>
                  {result.improvement.timeDiff > 0 ? <TrendingUp className="h-3 w-3" /> : result.improvement.timeDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {result.improvement.timeDiff > 0 ? 'Faster' : 'Slower'} by {Math.abs(Math.round(result.improvement.timeDiff / 60))}m
                </div>
              )}
            </div>

            {/* Accuracy */}
            <div>
              <p className="text-sm font-medium text-white/50 mb-1">Accuracy</p>
              <div className={`text-3xl font-bold ${accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {accuracy}%
              </div>
              {result?.improvement && (
                <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${result.improvement.accuracyDiff > 0 ? 'text-emerald-400' : result.improvement.accuracyDiff < 0 ? 'text-red-400' : 'text-white/40'}`}>
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
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" /> Question Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Correct
                </div>
                <span className="font-bold text-white">{result?.correctAnswers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/70">
                  <XCircle className="h-4 w-4 text-red-400" /> Incorrect
                </div>
                <span className="font-bold text-white">{result?.incorrectAnswers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/70">
                  <AlertCircle className="h-4 w-4 text-white/40" /> Skipped
                </div>
                <span className="font-bold text-white">{result?.unanswered}</span>
              </div>
            </div>
          </div>
          {/* Improvement Areas */}
          <div className="md:col-span-2 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-amber-400" /> Focus Insights
            </h3>
            <div className="space-y-3">
              {insights.map((insight, i) => {
                const colorClass = 
                    insight.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    insight.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20';
                
                const Icon = insight.type === 'success' ? CheckCircle2 : AlertCircle;

                 return (
                  <div key={i} className={`px-4 py-3 rounded-lg text-sm border flex items-start gap-3 ${colorClass}`}>
                    <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{insight.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Question Review Component */}
        <div className="mb-12">
            <QuestionReview questions={questions} attempt={attempt} />
        </div>

        <div className="mt-8 text-center bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-8 border border-white/10 backdrop-blur-xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay pointer-events-none" />
          <h2 className="text-2xl font-bold mb-2 relative z-10">Ready for the next challenge?</h2>
          <p className="text-white/60 mb-6 relative z-10">
            Consistent practice is the key to success. Try another mock test now.
          </p>
          <div className="flex justify-center gap-4 relative z-10">
            <Link href="/dashboard/tests">
              <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 text-white">
                Practice Other Tests
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-cta-primary hover:bg-cta-hover text-white border-none shadow-lg shadow-cta-primary/30"
              onClick={() => {
                if (!test) return;
                router.push(`/test/${test.id}/start?reattempt=true`);
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
