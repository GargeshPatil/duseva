import { Test } from "@/types/admin";
import { Button } from "@/components/ui/Button";
import { Clock, Trophy, Play, FileText, Lock, Sparkles, CheckCircle2 } from "lucide-react";
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

    // Status color mapping
    const getStatusConfig = () => {
        if (isLocked) return { border: 'border-semantic-warning/20', bg: 'bg-semantic-warning/5', glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]' };
        if (isInProgress) return { border: 'border-cta-primary/30', bg: 'bg-cta-primary/5', glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]' };
        if (isAttempted) return { border: 'border-semantic-success/30', bg: 'bg-semantic-success/5', glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]' };
        return { border: 'border-white/10', bg: 'bg-surface-card/40', glow: 'group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]' };
    };

    const status = getStatusConfig();

    return (
        <div className={`relative h-full flex flex-col rounded-[2rem] border ${status.border} ${status.bg} backdrop-blur-xl overflow-hidden transition-all duration-500 group ${status.glow}`}>

            {/* Background gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-[40px] group-hover:bg-white/[0.04] transition-colors duration-500" />

            {/* Lock Badge */}
            {isLocked && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="bg-semantic-warning/20 backdrop-blur-md p-2 rounded-xl border border-semantic-warning/30 shadow-lg shadow-semantic-warning/10">
                        <Lock className="h-4 w-4 text-amber-400" />
                    </div>
                </div>
            )}

            {/* Completed Badge */}
            {isAttempted && !isLocked && !isInProgress && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="bg-semantic-success/20 backdrop-blur-md p-1.5 rounded-full border border-semantic-success/30 shadow-lg pr-3 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 ml-1" />
                        <span className="text-xs font-semibold text-emerald-300">Completed</span>
                    </div>
                </div>
            )}

            <div className="p-6 flex-1 flex flex-col relative z-10">
                {/* Header Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`
                        px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase
                        ${test.difficulty === 'Hard' ? 'bg-semantic-error/10 text-red-400 border border-semantic-error/20' :
                            test.difficulty === 'Easy' ? 'bg-semantic-success/10 text-emerald-400 border border-semantic-success/20' :
                                'bg-semantic-warning/10 text-amber-400 border border-semantic-warning/20'}
                    `}>
                        {test.difficulty || 'Medium'}
                    </span>

                    {test.price === 'paid' && (
                        <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Premium
                        </span>
                    )}

                    {((test.category as string) === 'PYQ' || test.title.toLowerCase().includes('pyq')) && (
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                            PYQ
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-white text-xl mb-4 line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
                    {test.title}
                </h3>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-auto mb-6">
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-1.5 text-white/40 text-xs font-medium uppercase tracking-wider">
                            <Clock className="h-3.5 w-3.5" /> Duration
                        </div>
                        <span className="text-white font-bold text-sm tracking-wide">{test.duration} mins</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-1.5 text-white/40 text-xs font-medium uppercase tracking-wider">
                            <Trophy className="h-3.5 w-3.5" /> Max Score
                        </div>
                        <span className="text-white font-bold text-sm tracking-wide">{test.totalMarks} Marks</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                    <div className="text-xs text-white/40 font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                        <FileText className="h-3.5 w-3.5" /> {test.questions?.length ?? 0} Qs
                    </div>

                    {isLocked ? (
                        <Button
                            size="sm"
                            fullWidth
                            onClick={() => onUnlock?.(test)}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 shadow-lg shadow-amber-500/20 border-none flex-1 font-bold tracking-wide"
                        >
                            Unlock Test
                        </Button>
                    ) : (
                        onStart ? (
                            <Button
                                size="sm"
                                fullWidth
                                className={`flex-1 font-bold tracking-wide border-none shadow-lg ${isInProgress
                                    ? "bg-cta-primary hover:bg-cta-hover text-white shadow-cta-primary/30"
                                    : isAttempted
                                        ? "bg-white/10 hover:bg-white/20 text-white"
                                        : "bg-white text-slate-900 hover:bg-white/90 shadow-white/10"
                                    }`}
                                onClick={() => onStart(test)}
                            >
                                {isInProgress ? (
                                    <>Resume <Play className="h-3.5 w-3.5 ml-1.5 fill-current" /></>
                                ) : isAttempted ? (
                                    <>Reattempt <Play className="h-3.5 w-3.5 ml-1.5" /></>
                                ) : (
                                    <>Start Test <Play className="h-3.5 w-3.5 ml-1.5 fill-current" /></>
                                )}
                            </Button>
                        ) : (
                            <Link href={`/test/${test.id}`} className="flex-1">
                                <Button
                                    size="sm"
                                    fullWidth
                                    className={`w-full font-bold tracking-wide border-none shadow-lg transition-all active:scale-95 ${isInProgress
                                        ? "bg-cta-primary hover:bg-cta-hover text-white shadow-cta-primary/30"
                                        : isAttempted
                                            ? "bg-white/10 hover:bg-white/20 text-white"
                                            : "bg-white text-slate-900 hover:bg-white/90 shadow-white/10"
                                        }`}
                                >
                                    {isInProgress ? (
                                        <span className="flex items-center justify-center">Resume <Play className="h-3.5 w-3.5 ml-1.5 fill-current" /></span>
                                    ) : isAttempted ? (
                                        <span className="flex items-center justify-center">Reattempt <Play className="h-3.5 w-3.5 ml-1.5" /></span>
                                    ) : (
                                        <span className="flex items-center justify-center">Start Test <Play className="h-3.5 w-3.5 ml-1.5 fill-current" /></span>
                                    )}
                                </Button>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
