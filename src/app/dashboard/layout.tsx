"use client";

import { PremiumDashboardNav } from "@/components/dashboard/PremiumDashboardNav";
import { Header } from "@/components/dashboard/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendEmailVerification } from "firebase/auth";

import { LoadingScreen } from "@/components/ui/LoadingScreen";

// ... imports

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [sendingLink, setSendingLink] = useState(false);

    useEffect(() => {
        if (!loading && user && userData) {
            if (['admin', 'developer'].includes(userData.role)) {
                router.push("/admin");
            }
        }
    }, [user, userData, loading, router]);

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
        <div className="flex-1 flex flex-col h-screen overflow-hidden text-text-primary">
            {user && !user.emailVerified && (
                <div className="w-full bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 py-3 px-4 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 z-50 relative shrink-0">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 text-center">
                        Please verify your email address ({user.email}) to fully secure your account.
                    </p>
                    <button 
                        onClick={handleResend}
                        disabled={sendingLink}
                        className="text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline disabled:opacity-50 whitespace-nowrap"
                    >
                        {sendingLink ? "Sending..." : "Resend Link"}
                    </button>
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
        </div>
    );
}

