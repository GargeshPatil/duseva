import React, { useState } from 'react';
import { useExamEngine } from '@/hooks/useExamEngine';
import { QuestionPanel } from './QuestionPanel';
import { QuestionPalette } from './QuestionPalette';
import { Timer } from './Timer';
import Image from 'next/image';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SectionTabs } from './SectionTabs';

interface ExamLayoutProps {
    engine: ReturnType<typeof useExamEngine>;
}

export function ExamLayout({ engine }: ExamLayoutProps) {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle

    return (
        <div className="flex flex-col h-screen max-h-[100dvh] overflow-hidden bg-white select-none font-sans" {...engine.integrity.handlers}>
            
            {/* EXAM HEADER STRIP */}
            <header className="bg-[#f5f5f5] text-black shrink-0 flex items-start justify-between px-4 md:px-6 py-2.5 shadow-sm border-b border-[#ccc] sticky top-0 z-40" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <div className="flex items-start gap-4">
                    {/* Placeholder for Candidate Profile Box */}
                    <div className="w-[80px] h-[90px] bg-[#e0e0e0] border border-[#ccc] flex items-center justify-center shrink-0">
                        {user?.photoURL ? (
                            <Image src={user.photoURL} alt="User" width={80} height={90} className="object-cover w-full h-full" />
                        ) : (
                            <UserCircle2 className="w-16 h-16 text-gray-500" strokeWidth={1.5} />
                        )}
                    </div>
                    
                    <div className="flex flex-col text-[#333]">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold w-[120px]">Candidate Name</span>
                            <span>: {user?.displayName || user?.email || 'Candidate'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold w-[120px]">Exam Name</span>
                            <span>: CUET UG ({engine.test?.title || 'Mock Test'})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold w-[120px]">Subject Name</span>
                            <span>: {engine.currentSection}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-semibold w-[120px]">Remaining Time</span>
                            <span>: <Timer timeRemaining={engine.timeRemaining} /></span>
                        </div>
                    </div>
                </div>

                {/* Right Area: Language Dropdown */}
                <div className="flex flex-col items-end">
                    <select className="bg-white border border-[#ccc] text-[#333] px-2 py-1 text-sm outline-none cursor-pointer">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                    </select>

                    <button 
                        className="lg:hidden mt-2 text-xs font-semibold underline text-blue-600"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? 'Close Palette' : 'Show Palette'}
                    </button>
                    {/* DU Seva Logo (Small) */}
                    <div className="mt-auto pt-2 opacity-60 flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1D4E89]">DU SEVA</span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-1 overflow-hidden relative bg-white">
                
                {/* LEFT: Question Area */}
                <main className="flex-1 flex flex-col z-10 overflow-hidden">
                    {/* Section Tabs Container (Top of main area) */}
                    {/* The exam style usually has tabs directly below header if multiple subjects */}
                    <SectionTabs 
                        streams={engine.test?.streams || []} 
                        currentSection={engine.currentSection}
                        onSectionChange={(s: string) => engine.setCurrentSection(s)}
                    />

                    {/* Question Panel */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <QuestionPanel engine={engine} />
                    </div>
                </main>

                {/* BACKDROP FOR MOBILE/TABLET */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* RIGHT: Question Palette (Sidebar) */}
                <aside className={`
                    fixed lg:static top-0 right-0 h-full z-50 lg:z-auto
                    w-[85vw] md:w-[320px] lg:w-[320px] bg-white flex flex-col shrink-0
                    transform transition-transform duration-300
                    ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                    border-l border-[#ccc] shadow-xl lg:shadow-none
                `}>
                    {/* Header for Mobile/Tablet */}
                    <div className="flex lg:hidden justify-between items-center px-4 py-3 border-b border-[#ccc] bg-[#f5f5f5] shrink-0">
                        <span className="font-bold text-[#333] text-sm">Question Palette</span>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-black font-bold text-lg leading-none cursor-pointer">×</button>
                    </div>

                    {/* Question Palette container flexes to fill available height */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <QuestionPalette engine={engine} />
                    </div>
                </aside>
            </div>

            {/* INTEGRITY WARNING MODAL */}
            {engine.integrity.showTabWarning && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white rounded p-6 max-w-sm w-full space-y-4 shadow-none border border-[#ccc]">
                        <h2 className="text-[#d32f2f] font-bold text-lg flex items-center gap-2">
                            Warning
                        </h2>
                        <p className="text-[#333] font-medium text-sm">
                            You switched tabs or minimized the window. This is a strict violation of exam rules. 
                            Multiple violations will result in auto-submission and disqualification.
                        </p>
                        <p className="text-gray-500 text-xs">
                            Total warnings so far: {engine.integrity.tabSwitches}
                        </p>
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={engine.integrity.dismissTabWarning}
                                className="bg-[#1976d2] text-white px-4 py-1.5 rounded-sm font-semibold text-sm border border-[#0d47a1]"
                            >
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
