import { Test } from "@/types/admin";
import { Button } from "@/components/ui/Button";
import { Clock, Trophy, Play, FileText } from "lucide-react";
import Link from "next/link";

interface TestCardProps {
    test: Test;
    isAttempted?: boolean;
    isInProgress?: boolean;
    isPurchased?: boolean;
    onUnlock?: (test: Test) => void;
    onStart?: (test: Test) => void;
}

export function TestCard({ test, isAttempted, isInProgress, isPurchased = false, onUnlock, onStart }: TestCardProps) {
    const isLocked = test.price === 'paid' && !isPurchased;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 p-5 flex flex-col h-full relative overflow-hidden group">
            {isLocked && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm ring-1 ring-slate-100">
                        <div className="bg-amber-500 text-white p-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <span className={`
                    px-2.5 py-0.5 rounded-full text-xs font-semibold
                    ${test.difficulty === 'Hard' ? 'bg-red-50 text-red-700 border border-red-100' :
                        test.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border border-green-100' :
                            'bg-yellow-50 text-yellow-700 border border-yellow-100'}
                `}>
                    {test.difficulty || 'Medium'}
                </span>
                {test.price === 'paid' && (
                    <span className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                        Premium {test.priceAmount ? `₹${test.priceAmount}` : ''}
                    </span>
                )}
            </div>

            <h3 className="font-semibold text-slate-900 text-lg mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{test.title}</h3>

            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 font-medium">
                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                    <Clock className="h-3.5 w-3.5" />
                    {test.duration}m
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                    <Trophy className="h-3.5 w-3.5" />
                    {test.totalMarks} Marks
                </span>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="text-sm text-slate-500 font-medium">
                    {test.questions?.length ?? 0} Questions
                </div>

                {isLocked ? (
                    <Button
                        size="sm"
                        fullWidth
                        onClick={() => onUnlock?.(test)}
                        className="bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20 shadow-md flex-1"
                    >
                        Unlock Now
                    </Button>
                ) : (
                    onStart ? (
                        <Button
                            size="sm"
                            fullWidth
                            variant={isInProgress ? "primary" : "outline"}
                            className={isInProgress ? "bg-primary text-white shadow-blue-500/20 shadow-md" : "border-slate-200 hover:bg-slate-50 text-slate-700"}
                            onClick={() => onStart(test)}
                        >
                            {isInProgress ? (
                                <>Resume <Play className="h-3 w-3 ml-2 fill-current" /></>
                            ) : isAttempted ? (
                                <>Reattempt <Play className="h-3 w-3 ml-2" /></>
                            ) : (
                                <>Start Test <Play className="h-3 w-3 ml-2" /></>
                            )}
                        </Button>
                    ) : (
                        <Link href={`/test/${test.id}`} className="flex-1">
                            <Button
                                size="sm"
                                fullWidth
                                variant={isInProgress ? "primary" : "outline"}
                                className={isInProgress ? "bg-primary text-white shadow-blue-500/20 shadow-md" : "border-slate-200 hover:bg-slate-50 text-slate-700"}
                            >
                                {isInProgress ? (
                                    <>Resume <Play className="h-3 w-3 ml-2 fill-current" /></>
                                ) : isAttempted ? (
                                    <>Reattempt <Play className="h-3 w-3 ml-2" /></>
                                ) : (
                                    <>Start Test <Play className="h-3 w-3 ml-2" /></>
                                )}
                            </Button>
                        </Link>
                    )
                )}
            </div>
        </div>
    );
}
