"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PremiumGradient } from "@/components/ui/PremiumGradient";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    // Redirect already-authenticated users away from all auth pages
    useEffect(() => {
        if (!loading && user) {
            const dest = userData?.role === "admin" || userData?.role === "developer"
                ? "/admin"
                : "/dashboard";
            router.replace(dest);
        }
    }, [loading, user, userData, router]);

    // While auth state is resolving, show nothing to avoid flashing the form
    if (loading || user) return null;

    return (
        <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative text-text-primary">
            <PremiumGradient variant="transition" className="fixed inset-0" />
            <div className="relative z-10 w-full max-w-md mx-auto">
                {children}
            </div>
        </div>
    );
}
