"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { TestCard } from "@/components/dashboard/TestCard";
import { useAuth } from "@/context/AuthContext"; // Assuming useAuth exists
// Mock data for tests - in real implementation fetch from DB
const MOCK_TESTS = [
    {
        id: "t1",
        title: "Accountancy Full Syllabus Mock 1",
        subject: "Accountancy",
        questionCount: 50,
        duration: 60,
        difficulty: "Medium" as const,
        type: "free" as const,
        description: "Comprehensive mock test covering the entire Class 12th Accountancy syllabus.",
        totalMarks: 200,
        instructions: ["Attempt all questions", "No negative marking"],
        price: "free" as const,
        questions: Array(50).fill({}),
        category: "Full Mock" as const,
        createdDate: new Date().toISOString(),
        status: "published" as const
    },
    {
        id: "t2",
        title: "Economics Chapter Wise Test",
        subject: "Economics",
        questionCount: 40,
        duration: 45,
        difficulty: "Hard" as const,
        type: "premium" as const,
        description: "Focus on Microeconomics and Macroeconomics key concepts.",
        totalMarks: 200,
        instructions: ["Attempt all questions"],
        price: "paid" as const,
        priceAmount: 49,
        questions: Array(40).fill({}),
        category: "Subject" as const,
        createdDate: new Date().toISOString(),
        status: "published" as const
    },
    {
        id: "t3",
        title: "General Test Layout Practice",
        subject: "General Test",
        questionCount: 60,
        duration: 60,
        difficulty: "Easy" as const,
        type: "free" as const,
        description: "Practice General Knowledge, Current Affairs, and Numerical Ability.",
        totalMarks: 250,
        instructions: ["Attempt all questions"],
        price: "free" as const,
        questions: Array(60).fill({}),
        category: "General" as const,
        createdDate: new Date().toISOString(),
        status: "published" as const
    },
    {
        id: "t4",
        title: "English Language Comprehensive",
        subject: "English",
        questionCount: 50,
        duration: 45,
        difficulty: "Medium" as const,
        type: "premium" as const,
        description: "Reading Comprehension and Grammar practice.",
        totalMarks: 200,
        instructions: ["Attempt all questions"],
        price: "paid" as const,
        priceAmount: 49,
        questions: Array(50).fill({}),
        category: "Subject" as const,
        createdDate: new Date().toISOString(),
        status: "published" as const
    },
    {
        id: "t5",
        title: "Physics Mechanics Drill",
        subject: "Physics",
        questionCount: 40,
        duration: 60,
        difficulty: "Hard" as const,
        type: "premium" as const,
        description: "Intensive practice on Mechanics and Properties of Matter.",
        totalMarks: 200,
        instructions: ["Attempt all questions"],
        price: "paid" as const,
        priceAmount: 49,
        questions: Array(40).fill({}),
        category: "Subject" as const,
        createdDate: new Date().toISOString(),
        status: "published" as const
    },
    {
        id: "t6",
        title: "History: Ancient India",
        subject: "History",
        questionCount: 50,
        duration: 45,
        difficulty: "Medium" as const,
        type: "free" as const,
        description: "Deep dive into Harappan Civilization and Vedic Age.",
        totalMarks: 200,
        instructions: ["Attempt all questions"],
        price: "free" as const,
        questions: Array(50).fill({}),
        category: "Subject" as const,
        createdDate: new Date().toISOString(),
        status: "published" as const
    },
];

export default function MocksPage() {
    const [view, setView] = useState<'stream-selection' | 'directory'>('stream-selection');
    const [selectedStream, setSelectedStream] = useState<string | null>(null);

    // Persist choice in localStorage
    useEffect(() => {
        const savedStream = localStorage.getItem("user_stream_preference");
        if (savedStream) {
            setSelectedStream(savedStream);
            setView('directory');
        }
    }, []);

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

    // Filter logic (simplified for demo)
    const filteredTests = MOCK_TESTS.filter(test => {
        if (!selectedStream) return true;

        // Simple mapping for demo
        if (selectedStream === 'Commerce' && ['Accountancy', 'Economics', 'English', 'General Test'].includes(test.subject)) return true;
        if (selectedStream === 'Science' && ['Physics', 'Chemistry', 'Maths', 'English', 'General Test'].includes(test.subject)) return true;
        if (selectedStream === 'Humanities' && ['History', 'Pol Science', 'Sociology', 'English', 'General Test'].includes(test.subject)) return true;
        if (selectedStream === 'General' && ['English', 'General Test'].includes(test.subject)) return true;

        return false;
    }).sort((a, b) => (a.type === 'free' ? -1 : 1)); // Show free first

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
                                    { id: 'General', label: 'General Test & English', desc: 'Language & General Awareness' }
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
                            className="space-y-8"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        Mock Tests for <span className="text-blue-600">{selectedStream}</span>
                                        <button onClick={handleClearPreference} className="text-xs text-slate-400 font-normal underline hover:text-slate-600">Change</button>
                                    </h1>
                                    <p className="text-slate-500 mt-1">Showing {filteredTests.length} available tests</p>
                                </div>
                                <div className="flex gap-2">
                                    {/* Placeholder for more filters */}
                                    {/* <Button variant="outline" size="sm">Filter</Button> */}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTests.map((test) => (
                                    <TestCard
                                        key={test.id}
                                        test={{ ...test, attempts: 0 }} // Mocking attempts for display
                                        onStart={() => window.location.href = `/test/${test.id}`} // Simple redirect for now
                                    />
                                ))}

                                {filteredTests.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-slate-400">
                                        No mock tests found for this stream yet. Check back soon!
                                    </div>
                                )}
                            </div>

                            <div className="text-center pt-12">
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
