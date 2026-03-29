"use client";

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Trophy,
  Target,
  BarChart2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock
} from "lucide-react";
import { TestResult } from '@/types/admin';

export default function ShowcaseResultPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Partial<TestResult> | null>(null);

  useEffect(() => {
    // Load from purely local sessionStorage
    const savedSession = sessionStorage.getItem(`showcase_session`);
    if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session.resultData) {
            setResult(session.resultData);
        }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-cta-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 font-medium animate-pulse">Analyzing Performance...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-12 w-12 text-white/40 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Result Found</h2>
        <p className="text-white/50 mb-6">We couldn't find a completed showcase attempt. You might need to take the mock test first.</p>
        <Link href="/">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">Return Home</Button>
        </Link>
      </div>
    );
  }

  // derived for display
  const accuracy = result?.accuracy ? Math.round(result.accuracy * 100) / 100 : 0;
  const timeDisplay = result?.timeTaken
    ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s`
    : "N/A";

  const totalAttempted = (result.correctAnswers || 0) + (result.incorrectAnswers || 0);

  return (
    <div className="min-h-screen py-8 bg-slate-950 font-sans selection:bg-cta-primary/30 text-white">
      <div className="container max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Showcase Test Complete</h1>
            <p className="text-white/50 font-medium">Here is a sneak peek at your performance.</p>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white/5 rounded-3xl shadow-2xl border border-white/10 p-8 mb-8 relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <Trophy className="h-48 w-48 text-white" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {/* Total Score */}
            <div>
              <p className="text-sm font-medium text-white/50 mb-2 uppercase tracking-wider">Score</p>
              <div className="text-4xl font-black text-white flex items-baseline gap-2">
                {result?.score}
              </div>
            </div>

            {/* Time Taken */}
            <div>
              <p className="text-sm font-medium text-white/50 mb-2 uppercase tracking-wider">Time</p>
              <div className="text-4xl font-black text-blue-400">{timeDisplay}</div>
            </div>

            {/* Accuracy */}
            <div>
              <p className="text-sm font-medium text-white/50 mb-2 uppercase tracking-wider">Accuracy</p>
              <div className={`text-4xl font-black ${accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {accuracy}%
              </div>
            </div>

            {/* Attempted */}
            <div>
              <p className="text-sm font-medium text-white/50 mb-2 uppercase tracking-wider">Attempted</p>
              <div className="text-4xl font-black text-white flex items-baseline gap-2">
                {totalAttempted} <span className="text-lg text-white/30 font-bold">/ {result.totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hard Lock CTA Block */}
        <div className="mt-12 text-center bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-[3rem] p-12 border border-white/10 backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cta-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none translate-x-1/3 -translate-y-1/3" />
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6 relative z-10 shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-4xl font-black mb-6 relative z-10 tracking-tight">Unlock Full Analysis</h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
            Find out exactly where you made mistakes and unlock deep insights into your weak areas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 mb-12 relative z-10">
              <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-1.5 rounded-full"><CheckCircle2 className="h-5 w-5 text-emerald-400"/></div>
                  <span className="font-semibold text-lg">Question-wise solutions</span>
              </div>
              <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-1.5 rounded-full"><Target className="h-5 w-5 text-purple-400"/></div>
                  <span className="font-semibold text-lg">Weak area insights</span>
              </div>
              <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-1.5 rounded-full"><BarChart2 className="h-5 w-5 text-blue-400"/></div>
                  <span className="font-semibold text-lg">Performance tracking</span>
              </div>
          </div>

          <div className="flex justify-center relative z-10">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="group inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-10 py-7 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
              >
                Sign up to unlock
              </Button>
            </Link>
          </div>
          <p className="text-sm font-medium text-white/40 mt-6 relative z-10">
             Plus, claim your 10 free credits instantly after signing up.
          </p>
        </div>

      </div>
    </div>
  );
}
