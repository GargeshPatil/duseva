"use client";

import { useEffect } from 'react';
import { useShowcaseEngine } from '@/hooks/useShowcaseEngine';
import { ExamLayout } from '@/components/test/ExamLayout';
import { Loader2 } from 'lucide-react';

export default function ShowcaseTestPage() {
    const engine = useShowcaseEngine();

    // Prompt user to start test if they land here without starting
    useEffect(() => {
        if (!engine.loading && !engine.isTestStarted && engine.test) {
            engine.actions.startTest();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine.loading, engine.isTestStarted, engine.test]);

    if (engine.loading || !engine.test) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-cta-primary mb-4" />
                <p className="font-medium text-white/50">Fetching your showcase test...</p>
            </div>
        );
    }

    if (!engine.isTestStarted) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <p className="text-white/50 font-medium mb-4">Initializing Test Environment...</p>
            </div>
        );
    }

    return <ExamLayout engine={engine} />;
}
