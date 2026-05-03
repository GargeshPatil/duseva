"use client";

import { PremiumDashboardNav } from "@/components/dashboard/PremiumDashboardNav";
import { Header } from "@/components/dashboard/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { X } from "lucide-react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { CreditModalProvider } from "@/context/CreditModalContext";
import { CreditModal } from "@/components/dashboard/CreditModal";

const VERIFICATION_BANNER_DISMISSED_KEY = "email_verification_banner_dismissed";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [sendingLink, setSendingLink] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(true); // default true to avoid flash

    useEffect(() => {
        // Load banner dismissed state from localStorage
        const dismissed = localStorage.getItem(VERIFICATION_BANNER_DISMISSED_KEY) === 'true';
        setBannerDismissed(dismissed);
    }, []);

    useEffect(() => {
        if (!loading && user && userData) {
            if (['admin', 'developer'].includes(userData.role)) {
                router.push("/admin");
            }
        }
    }, [user, userData, loading, router]);

    const handleDismissBanner = () => {
        localStorage.setItem(VERIFICATION_BANNER_DISMISSED_KEY, 'true');
        setBannerDismissed(true);
    };

    if (loading) return null; // Global loader handles initial auth check

    // Wait for user profile to load before showing dashboard to prevent role-based flashes
    if (user && !userData) {
        return <LoadingScreen />;
    }

    // Prevent flash of dashboard for admins by showing loading screen while redirecting
    if (user && userData && ['admin', 'developer'].includes(userData.role)) {
        return <LoadingScreen />;
    }

    const handleResend = async () => {
        if (!user) return;
        setSendingLink(true);
        try {
            await sendEmailVerification(user);
            alert("Verification email sent! Please check your inbox and spam folder.");
        } catch (err) {
            console.error(err);
            alert("Too many requests. Please wait a few minutes before trying again.");
        } finally {
            setSendingLink(false);
        }
    };

    return (
        <CreditModalProvider>
            <div className="flex-1 flex flex-col h-screen overflow-hidden text-text-primary">
                {user && !user.emailVerified && !bannerDismissed && (
                    <div className="w-full bg-red-900/30 border-b border-red-700/40 py-2.5 px-4 flex flex-row justify-center items-center gap-3 z-50 relative shrink-0">
                        <p className="text-sm font-medium text-red-300 text-center flex-1 text-center">
                            ⚠️ Please verify your email address ({user.email}) to fully secure your account.
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleResend}
                                disabled={sendingLink}
                                className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline disabled:opacity-50 whitespace-nowrap"
                            >
                                {sendingLink ? "Sending..." : "Resend Link"}
                            </button>
                            <button
                                onClick={handleDismissBanner}
                                title="Dismiss (won't show again)"
                                className="p-1 rounded-full text-red-400/70 hover:text-red-300 hover:bg-red-900/40 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
                <PremiumDashboardNav />
                <div className="flex-1 overflow-y-auto w-full relative">
                    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 min-h-full pb-16 md:pb-0 relative z-10">
                        <Header />
                        <main className="flex-1 py-8 text-text-primary">
                            {children}
                        </main>
                    </div>
                </div>
                <MobileNav />
                {/* Global credit purchase modal — accessible from any dashboard route */}
                <CreditModal />
            </div>
        </CreditModalProvider>
    );
}

