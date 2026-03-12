"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PremiumAdminNav } from "@/components/admin/PremiumAdminNav";
import { PremiumGradient } from "@/components/ui/PremiumGradient";

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
                <div className="flex flex-col items-center justify-center min-h-screen bg-surface-base">
                    <div className="bg-surface-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-semantic-error/20 backdrop-blur-xl">
                        <div className="h-16 w-16 bg-semantic-error/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-semantic-error/20">
                            <svg className="h-8 w-8 text-semantic-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary mb-2">Access Restricted</h1>
                        <p className="text-text-secondary mb-6">
                            This area is restricted to administrators only.<br />
                            Your current role is: <span className="font-mono bg-surface-elevated px-2 py-1 rounded text-text-primary border border-border mt-1 inline-block font-medium">{userData.role}</span>
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full px-4 py-2 bg-cta-primary text-white rounded-lg hover:bg-cta-hover transition-colors font-medium shadow-cta"
                            >
                                Reload Permissions
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full px-4 py-2 bg-surface-elevated border border-border text-text-primary rounded-lg hover:bg-surface-glass transition-colors font-medium hover:border-text-muted"
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
        <div className="flex-1 flex flex-col h-screen overflow-hidden text-text-primary bg-transparent relative selection:bg-cta-primary/30">
            <PremiumGradient variant="examSafe" className="fixed inset-0 z-0" />
            <div className="relative z-40">
                <PremiumAdminNav />
            </div>

            <div className="flex-1 overflow-y-auto w-full relative z-10">
                <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 min-h-full pb-20 text-text-primary">
                    {children}
                </main>
            </div>
        </div>
    );
}
