"use client";

import { Test } from "@/types/admin";
import { Button } from "@/components/ui/Button";
import {
    Clock,
    Play,
    FileText,
    Lock,
    Sparkles,
    CheckCircle2,
    RotateCcw,
    Coins,
    Hash,
} from "lucide-react";
import Link from "next/link";
import { useCreditModal } from "@/context/CreditModalContext";

interface TestCardProps {
    test: Test;
    isAttempted?: boolean;
    isInProgress?: boolean;
    userCredits?: number;
    onStart?: (test: Test) => void;
}

export function TestCard({
    test,
    isAttempted,
    isInProgress,
    userCredits = 0,
    onStart,
}: TestCardProps) {
    const { openModal } = useCreditModal();

    const requiresCredits = !test.isFree && userCredits === 0;

    const isPYQ =
        test.tier2Category === "PYQ" ||
        (test.category as string) === "PYQ" ||
        test.title?.toLowerCase().includes("pyq");

    const testType = isPYQ ? "PYQ" : test.tier2Category || "Mock";

    // Card accent based on state
    const cardStyle = isInProgress
        ? { border: "border-blue-500/25", accent: "bg-blue-500/8" }
        : isAttempted
        ? { border: "border-emerald-500/20", accent: "bg-emerald-500/5" }
        : { border: "border-white/8", accent: "bg-white/[0.03]" };

    const handleStartClick = (e: React.MouseEvent) => {
        if (requiresCredits) {
            e.preventDefault();
            openModal();
            return;
        }
        if (onStart) {
            e.preventDefault();
            isAttempted
                ? onStart({ ...test, isReattempt: true } as any)
                : onStart(test);
        }
    };

    return (
        <div
            className={`relative flex flex-col rounded-2xl border ${cardStyle.border} ${cardStyle.accent} backdrop-blur-xl overflow-hidden transition-all duration-300 group hover:border-white/15 hover:shadow-xl hover:shadow-black/30`}
        >
            {/* Subtle top-right glow */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/[0.025] rounded-full blur-[50px] pointer-events-none" />

            <div className="p-5 flex flex-col gap-4 relative z-10 flex-1">

                {/* ── Status pill (in-progress / done) — top-right corner ── */}
                <div className="flex items-start justify-between gap-2">
                    {/* Type chip (PYQ / Mock) */}
                    <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase ${
                            isPYQ
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                                : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                        }`}
                    >
                        {testType}
                    </span>

                    {/* Status badge */}
                    {isInProgress ? (
                        <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase">
                            <Play className="h-2.5 w-2.5 fill-current" />
                            In Progress
                        </span>
                    ) : isAttempted ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Done
                        </span>
                    ) : null}
                </div>

                {/* ── 1. TITLE ──────────────────────────────────────────── */}
                <div>
                    <h3 className="font-bold text-white text-[15px] leading-snug line-clamp-2 group-hover:text-white/90 transition-colors">
                        {test.title}
                    </h3>
                </div>

                {/* ── 2. DESCRIPTION ───────────────────────────────────── */}
                {test.description && (
                    <p className="text-white/45 text-[13px] leading-relaxed line-clamp-2 -mt-1">
                        {test.description}
                    </p>
                )}

                {/* ── 3. METADATA ──────────────────────────────────────── */}
                <div className="flex items-center gap-3 flex-wrap mt-auto">
                    {/* Questions */}
                    <div className="flex items-center gap-1.5 text-white/50 text-xs">
                        <FileText className="h-3.5 w-3.5 text-white/30 shrink-0" />
                        <span className="font-semibold text-white/70">
                            {test.questions?.length ?? 0}
                        </span>
                        <span>Qs</span>
                    </div>

                    <span className="w-px h-3 bg-white/10 shrink-0" />

                    {/* Duration */}
                    <div className="flex items-center gap-1.5 text-white/50 text-xs">
                        <Clock className="h-3.5 w-3.5 text-white/30 shrink-0" />
                        <span className="font-semibold text-white/70">
                            {test.duration}
                        </span>
                        <span>min</span>
                    </div>

                    <span className="w-px h-3 bg-white/10 shrink-0" />

                    {/* Cost */}
                    <div className="flex items-center gap-1.5 text-xs">
                        {test.isFree ? (
                            <>
                                <Sparkles className="h-3.5 w-3.5 text-emerald-400/70 shrink-0" />
                                <span className="font-semibold text-emerald-400">
                                    Free
                                </span>
                            </>
                        ) : (
                            <>
                                <Coins className="h-3.5 w-3.5 text-amber-400/70 shrink-0" />
                                <span className="font-semibold text-amber-300">
                                    1 Credit
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* ── 4. CTA ───────────────────────────────────────────── */}
                <div className="pt-3 border-t border-white/8">
                    {requiresCredits ? (
                        /* "Get Credits" — NOT disabled, opens modal */
                        <button
                            onClick={openModal}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.98]"
                        >
                            <Lock className="h-3.5 w-3.5" />
                            Get Credits to Unlock
                        </button>
                    ) : (
                        <Link
                            href={`/test/${test.id}/start${isAttempted ? "?reattempt=true" : ""}`}
                            className="block"
                            onClick={handleStartClick}
                        >
                            <Button
                                size="sm"
                                fullWidth
                                className={`w-full font-bold tracking-wide border-none shadow-md transition-all duration-200 active:scale-[0.98] ${
                                    isInProgress
                                        ? "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20"
                                        : isAttempted
                                        ? "bg-white/10 hover:bg-white/18 text-white"
                                        : "bg-white text-slate-900 hover:bg-white/90 shadow-white/10"
                                }`}
                            >
                                {isInProgress ? (
                                    <span className="flex items-center justify-center gap-1.5">
                                        Resume{" "}
                                        <Play className="h-3.5 w-3.5 fill-current" />
                                    </span>
                                ) : isAttempted ? (
                                    <span className="flex items-center justify-center gap-1.5">
                                        Reattempt{" "}
                                        <RotateCcw className="h-3.5 w-3.5" />
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-1.5">
                                        Start Test{" "}
                                        <Play className="h-3.5 w-3.5 fill-current" />
                                    </span>
                                )}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
