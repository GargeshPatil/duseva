"use client";

import { useEffect, useState } from "react";
import { firestoreService } from "@/services/firestoreService";
import { Test, TestAttempt } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { TestCard } from "@/components/dashboard/TestCard";
import { Search, Sparkles, BookOpen, Clock } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

type FilterType = 'All' | 'Full Mock' | 'Subject' | 'General' | 'PYQ';

export default function MockTestsPage() {
    const { user, userData } = useAuth();
    const [tests, setTests] = useState<Test[]>([]);
    const [userAttempts, setUserAttempts] = useState<TestAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
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
            } catch (error) {
                console.error("Error loading tests:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user]);

    // Derived state for filtering
    const filteredTests = tests.filter(test => {
        // Search filter
        if (searchQuery && !test.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Category filter
        if (activeFilter === 'All') return true;

        // PYQ specialized filter
        if (activeFilter === 'PYQ') {
            return (test.category as string) === 'PYQ' || test.title.toLowerCase().includes('pyq') || test.title.toLowerCase().includes('previous year');
        }

        return test.category === activeFilter as string;
    });

    // Helper to check attempts
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
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
            {/* Header section (Glassmorphic) */}
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

                {/* Search Bar */}
                <div className="relative z-10 w-full md:w-auto flex-1 max-w-md">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cta-primary/50 to-purple-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative flex items-center bg-surface-elevated border border-white/10 rounded-xl overflow-hidden focus-within:border-cta-primary/50 transition-colors">
                            <Search className="h-5 w-5 text-white/40 ml-4 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search 'Physics' or 'PYQ'..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-white placeholder-white/30 px-4 py-3.5 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none px-2">
                {(['All', 'PYQ', 'Full Mock', 'Subject', 'General'] as FilterType[]).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
                            px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 relative
                            ${activeFilter === filter
                                ? 'bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                                : 'bg-surface-card border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'}
                        `}
                    >
                        {filter === 'PYQ' && activeFilter === filter && <Clock className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />}
                        {filter}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <AnimatePresence mode="wait">
                {filteredTests.length > 0 ? (
                    <motion.div
                        key="grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: 20 }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredTests.map(test => {
                            const state = getAttemptState(test.id);

                            return (
                                <motion.div key={test.id} variants={itemVariants} layout>
                                    <TestCard
                                        test={test}
                                        isInProgress={state === 'in_progress'}
                                        isAttempted={state === 'completed'}
                                        userCredits={userData?.credits ?? 0}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-20 bg-surface-card/30 rounded-3xl border border-white/5 backdrop-blur-sm"
                    >
                        <div className="w-16 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-4">
                            <Search className="h-6 w-6 text-white/30" />
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">No tests found</h3>
                        <p className="text-white/40 text-sm max-w-md mx-auto">Try adjusting your filters or search query to find what you're looking for.</p>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
}
