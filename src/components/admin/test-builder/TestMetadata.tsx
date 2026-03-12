import React from "react";
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

    const handleStreamToggle = (stream: string) => {
        const current = test.streams || [];
        const updated = current.includes(stream)
            ? current.filter(s => s !== stream)
            : [...current, stream];
        handleChange('streams', updated);
    };

    return (
        <div className="bg-surface-card p-6 sm:p-8 rounded-2xl shadow-xl border border-white/5 space-y-8 relative overflow-hidden group">
            {/* Subtle top glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cta-primary/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col sm:flex-row justify-between border-b border-border/50 pb-4 items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-text-primary">Test Configuration</h2>
                <label className="flex items-center gap-2 cursor-pointer bg-surface p-2 rounded-lg border border-border">
                    <input
                        type="checkbox"
                        checked={test.shuffleQuestions || false}
                        onChange={(e) => handleChange('shuffleQuestions', e.target.checked)}
                        className="rounded border-input text-cta-primary focus:ring-cta-primary"
                    />
                    <span className="text-sm font-medium text-text-secondary">Shuffle Questions</span>
                </label>
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

                {/* Category & Difficulty */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                    <select
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
                        value={test.category || "Subject"}
                        onChange={(e) => handleChange('category', e.target.value)}
                    >
                        <option value="Subject">Subject Test</option>
                        <option value="General">General Test</option>
                        <option value="Full Mock">Full Mock</option>
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
                            const isSelected = test.streams?.includes(stream);
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

                {/* Pricing */}
                <div className="md:col-span-2 bg-surface-elevated p-4 rounded-lg border border-border">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Pricing Configuration</label>
                    <div className="flex flex-wrap gap-4 items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="price"
                                checked={test.price === 'free'}
                                onChange={() => handleChange('price', 'free')}
                            />
                            <span className="text-sm text-text-secondary">Free</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="price"
                                checked={test.price === 'paid'}
                                onChange={() => handleChange('price', 'paid')}
                            />
                            <span className="text-sm text-text-secondary">Paid</span>
                        </label>

                        {test.price === 'paid' && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                <span className="text-sm text-text-muted">Amount (₹):</span>
                                <Input
                                    type="number"
                                    min={0}
                                    className="w-32 h-9"
                                    value={test.priceAmount || 0}
                                    onChange={(e) => handleChange('priceAmount', parseFloat(e.target.value))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
