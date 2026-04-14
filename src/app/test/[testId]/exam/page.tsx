"use client";

import { useEffect, use } from 'react';
import { useExamEngine } from '@/hooks/useExamEngine';
import { ExamLayout } from '@/components/test/ExamLayout';
import { Loader2 } from 'lucide-react';

export default function ExamPage({ params }: { params: Promise<{ testId: string }> }) {
    const { testId } = use(params);
    const engine = useExamEngine(testId);

    // Prompt user to start test if they land here without starting
    useEffect(() => {
        if (!engine.loading && !engine.isTestStarted && !engine.error && engine.test) {
            engine.actions.startTest();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine.loading, engine.isTestStarted, engine.test, engine.error]);

    if (engine.error) {
        return (
            <div className="min-h-screen bg-[#E0E0E0] flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-red-500/20">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Blocked</h2>
                    <p className="text-gray-600 mb-6">{engine.error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    if (engine.loading || !engine.test) {
        return (
            <div className="min-h-screen bg-[#E0E0E0] flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600 font-medium">Loading Exam Content...</p>
            </div>
        );
    }

    if (!engine.isTestStarted) {
        return (
            <div className="min-h-screen bg-[#E0E0E0] flex flex-col items-center justify-center">
                <p className="text-gray-600 font-medium mb-4">Initializing Test Environment...</p>
            </div>
        );
    }

    return <ExamLayout engine={engine} />;
}
