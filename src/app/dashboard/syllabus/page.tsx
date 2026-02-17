"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SYLLABUS_DATA } from "@/data/syllabus";
import { ChevronDown, ChevronRight, BookOpen, GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-8 animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Welcome to your Prep Journey</h2>
                    <p className="text-slate-500">To personalize your guidance, tell us a bit about your goals.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Which stream are you from?</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['Science', 'Commerce', 'Humanities'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStream(s)}
                                    className={`
                                        py-3 px-2 rounded-xl text-sm font-medium border-2 transition-all
                                        ${stream === s
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'}
                                    `}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Target University</label>
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                            placeholder="e.g. BHU, JNU, AMU"
                        />
                        <p className="text-xs text-slate-400">We've set Delhi University as default as it's the most popular choice.</p>
                    </div>
                </div>

                <Button
                    fullWidth
                    size="lg"
                    disabled={!stream || !target}
                    onClick={() => onComplete(stream, target)}
                    className="bg-blue-600 hover:bg-blue-700 text-lg py-6 rounded-xl shadow-lg shadow-blue-200/50"
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
        <div className="max-w-3xl mx-auto py-12 px-4 space-y-20 animate-in fade-in duration-700">
            {/* Section 1: Intro */}
            <section className="space-y-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm">
                    <Sparkles className="h-4 w-4" /> Mentor Mode
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Relax. You’ve got this.
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                    CUET isn't just another exam. It's a shift from <span className="text-slate-900 font-semibold">rote learning</span> to <span className="text-slate-900 font-semibold">smart application</span>. Let's break down how you're going to crack it.
                </p>
                <div className="h-16 w-0.5 bg-gradient-to-b from-slate-200 to-transparent mx-auto mt-8"></div>
            </section>

            {/* Section 2: Reality Check */}
            <section className="space-y-6 p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl transform transition-all hover:scale-[1.01] duration-500">
                <h2 className="text-2xl font-bold text-slate-900">The North Campus Reality</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                    You're aiming for the best colleges in the country. The cut-offs are high, but they aren't impossible. The secret isn't studying 18 hours a day—it's studying the <strong>right topics</strong> with <strong>high accuracy</strong>. One incorrect answer costs you 6 marks (-1 negative, -5 lost). Accuracy is your new best friend.
                </p>
            </section>

            {/* Section 3: Stream Specific */}
            <section className="space-y-6 p-8 bg-blue-600 text-white shadow-xl shadow-blue-200/40 rounded-3xl transform transition-all hover:scale-[1.01] duration-500">
                <h2 className="text-2xl font-bold">{content.title}</h2>
                <p className="text-lg text-blue-50 leading-relaxed opacity-90">
                    {content.text}
                </p>
            </section>

            {/* Section 4: Action */}
            <section className="text-center space-y-8 pt-8">
                <p className="text-xl font-medium text-slate-900">
                    Ready to see your roadmap?
                </p>
                <Button
                    size="lg"
                    onClick={onFinish}
                    className="bg-slate-900 text-white hover:bg-slate-800 text-lg px-10 py-6 rounded-full shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95"
                >
                    Reveal My Syllabus <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </section>
        </div>
    );
}

function SyllabusAccordion({ data }: { data: typeof SYLLABUS_DATA }) {
    const [openSubject, setOpenSubject] = useState<string | null>(null);

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
            {data.map((section, idx) => (
                <div key={idx} className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-400 uppercase tracking-wider pl-1">{section.category}</h3>
                    <div className="grid gap-4">
                        {section.subjects.map((subject) => (
                            <div
                                key={subject.name}
                                className={`
                                    bg-white rounded-xl border transition-all duration-300 overflow-hidden
                                    ${openSubject === subject.name ? 'border-blue-200 shadow-md ring-1 ring-blue-50' : 'border-slate-200 shadow-sm hover:border-slate-300'}
                                `}
                            >
                                <button
                                    onClick={() => setOpenSubject(openSubject === subject.name ? null : subject.name)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <span className={`font-semibold text-lg ${openSubject === subject.name ? 'text-blue-700' : 'text-slate-900'}`}>
                                        {subject.name} {subject.code && <span className="text-slate-400 font-normal text-sm ml-2">({subject.code})</span>}
                                    </span>
                                    {openSubject === subject.name
                                        ? <ChevronDown className="h-5 w-5 text-blue-500" />
                                        : <ChevronRight className="h-5 w-5 text-slate-400" />
                                    }
                                </button>

                                {openSubject === subject.name && (
                                    <div className="px-5 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                                        <div className="h-px bg-slate-100 mb-4"></div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {subject.topics.map((topic, i) => (
                                                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors">
                                                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                        {topic.title}
                                                    </h4>
                                                    {topic.subtopics && topic.subtopics.length > 0 && (
                                                        <ul className="space-y-1.5 ml-3.5">
                                                            {topic.subtopics.map((sub, j) => (
                                                                <li key={j} className="text-sm text-slate-600 leading-relaxed flex items-start gap-2">
                                                                    <span className="text-slate-300 mt-1.5 text-[10px]">•</span>
                                                                    <span>{sub}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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

    useEffect(() => {
        if (userData) {
            setStream(userData.stream as StreamType);

            // Logic: 
            // 1. If no stream/target set -> Show Modal
            // 2. If stream set BUT onboarding not completed -> Show Guide
            // 3. If onboarding completed -> Show Syllabus directly

            if (!userData.stream || !userData.targetUniversity) {
                setShowModal(true);
            } else if (!userData.onboardingCompleted) {
                setShowGuide(true);
            }

            setLoading(false);
        }
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
            <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
                <MentorGuide stream={stream} onFinish={handleGuideFinish} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Syllabus & Roadmap</h1>
                    <p className="text-slate-500 mt-2">Check the official topics for CUET UG 2026</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGuide(true)}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                    <Sparkles className="h-4 w-4 mr-2" /> View Mentor Guide
                </Button>
            </div>

            <SyllabusAccordion data={SYLLABUS_DATA} />

            <OnboardingModal isOpen={showModal} onComplete={handleOnboardingComplete} />
        </div>
    );
}
