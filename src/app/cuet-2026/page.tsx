"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CuetHero } from "@/components/cuet2026/CuetHero";
import { CuetContentGrid } from "@/components/cuet2026/CuetContentGrid";
import { CuetCTA } from "@/components/cuet2026/CuetCTA";

export default function Cuet2026Page() {
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();

    // Parallax Effects
    const { scrollYProgress } = useScroll();
    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    useEffect(() => {
        if (!authLoading && user && userData) {
            if (userData.role === 'admin' || userData.role === 'developer') {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        }
    }, [user, userData, authLoading, router]);

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-white selection:bg-cta-primary/30 selection:text-white relative overflow-hidden">
            <Navbar />

            {/* Soft, Calming Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    style={{ y: yBg }}
                    className="absolute inset-0 opacity-40"
                >
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen animate-blob" />
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-purple-500/20 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
                    <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-cta-primary/20 blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
                </motion.div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <main className="flex-1 relative z-10">
                <CuetHero fadeUpVariants={fadeUpVariants} />
                <CuetContentGrid />
                <CuetCTA />
            </main>

            <Footer />
        </div>
    );
}
