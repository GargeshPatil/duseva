"use client";

import { useEffect, useState } from "react";
import { firestoreService } from "@/services/firestoreService";
import { Test, TestAttempt } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { TestCard } from "@/components/dashboard/TestCard";
import { Search, Filter } from "lucide-react";
import { PaymentModal } from "@/components/dashboard/PaymentModal";

type FilterType = 'All' | 'Full Mock' | 'Subject' | 'General' | 'Free';

export default function MockTestsPage() {
    const { user, userData } = useAuth();
    const [tests, setTests] = useState<Test[]>([]);
    const [userAttempts, setUserAttempts] = useState<TestAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedTestToUnlock, setSelectedTestToUnlock] = useState<Test | null>(null);

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
        if (activeFilter === 'Free') return test.price === 'free';
        return test.category === activeFilter;
    });

    // Helper to check attempts
    const getAttemptState = (testId: string) => {
        const attempt = userAttempts.find(a => a.testId === testId && a.status === 'in_progress');
        if (attempt) return 'in_progress';

        const completed = userAttempts.some(a => a.testId === testId && a.status === 'completed');
        return completed ? 'completed' : 'new';
    };

    const handleUnlock = (test: Test) => {
        setSelectedTestToUnlock(test);
    };

    const onPaymentSuccess = async () => {
        // Logic to update local state (optimistic UI) - mostly useful if we don't refetch
        // In a real app we'd call an API. Here we just close modal and maybe refresh user?
        // We're currently just showing the UI. The access control is the main part.
        if (selectedTestToUnlock && user) {
            // Mock purchase update in local state for immediate feedback
            // This is "UI only" as requested, but we should clear the modal
        }
        setSelectedTestToUnlock(null);
        // Reload page or re-fetch user to get updated purchasedTests
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-slate-400">Loading mock tests...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mock Tests</h1>
                    <p className="text-slate-500">Practice with official pattern mock tests</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 w-full md:w-64"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {(['All', 'Full Mock', 'Subject', 'General', 'Free'] as FilterType[]).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                            ${activeFilter === filter
                                ? 'bg-slate-900 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}
                        `}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filteredTests.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTests.map(test => {
                        const state = getAttemptState(test.id);
                        const isPurchased = !!user?.uid && (test.price === 'free' || !!userData?.purchasedTests?.[test.id]);

                        return (
                            <TestCard
                                key={test.id}
                                test={test}
                                isInProgress={state === 'in_progress'}
                                isAttempted={state === 'completed'}
                                isPurchased={test.price === 'free' || !!userData?.purchasedTests?.[test.id]}
                                onUnlock={handleUnlock}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <h3 className="text-slate-900 font-medium mb-1">No tests found</h3>
                    <p className="text-slate-500 text-sm">Try adjusting your filters or search query.</p>
                </div>
            )}

            {selectedTestToUnlock && (
                <PaymentModal
                    isOpen={!!selectedTestToUnlock}
                    onClose={() => setSelectedTestToUnlock(null)}
                    test={selectedTestToUnlock}
                    onUnlock={onPaymentSuccess}
                />
            )}
        </div>
    );
}
