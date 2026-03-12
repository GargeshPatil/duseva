"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { firestoreService } from "@/services/firestoreService";
import { Test, Bundle } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { StreamSelectionView } from "@/components/mocks/StreamSelectionView";
import { MocksDirectoryView } from "@/components/mocks/MocksDirectoryView";

export default function MocksPage() {
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();

    const [view, setView] = useState<'stream-selection' | 'directory'>('stream-selection');
    const [selectedStream, setSelectedStream] = useState<string | null>(null);
    const [tests, setTests] = useState<Test[]>([]);
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);

    const { scrollYProgress } = useScroll();
    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    useEffect(() => {
        if (!authLoading && user && userData) {
            if (userData.role === 'admin' || userData.role === 'developer') {
                router.push("/admin");
            }
        }
    }, [user, userData, authLoading, router]);

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
                firestoreService.getTests(true),
                firestoreService.getBundles(true)
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

    const filteredTests = tests.filter(test => {
        if (!selectedStream) return true;
        const testStreams = test.streams || [];
        return testStreams.includes(selectedStream) || testStreams.includes('General');
    }).sort((a, b) => {
        if (a.price === 'free' && b.price !== 'free') return -1;
        if (b.price === 'free' && a.price !== 'free') return 1;
        return 0;
    });

    const filteredBundles = bundles;

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-white selection:bg-cta-primary/30 selection:text-white relative overflow-hidden">
            <Navbar />

            {/* Soft, Calming Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    style={{ y: yBg }}
                    className="absolute inset-0 opacity-40"
                >
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cta-primary/20 blur-[120px] mix-blend-screen animate-blob" />
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-purple-500/20 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
                    <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
                </motion.div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <main className="flex-1 container px-4 md:px-6 py-24 relative z-10 w-full max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {view === 'stream-selection' ? (
                        <StreamSelectionView onSelectStream={handleStreamSelect} />
                    ) : (
                        <MocksDirectoryView
                            selectedStream={selectedStream}
                            loading={loading}
                            filteredTests={filteredTests}
                            filteredBundles={filteredBundles}
                            onClearPreference={handleClearPreference}
                        />
                    )}
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
}
