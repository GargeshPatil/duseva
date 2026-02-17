import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, testId, userId, amount } = body;

        console.log("Verifying payment for Order:", razorpay_order_id);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !testId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET!;
        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            console.error("Invalid payment signature");
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        console.log("Payment Verified Successfully. Updating Firestore...");

        // 1. Update user's purchasedTests
        const userRef = adminDb.collection("users").doc(userId);

        // Optimistic update for purchasedTests map
        // We use set with merge: true to avoid overwriting other fields
        // The key is the testId, value can be anything (e.g., true, purchase date, or full object)
        // Using `purchaseDate: Timestamp.now()` as the value for better data
        await userRef.set({
            purchasedTests: {
                [testId]: {
                    purchaseDate: Timestamp.now(),
                    transactionId: razorpay_payment_id,
                    amount: amount
                }
            }
        }, { merge: true });

        // 2. Create a record in 'payments' collection
        await adminDb.collection("payments").add({
            userId: userId,
            testId: testId,
            amount: amount,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: "completed",
            createdAt: Timestamp.now(),
            method: "razorpay"
        });

        console.log("Firestore Updated Successfully");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
