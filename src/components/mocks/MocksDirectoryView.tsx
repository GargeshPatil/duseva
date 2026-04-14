import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Package, Search, Clock } from "lucide-react";
import { TestCard } from "@/components/dashboard/TestCard";
import { Test } from "@/types/admin";
import { useState } from "react";

interface MocksDirectoryViewProps {
    selectedStream: string | null;
    loading: boolean;
    filteredTests: Test[];
    onClearPreference: () => void;
    userCredits?: number;
}

type FilterType = 'All' | 'Full Mock' | 'Subject' | 'General' | 'PYQ';

export function MocksDirectoryView({
    selectedStream,
    loading,
    filteredTests,
    onClearPreference,
    userCredits
}: MocksDirectoryViewProps) {
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [searchQuery, setSearchQuery] = useState("");

    const displayedTests = filteredTests.filter(test => {
        // Search filter
        if (searchQuery && !test.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Category filter
        if (activeFilter === 'All') return true;

        if (activeFilter === 'PYQ') {
            return (test.category as string) === 'PYQ' || test.title.toLowerCase().includes('pyq') || test.title.toLowerCase().includes('previous year');
        }

        return test.category === activeFilter as string;
    });

    return (
        <motion.div
            key="directory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 pt-10"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
                <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-4 flex-wrap mb-4">
                        Mocks for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{selectedStream}</span>
                    </h1>
                    <div className="flex items-center gap-4 text-white/50 text-lg font-medium">
                        {loading ? "Waking up the servers..." : `Found ${displayedTests.length} beautifully crafted tests.`}
                        <button onClick={onClearPreference} className="text-sm px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors">
                            Change Stream
                        </button>
                    </div>
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
            </div>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-cta-primary" />
                    <p className="text-white/50 font-medium">Preparing your study material...</p>
                </div>
            ) : (
                <div className="space-y-8">
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
                        {displayedTests.length > 0 ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {displayedTests.map((test) => (
                                    <motion.div key={test.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                                        <TestCard
                                            test={{ ...test, attempts: 0 }}
                                            userCredits={userCredits ?? 0}
                                            onStart={() => window.location.href = `/test/${test.id}`}
                                        />
                                    </motion.div>
                                ))}
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
            )}
        </motion.div>
    );
}
