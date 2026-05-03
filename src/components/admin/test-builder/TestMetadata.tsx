import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Test } from "@/types/admin";

interface TestMetadataProps {
    test: Partial<Test>;
    onChange: (updated: Partial<Test>) => void;
}

export function TestMetadata({ test, onChange }: TestMetadataProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (field: keyof Test, value: any) => {
        onChange({ ...test, [field]: value });
    };

    const commonSubjects = [
        'Physics', 'Chemistry', 'Mathematics', 'Biology', 
        'Accountancy', 'Business Studies', 'Economics', 
        'History', 'Political Science', 'Geography', 
        'English', 'General Test'
    ];

    const [isAddingSubject, setIsAddingSubject] = useState(false);
    const [newSubject, setNewSubject] = useState("");

    const handleAddNewSubject = () => {
        if (newSubject.trim()) {
            handleChange('subject', newSubject.trim());
            setIsAddingSubject(false);
            setNewSubject("");
        }
    };

    const handleStreamToggle = (stream: string) => {
        let current = test.streams || [];
        if (typeof current === 'string') {
            current = [current];
        }
        
        const updated = (current as string[]).includes(stream)
            ? (current as string[]).filter(s => s !== stream)
            : [...(current as string[]), stream];
        handleChange('streams', updated);
    };

    return (
        <div className="bg-surface-card p-6 sm:p-8 rounded-2xl shadow-xl border border-white/5 space-y-8 relative overflow-hidden group">
            {/* Subtle top glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cta-primary/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col sm:flex-row justify-between border-b border-border/50 pb-4 items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-text-primary">Test Configuration</h2>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-surface p-2 rounded-lg border border-border transition-colors hover:border-text-muted">
                        <input
                            type="checkbox"
                            checked={test.isFree || false}
                            onChange={(e) => handleChange('isFree', e.target.checked)}
                            className="rounded border-input text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-text-secondary">Free Test</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-surface p-2 rounded-lg border border-border hover:border-text-muted transition-colors">
                        <input
                            type="checkbox"
                            checked={test.shuffleQuestions || false}
                            onChange={(e) => handleChange('shuffleQuestions', e.target.checked)}
                            className="rounded border-input text-cta-primary focus:ring-cta-primary"
                        />
                        <span className="text-sm font-medium text-text-secondary">Shuffle Questions</span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Test Title</label>
                    <Input
                        value={test.title || ""}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="e.g., Mathematics Mock Test 1"
                        className="text-lg font-medium"
                    />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                    <textarea
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring transition-all min-h-[80px]"
                        value={test.description || ""}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Describe the syllabus or topics covered..."
                    />
                </div>

                {/* Duration & Marks */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Duration (minutes)</label>
                    <Input
                        type="number"
                        min={5}
                        value={test.duration || 60}
                        onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Total Marks</label>
                    <Input
                        type="number"
                        min={0}
                        value={test.totalMarks || 0}
                        onChange={(e) => handleChange('totalMarks', parseInt(e.target.value) || 0)}
                    />
                </div>

                {/* Tier 1: Subject */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Subject (Tier 1)</label>
                    {isAddingSubject ? (
                        <div className="flex gap-2">
                            <Input
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                placeholder="Enter new subject name..."
                                className="flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddNewSubject();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleAddNewSubject}
                                className="px-4 py-2 bg-cta-primary text-white text-sm font-medium rounded-lg hover:bg-cta-hover transition-colors"
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddingSubject(false)}
                                className="px-4 py-2 bg-surface-base text-text-secondary border border-border text-sm font-medium rounded-lg hover:text-text-primary transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <select
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
                            value={test.subject || ""}
                            onChange={(e) => {
                                if (e.target.value === 'ADD_NEW') {
                                    setIsAddingSubject(true);
                                } else {
                                    handleChange('subject', e.target.value);
                                }
                            }}
                        >
                            <option value="">Select a Subject...</option>
                            <option value="ADD_NEW">+ Add New Subject</option>
                            <optgroup label="Subjects">
                                {/* Include selected subject if it's not in the common list */}
                                {test.subject && !commonSubjects.includes(test.subject) && (
                                    <option value={test.subject}>{test.subject}</option>
                                )}
                                {commonSubjects.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </optgroup>
                        </select>
                    )}
                </div>

                {/* Primary Stream */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Primary Stream</label>
                    <select
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
                        value={test.stream || ""}
                        onChange={(e) => handleChange('stream', e.target.value)}
                    >
                        <option value="">Select Stream...</option>
                        <option value="Science">Science</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Humanities">Humanities</option>
                        <option value="Language">Language</option>
                        <option value="General Test">General Test</option>
                    </select>
                </div>

                {/* Tier 2 & Tier 3 Categories */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Type (Tier 2)</label>
                    <select
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
                        value={test.tier2Category || "Mock"}
                        onChange={(e) => handleChange('tier2Category', e.target.value)}
                    >
                        <option value="Mock">Mock Test</option>
                        <option value="PYQ">Previous Year Paper (PYQ)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Format (Tier 3)</label>
                    <select
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
                        value={test.tier3Category || "Full Mock"}
                        onChange={(e) => handleChange('tier3Category', e.target.value)}
                    >
                        <option value="Full Mock">Full Mock</option>
                        <option value="Chapterwise">Chapterwise</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Difficulty</label>
                    <select
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
                        value={test.difficulty || "Medium"}
                        onChange={(e) => handleChange('difficulty', e.target.value)}
                    >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                {/* Streams */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Target Streams</label>
                    <div className="flex flex-wrap gap-2">
                        {['Science', 'Commerce', 'Humanities', 'General', 'English'].map(stream => {
                            const isSelected = Array.isArray(test.streams) ? test.streams.includes(stream) : test.streams === stream;
                            return (
                                <button
                                    key={stream}
                                    type="button"
                                    onClick={() => handleStreamToggle(stream)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${isSelected
                                        ? 'bg-cta-primary/10 text-cta-primary border-cta-primary/30'
                                        : 'bg-transparent text-text-secondary border-border hover:border-text-muted hover:text-text-primary'
                                        }`}
                                >
                                    {stream}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
