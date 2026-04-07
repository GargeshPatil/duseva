import { Test } from "@/types/admin";
import { Button } from "@/components/ui/Button";
import { Clock, Trophy, Play, FileText, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface TestCardProps {
    test: Test;
    isAttempted?: boolean;
    isInProgress?: boolean;
    userCredits?: number;
    onStart?: (test: Test) => void;
}

export function TestCard({ test, isAttempted, isInProgress, userCredits = 0, onStart }: TestCardProps) {

    // Status color mapping
    const getStatusConfig = () => {
        if (isInProgress) return { border: 'border-cta-primary/30', bg: 'bg-cta-primary/5', glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]' };
        if (isAttempted) return { border: 'border-semantic-success/30', bg: 'bg-semantic-success/5', glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]' };
        return { border: 'border-white/10', bg: 'bg-surface-card/40', glow: 'group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]' };
    };

    const status = getStatusConfig();
    
    const requiresCredits = !test.isFree && userCredits === 0;

    const handleStartClick = (e: React.MouseEvent) => {
        if (requiresCredits) {
            e.preventDefault();
            // Scroll to credits strip or redirect
            const strip = document.getElementById('credit-purchase-strip');
            if (strip) {
                strip.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.hash = 'credit-purchase-strip';
            }
            return;
        }

        if (onStart) {
            e.preventDefault();
            isAttempted ? onStart({ ...test, isReattempt: true } as any) : onStart(test);
        }
    };

    return (
        <div className={`relative h-full flex flex-col rounded-[2rem] border ${status.border} ${status.bg} backdrop-blur-xl overflow-hidden transition-all duration-500 group ${status.glow}`}>

            {/* Background gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-[40px] group-hover:bg-white/[0.04] transition-colors duration-500" />

            <div className="p-6 flex-1 flex flex-col relative z-10">
                {/* Header Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {/* Completed Badge moved into normal flow to prevent overlap */}
                    {isAttempted && !isInProgress && (
                        <span className="bg-semantic-success/20 text-emerald-300 border border-semantic-success/30 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                    )}

                    <span className={`
                        px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase
                        ${test.difficulty === 'Hard' ? 'bg-semantic-error/10 text-red-400 border border-semantic-error/20' :
                            test.difficulty === 'Easy' ? 'bg-semantic-success/10 text-emerald-400 border border-semantic-success/20' :
                                'bg-semantic-warning/10 text-amber-400 border border-semantic-warning/20'}
                    `}>
                        {test.difficulty || 'Medium'}
                    </span>

                    {test.isFree ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Free Test
                        </span>
                    ) : (
                        <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> 1 Credit
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

                    <Link 
                        href={`/test/${test.id}/start${isAttempted ? '?reattempt=true' : ''}`} 
                        className="flex-1"
                        onClick={handleStartClick}
                    >
                        <Button
                            size="sm"
                            fullWidth
                            disabled={requiresCredits}
                            className={`w-full font-bold tracking-wide border-none shadow-lg transition-all active:scale-95 ${
                                requiresCredits 
                                    ? "bg-surface-elevated text-text-muted opacity-80 cursor-not-allowed"
                                    : isInProgress
                                        ? "bg-cta-primary hover:bg-cta-hover text-white shadow-cta-primary/30"
                                        : isAttempted
                                            ? "bg-white/10 hover:bg-white/20 text-white"
                                            : "bg-white text-slate-900 hover:bg-white/90 shadow-white/10"
                                }`}
                        >
                            {requiresCredits ? (
                                <span className="flex items-center justify-center">Get Credits <Lock className="h-3.5 w-3.5 ml-1.5" /></span>
                            ) : isInProgress ? (
                                <span className="flex items-center justify-center">Resume <Play className="h-3.5 w-3.5 ml-1.5 fill-current" /></span>
                            ) : isAttempted ? (
                                <span className="flex items-center justify-center">Reattempt <Play className="h-3.5 w-3.5 ml-1.5" /></span>
                            ) : (
                                <span className="flex items-center justify-center">Start Test <Play className="h-3.5 w-3.5 ml-1.5 fill-current" /></span>
                            )}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
