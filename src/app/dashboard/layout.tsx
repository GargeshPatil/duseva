"use client";

import { PremiumDashboardNav } from "@/components/dashboard/PremiumDashboardNav";
import { Header } from "@/components/dashboard/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingScreen } from "@/components/ui/LoadingScreen";

// ... imports

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

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

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden text-text-primary">
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
