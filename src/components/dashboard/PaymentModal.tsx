import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import { Test } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import Script from "next/script";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    test: Test;
    onUnlock?: () => void;
}

export function PaymentModal({ isOpen, onClose, test, onUnlock }: PaymentModalProps) {
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        if (!user) return;
        setIsProcessing(true);
        try {
            // 1. Create Order
            const response = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testId: test.id, amount: test.priceAmount || 99 })
            });

            const order = await response.json();

            if (order.error) {
                console.error("Order creation failed:", order.error);
                alert("Failed to initiate payment. Please try again.");
                setIsProcessing(false);
                return;
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "CUET Mock Platform",
                description: `Unlock ${test.title}`,
                order_id: order.id,
                handler: async function (response: any) {
                    console.log("Payment Successful", response);

                    // 3. Verify Payment
                    const verifyResponse = await fetch('/api/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            testId: test.id,
                            userId: user.uid,
                            amount: test.priceAmount || 99
                        })
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyData.success) {
                        onUnlock?.();
                        onClose();
                    } else {
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user.displayName || "",
                    email: user.email || "",
                },
                theme: {
                    color: "#F59E0B" // Amber-500
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                alert(response.error.description);
                console.error("Payment Failed:", response.error);
            });
            rzp1.open();

        } catch (error) {
            console.error("Payment Error:", error);
            alert("An unexpected error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-amber-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Unlock Premium Test</DialogTitle>
                    <DialogDescription className="text-center">
                        Get full access to "{test.title}" and detailed analysis.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <div className="text-center mb-6">
                        <span className="text-3xl font-bold text-slate-900">₹{test.priceAmount || 99}</span>
                        <span className="text-slate-500 ml-2 line-through">₹199</span>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-medium text-slate-900 mb-2">What's included:</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Full exam simulation ({test.duration} mins)
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Detailed solutions & explanations
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Performance analysis & rank
                            </li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-3">
                    <Button
                        onClick={handlePayment}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : `Unlock Now • ₹${test.priceAmount || 99}`}
                    </Button>

                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mt-2">
                        <ShieldCheck className="h-3 w-3" />
                        Secure Payment via Razorpay
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
