"use client";

import { useState } from 'react';
import { Question, TestAttempt } from "@/types/admin";
import { AlertCircle, Target, CheckCircle2, ChevronDown, ChevronUp, Bookmark, Clock, XCircle, TrendingUp } from "lucide-react";

interface RepeatMistakesProps {
  attempts: TestAttempt[]; // All completed attempts for this test, sorted oldest to newest
  questions: Question[];
}

export function RepeatMistakes({ attempts, questions }: RepeatMistakesProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  if (attempts.length < 2) return null;

  const latestAttempt = attempts[attempts.length - 1];

  // Analyze trends for every question
  const analyzedQuestions = questions.map(q => {
    const history = attempts.map(att => {
      const userAnswerIdx = att.answers[q.id];
      const isSkipped = userAnswerIdx === undefined;
      const isCorrect = userAnswerIdx === q.correctOption;
      return { isCorrect, isSkipped, userAnswerIdx, attemptId: att.id };
    });

    const latest = history[history.length - 1];
    const previousErrors = history.slice(0, history.length - 1).filter(h => !h.isCorrect);

    let type: 'repeat_mistake' | 'resolved' | 'other' = 'other';

    // If latest is incorrect/skipped AND it was also incorrect/skipped in AT LEAST ONE previous attempt
    if (!latest.isCorrect && previousErrors.length > 0) {
      type = 'repeat_mistake';
    } 
    // If latest is CORRECT, but it was incorrect/skipped in AT LEAST ONE previous attempt
    else if (latest.isCorrect && previousErrors.length > 0) {
      type = 'resolved';
    }

    return { question: q, history, type, latest };
  });

  const repeatMistakes = analyzedQuestions.filter(q => q.type === 'repeat_mistake');
  const resolvedMistakes = analyzedQuestions.filter(q => q.type === 'resolved');

  if (repeatMistakes.length === 0 && resolvedMistakes.length === 0) {
    return (
      <div className="bg-surface-card/60 rounded-2xl border border-white/10 p-8 backdrop-blur-xl text-center">
        <Target className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Repeat Mistakes Found!</h2>
        <p className="text-white/50">You are doing a fantastic job minimizing recurring errors.</p>
      </div>
    );
  }

  const renderQuestionList = (list: typeof analyzedQuestions, isResolved: boolean) => (
    <div className="space-y-4">
      {list.map(({ question: q, history, latest }) => {
        const index = questions.findIndex(origQ => origQ.id === q.id);
        const { isSkipped, isCorrect, userAnswerIdx } = latest;
        const timeSpent = latestAttempt.timeSpent?.[q.id] || 0;
        const displayTime = timeSpent > 0 ? (timeSpent / 1000).toFixed(1) + 's' : '--';

        const isExpanded = expandedQuestion === q.id;
        const statusColor = isResolved 
            ? "border-emerald-500/20 bg-emerald-500/5 ring-emerald-500/20" 
            : "border-red-500/20 bg-red-500/5 ring-red-500/20";

        return (
          <div 
            key={q.id} 
            className={`rounded-2xl border ${statusColor} backdrop-blur-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1' : ''}`}
          >
            <div
              className="p-4 md:p-6 flex items-start gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
            >
              <div className={`
                shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm
                ${isResolved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}
              `}>
                Q{index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="font-medium text-white/90 rich-text-content prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.text }} />
                  <div className="flex items-center gap-2 shrink-0 text-white/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                        <Clock className="w-3.5 h-3.5" /> {displayTime}
                    </div>
                    <div className="p-1 rounded-md hover:bg-white/10 transition-colors">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* History Track */}
                <div className="flex items-center gap-2 text-xs font-bold mt-3 bg-black/20 p-2 rounded-lg inline-flex w-fit border border-white/5">
                    <span className="text-white/40 mr-1 uppercase tracking-wider">History:</span>
                    {history.map((h, i) => (
                        <div key={i} className={`w-5 h-5 rounded flex items-center justify-center ${h.isCorrect ? 'bg-emerald-500 text-white' : h.isSkipped ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`} title={`Attempt ${i + 1}`}>
                            {i + 1}
                        </div>
                    ))}
                </div>
              </div>
            </div>

            {/* EXPANDED SECTION */}
            {isExpanded && (
                <div className="px-4 md:px-6 pb-6 pt-0 border-t border-white/10">
                <div className="mt-6 space-y-3">
                    {q.options.map((opt, i) => {
                        const isSelected = i === userAnswerIdx;
                        const isCorrectOpt = i === q.correctOption;

                        let optClass = "border-white/10 text-white/80 bg-white/5";
                        if (isCorrectOpt) optClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-100 font-medium ring-1 ring-emerald-500/30";
                        else if (isSelected && !isCorrectOpt) optClass = "border-red-500/50 bg-red-500/10 text-red-100 ring-1 ring-red-500/30";

                        return (
                            <div key={i} className={`p-4 rounded-xl border text-sm flex items-center gap-4 transition-all ${optClass}`}>
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold shrink-0
                                ${isCorrectOpt ? 'border-emerald-500 bg-emerald-500 text-white' : isSelected ? 'border-red-500 bg-red-500 text-white' : 'border-white/20 text-white/50 bg-white/5' }
                            `}>
                                {String.fromCharCode(65 + i)}
                            </div>
                            <div className="flex-1 rich-text-content prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: opt }} />
                            {isCorrectOpt && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
                            {isSelected && !isCorrectOpt && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
                            </div>
                        );
                    })}
                </div>

                {q.explanation && (
                    <div className="mt-8 bg-cta-primary/10 p-5 rounded-xl border border-cta-primary/20">
                    <h4 className="font-semibold text-cta-primary flex items-center gap-2 mb-3">
                        <Bookmark className="w-4 h-4" /> Explanation
                    </h4>
                    <div className="text-sm text-blue-100 leading-relaxed rich-text-content prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                    </div>
                )}
                </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Resolved Mistakes */}
      {resolvedMistakes.length > 0 && (
        <div className="bg-surface-card/60 p-6 md:p-8 rounded-2xl border border-emerald-500/20 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 mb-6 flex items-start gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-emerald-400 mb-1">Resolved Mistakes</h2>
                <p className="text-white/60">Amazing job! You successfully corrected these recurring errors in your latest attempt.</p>
            </div>
          </div>
          {renderQuestionList(resolvedMistakes, true)}
        </div>
      )}

      {/* Repeat Mistakes */}
      {repeatMistakes.length > 0 && (
        <div className="bg-surface-card/60 p-6 md:p-8 rounded-2xl border border-red-500/20 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 mb-6 flex items-start gap-4">
            <div className="bg-red-500/20 p-3 rounded-xl border border-red-500/30">
                <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-red-400 mb-1">Concept Gaps (Repeat Mistakes)</h2>
                <p className="text-white/60">You struggled with these questions across multiple attempts. Focus your study here.</p>
            </div>
          </div>
          {renderQuestionList(repeatMistakes, false)}
        </div>
      )}
    </div>
  );
}
