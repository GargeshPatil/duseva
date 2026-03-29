import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const revalidate = 600; // Cache this route for 10 minutes

export async function GET() {
    try {
        const testsRef = adminDb.collection('tests');
        
        // Fetch all published and visible tests
        // In a very large DB we might use more advanced random selection, 
        // but for now fetching all visible/published and picking one in memory is fine and cached.
        const snapshot = await testsRef
            .where('status', '==', 'published')
            .where('isVisible', '==', true)
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ error: 'No showcase tests available' }, { status: 404 });
        }

        const tests = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        
        // Pick exactly 1 random test
        const randomIndex = Math.floor(Math.random() * tests.length);
        const selectedTest = tests[randomIndex] as any;

        const originalId = selectedTest.id;
        const showcaseId = `showcase_${originalId}`;

        // Fetch questions for this test
        let questionsSnapshot;
        if (selectedTest.questionIds && selectedTest.questionIds.length > 0) {
            const batches = [];
            // Firestore 'in' has a max of 30, so chunk it
            for (let i = 0; i < selectedTest.questionIds.length; i += 30) {
                const chunk = selectedTest.questionIds.slice(i, i + 30);
                batches.push(adminDb.collection('questions').where('__name__', 'in', chunk).get());
            }
            const results = await Promise.all(batches);
            let combinedDocs: any[] = [];
            results.forEach((res: any) => combinedDocs.push(...res.docs));
            questionsSnapshot = { docs: combinedDocs };
        } else {
            // Fallback to testId query
            questionsSnapshot = await adminDb.collection('questions').where('testId', '==', originalId).get();
        }

        const questions = questionsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

        // Transform test details to disguise it as 'showcase'
        const showcaseTest = {
            ...selectedTest,
            id: showcaseId,
            originalTestId: originalId,
            isShowcase: true,
            // Optionally, strip sensitive config fields
        };

        // We do NOT strip correct answers here because the client-side useShowcaseEngine 
        // needs them to compute the final score in memory for the limited analysis.
        // The results page will block access to seeing those answers.

        return NextResponse.json({
            test: showcaseTest,
            questions: questions
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
            }
        });

    } catch (error) {
        console.error("Showcase Test API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch showcase test' }, { status: 500 });
    }
}
