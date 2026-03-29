import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId, credits, userId, amount } = body;

        console.log("Verifying payment for Order:", razorpay_order_id);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !packageId || !credits) {
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

        const userRef = adminDb.collection("users").doc(userId);

        await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error("User does not exist!");
            }

            const userData = userDoc.data();
            const currentCredits = userData?.credits || 0;
            const currentTotalPurchased = userData?.totalCreditsPurchased || 0;
            const creditsToAdd = Number(credits);

            transaction.update(userRef, {
                credits: currentCredits + creditsToAdd,
                totalCreditsPurchased: currentTotalPurchased + creditsToAdd
            });

            const paymentRef = adminDb.collection("payments").doc();
            transaction.set(paymentRef, {
                userId: userId,
                packageId: packageId,
                creditsAdded: creditsToAdd,
                amount: amount,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: "completed",
                createdAt: Timestamp.now(),
                method: "razorpay"
            });
        });

        console.log("Firestore Updated Successfully");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
