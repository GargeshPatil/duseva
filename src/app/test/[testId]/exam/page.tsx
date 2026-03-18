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
        if (!engine.loading && !engine.isTestStarted && engine.test) {
            engine.actions.startTest();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine.loading, engine.isTestStarted, engine.test]);

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
