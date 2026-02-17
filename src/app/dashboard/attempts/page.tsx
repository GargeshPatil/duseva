"use client";

import { useEffect, useState } from "react";
import { firestoreService } from "@/services/firestoreService";
import { Test, TestAttempt } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FileText, ArrowRight, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function MyAttemptsPage() {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState<TestAttempt[]>([]);
    const [tests, setTests] = useState<Record<string, Test>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!user) return;
            try {
                // Fetch attempts
                const userAttempts = await firestoreService.getUserAttempts(user.uid);
                setAttempts(userAttempts);

                // Fetch related test details for titles
                // Optimize: only fetch unique testIds locally or assume we have a test cache if feasible. 
                // For now, simple parallel fetch for unique IDs.
                const uniqueTestIds = Array.from(new Set(userAttempts.map(a => a.testId)));
                const testPromises = uniqueTestIds.map(id => firestoreService.getTest(id));
                const testsData = await Promise.all(testPromises);

                const testMap: Record<string, Test> = {};
                testsData.forEach(t => {
                    if (t) testMap[t.id] = t;
                });
                setTests(testMap);

            } catch (error) {
                console.error("Error loading attempts:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-slate-400">Loading attempts...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Attempts</h1>
                <p className="text-slate-500">Track your progress and review past performance.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {attempts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Test Name</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Accuracy</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attempts.map((attempt) => {
                                    const test = tests[attempt.testId];
                                    const date = new Date(attempt.startTime).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'short', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    });

                                    return (
                                        <tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {test?.title || 'Unknown Test'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {date}
                                            </td>
                                            <td className="px-6 py-4">
                                                {attempt.status === 'completed' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                        <Clock className="h-3 w-3" />
                                                        In Progress
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {attempt.resultData?.score ?? '-'}
                                                <span className="text-slate-400 font-normal text-xs ml-1">
                                                    / {test?.totalMarks}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {attempt.resultData?.accuracy ? `${attempt.resultData.accuracy}%` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {attempt.status === 'completed' ? (
                                                    <Link href={`/dashboard/analysis/${attempt.testId}`}>
                                                        <Button size="sm" variant="ghost" className="text-slate-600 hover:text-primary">
                                                            Analysis <ArrowRight className="h-4 w-4 ml-1" />
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Link href={`/test/${attempt.testId}`}>
                                                        <Button size="sm" variant="primary" className="h-8">
                                                            Resume
                                                        </Button>
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-16 px-6">
                        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-medium mb-1">No attempts yet</h3>
                        <p className="text-slate-500 text-sm mb-6">Start your first mock test to see performance history.</p>
                        <Link href="/dashboard/tests">
                            <Button variant="primary">Browse Tests</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
