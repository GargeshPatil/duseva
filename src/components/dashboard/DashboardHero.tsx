"use client";

import { motion, Variants } from "framer-motion";
import { Sparkles, Play, ArrowRight, Target, CheckCircle2, Zap, Coins, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { Test, TestAttempt, DashboardHeroConfig } from "@/types/admin";
import { User } from "firebase/auth";
import { DashboardStats, PerformanceInsight } from "@/hooks/useDashboardData";
import { useCreditModal } from "@/context/CreditModalContext";

interface DashboardHeroProps {
    userData: any;
    user: User | null;
    activeAttempt: TestAttempt | null;
    activeAttemptTest: Test | null;
    itemVariants: Variants;
    stats: DashboardStats;
    insight: PerformanceInsight | null;
    heroConfig?: DashboardHeroConfig;
    daysSinceLastTest?: number | null;
}

function StatPill({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
            <div className={`p-1.5 rounded-lg ${color} bg-current/10`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
            </div>
            <div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold leading-none mb-0.5">{label}</div>
                <div className="text-white font-bold text-sm leading-none">{value}</div>
            </div>
        </div>
    );
}

export function DashboardHero({
    userData,
    user,
    activeAttempt,
    activeAttemptTest,
    itemVariants,
    stats,
    insight,
    heroConfig = {},
    daysSinceLastTest,
}: DashboardHeroProps) {
    const { openModal } = useCreditModal();
    const firstName = userData?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Student';
    const credits = userData?.credits ?? 0;
    const isNewUser = stats.testsAttempted === 0;

    const insightColors: Record<string, string> = {
        strength: 'text-emerald-400',
        weakness: 'text-amber-400',
        neutral: 'text-blue-400',
    };

    // Derive personalization message
    const personalizationMessage: { text: string; color: string; icon: React.ElementType } | null = (() => {
        if (daysSinceLastTest !== null && daysSinceLastTest !== undefined && daysSinceLastTest >= 2) {
            return {
                text: `You haven't attempted a test in ${daysSinceLastTest} day${daysSinceLastTest > 1 ? 's' : ''}. Time to get back on track!`,
                color: 'text-amber-400',
                icon: Clock,
            };
        }
        return null;
    })();

    // Headline: admin override → dynamic greeting
    const headline = heroConfig.headline || (isNewUser
        ? `Let\u2019s get started, ${firstName}.`
        : `Ready to crush it, ${firstName}?`);

    // CTA label
    const ctaLabel = heroConfig.ctaLabel || 'Start Test';

    // Trust badges
    const trustBadges = heroConfig.trustBadges ?? [];

    return (
        <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-[2.5rem] bg-surface-card/60 border border-white/10 backdrop-blur-2xl shadow-2xl"
        >
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[28rem] h-[28rem] bg-cta-primary/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6 p-8 sm:p-10 lg:p-12">

                {/* Admin broadcast override message */}
                {heroConfig.overrideMessage && (
                    <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                        <span>{heroConfig.overrideMessage}</span>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">

                    {/* ── LEFT: greeting + stats + insight ─────────────────────── */}
                    <div className="flex-1 min-w-0">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-semibold tracking-wide mb-5">
                            <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                            {isNewUser ? 'First session' : 'Welcome back'}
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 tracking-tight leading-tight mb-2">
                            {headline}
                        </h1>

                        {/* Admin subtext */}
                        {heroConfig.subtext && (
                            <p className="text-white/50 text-sm mb-4 max-w-sm">{heroConfig.subtext}</p>
                        )}

                        {/* Personalization message (inactivity / custom) */}
                        {personalizationMessage && (
                            <p className={`text-sm font-medium mb-4 max-w-sm flex items-center gap-2 ${personalizationMessage.color}`}>
                                <personalizationMessage.icon className="h-3.5 w-3.5 shrink-0" />
                                {personalizationMessage.text}
                            </p>
                        )}

                        {/* Insight message */}
                        {insight && !personalizationMessage && (
                            <p className={`text-sm font-medium mb-6 max-w-sm ${insightColors[insight.type] ?? 'text-white/50'}`}>
                                {insight.type === 'strength' && <CheckCircle2 className="inline h-3.5 w-3.5 mr-1.5 mb-0.5" />}
                                {insight.type === 'weakness' && <Zap className="inline h-3.5 w-3.5 mr-1.5 mb-0.5" />}
                                {insight.message}
                            </p>
                        )}

                        {/* Stat pills */}
                        <div className="flex flex-wrap gap-2">
                            {stats.testsAttempted > 0 && (
                                <>
                                    <StatPill icon={Target} label="Tests Taken" value={String(stats.testsAttempted)} color="text-blue-400" />
                                    <StatPill icon={CheckCircle2} label="Avg Accuracy" value={`${stats.avgAccuracy}%`} color="text-emerald-400" />
                                </>
                            )}
                            <button
                                onClick={openModal}
                                className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-2.5 hover:bg-amber-500/20 transition-colors group"
                            >
                                <div className="p-1.5 rounded-lg bg-amber-500/20">
                                    <Coins className="h-3.5 w-3.5 text-amber-400" />
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] text-amber-400/60 uppercase tracking-widest font-semibold leading-none mb-0.5">Credits</div>
                                    <div className="text-amber-300 font-bold text-sm leading-none group-hover:text-amber-200 transition-colors">{credits} left</div>
                                </div>
                            </button>

                            {/* Trust badges from admin CMS */}
                            {trustBadges.map((badge) => (
                                <div
                                    key={badge}
                                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5"
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                    <span className="text-white/70 text-xs font-semibold">{badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: CTAs ──────────────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-[220px] shrink-0">
                        {/* Primary CTA */}
                        <Link href="/dashboard/tests" className="group relative block">
                            <div className="absolute inset-0 bg-cta-primary/30 blur-lg rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-cta-primary hover:bg-cta-hover text-white font-bold text-base px-6 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all group-hover:-translate-y-0.5 group-hover:shadow-cta-primary/40">
                                <Play className="h-5 w-5 fill-current" />
                                {ctaLabel}
                                <ArrowRight className="h-4 w-4 ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>

                        {/* Resume card (if active attempt) */}
                        {activeAttempt && activeAttemptTest && (
                            <Link href={`/test/${activeAttempt.testId}`} className="group block">
                                <div className="bg-surface-elevated/80 backdrop-blur-md border border-white/10 hover:border-white/20 px-5 py-3.5 rounded-2xl flex items-center gap-4 transition-all group-hover:-translate-y-0.5 shadow-lg">
                                    <div className="h-9 w-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Play className="h-4 w-4 text-cta-primary fill-current ml-0.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-cta-primary font-bold uppercase tracking-wide">Resume</p>
                                        <p className="text-white/80 font-semibold text-sm truncate">{activeAttemptTest.title}</p>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
