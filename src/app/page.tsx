"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Heart } from "lucide-react";
import { StudentStories } from "@/components/marketing/StudentStories";
import { HeroSection } from "@/components/marketing/HeroSection";
import { WhoWeAreSection } from "@/components/marketing/WhoWeAreSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { SuccessStatsSection } from "@/components/marketing/SuccessStatsSection";
import { FinalCtaSection } from "@/components/marketing/FinalCtaSection";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();

  // Parallax Effects
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const [heroContent] = useState({
    headline: "Breathe. You're going to crack CUET.",
    subheadline: "Welcome to DU Seva. India's sweetest, most powerful mock test platform designed to calm your nerves and boost your percentile."
  });

  useEffect(() => {
    if (!authLoading && user && userData) {
      if (userData.role === 'admin' || userData.role === 'developer') {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, userData, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Heart className="h-10 w-10 text-cta-primary animate-pulse" />
        <p className="text-white/50 font-medium">Warming up your space...</p>
      </div>
    );
  }

  // Animation variants for section reveals
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
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cta-primary/20 blur-[120px] mix-blend-screen animate-blob" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-purple-500/20 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
        </motion.div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <main className="flex-1 relative z-10">
        <HeroSection heroContent={heroContent} fadeUpVariants={fadeUpVariants} />
        <WhoWeAreSection fadeUpVariants={fadeUpVariants} />
        <FeaturesSection fadeUpVariants={fadeUpVariants} />
        <SuccessStatsSection />
        <StudentStories />
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
