import React from "react";
import { Input } from "@/components/ui/Input";
import { Test } from "@/types/admin";

interface TestMetadataProps {
    test: Partial<Test>;
    onChange: (updated: Partial<Test>) => void;
}

export function TestMetadata({ test, onChange }: TestMetadataProps) {
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 className space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-100 pb-2">Test Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Test Title</label>
                    <Input
                        value={test.title || ""}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="e.g., Mathematics Mock Test 1"
                        className="text-lg font-medium"
                    />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[80px]"
                        value={test.description || ""}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Describe the syllabus or topics covered..."
                    />
                </div>

                {/* Duration & Marks */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                    <Input
                        type="number"
                        min={5}
                        value={test.duration || 60}
                        onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Marks</label>
                    <Input
                        type="number"
                        min={0}
                        value={test.totalMarks || 0}
                        onChange={(e) => handleChange('totalMarks', parseInt(e.target.value) || 0)}
                    />
                </div>

                {/* Category & Difficulty */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={test.category || "Subject"}
                        onChange={(e) => handleChange('category', e.target.value)}
                    >
                        <option value="Subject">Subject Test</option>
                        <option value="General">General Test</option>
                        <option value="Full Mock">Full Mock</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                    <select
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Target Streams</label>
                    <div className="flex flex-wrap gap-2">
                        {['Science', 'Commerce', 'Humanities', 'General', 'English'].map(stream => {
                            const isSelected = test.streams?.includes(stream);
                            return (
                                <button
                                    key={stream}
                                    type="button"
                                    onClick={() => handleStreamToggle(stream)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${isSelected
                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {stream}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Pricing */}
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pricing Configuration</label>
                    <div className="flex flex-wrap gap-4 items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="price"
                                checked={test.price === 'free'}
                                onChange={() => handleChange('price', 'free')}
                            />
                            <span className="text-sm text-slate-700">Free</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="price"
                                checked={test.price === 'paid'}
                                onChange={() => handleChange('price', 'paid')}
                            />
                            <span className="text-sm text-slate-700">Paid</span>
                        </label>

                        {test.price === 'paid' && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                <span className="text-sm text-slate-500">Amount (₹):</span>
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
