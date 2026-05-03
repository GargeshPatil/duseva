"use client";

import { useEffect, useState, useMemo } from "react";
import { firestoreService } from "@/services/firestoreService";
import { Test, TestAttempt } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { TestCard } from "@/components/dashboard/TestCard";
import { Search, Sparkles, BookOpen } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useSearchParams } from "next/navigation";

// Stream → Subject mapping for filtering subjects by stream
const STREAM_SUBJECT_MAP: Record<string, string[]> = {
    Science: ["Physics", "Chemistry", "Mathematics", "Biology", "Math", "Maths"],
    Commerce: ["Accountancy", "Business Studies", "Economics"],
    Humanities: ["History", "Political Science", "Geography", "Psychology", "Sociology"],
    Language: ["English", "Hindi", "Sanskrit"],
    "General Test": ["General Test"],
};

const ALL_STREAMS = ["Science", "Commerce", "Humanities", "Language", "General Test"] as const;

// Chip component for consistent filter pill styling
function FilterChip({
    label,
    count,
    isSelected,
    color = "cta",
    onClick,
}: {
    label: string;
    count?: number;
    isSelected: boolean;
    color?: "cta" | "indigo" | "emerald";
    onClick: () => void;
}) {
    const activeClass =
        color === "cta" ? "bg-cta-primary text-white shadow-lg shadow-cta-primary/20" :
        color === "indigo" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" :
        "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20";

    return (
        <button
            onClick={onClick}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                isSelected ? activeClass : "bg-surface-card border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
        >
            {label}
            {count !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/20" : "bg-white/10"}`}>
                    {count}
                </span>
            )}
        </button>
    );
}

