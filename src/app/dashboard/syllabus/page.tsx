"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { firestoreService } from "@/services/firestoreService";
import { SYLLABUS_DATA } from "@/data/syllabus";
import {
  ChevronDown,
  ChevronRight,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Map
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type StreamType = 'Science' | 'Commerce' | 'Humanities' | null;

// --- Components ---

function OnboardingModal({
    isOpen,
    onComplete
}: {
    isOpen: boolean;
    onComplete: (stream: StreamType, target: string) => void;
}) {
    const [stream, setStream] = useState<StreamType>(null);
    const [target, setTarget] = useState("University of Delhi");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-surface-elevated/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-lg w-full p-8 space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cta-primary via-purple-500 to-indigo-500" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-cta-primary/20 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center space-y-2 relative z-10">
                    <div className="mx-auto w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                        <GraduationCap className="h-7 w-7 text-cta-primary" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Welcome to your Prep Journey</h2>
                    <p className="text-white/50 text-sm font-medium">To personalize your guidance, tell us a bit about your goals.</p>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Which stream are you from?</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['Science', 'Commerce', 'Humanities'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStream(s)}
                                    className={`
                                        py-4 px-2 rounded-2xl text-sm font-bold border transition-all duration-300
                                        ${stream === s
                                            ? 'border-cta-primary/50 bg-cta-primary/10 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                                            : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white hover:bg-white/10'}
                                    `}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Target University</label>
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cta-primary/50 focus:ring-1 focus:ring-cta-primary/50 font-medium transition-all"
                            placeholder="e.g. BHU, JNU, AMU"
                        />
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        <p className="text-[11px] text-white/30 font-medium tracking-wide">We've set Delhi University as default as it's the most popular choice.</p>
                    </div>
                </div>

                <Button
                    fullWidth
                    size="lg"
                    disabled={!stream || !target}
                    onClick={() => onComplete(stream, target)}
                    className="relative z-10 text-lg py-6 rounded-2xl font-bold tracking-wide shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all hover:-translate-y-1"
                >
                    Start My Journey
                </Button>
            </div>
        </div>
    );
}

function MentorGuide({
    stream,
    onFinish
}: {
    stream: StreamType;
    onFinish: () => void;
}) {
    // Dynamic Content based on stream
    const getStreamContent = () => {
        switch (stream) {
            case 'Commerce':
                return {
                    title: "The Commerce Edge",
                    text: "For B.Com (Hons) and Eco (Hons) at SRCC or Hindu, the competition is fierce. Your domain subjects (Accountancy, Economics, BST) combined with English will define your score. Mathematics is a tie-breaker for Eco Hons. Don't take the General Test lightly if you're aiming for BMS/BBA (FIA)."
                };
            case 'Science':
                return {
                    title: "Science & Strategy",
                    text: "B.Sc courses at St. Stephen's or Miranda House require top-tier domain scores in Physics, Chemistry, and Math/Bio. Unlike JEE/NEET, accuracy in NCERT theory is paramount here. Speed solving easy questions is more important than cracking tough numericals."
                };
            default: // Humanities
                return {
                    title: "Arts & Analytics",
                    text: "Political Science and History cut-offs at LSR and Hindu skyrocket to 800/800. Every single question matters. Your domain knowledge must be NCERT-perfect. Reading comprehension in English (Section I) is your secret weapon to boost the aggregate."
                };
        }
    };

    const content = getStreamContent();

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-24 animate-in fade-in duration-1000">
            {/* Section 1: Intro */}
            <section className="space-y-8 text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cta-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cta-primary font-bold text-sm tracking-wide shadow-inner">
                    <Sparkles className="h-4 w-4" /> MENTOR MODE
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 tracking-tight leading-tight">
                    Relax.<br />You’ve got this.
                </h1>
                <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto font-medium">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    CUET isn't just another exam. It's a shift from <span className="text-white font-bold">rote learning</span> to <span className="text-white font-bold">smart application</span>. Let's break down how you're going to crack it.
                </p>
                <div className="h-24 w-px bg-gradient-to-b from-white/20 to-transparent mx-auto mt-12"></div>
            </section>

            {/* Section 2: Reality Check */}
            <section className="space-y-6 p-10 bg-surface-card/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                        <Map className="h-6 w-6 text-indigo-400" />
                    </div>
                    The North Campus Reality
                </h2>
                <p className="text-lg text-white/60 leading-relaxed font-medium md:pl-20">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    You're aiming for the best colleges in the country. The cut-offs are high, but they aren't impossible. The secret isn't studying 18 hours a day—it's studying the <strong className="text-white">right topics</strong> with <strong className="text-white">high accuracy</strong>. One incorrect answer costs you 6 marks (-1 negative, -5 lost). Accuracy is your new best friend.
                </p>
            </section>

            {/* Section 3: Stream Specific */}
            <section className="space-y-6 p-10 bg-cta-primary/10 backdrop-blur-2xl border border-cta-primary/20 shadow-[0_0_40px_rgba(139,92,246,0.1)] rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cta-primary/5 to-transparent pointer-events-none" />
                <h2 className="text-2xl md:text-3xl font-black text-white relative z-10">{content.title}</h2>
                <p className="text-lg text-white/70 leading-relaxed font-medium relative z-10">
                    {content.text}
                </p>
            </section>

            {/* Section 4: Action */}
            <section className="text-center space-y-8 pt-12 relative z-10">
                <p className="text-xl font-bold text-white/80">
                    Ready to see your roadmap?
                </p>
                <Button
                    size="lg"
                    onClick={onFinish}
                    className="text-lg px-12 py-7 rounded-2xl font-bold tracking-wide shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all hover:-translate-y-1"
                >
                    Reveal My Syllabus <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
            </section>
        </div>
    );
}

