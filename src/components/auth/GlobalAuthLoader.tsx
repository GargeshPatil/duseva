"use client";

import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AnimatePresence } from "framer-motion";

export function GlobalAuthLoader({ children }: { children: React.ReactNode }) {
    const { loading } = useAuth();

    return (
        <>
            <AnimatePresence>
                {loading && <LoadingScreen />}
            </AnimatePresence>
            {/* 
                Optionally, we can hide children while loading if we want to prevent
                any background rendering/flashing, but overlapping with absolute
                positioning (z-index) usually works well and allows pre-loading.
                If strict blocking is required:
                {!loading && children}
             */}
            {children}
        </>
    );
}