export default function MockTestsPage() {
    const { user, userData } = useAuth();
    const searchParams = useSearchParams();

    const [tests, setTests] = useState<Test[]>([]);
    const [userAttempts, setUserAttempts] = useState<TestAttempt[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state — 4 tiers: Stream → Subject → Type → Format
    const [selectedStream, setSelectedStream] = useState<string>("All");
    const [selectedSubject, setSelectedSubject] = useState<string>("All");
    const [selectedTier2, setSelectedTier2] = useState<string>("All");
    const [selectedTier3, setSelectedTier3] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadData() {
            if (!user) return;
            try {
                const [allTests, attempts] = await Promise.all([
                    firestoreService.getTests(true),
                    firestoreService.getUserAttempts(user.uid)
                ]);
                setTests(allTests);
                setUserAttempts(attempts);

                // Read URL param ?type=PYQ on first load
                const typeParam = searchParams.get("type");
                if (typeParam) setSelectedTier2(typeParam);
            } catch (error) {
                console.error("Error loading tests:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);

    // ── Derived filter options with counts ──────────────────────────────────

    // Tests matching selected stream
    const streamFilteredTests = useMemo(() => {
        if (selectedStream === "All") return tests;
        const streamSubjects = STREAM_SUBJECT_MAP[selectedStream] ?? [];
        return tests.filter(t =>
            // Check test.stream field first, fall back to subject-based derivation
            t.stream === selectedStream ||
            (t.streams && t.streams.includes(selectedStream)) ||
            (t.subject && streamSubjects.some(s => s.toLowerCase() === t.subject!.toLowerCase()))
        );
    }, [tests, selectedStream]);

    // Stream counts
    const streamCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        ALL_STREAMS.forEach(stream => {
            const subjects = STREAM_SUBJECT_MAP[stream] ?? [];
            counts[stream] = tests.filter(t =>
                t.stream === stream ||
                (t.streams && t.streams.includes(stream)) ||
                (t.subject && subjects.some(s => s.toLowerCase() === t.subject!.toLowerCase()))
            ).length;
        });
        return counts;
    }, [tests]);

    // Distinct subjects within selected stream
    const distinctSubjects = useMemo(() =>
        Array.from(new Set(streamFilteredTests.map(t => t.subject).filter(Boolean))) as string[],
        [streamFilteredTests]
    );

    // Subject counts
    const subjectCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        distinctSubjects.forEach(sub => {
            counts[sub] = streamFilteredTests.filter(t => t.subject === sub).length;
        });
        return counts;
    }, [distinctSubjects, streamFilteredTests]);

    const subjectFilteredTests = useMemo(() =>
        selectedSubject === "All" ? streamFilteredTests : streamFilteredTests.filter(t => t.subject === selectedSubject),
        [streamFilteredTests, selectedSubject]
    );

    const distinctTier2 = useMemo(() =>
        Array.from(new Set(subjectFilteredTests.map(t => t.tier2Category).filter(Boolean))) as string[],
        [subjectFilteredTests]
    );

    const tier2Counts = useMemo(() => {
        const counts: Record<string, number> = {};
        distinctTier2.forEach(t2 => {
            counts[t2] = subjectFilteredTests.filter(t => t.tier2Category === t2).length;
        });
        return counts;
    }, [distinctTier2, subjectFilteredTests]);

    const tier2FilteredTests = useMemo(() =>
        selectedTier2 === "All" ? subjectFilteredTests : subjectFilteredTests.filter(t => t.tier2Category === selectedTier2),
        [subjectFilteredTests, selectedTier2]
    );

    const distinctTier3 = useMemo(() =>
        Array.from(new Set(tier2FilteredTests.map(t => t.tier3Category).filter(Boolean))) as string[],
        [tier2FilteredTests]
    );

    const tier3Counts = useMemo(() => {
        const counts: Record<string, number> = {};
        distinctTier3.forEach(t3 => {
            counts[t3] = tier2FilteredTests.filter(t => t.tier3Category === t3).length;
        });
        return counts;
    }, [distinctTier3, tier2FilteredTests]);

    // Final filtered list
    const filteredTests = useMemo(() => {
        let result = tier2FilteredTests;
        if (selectedTier3 !== "All") result = result.filter(t => t.tier3Category === selectedTier3);
        if (searchQuery) result = result.filter(t => t.title?.toLowerCase().includes(searchQuery.toLowerCase()));
        return result;
    }, [tier2FilteredTests, selectedTier3, searchQuery]);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleStreamSelect = (stream: string) => {
        setSelectedStream(stream);
        setSelectedSubject("All");
        setSelectedTier2("All");
        setSelectedTier3("All");
    };

    const handleSubjectSelect = (sub: string) => {
        setSelectedSubject(sub);
        setSelectedTier2("All");
        setSelectedTier3("All");
    };

    const handleTier2Select = (t2: string) => {
        setSelectedTier2(t2);
        setSelectedTier3("All");
    };

    const getAttemptState = (testId: string) => {
        const attempt = userAttempts.find(a => a.testId === testId && a.status === 'in_progress');
        if (attempt) return 'in_progress';
        const completed = userAttempts.some(a => a.testId === testId && a.status === 'completed');
        return completed ? 'completed' : 'new';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-cta-primary/20 blur-xl rounded-full" />
                    <BookOpen className="h-12 w-12 text-cta-primary animate-pulse relative z-10" />
                </div>
                <p className="text-white/50 font-medium animate-pulse">Loading Test Vault...</p>
            </div>
        );
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
            {/* ── Page Header ───────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative overflow-hidden rounded-[2.5rem] bg-surface-card/60 border border-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cta-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-6">
                        <Sparkles className="h-4 w-4 text-cta-primary" /> The Vault
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight leading-tight">
                        Mock Tests & PYQs
                    </h1>
                    <p className="mt-4 text-white/60 max-w-xl text-lg">
                        Practice with exact exam patterns, track your speed, and conquer your weaknesses.
                    </p>
                </div>

                {/* Search */}
                <div className="relative z-10 w-full md:w-auto flex-1 max-w-md">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cta-primary/50 to-purple-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                        <div className="relative flex items-center bg-surface-elevated border border-white/10 rounded-xl overflow-hidden focus-within:border-cta-primary/50 transition-colors">
                            <Search className="h-5 w-5 text-white/40 ml-4 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search tests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-white placeholder-white/30 px-4 py-3.5 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Filters ───────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 px-1">

                {/* Tier 0: Stream */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-white/30 text-xs font-bold tracking-widest uppercase mr-2 shrink-0 w-16">Stream</span>
                    <FilterChip label="All" count={tests.length} isSelected={selectedStream === "All"} color="cta" onClick={() => handleStreamSelect("All")} />
                    {ALL_STREAMS.filter(s => (streamCounts[s] ?? 0) > 0).map(stream => (
                        <FilterChip
                            key={stream}
                            label={stream}
                            count={streamCounts[stream]}
                            isSelected={selectedStream === stream}
                            color="cta"
                            onClick={() => handleStreamSelect(stream)}
                        />
                    ))}
                </div>

                {/* Tier 1: Subject */}
                {distinctSubjects.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <span className="text-white/30 text-xs font-bold tracking-widest uppercase mr-2 shrink-0 w-16">Subject</span>
                        <FilterChip label="All" isSelected={selectedSubject === "All"} color="cta" onClick={() => handleSubjectSelect("All")} />
                        {distinctSubjects.map(sub => (
                            <FilterChip
                                key={sub}
                                label={sub}
                                count={subjectCounts[sub]}
                                isSelected={selectedSubject === sub}
                                color="cta"
                                onClick={() => handleSubjectSelect(sub)}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Tier 2: Type (PYQ / Mock) */}
                {distinctTier2.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <span className="text-white/30 text-xs font-bold tracking-widest uppercase mr-2 shrink-0 w-16">Type</span>
                        <FilterChip label="All" isSelected={selectedTier2 === "All"} color="indigo" onClick={() => handleTier2Select("All")} />
                        {distinctTier2.map(t2 => (
                            <FilterChip
                                key={t2}
                                label={t2}
                                count={tier2Counts[t2]}
                                isSelected={selectedTier2 === t2}
                                color="indigo"
                                onClick={() => handleTier2Select(t2)}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Tier 3: Format */}
                {distinctTier3.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <span className="text-white/30 text-xs font-bold tracking-widest uppercase mr-2 shrink-0 w-16">Format</span>
                        <FilterChip label="All" isSelected={selectedTier3 === "All"} color="emerald" onClick={() => setSelectedTier3("All")} />
                        {distinctTier3.map(t3 => (
                            <FilterChip
                                key={t3}
                                label={t3}
                                count={tier3Counts[t3]}
                                isSelected={selectedTier3 === t3}
                                color="emerald"
                                onClick={() => setSelectedTier3(t3)}
                            />
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Stats summary bar */}
            <div className="flex items-center gap-2 px-1">
                <span className="text-white/30 text-xs font-medium">
                    Showing <span className="text-white font-bold">{filteredTests.length}</span> of {tests.length} tests
                </span>
                {(selectedStream !== "All" || selectedSubject !== "All" || selectedTier2 !== "All" || selectedTier3 !== "All" || searchQuery) && (
                    <button
                        onClick={() => { setSelectedStream("All"); setSelectedSubject("All"); setSelectedTier2("All"); setSelectedTier3("All"); setSearchQuery(""); }}
                        className="text-xs text-cta-primary hover:text-white font-semibold transition-colors ml-2"
                    >
                        Clear all filters ×
                    </button>
                )}
            </div>

            {/* ── Grid ──────────────────────────────────────────────────────── */}
            {filteredTests.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredTests.map(test => {
                            const state = getAttemptState(test.id);
                            return (
                                <motion.div
                                    key={test.id}
                                    variants={itemVariants}
                                    layout
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                >
                                    <TestCard
                                        test={test}
                                        isInProgress={state === 'in_progress'}
                                        isAttempted={state === 'completed'}
                                        userCredits={userData?.credits ?? 0}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-surface-card/30 rounded-3xl border border-white/5 backdrop-blur-sm"
                >
                    <div className="w-16 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <Search className="h-6 w-6 text-white/30" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">No tests found</h3>
                    <p className="text-white/40 text-sm max-w-md mx-auto">Try adjusting your filters or search query.</p>
                </motion.div>
            )}
        </div>
    );
}
