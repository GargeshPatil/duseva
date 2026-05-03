"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, Pencil, ChevronUp } from "lucide-react";

// --- Types ---
export type ImportantDateItem = { id: string; date: string; title: string; description: string; type: 'exam' | 'registration' | 'result' | 'other' };
export type CMSTopic = { title: string; subtopics: string[] };
export type SyllabusSubject = { id: string; subject: string; domain: string; topics: CMSTopic[]; difficulty: 'easy' | 'medium' | 'hard' };
export type StrategyStep = { id: string; title: string; description: string; icon: string };
export type CollegeTier = { id: string; tier: string; description: string; colleges: string[] };

// Helper to safely parse JSON
const safelyParseJSON = <T,>(json: string, fallback: T): T => {
    try {
        return JSON.parse(json) as T;
    } catch (e) {
        return fallback;
    }
};

const generateId = () => Math.random().toString(36).substring(2, 9);

// --- Important Dates Editor ---
export function ImportantDatesEditor({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled: boolean }) {
    const items: ImportantDateItem[] = safelyParseJSON(value, []);

    const updateItem = (index: number, updates: Partial<ImportantDateItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onChange(JSON.stringify(newItems));
    };

    const addItem = () => {
        const newItems = [...items, { id: generateId(), date: "", title: "", description: "", type: "other" as const }];
        onChange(JSON.stringify(newItems));
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(JSON.stringify(newItems));
    };

    return (
        <div className="space-y-4">
            {items.map((item, i) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative flex gap-4">
                    <button disabled={disabled} onClick={() => removeItem(i)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Date/Time</label>
                                <Input disabled={disabled} value={item.date} onChange={e => updateItem(i, { date: e.target.value })} placeholder="e.g. Feb 15, 2026" className="mt-1" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Title</label>
                                <Input disabled={disabled} value={item.title} onChange={e => updateItem(i, { title: e.target.value })} placeholder="e.g. Registration Opens" className="mt-1" />
                            </div>
                            <div className="w-1/4">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Type</label>
                                <select disabled={disabled} value={item.type} onChange={e => updateItem(i, { type: e.target.value as any })} className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="registration">Registration</option>
                                    <option value="exam">Exam</option>
                                    <option value="result">Result</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                            <textarea disabled={disabled} value={item.description} onChange={e => updateItem(i, { description: e.target.value })} placeholder="Short description of the event..." className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />
                        </div>
                    </div>
                </div>
            ))}
            <Button disabled={disabled} onClick={addItem} variant="outline" size="sm" className="w-full border-dashed"><Plus className="h-4 w-4 mr-2" /> Add Date</Button>
        </div>
    );
}

