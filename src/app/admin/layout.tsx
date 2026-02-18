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

    // Show nothing while checking auth to let GlobalAuthLoader handle the UI
    if (loading) return null;

    if (!user || !userData || !['admin', 'developer'].includes(userData.role)) {
        return null; // Redirecting in useEffect
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
