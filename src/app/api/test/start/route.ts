import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { testId, userId, durationMinutes } = body;

        if (!testId || !userId || typeof durationMinutes !== 'number') {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userRef = adminDb.collection("users").doc(userId);
        const attemptsRef = adminDb.collection("testAttempts");

        // First, check if there's an ALREADY active attempt
        const existingAttemptQuery = await attemptsRef
            .where("userId", "==", userId)
            .where("testId", "==", testId)
            .where("status", "==", "in_progress")
            .limit(1)
            .get();

        if (!existingAttemptQuery.empty) {
            console.log("Resuming existing attempt:", existingAttemptQuery.docs[0].id);
            return NextResponse.json({ success: true, attemptId: existingAttemptQuery.docs[0].id });
        }

        // Run transaction to ensure atomicity of credit deduction and attempt creation
        const attemptId = await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error("User not found");
            }

            const userData = userDoc.data();
            const currentCredits = userData?.credits || 0;

            if (currentCredits < 1) {
                throw new Error("Insufficient credits");
            }

            // Decrement credit
            transaction.update(userRef, {
                credits: FieldValue.increment(-1)
            });

            // Create new attempt document
            const newAttemptRef = attemptsRef.doc();
            const newAttempt = {
                userId,
                testId,
                startTime: new Date().toISOString(),
                answers: {},
                timeRemaining: durationMinutes * 60,
                status: 'in_progress',
                currentQuestionIndex: 0,
                questionStatus: {}
            };

            transaction.set(newAttemptRef, newAttempt);

            return newAttemptRef.id;
        });

        return NextResponse.json({ success: true, attemptId });

    } catch (error: any) {
        console.error("Error starting test securely:", error);
        if (error.message === "Insufficient credits") {
            return NextResponse.json({ error: "Insufficient credits", code: "INSUFFICIENT_CREDITS" }, { status: 403 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
