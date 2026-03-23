"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { firestoreService } from '@/services/firestoreService';
import { Test, Question, TestAttempt } from "@/types/admin";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RepeatMistakes } from "@/components/analysis/RepeatMistakes";
import { Loader2, TrendingUp, History, AlertTriangle, ArrowRight } from "lucide-react";

export default function TestSpecificAnalysisPage() {
  const params = useParams();
  const testId = params.testId as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<Test | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/dashboard/analysis/test/${testId}`);
      return;
    }

    async function fetchData() {
      if (!user || !testId) return;

      try {
        const [fetchedTest, allAttempts] = await Promise.all([
          firestoreService.getTest(testId),
          firestoreService.getUserAttempts(user.uid, 'completed')
        ]);

        let fetchedQuestions: Question[] = [];
        if (fetchedTest?.questionIds && fetchedTest.questionIds.length > 0) {
            fetchedQuestions = await firestoreService.getQuestions({ ids: fetchedTest.questionIds });
        } else {
            fetchedQuestions = await firestoreService.getQuestions({ testId });
        }

        const testAttempts = allAttempts
          .filter(a => a.testId === testId)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        setTest(fetchedTest);
        setQuestions(fetchedQuestions);
        setAttempts(testAttempts);
      } catch (error) {
        console.error("Error loading test specific analysis:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchData();
  }, [user, testId, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-cta-primary mb-4" />
        <p className="text-white/50 font-medium animate-pulse">Analyzing Trend Data...</p>
      </div>
    );
  }

  if (!test || attempts.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-white/40 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Data Available</h2>
        <p className="text-white/50 mb-6">Take this test to unlock detailed progression analysis.</p>
        <Link href="/dashboard/tests">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">Browse Tests</Button>
        </Link>
      </div>
    );
  }

  // Prep chart data
  const chartData = attempts.map((att, idx) => ({
    index: idx + 1,
    score: att.resultData?.score || 0,
    accuracy: att.resultData?.accuracy || 0,
    date: new Date(att.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  const latestAttempt = attempts[attempts.length - 1];
  const firstAttempt = attempts[0];
  const scoreImprovement = (latestAttempt.resultData?.score || 0) - (firstAttempt.resultData?.score || 0);
  const isImproved = scoreImprovement >= 0;

  return (
    <div className="min-h-screen py-8 pb-20 max-w-[1600px] mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <Link href="/dashboard/analysis" className="text-cta-primary hover:text-white text-sm font-medium transition-colors mb-4 inline-block">
          ← Back to Overall Analysis
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{test.title} Progression</h1>
            <p className="text-white/50 flex items-center gap-2">
              <History className="w-4 h-4" /> Based on {attempts.length} historical attempt{attempts.length > 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={() => router.push(`/test/${test.id}/start?reattempt=true`)}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xl"
          >
            Re-attempt Now
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* PROGRESSION CHART */}
        <div className="lg:col-span-2 bg-surface-card/60 p-6 rounded-2xl border border-white/10 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cta-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Score Trajectory</h2>
              <p className="text-white/40 text-sm">Your scoring trend across all {attempts.length} attempts.</p>
            </div>
            {attempts.length > 1 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold ${isImproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                <TrendingUp className={`w-4 h-4 ${!isImproved && 'rotate-180'}`} />
                {scoreImprovement > 0 ? '+' : ''}{scoreImprovement} pts overall
              </div>
            )}
          </div>
          
          <PerformanceChart chartData={chartData} dataKey="score" color="#8b5cf6" />
        </div>

        {/* ATTEMPTS HISTORY */}
        <div className="bg-surface-card/60 p-6 rounded-2xl border border-white/10 backdrop-blur-xl flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6">Attempts History</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {[...attempts].reverse().map((att, idx) => (
              <Link 
                key={att.id} 
                href={`/dashboard/analysis/${att.id}`}
                className="group flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div>
                  <div className="text-white font-medium mb-1 group-hover:text-cta-primary transition-colors">
                    Attempt {attempts.length - idx}
                  </div>
                  <div className="text-xs text-white/40">
                    {new Date(att.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-emerald-400 font-bold">{att.resultData?.score} pts</div>
                    <div className="text-xs text-white/40">{Math.round(att.resultData?.accuracy || 0)}% Acc.</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-cta-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* REPEAT MISTAKES & IMPROVEMENTS */}
      {attempts.length > 1 && (
        <RepeatMistakes attempts={attempts} questions={questions} />
      )}
    </div>
  );
}