// --- Syllabus Editor ---
export function SyllabusEditor({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled: boolean }) {
    const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

    let baseItems = safelyParseJSON<any[]>(value, []);
    const items: SyllabusSubject[] = Array.isArray(baseItems) ? baseItems.map(item => {
        if (item.coreTopics && !item.topics) {
            return { ...item, topics: item.coreTopics.map((t: string) => ({ title: t, subtopics: [] })) };
        }
        return { ...item, topics: item.topics || [] };
    }) : [];

    const updateItem = (index: number, updates: Partial<SyllabusSubject>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onChange(JSON.stringify(newItems));
    };

    const addItem = () => {
        const newItems = [...items, { id: generateId(), subject: "", domain: "Commerce", topics: [{ title: "", subtopics: [] }], difficulty: "medium" as const }];
        onChange(JSON.stringify(newItems));
        setExpandedIndex(newItems.length - 1);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(JSON.stringify(newItems));
        if (expandedIndex === index) setExpandedIndex(null);
        else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1);
    };

    const updateTopicTitle = (subjectIdx: number, topicIdx: number, title: string) => {
        const newItems = [...items];
        newItems[subjectIdx].topics[topicIdx].title = title;
        onChange(JSON.stringify(newItems));
    };

    const updateTopicSubtopics = (subjectIdx: number, topicIdx: number, subtopicsStr: string) => {
        const newItems = [...items];
        newItems[subjectIdx].topics[topicIdx].subtopics = subtopicsStr.split(',').map(s => s.trim()).filter(Boolean);
        onChange(JSON.stringify(newItems));
    };

    const addTopic = (subjectIdx: number) => {
        const newItems = [...items];
        newItems[subjectIdx].topics.push({ title: "", subtopics: [] });
        onChange(JSON.stringify(newItems));
    };

    const removeTopic = (subjectIdx: number, topicIdx: number) => {
        const newItems = [...items];
        newItems[subjectIdx].topics = newItems[subjectIdx].topics.filter((_, i) => i !== topicIdx);
        onChange(JSON.stringify(newItems));
    };

    const DOMAIN_BADGE: Record<string, string> = {
        Commerce: 'bg-blue-50 text-blue-600 border-blue-200',
        Science: 'bg-green-50 text-green-600 border-green-200',
        Humanities: 'bg-purple-50 text-purple-600 border-purple-200',
        Language: 'bg-amber-50 text-amber-600 border-amber-200',
        'General Test': 'bg-slate-100 text-slate-600 border-slate-200',
        Vocational: 'bg-rose-50 text-rose-600 border-rose-200',
    };

    const DIFF_COLOR: Record<string, string> = {
        easy: 'text-emerald-600', medium: 'text-amber-600', hard: 'text-red-600',
    };

    return (
        <div className="space-y-2">
            {items.map((item, i) => {
                const isExpanded = expandedIndex === i;
                const domainClass = DOMAIN_BADGE[item.domain] || 'bg-slate-100 text-slate-600 border-slate-200';
                const hasEmptySubject = !item.subject?.trim();

                return (
                    <div
                        key={item.id}
                        className={`border rounded-lg overflow-hidden transition-colors ${
                            isExpanded ? 'border-blue-300 bg-white' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        }`}
                    >
                        {/* Collapsed row */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
                                {hasEmptySubject ? (
                                    <span className="text-sm text-slate-400 italic">Untitled subject</span>
                                ) : (
                                    <span className="text-sm font-semibold text-slate-800 truncate">{item.subject}</span>
                                )}
                                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${domainClass}`}>
                                    {item.domain}
                                </span>
                                <span className={`shrink-0 text-[10px] font-semibold hidden sm:inline ${DIFF_COLOR[item.difficulty] || 'text-slate-500'}`}>
                                    {item.difficulty}
                                </span>
                                <span className="shrink-0 text-[10px] text-slate-400 hidden sm:inline">
                                    {item.topics.length} topic{item.topics.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    disabled={disabled}
                                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                                    title={isExpanded ? 'Collapse' : 'Edit this subject'}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        isExpanded
                                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isExpanded ? <><ChevronUp className="h-3.5 w-3.5" /> Done</> : <><Pencil className="h-3.5 w-3.5" /> Edit</>}
                                </button>
                                <button
                                    disabled={disabled}
                                    onClick={() => removeItem(i)}
                                    title="Delete subject"
                                    className={`p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Expanded edit panel */}
                        {isExpanded && (
                            <div className="border-t border-slate-200 p-4 space-y-4 bg-white">
                                {hasEmptySubject && (
                                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                        <span className="font-semibold">⚠ Subject name is required before saving.</span>
                                    </div>
                                )}
                                <div className="flex gap-2 flex-wrap">
                                    <div className="flex-1 min-w-[160px]">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Subject Name *</label>
                                        <Input disabled={disabled} value={item.subject} onChange={e => updateItem(i, { subject: e.target.value })} placeholder="e.g. Accountancy" className="mt-1" />
                                    </div>
                                    <div className="w-36">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Domain</label>
                                        <select disabled={disabled} value={item.domain} onChange={e => updateItem(i, { domain: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="Commerce">Commerce</option>
                                            <option value="Science">Science</option>
                                            <option value="Humanities">Humanities</option>
                                            <option value="Language">Language</option>
                                            <option value="General Test">General Test</option>
                                            <option value="Vocational">Vocational</option>
                                        </select>
                                    </div>
                                    <div className="w-28">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Difficulty</label>
                                        <select disabled={disabled} value={item.difficulty} onChange={e => updateItem(i, { difficulty: e.target.value as any })} className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Detailed Topics</label>
                                    <div className="space-y-3 mt-2">
                                        {item.topics.map((topic, tIdx) => (
                                            <div key={tIdx} className="flex gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg">
                                                <div className="flex-1 space-y-2">
                                                    <Input disabled={disabled} value={topic.title} onChange={e => updateTopicTitle(i, tIdx, e.target.value)} placeholder="Topic name (e.g. Algebra)" className="h-9 text-sm font-semibold" />
                                                    <textarea
                                                        disabled={disabled}
                                                        value={topic.subtopics.join(', ')}
                                                        onChange={e => updateTopicSubtopics(i, tIdx, e.target.value)}
                                                        placeholder="Subtopics (comma-separated)..."
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 min-h-[40px] resize-y"
                                                    />
                                                </div>
                                                <Button disabled={disabled} onClick={() => removeTopic(i, tIdx)} variant="outline" className="h-9 w-9 p-0 shrink-0 text-slate-400 hover:text-red-500 border-slate-200 shadow-none mt-0"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        ))}
                                        <Button disabled={disabled} onClick={() => addTopic(i)} variant="ghost" size="sm" className="h-8 text-xs"><Plus className="h-3 w-3 mr-1" /> Add Topic</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            <Button
                disabled={disabled || items.some(item => !item.subject?.trim())}
                onClick={addItem}
                variant="outline"
                size="sm"
                className="w-full border-dashed"
            >
                <Plus className="h-4 w-4 mr-2" /> Add Subject
            </Button>
        </div>
    );
}

// --- Strategy Editor ---
export function StrategyEditor({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled: boolean }) {
    const items: StrategyStep[] = safelyParseJSON(value, []);

    const updateItem = (index: number, updates: Partial<StrategyStep>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onChange(JSON.stringify(newItems));
    };

    const addItem = () => {
        const newItems = [...items, { id: generateId(), title: "", description: "", icon: "Target" }];
        onChange(JSON.stringify(newItems));
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(JSON.stringify(newItems));
    };

    return (
        <div className="space-y-4">
            {items.map((item, i) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative">
                    <button disabled={disabled} onClick={() => removeItem(i)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="space-y-3 pr-8">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Step Title</label>
                                <Input disabled={disabled} value={item.title} onChange={e => updateItem(i, { title: e.target.value })} placeholder="e.g. Master the Syllabus" className="mt-1" />
                            </div>
                            <div className="w-1/3">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Icon Name</label>
                                <Input disabled={disabled} value={item.icon} onChange={e => updateItem(i, { icon: e.target.value })} placeholder="e.g. Target, Book, Layout" className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                            <textarea disabled={disabled} value={item.description} onChange={e => updateItem(i, { description: e.target.value })} placeholder="Detailed strategy..." className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />
                        </div>
                    </div>
                </div>
            ))}
            <Button disabled={disabled} onClick={addItem} variant="outline" size="sm" className="w-full border-dashed"><Plus className="h-4 w-4 mr-2" /> Add Strategy Step</Button>
        </div>
    );
}

// --- College Preferences Editor ---
export function CollegeTierEditor({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled: boolean }) {
    const items: CollegeTier[] = safelyParseJSON(value, []);

    const updateItem = (index: number, updates: Partial<CollegeTier>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onChange(JSON.stringify(newItems));
    };

    const addItem = () => {
        const newItems = [...items, { id: generateId(), tier: "", description: "", colleges: [""] }];
        onChange(JSON.stringify(newItems));
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(JSON.stringify(newItems));
    };

    const updateCollege = (tierIdx: number, collegeIdx: number, val: string) => {
        const newItems = [...items];
        newItems[tierIdx].colleges[collegeIdx] = val;
        onChange(JSON.stringify(newItems));
    };

    const addCollege = (tierIdx: number) => {
        const newItems = [...items];
        newItems[tierIdx].colleges.push("");
        onChange(JSON.stringify(newItems));
    };

    const removeCollege = (tierIdx: number, collegeIdx: number) => {
        const newItems = [...items];
        newItems[tierIdx].colleges = newItems[tierIdx].colleges.filter((_, i) => i !== collegeIdx);
        onChange(JSON.stringify(newItems));
    };

    return (
        <div className="space-y-4">
            {items.map((item, i) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative">
                    <button disabled={disabled} onClick={() => removeItem(i)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="space-y-3 pr-8">
                        <div className="flex gap-2">
                            <div className="w-1/3">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Tier / Category</label>
                                <Input disabled={disabled} value={item.tier} onChange={e => updateItem(i, { tier: e.target.value })} placeholder="e.g. Tier 1 North Campus" className="mt-1" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                                <Input disabled={disabled} value={item.description} onChange={e => updateItem(i, { description: e.target.value })} placeholder="e.g. Top colleges requiring 780+ score" className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Colleges list</label>
                            <div className="space-y-2 mt-1">
                                {item.colleges.map((college, cIdx) => (
                                    <div key={cIdx} className="flex gap-2">
                                        <Input disabled={disabled} value={college} onChange={e => updateCollege(i, cIdx, e.target.value)} placeholder="College Name (e.g. SRCC)" className="flex-1 h-8 text-sm" />
                                        <Button disabled={disabled} onClick={() => removeCollege(i, cIdx)} variant="outline" className="h-8 w-8 p-0 shrink-0 text-slate-400 hover:text-red-500 border-none bg-transparent shadow-none"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                <Button disabled={disabled} onClick={() => addCollege(i)} variant="ghost" size="sm" className="h-8 text-xs"><Plus className="h-3 w-3 mr-1" /> Add College</Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <Button disabled={disabled} onClick={addItem} variant="outline" size="sm" className="w-full border-dashed"><Plus className="h-4 w-4 mr-2" /> Add College Tier</Button>
        </div>
    );
}

// --- Image Array Editor (For Student Stories / Wall of Love) ---
export type ImageItem = { id: string; url: string; altText: string; name?: string; college?: string; };

export function ImageArrayEditor({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled: boolean }) {
    const items: ImageItem[] = safelyParseJSON(value, []);

    const updateItem = (index: number, updates: Partial<ImageItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onChange(JSON.stringify(newItems));
    };

    const addItem = () => {
        const newItems = [...items, { id: generateId(), url: "", altText: "" }];
        onChange(JSON.stringify(newItems));
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(JSON.stringify(newItems));
    };

    return (
        <div className="space-y-4">
            {items.map((item, i) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative flex gap-4 items-center">
                    {item.url ? (
                        <div className="h-16 w-16 bg-slate-200 rounded-lg overflow-hidden shrink-0 border border-slate-300">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.url} alt="Preview" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=Invalid')} />
                        </div>
                    ) : (
                        <div className="h-16 w-16 bg-slate-200 rounded-lg flex items-center justify-center shrink-0 border border-slate-300 text-slate-400 text-xs text-center p-1">
                            No Image
                        </div>
                    )}

                    <button disabled={disabled} onClick={() => removeItem(i)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex-1 space-y-3 pr-6">
                        <div className="flex gap-2">
                            <div className="w-1/3">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Image URL</label>
                                <Input disabled={disabled} value={item.url} onChange={e => updateItem(i, { url: e.target.value })} placeholder="https://..." className="mt-1" />
                            </div>
                            <div className="w-1/3">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Name</label>
                                <Input disabled={disabled} value={item.name || item.altText} onChange={e => updateItem(i, { name: e.target.value, altText: e.target.value })} placeholder="e.g. Rahul" className="mt-1" />
                            </div>
                            <div className="w-1/3">
                                <label className="text-xs font-semibold text-slate-500 uppercase">College</label>
                                <Input disabled={disabled} value={item.college || ''} onChange={e => updateItem(i, { college: e.target.value })} placeholder="e.g. SRCC" className="mt-1" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <Button disabled={disabled} onClick={addItem} variant="outline" size="sm" className="w-full border-dashed"><Plus className="h-4 w-4 mr-2" /> Add Image</Button>
        </div>
    );
}

// --- Export a mapping for the CMS page to use ---
export const STRUCTURED_EDITORS: Record<string, React.FC<{ value: string, onChange: (v: string) => void, disabled: boolean }>> = {
    'important_dates_content': ImportantDatesEditor,
    'syllabus_content': SyllabusEditor,
    'exam_strategy_content': StrategyEditor,
    'college_preferences_content': CollegeTierEditor,
    'student_stories': ImageArrayEditor
};
