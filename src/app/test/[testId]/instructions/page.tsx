import React from 'react';
import NTAInstructions from '@/components/test/NTAInstructions';

interface Props {
  params: Promise<{
    testId: string;
  }>;
}

export default async function InstructionsPage({ params }: Props) {
  const resolvedParams = await params;
  return <NTAInstructions testId={resolvedParams.testId} />;
}
