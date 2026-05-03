"use client";

import { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { CreditPackage } from "@/types/admin";
import { motion, Variants } from "framer-motion";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { DashboardPrepResources } from "@/components/dashboard/DashboardPrepResources";
import { DashboardNextTargets } from "@/components/dashboard/DashboardNextTargets";
import { DashboardInsightsHistory } from "@/components/dashboard/DashboardInsightsHistory";
import { PaymentSuccessModal } from "@/components/dashboard/PaymentSuccessModal";
import { Target, Clock, Trophy, FileText, BrainCircuit } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useCreditModal } from "@/context/CreditModalContext";

export default function DashboardPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [addedCredits, setAddedCredits] = useState(0);

    const { registerBuyHandler } = useCreditModal();

    const {
        stats,
        recommendedTests,
        recentAttempts,
        activeAttempt,
        activeAttemptTest,
        loading,
        insights,
        heroConfig,
        daysSinceLastTest
    } = useDashboardData(user, authLoading);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    const handleBuyPackage = async (pkg: CreditPackage) => {
        if (!user || isProcessing) return;
        setIsProcessing(true);
        try {
            const response = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId: pkg.id, amount: pkg.price, credits: pkg.credits })
            });

            const order = await response.json();

            if (order.error) {
                console.error("Order creation failed:", order.error);
                alert("Failed to initiate payment. Please try again.");
                setIsProcessing(false);
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "CUET Mock Platform",
                description: `Purchase ${pkg.credits} Credits`,
                order_id: order.id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handler: async function (response: any) {
                    const verifyResponse = await fetch('/api/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            packageId: pkg.id,
                            credits: pkg.credits,
                            userId: user.uid,
                            amount: pkg.price
                        })
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyData.success) {
                        setAddedCredits(pkg.credits);
                        setShowSuccessModal(true);
                    } else {
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: userData?.name || user.displayName || "",
                    email: user.email || "",
                },
                theme: { color: "#F59E0B" }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rzp1 = new (window as any).Razorpay(options);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Register the Razorpay handler with the global credit modal context
    // so it works even when the modal is opened from TestCard or any other component
    useEffect(() => {
        registerBuyHandler(handleBuyPackage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, userData]);

    const statCards = [
        { title: "Tests Taken", value: stats.testsAttempted.toString(), icon: FileText, color: "from-blue-500/20 to-cyan-500/5", iconColor: "text-blue-400" },
        { title: "Avg Accuracy", value: `${stats.avgAccuracy}%`, icon: Target, color: "from-emerald-500/20 to-teal-500/5", iconColor: "text-emerald-400" },
        { title: "Avg Pace", value: `${stats.avgSpeed}m`, icon: Clock, color: "from-amber-500/20 to-orange-500/5", iconColor: "text-amber-400" },
        { title: "Best Score", value: stats.bestScore.toString(), icon: Trophy, color: "from-purple-500/20 to-pink-500/5", iconColor: "text-purple-400" },
    ];

    if (authLoading || loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-cta-primary/20 blur-xl rounded-full" />
                    <BrainCircuit className="h-12 w-12 text-cta-primary animate-pulse relative z-10" />
                </div>
                <p className="text-white/50 font-medium animate-pulse">Syncing neuronal pathways...</p>
            </div>
        );
    }

    if (!user) return null;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto pb-20"
        >
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            {/* Header Hero */}
            <DashboardHero
                userData={userData}
                user={user}
                activeAttempt={activeAttempt}
                activeAttemptTest={activeAttemptTest}
                itemVariants={itemVariants}
                stats={stats}
                insight={insights[0] ?? null}
                heroConfig={heroConfig}
                daysSinceLastTest={daysSinceLastTest}
            />

            {/* Stats Grid */}
            <DashboardStatsGrid statCards={statCards} itemVariants={itemVariants} />

            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left Column: Recommendations & Resources */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
                    <DashboardPrepResources />
                    <DashboardNextTargets recommendedTests={recommendedTests} userData={userData} />
                </motion.div>

                {/* Right Column: Insights & History */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <DashboardInsightsHistory insights={insights} recentAttempts={recentAttempts} />
                </motion.div>
            </div>

            <PaymentSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                creditsAdded={addedCredits}
            />
        </motion.div>
    );
}
