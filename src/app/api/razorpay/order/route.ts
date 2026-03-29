import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
    const hasId = !!process.env.RAZORPAY_KEY_ID;
    const hasSecret = !!process.env.RAZORPAY_KEY_SECRET;

    if (!hasId || !hasSecret) {
        console.error(`Razorpay Keys Missing! ID present: ${hasId}, Secret present: ${hasSecret}`);
        return NextResponse.json({ 
            error: `Server Configuration Error: Razorpay Keys Missing. (ID present: ${hasId}, Secret present: ${hasSecret})` 
        }, { status: 500 });
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    try {
        const body = await req.json();
        const { packageId, amount, credits } = body;

        console.log("Creating Razorpay order for package:", packageId, "Amount:", amount);

        if (!packageId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay accepts amount in paise
            currency: "INR",
            receipt: `rcpt_${packageId}_${Date.now()}`.substring(0, 40),
            notes: { packageId: packageId, credits: credits }
        };

        const order = await razorpay.orders.create(options);
        console.log("Razorpay Order Created:", order.id);

        return NextResponse.json(order);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error creating Razorpay order:", error);
        // Log specific Razorpay error details if available
        if (error.error) {
            console.error("Razorpay Error Details:", JSON.stringify(error.error, null, 2));
        }
        return NextResponse.json({
            error: "Failed to create order",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
