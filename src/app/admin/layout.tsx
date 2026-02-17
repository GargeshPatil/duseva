"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/auth/login");
            } else if (userData && !['admin', 'developer'].includes(userData.role)) {
                router.push("/dashboard");
            }
        }
    }, [user, userData, loading, router]);

    // Show loading state while checking auth, fetching user data, or redirecting
    if (loading || !user || !userData || !['admin', 'developer'].includes(userData.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <AdminSidebar />

            <div className="md:ml-64 min-h-screen flex flex-col transition-all duration-300">
                <AdminMobileNav />

                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
