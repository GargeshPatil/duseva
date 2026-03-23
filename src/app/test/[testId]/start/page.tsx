import React, { Suspense } from 'react';
import NTAInstructions from '@/components/test/NTAInstructions';

interface Props {
  params: Promise<{
    testId: string;
  }>;
}

export default async function InstructionsPage({ params }: Props) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading instructions...</div>}>
      <NTAInstructions testId={resolvedParams.testId} />
    </Suspense>
  );
}
