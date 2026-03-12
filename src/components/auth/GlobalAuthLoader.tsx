"use client";

import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function GlobalAuthLoader({ children }: { children: React.ReactNode }) {
    const { loading } = useAuth();
    const pathname = usePathname();
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        // Only show the massive global loader if we are navigating to an authenticated route 
        // OR if we expect to be logged in. For public pages (like /, /auth/login), 
        // we shouldn't flash a "Signing you in" screen initially.
        const isAuthRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/test') || pathname?.startsWith('/admin');

        if (loading && isAuthRoute) {
            setShowLoader(true);
        } else if (!loading) {
            setShowLoader(false);
        }
    }, [loading, pathname]);

    return (
        <>
            <AnimatePresence>
                {showLoader && <LoadingScreen />}
            </AnimatePresence>
            {children}
        </>
    );
}
