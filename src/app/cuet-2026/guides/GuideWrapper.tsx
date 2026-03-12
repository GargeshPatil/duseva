"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { firestoreService } from "@/services/firestoreService";
import { ImportantDatesGuide } from "./ImportantDatesGuide";
import { SyllabusGuide } from "./SyllabusGuide";
import { StrategyGuide } from "./StrategyGuide";
import { CollegePreferencesGuide } from "./CollegePreferencesGuide";

interface GuideWrapperProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon: React.ReactNode;
    cmsKey: string;
}

export function GuideWrapper({ isOpen, onClose, title, icon, cmsKey }: GuideWrapperProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        async function loadContent() {
            setLoading(true);
            const cmsData = await firestoreService.getCMSContent();
            const sectionItem = cmsData.find(c => c.key === cmsKey && c.section === 'cuet2026');
            if (cmsKey === 'syllabus_content') {
                const { SYLLABUS_DATA } = await import("@/data/syllabus");
                const defaultFlatList: any[] = [];
                SYLLABUS_DATA.forEach(category => {
                    let domain = "Other";
                    if (category.category.includes("Science")) domain = "Science";
                    else if (category.category.includes("Commerce")) domain = "Commerce";
                    else if (category.category.includes("Humanities")) domain = "Humanities";
                    else if (category.category.includes("Language")) domain = "Language";
                    else if (category.category.includes("General Test")) domain = "General Test";
                    else if (category.category.includes("Vocational")) domain = "Vocational";

                    category.subjects.forEach(sub => {
                        defaultFlatList.push({
                            id: sub.code || sub.name.replace(/\s+/g, '-').toLowerCase(),
                            domain: domain,
                            subject: sub.name,
                            difficulty: "medium",
                            topics: sub.topics.map(t => ({ title: t.title }))
                        });
                    });
                });

                let cmsFlatList: any[] = [];
                if (sectionItem && sectionItem.value) {
                    try { cmsFlatList = JSON.parse(sectionItem.value); } catch { }
                }

                cmsFlatList.forEach((cmsSub: any) => {
                    const existingIdx = defaultFlatList.findIndex(d => d.subject === cmsSub.subject);
                    if (existingIdx !== -1) {
                        defaultFlatList[existingIdx] = { ...defaultFlatList[existingIdx], ...cmsSub };
                    } else {
                        defaultFlatList.push(cmsSub);
                    }
                });
                setData(defaultFlatList);
            } else {
                if (sectionItem) {
                    try {
                        setData(JSON.parse(sectionItem.value));
                    } catch {
                        setData(null);
                    }
                } else {
                    setData(null);
                }
            }
            setLoading(false);
        }
        loadContent();
    }, [isOpen, cmsKey]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset" };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-[10%] lg:inset-x-[15%] z-50 bg-[#0A0A0B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-xl border border-white/10 shrink-0">
                                    {icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                                    <div className="text-sm font-medium text-white/50 tracking-wide uppercase mt-1">Interactive Guide</div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-white/30" />
                                </div>
                            ) : !data ? (
                                <div className="absolute inset-0 flex items-center justify-center flex-col text-white/50">
                                    <p>No content available for this section yet.</p>
                                    <p className="text-sm mt-2">Admins can add this in the CMS.</p>
                                </div>
                            ) : (
                                <div className="h-full">
                                    {cmsKey === 'important_dates_content' && <ImportantDatesGuide data={data} />}
                                    {cmsKey === 'syllabus_content' && <SyllabusGuide data={data} />}
                                    {cmsKey === 'exam_strategy_content' && <StrategyGuide data={data} />}
                                    {cmsKey === 'college_preferences_content' && <CollegePreferencesGuide data={data} />}
                                    {/* Add other guides here later */}
                                    {cmsKey !== 'important_dates_content' &&
                                        cmsKey !== 'syllabus_content' &&
                                        cmsKey !== 'exam_strategy_content' &&
                                        cmsKey !== 'college_preferences_content' && (
                                            <div className="h-full flex items-center justify-center text-white/50">
                                                Component for {cmsKey} is under construction.
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
