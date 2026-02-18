"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

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

    if (loading) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <div className="md:ml-64 flex flex-col min-h-screen pb-16 md:pb-0">
                <Header />
                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </div>
            <MobileNav />
        </div>
    );
}
