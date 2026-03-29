"use client";

import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    FileText,
    Library,
    Package,
    CreditCard,
    Sparkles
} from "lucide-react";
import { OverviewTab } from "@/components/admin/management/OverviewTab";
import { QuestionsTab } from "@/components/admin/management/QuestionsTab";
import { TestsTab } from "@/components/admin/management/TestsTab";
import { CreditsTab } from "@/components/admin/management/CreditsTab";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

type TabId = 'overview' | 'questions' | 'tests' | 'credits';

export default function TestManagementPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        setMounted(true);
        const initialTab = searchParams.get('tab') as TabId;
        if (initialTab && ['overview', 'questions', 'tests', 'credits'].includes(initialTab)) {
            setActiveTab(initialTab);
        }
    }, [searchParams]);

    const handleTabChange = (tab: TabId) => {
        if (tab === activeTab || isTransitioning) return;
        setIsTransitioning(true);
        setActiveTab(tab);

        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.push(`${pathname}?${params.toString()}`);

        setTimeout(() => setIsTransitioning(false), 300);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'questions', label: 'Question Bank', icon: Library },
        { id: 'tests', label: 'Tests', icon: FileText },
        { id: 'credits', label: 'Credit Packages', icon: CreditCard },
    ] as const;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen pb-20 relative">
            {/* Sticky Header Background Container */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="sticky top-10 sm:top-24 z-0 max-w-[1600px] mx-auto px-4 sm:px-8 pt-8 pb-32 pointer-events-none"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-3">
                            <Sparkles className="h-4 w-4 text-cta-primary" /> Content Studio
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight leading-tight">
                            Test Management
                        </h1>
                        <p className="text-white/50 mt-2 font-medium">Central command center for all exam content and pricing.</p>
                    </div>
                </div>
            </motion.div>

            {/* Scrolling Content foreground */}
            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-8 mt-[-100px]">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Premium Pill Tab Navigation */}
                    <motion.div variants={itemVariants} className="relative w-full pointer-events-auto">
                        <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner w-fit">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id as TabId)}
                                        className={`
                                            relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors duration-300 outline-none whitespace-nowrap
                                            ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
                                        `}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeAdminTab"
                                                className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <tab.icon className={`h-4 w-4 ${isActive ? 'text-cta-primary' : 'text-white/40'}`} />
                                            {tab.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Tab Content with smooth fade */}
                    <motion.div variants={itemVariants} className="min-h-[600px] relative pointer-events-auto">
                        <AnimatePresence mode="wait">
                            {mounted ? (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="bg-surface-card/60 backdrop-blur-[32px] border border-white/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-6 sm:p-8"
                                >
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {activeTab === 'overview' && <OverviewTab onNavigate={(tab) => handleTabChange(tab as TabId)} />}
                                    {activeTab === 'questions' && <QuestionsTab />}
                                    {activeTab === 'tests' && <TestsTab />}
                                    {activeTab === 'credits' && <CreditsTab />}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