function SyllabusAccordion({ data }: { data: typeof SYLLABUS_DATA }) {
    const [openSubject, setOpenSubject] = useState<string | null>(null);

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            {data.map((section, idx) => (
                <div key={idx} className="space-y-5">
                    <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.2em] pl-2 flex items-center gap-3">
                        {section.category}
                        <div className="h-px bg-white/10 flex-1 ml-2" />
                    </h3>
                    <div className="grid gap-4">
                        {section.subjects.map((subject: any) => (
                            <div
                                key={subject.name}
                                className={`
                                    bg-surface-card/40 backdrop-blur-xl rounded-[2rem] border transition-all duration-500 overflow-hidden
                                    ${openSubject === subject.name ? 'border-cta-primary/40 shadow-[0_0_30px_rgba(139,92,246,0.1)]' : 'border-white/10 shadow-lg hover:border-white/20 hover:bg-surface-card/60'}
                                `}
                            >
                                <button
                                    onClick={() => setOpenSubject(openSubject === subject.name ? null : subject.name)}
                                    className="w-full flex items-center justify-between p-6 sm:p-8 text-left group"
                                >
                                    <span className={`font-black text-xl sm:text-2xl tracking-tight transition-colors ${openSubject === subject.name ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                                        {subject.name} {subject.code && <span className="text-white/30 font-semibold text-base sm:text-lg ml-3 bg-white/5 px-3 py-1 rounded-lg border border-white/5">{subject.code}</span>}
                                    </span>
                                    <div className={`p-2 rounded-xl transition-all duration-300 ${openSubject === subject.name ? 'bg-cta-primary/20 text-cta-primary' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'}`}>
                                        {openSubject === subject.name ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {openSubject === subject.name && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 sm:px-8 pb-8 pt-0">
                                                <div className="h-px bg-white/10 mb-6"></div>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {subject.topics.map((topic: any, i: number) => (
                                                        <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
                                                            <h4 className="font-bold text-white/90 mb-3 flex items-start gap-3 leading-snug">
                                                                <div className="w-2 h-2 rounded-full bg-cta-primary shrink-0 mt-1.5 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                                                                {topic.title}
                                                            </h4>
                                                            {topic.subtopics && topic.subtopics.length > 0 && (
                                                                <ul className="space-y-2 ml-5">
                                                                    {topic.subtopics.map((sub: string, j: number) => (
                                                                        <li key={j} className="text-sm text-white/50 leading-relaxed font-medium flex items-start gap-2.5">
                                                                            <span className="text-white/20 mt-1.5 text-[8px] uppercase tracking-widest leading-none">■</span>
                                                                            <span className="group-hover:text-white/70 transition-colors">{sub}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// --- Main Page ---

export default function SyllabusPage() {
    const { user, userData } = useAuth();
    const [stream, setStream] = useState<StreamType>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [syllabusData, setSyllabusData] = useState<any[]>([]);

    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            try {
                // Fetch dynamic syllabus from CMS
                const cmsContent = await firestoreService.getCMSContent();
                const syllabusItem = cmsContent.find((c: any) => c.section === 'cuet2026' && c.key === 'syllabus_content');

                if (syllabusItem && syllabusItem.value) {
                    const flatList = JSON.parse(syllabusItem.value);
                    if (flatList && flatList.length > 0) {
                        let mergedData = JSON.parse(JSON.stringify(SYLLABUS_DATA));

                        flatList.forEach((cmsSubject: any) => {
                            let found = false;
                            for (let category of mergedData) {
                                const subjectIndex = category.subjects.findIndex((s: any) => s.name === cmsSubject.subject);
                                if (subjectIndex !== -1) {
                                    category.subjects[subjectIndex].topics = cmsSubject.topics || [];
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                let catName = `Section II: ${cmsSubject.domain} Domains`;
                                if (cmsSubject.domain === 'Language') catName = "Section IA: Languages";
                                if (cmsSubject.domain === 'General Test') catName = "Section III: General Test";

                                let cat = mergedData.find((c: any) => c.category === catName);
                                if (!cat) {
                                    cat = { category: catName, subjects: [] };
                                    mergedData.push(cat);
                                }
                                cat.subjects.push({
                                    name: cmsSubject.subject,
                                    topics: cmsSubject.topics || []
                                });
                            }
                        });
                        setSyllabusData(mergedData);
                    } else {
                        setSyllabusData(SYLLABUS_DATA); // fallback for empty payload
                    }
                } else {
                    setSyllabusData(SYLLABUS_DATA); // fallback
                }

                if (userData) {
                    setStream(userData.stream as StreamType);
                    // Onboarding logic
                    if (!userData.stream || !userData.targetUniversity) {
                        setShowModal(true);
                    } else if (!userData.onboardingCompleted) {
                        setShowGuide(true);
                    }
                }
            } catch (err) {
                console.error("Error loading syllabus data:", err);
                setSyllabusData(SYLLABUS_DATA); // Ensure fallback on parsing error
            } finally {
                setLoading(false);
            }
        }

        fetchInitialData();
    }, [userData]);

    const handleOnboardingComplete = async (selectedStream: StreamType, selectedTarget: string) => {
        if (!user) return;
        setStream(selectedStream);
        setShowModal(false);
        setShowGuide(true); // Transition to guide

        try {
            await updateDoc(doc(db, "users", user.uid), {
                stream: selectedStream,
                targetUniversity: selectedTarget
            });
        } catch (err) {
            console.error("Failed to update user profile", err);
        }
    };

    const handleGuideFinish = async () => {
        if (!user) return;
        setShowGuide(false);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                onboardingCompleted: true
            });
        } catch (err) {
            console.error("Failed to mark onboarding complete", err);
        }
    };

    if (loading) return null;

    if (showGuide) {
        return (
            <div className="min-h-screen">
                <MentorGuide stream={stream} onFinish={handleGuideFinish} />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-24 max-w-[1600px] mx-auto min-h-[80vh]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8 relative">
                <div className="absolute top-0 left-0 w-64 h-64 bg-cta-primary/10 rounded-full blur-[80px] pointer-events-none -mt-20 -ml-20" />
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Syllabus & Roadmap</h1>
                    <p className="text-white/50 font-medium mt-3 text-lg">Check the official topics & mastery blueprint for CUET UG 2026</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowGuide(true)}
                    className="relative z-10 bg-surface-card/60 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-cta-primary/50 text-white font-bold tracking-wide rounded-xl py-6 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                >
                    <Sparkles className="h-5 w-5 mr-2 text-cta-primary" /> View Mentor Guide
                </Button>
            </div>

            <SyllabusAccordion data={syllabusData} />

            <OnboardingModal isOpen={showModal} onComplete={handleOnboardingComplete} />
        </div>
    );
}
