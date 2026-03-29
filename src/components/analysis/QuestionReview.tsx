"use client";

import { useState, useRef } from 'react';
import { Question, TestAttempt } from "@/types/admin";
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Clock, Bookmark, Filter } from "lucide-react";

interface QuestionReviewProps {
  questions: Question[];
  attempt: TestAttempt;
}

export function QuestionReview({ questions, attempt }: QuestionReviewProps) {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  
  // Refs for jumping to questions
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToQuestion = (questionId: string) => {
    setFilter('all'); // Ensure it's visible
    setExpandedQuestion(questionId);
    setTimeout(() => {
      questionRefs.current[questionId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const getQuestionStatus = (q: Question) => {
    const userAnswerIdx = attempt.answers[q.id];
    const isSkipped = userAnswerIdx === undefined;
    const isCorrect = userAnswerIdx === q.correctOption;
    // Handle marked
    const interactionStatus = attempt.questionStatus?.[q.id]?.status;
    const isMarked = interactionStatus === 'marked_for_review' || interactionStatus === 'answered_marked_for_review';

    return { isSkipped, isCorrect, isMarked, userAnswerIdx };
  };

  const filteredQuestions = questions.filter(q => {
    const { isSkipped, isCorrect } = getQuestionStatus(q);
    if (filter === 'skipped') return isSkipped;
    if (filter === 'correct') return isCorrect;
    if (filter === 'incorrect') return !isSkipped && !isCorrect;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* HEATMAP */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl shadow-black/20">
        <h3 className="text-lg font-bold text-white mb-4">Question Heatmap</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {questions.map((q, idx) => {
            const { isSkipped, isCorrect, isMarked } = getQuestionStatus(q);
            let bgColor = "bg-white/5 text-white/50 border border-white/10"; // Skipped grey
            if (isMarked) bgColor = "bg-purple-500/20 text-purple-400 border border-purple-500/30"; // Purple marked
            else if (!isSkipped && isCorrect) bgColor = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"; // Green correct
            else if (!isSkipped && !isCorrect) bgColor = "bg-red-500/20 text-red-400 border border-red-500/30"; // Red incorrect

            return (
              <button
                key={q.id}
                onClick={() => scrollToQuestion(q.id)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all hover:scale-105 hover:bg-white/10 ${bgColor}`}
                title={`Q${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-white/60 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Correct</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Incorrect</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" /> Skipped</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /> Marked for Review</div>
        </div>
      </div>

      {/* FILTER & LIST */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-cta-primary" /> Detailed Review
          </h2>
          <div className="flex bg-white/5 backdrop-blur-xl rounded-xl p-1 border border-white/10 shadow-lg">
            {(['all', 'correct', 'incorrect', 'skipped'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
                  filter === f ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const index = questions.findIndex(origQ => origQ.id === q.id);
            const { isSkipped, isCorrect, userAnswerIdx } = getQuestionStatus(q);
            const timeSpent = attempt.timeSpent?.[q.id] || 0;
            const displayTime = timeSpent > 0 ? (timeSpent / 1000).toFixed(1) + 's' : '--';

            const statusColor = isSkipped
              ? "border-white/10 bg-white/5"
              : isCorrect
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-red-500/20 bg-red-500/5";

            const isExpanded = expandedQuestion === q.id;

            return (
              <div 
                key={q.id} 
                className={`rounded-2xl border ${statusColor} backdrop-blur-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-white/20' : ''}`}
                ref={(el) => { questionRefs.current[q.id] = el; }}
              >
                <div
                  className="p-4 md:p-6 flex items-start gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                >
                  <div className={`
                    shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm
                    ${isSkipped ? 'bg-white/10 text-white/60 border border-white/10' : isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}
                  `}>
                    Q{index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    {(q as any).passageText && isExpanded && (
                      <div 
                         className="mb-4 p-4 rounded-xl border border-white/10 bg-white/5 text-[13px] text-white/80 max-h-[200px] overflow-y-auto leading-relaxed" 
                         style={{ whiteSpace: "pre-line" }} 
                         dangerouslySetInnerHTML={{ __html: (q as any).passageText }} 
                      />
                    )}
                    <div className="flex justify-between items-start gap-4">
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

                    {!isExpanded && (
                      <div className="mt-4 flex items-center gap-3 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : isSkipped ? 'bg-white/10 text-white/60 border border-white/10' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                          {isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

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
                    
                    {/* Navigation inside review */}
                    <div className="mt-6 flex justify-between items-center pt-5 border-t border-white/10">
                        <button 
                            disabled={index === 0}
                            onClick={() => scrollToQuestion(questions[index - 1]?.id)}
                            className="text-sm font-bold text-white/50 hover:text-white disabled:opacity-30 disabled:hover:text-white/50 transition-colors uppercase tracking-wider flex items-center gap-1"
                        >
                            ← Prev
                        </button>
                        <button 
                            disabled={index === questions.length - 1}
                            onClick={() => scrollToQuestion(questions[index + 1]?.id)}
                            className="text-sm font-bold text-white/50 hover:text-white disabled:opacity-30 disabled:hover:text-white/50 transition-colors uppercase tracking-wider flex items-center gap-1"
                        >
                            Next →
                        </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredQuestions.length === 0 && (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                  <AlertCircle className="h-10 w-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 font-medium">No questions found for this filter.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
