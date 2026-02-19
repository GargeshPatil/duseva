"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { firestoreService } from "@/services/firestoreService";
import { Test } from "@/types/admin";
import { Loader2, Search, Plus, FileText, Check } from "lucide-react";

interface AddToTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionIds: string[];
    onSuccess: () => void;
}

export function AddToTestModal({ isOpen, onClose, questionIds, onSuccess }: AddToTestModalProps) {
    const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
    const [isLoading, setIsLoading] = useState(false);

    // Existing Test State
    const [tests, setTests] = useState<Test[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
    const [loadingTests, setLoadingTests] = useState(false);

    // New Test State
    const [newTest, setNewTest] = useState({
        title: "",
        description: "",
        stream: "General",
        category: "Genera", // Typo fixed in render
        duration: 60,
        totalMarks: 100,
        difficulty: "Medium"
    });

    useEffect(() => {
        if (isOpen && activeTab === 'existing') {
            loadTests();
        }
    }, [isOpen, activeTab]);

    async function loadTests() {
        setLoadingTests(true);
        try {
            const data = await firestoreService.getTests();
            setTests(data);
        } catch (error) {
            console.error("Failed to load tests", error);
        } finally {
            setLoadingTests(false);
        }
    }

    const filteredTests = tests.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    async function handleAddToExisting() {
        if (!selectedTestId) return;
        setIsLoading(true);
        try {
            await firestoreService.addQuestionsToTest(selectedTestId, questionIds);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to add to test", error);
            alert("Failed to add questions to test.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateAndAdd() {
        if (!newTest.title) return;
        setIsLoading(true);
        try {
            // 1. Create Test
            const testId = await firestoreService.createTest({
                ...newTest,
                category: newTest.category as any,
                difficulty: newTest.difficulty as any,
                streams: [newTest.stream]
            });

            if (testId) {
                // 2. Add Questions
                await firestoreService.addQuestionsToTest(testId, questionIds);
                onSuccess();
                onClose();
            } else {
                throw new Error("Failed to create test");
            }
        } catch (error) {
            console.error("Failed to create and add", error);
            alert("Failed to create test.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add {questionIds.length} Questions to Test</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mb-4 border-b border-slate-100 pb-2">
                    <button
                        onClick={() => setActiveTab('existing')}
                        className={`flex-1 pb-2 text-sm font-medium transition-colors ${activeTab === 'existing'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        Existing Test
                    </button>
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`flex-1 pb-2 text-sm font-medium transition-colors ${activeTab === 'new'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        Create New Test
                    </button>
                </div>

                {activeTab === 'existing' && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search tests..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="h-60 overflow-y-auto border rounded-md divide-y">
                            {loadingTests ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                </div>
                            ) : filteredTests.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-500">No tests found.</div>
                            ) : (
                                filteredTests.map(test => (
                                    <div
                                        key={test.id}
                                        onClick={() => setSelectedTestId(test.id)}
                                        className={`p-3 cursor-pointer hover:bg-slate-50 flex items-center justify-between ${selectedTestId === test.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                            }`}
                                    >
                                        <div>
                                            <p className="font-medium text-sm text-slate-900">{test.title}</p>
                                            <p className="text-xs text-slate-500">{test.questions?.length || 0} questions • {test.streams?.join(", ")}</p>
                                        </div>
                                        {selectedTestId === test.id && <Check className="h-4 w-4 text-blue-600" />}
                                    </div>
                                ))
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button
                                onClick={handleAddToExisting}
                                disabled={!selectedTestId || isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to Test"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {activeTab === 'new' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Test Title</label>
                            <Input
                                value={newTest.title}
                                onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                                placeholder="e.g. Physics Chapter 1 Quiz"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stream</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                                    value={newTest.stream}
                                    onChange={(e) => setNewTest({ ...newTest, stream: e.target.value })}
                                >
                                    <option value="General">General</option>
                                    <option value="Science">Science</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Humanities">Humanities</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                                    value={newTest.category}
                                    onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
                                >
                                    <option value="General">General Test</option>
                                    <option value="Subject">Subject Test</option>
                                    <option value="Full Mock">Full Mock</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (Optional)</label>
                            <Input
                                value={newTest.description}
                                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                                placeholder="Short description..."
                            />
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button
                                onClick={handleCreateAndAdd}
                                disabled={!newTest.title || isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create & Add"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
