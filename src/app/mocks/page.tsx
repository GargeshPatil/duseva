"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { TestCard } from "@/components/dashboard/TestCard";
import { firestoreService } from "@/services/firestoreService";
import { Test, Bundle } from "@/types/admin";
import { Package, Loader2 } from "lucide-react";
import Link from "next/link";

export default function MocksPage() {
    const [view, setView] = useState<'stream-selection' | 'directory'>('stream-selection');
    const [selectedStream, setSelectedStream] = useState<string | null>(null);
    const [tests, setTests] = useState<Test[]>([]);
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);

    // Persist choice in localStorage
    useEffect(() => {
        const savedStream = localStorage.getItem("user_stream_preference");
        if (savedStream) {
            setSelectedStream(savedStream);
            setView('directory');
        }
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [testsData, bundlesData] = await Promise.all([
                firestoreService.getTests(),
                firestoreService.getBundles(true) // Fetch active bundles
            ]);
            setTests(testsData);
            setBundles(bundlesData);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleStreamSelect = (stream: string) => {
        localStorage.setItem("user_stream_preference", stream);
        setSelectedStream(stream);
        setView('directory');
    };

    const handleClearPreference = () => {
        localStorage.removeItem("user_stream_preference");
        setSelectedStream(null);
        setView('stream-selection');
    };

    // Filter logic
    const filteredTests = tests.filter(test => {
        if (!selectedStream) return true;
        // Check if the test's streams array includes the selected stream
        // Or if it's "General" (often applicable to all) or if the test is "General" stream
        // Also handle legacy 'stream' field via the mapped 'streams' array

        const testStreams = test.streams || [];
        return testStreams.includes(selectedStream) || testStreams.includes('General');
    }).sort((a, b) => (a.price === 'free' ? -1 : 1)); // Show free first

    // Filter bundles (optional: if bundles are stream-specific? For now show all or filter if possible)
    // Bundles don't have streams yet in schema, so show all or maybe add logic later.
    const filteredBundles = bundles;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            <Navbar />

            <main className="flex-1 container px-4 md:px-6 py-12">
                <AnimatePresence mode="wait">
                    {view === 'stream-selection' ? (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Which stream are you preparing for?</h1>
                            <p className="text-slate-600 mb-12 text-lg">We'll customize your mock test experience based on your selection.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                {[
                                    { id: 'Commerce', label: 'Commerce', desc: 'Accountancy, BST, Economics' },
                                    { id: 'Science', label: 'Science', desc: 'Physics, Chemistry, Maths, Bio' },
                                    { id: 'Humanities', label: 'Humanities', desc: 'History, Pol Sci, Geography' },
                                    { id: 'General', label: 'General Test & English', desc: 'Language & General Awareness' } // "General" usually maps to General Test stream or similar
                                ].map((stream) => (
                                    <button
                                        key={stream.id}
                                        onClick={() => handleStreamSelect(stream.id)}
                                        className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-left group"
                                    >
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">{stream.label}</h3>
                                        <p className="text-slate-500 text-sm">{stream.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="directory"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-12"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        Mock Tests for <span className="text-blue-600">{selectedStream}</span>
                                        <button onClick={handleClearPreference} className="text-xs text-slate-400 font-normal underline hover:text-slate-600">Change</button>
                                    </h1>
                                    <p className="text-slate-500 mt-1">
                                        {loading ? "Loading available tests..." : `Showing ${filteredTests.length} available tests`}
                                    </p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="py-20 flex justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
                            ) : (
                                <>
                                    {/* Bundles Section */}
                                    {filteredBundles.length > 0 && (
                                        <div className="space-y-4">
                                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                                <Package className="h-5 w-5 text-indigo-600" /> Value Bundles
                                            </h2>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {filteredBundles.map(bundle => (
                                                    <div key={bundle.id} className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5 hover:shadow-md transition-all relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                                                            SAVE BIG
                                                        </div>
                                                        <h3 className="font-bold text-slate-900 text-lg mb-2">{bundle.name}</h3>
                                                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{bundle.description}</p>
                                                        <div className="flex justify-between items-center mt-auto">
                                                            <div>
                                                                <span className="text-xl font-bold text-slate-900">₹{bundle.price}</span>
                                                                {bundle.originalPrice && (
                                                                    <span className="text-sm text-slate-400 line-through ml-2">₹{bundle.originalPrice}</span>
                                                                )}
                                                            </div>
                                                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                                                View Bundle
                                                            </Button>
                                                        </div>
                                                        <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-500 flex gap-2">
                                                            <span className="bg-slate-100 px-2 py-1 rounded">{bundle.includedTests.length} Tests</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tests Grid */}
                                    <div className="space-y-4">
                                        {filteredBundles.length > 0 && <h2 className="text-lg font-semibold text-slate-900">Individual Tests</h2>}
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredTests.map((test) => (
                                                <TestCard
                                                    key={test.id}
                                                    test={{ ...test, attempts: 0 }}
                                                    onStart={() => window.location.href = `/test/${test.id}`}
                                                />
                                            ))}

                                            {filteredTests.length === 0 && (
                                                <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                                                    No mock tests found for {selectedStream} yet. Check back soon!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="text-center pt-12 pb-8">
                                <p className="text-slate-500 mb-4">Want to explore all subjects?</p>
                                <Button variant="outline" onClick={handleClearPreference}>View All Streams</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
}
