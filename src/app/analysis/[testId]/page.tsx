import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { 
  Trophy, 
  Target, 
  Clock, 
  BarChart2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight
} from "lucide-react";

export default function AnalysisPage() {
  // Mock Data
  const result = {
    score: 185,
    totalScore: 200,
    rank: 142,
    percentile: 98.4,
    accuracy: 92,
    timeTaken: "42m 15s",
    correct: 37,
    incorrect: 3,
    skipped: 0
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Test Analysis</h1>
            <p className="text-slate-500">General Test - Mock 3 • Attempted on Oct 24, 2025</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button>
              View Solutions <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="h-32 w-32 text-yellow-500" />
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Score</p>
              <div className="text-3xl font-bold text-slate-900 flex items-end gap-2">
                {result.score} <span className="text-lg text-slate-400 font-medium">/ {result.totalScore}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">All India Rank</p>
              <div className="text-3xl font-bold text-slate-900">#{result.rank}</div>
              <div className="text-sm text-green-600 font-medium">Top 5% of students</div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Percentile</p>
              <div className="text-3xl font-bold text-indigo-600">{result.percentile}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Accuracy</p>
              <div className="text-3xl font-bold text-green-600">{result.accuracy}%</div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Question Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" /> Question Logic
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Correct
                </div>
                <span className="font-bold text-slate-900">{result.correct}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <XCircle className="h-4 w-4 text-red-500" /> Incorrect
                </div>
                <span className="font-bold text-slate-900">{result.incorrect}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <AlertCircle className="h-4 w-4 text-slate-400" /> Skipped
                </div>
                <span className="font-bold text-slate-900">{result.skipped}</span>
              </div>
            </div>
          </div>

          {/* Time Analysis */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" /> Time Management
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Total Time Taken</span>
                  <span className="font-medium text-slate-900">{result.timeTaken}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full w-[70%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Avg. Time / Question</span>
                  <span className="font-medium text-slate-900">45s</span>
                </div>
                <div className="text-xs text-green-600">15s faster than topper average</div>
              </div>
            </div>
          </div>

          {/* Weak Areas */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-orange-500" /> Improvement Areas
            </h3>
            <div className="space-y-3">
              <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm border border-red-100">
                Critical Reasoning (Accuracy: 40%)
              </div>
              <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm border border-yellow-100">
                Data Interpretation (Time High)
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Want to improve your rank?</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Unlock the full test series to get access to 40+ more mock tests and advanced topic-wise analytics.
          </p>
          <Link href="/pricing">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-none">
              Get Full Access Now
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
