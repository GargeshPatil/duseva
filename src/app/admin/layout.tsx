"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

import { LoadingScreen } from "@/components/ui/LoadingScreen";

// ... imports

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            console.log("AdminLayout: Auth State:", { user: user?.uid, role: userData?.role });
            if (!user) {
                router.push("/auth/login");
            }
            // else if (userData && !['admin', 'developer'].includes(userData.role)) {
            //    router.push("/dashboard");
            // }
        }
    }, [user, userData, loading, router]);

    // Show nothing while checking auth to let GlobalAuthLoader handle the UI
    if (loading) return null;

    if (!user || !userData || !['admin', 'developer'].includes(userData.role)) {
        if (!loading && user && userData) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-red-100">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h1>
                        <p className="text-slate-600 mb-6">
                            This area is restricted to administrators only.<br />
                            Your current role is: <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-800 font-medium">{userData.role}</span>
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                            >
                                Reload Permissions
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                            >
                                Go to Student Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return <LoadingScreen />;
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
