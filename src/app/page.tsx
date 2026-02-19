"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Testimonials } from "@/components/landing/Testimonials";
import { mockDb } from "@/services/mockDb";
import { useAuth } from "@/context/AuthContext";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { StatsSection } from "@/components/landing/StatsSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [heroContent, setHeroContent] = useState({
    headline: "Crack CUET with Real Exam-Level Mock Tests",
    subheadline: "Boost your speed, accuracy, and percentile with India's most advanced mock test platform. Detailed analytics, distraction-free interface, and NTA-level questions."
  });

  // Redirect if logged in
  useEffect(() => {
    if (!authLoading && user && userData) {
      if (userData.role === 'admin' || userData.role === 'developer') {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, userData, authLoading, router]);

  useEffect(() => {
    async function loadContent() {
      const cmsData = await mockDb.getCMSContent();
      const heroData = cmsData.filter(c => c.section === 'hero');

      setHeroContent(prev => {
        const newContent = { ...prev };
        heroData.forEach(item => {
          if (item.key === 'headline') newContent.headline = item.value;
          if (item.key === 'subheadline') newContent.subheadline = item.value;
        });
        return newContent;
      });
    }
    loadContent();
  }, []);

  // Show loading spinner while checking auth to prevent flash of content
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        <HeroSection
          headline={heroContent.headline}
          subheadline={heroContent.subheadline}
        />

        <TrustSection />

        <FeatureShowcase />

        <StatsSection />

        <Testimonials />

        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
