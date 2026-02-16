"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { mockDb } from "@/services/mockDb";
import { CMSContent } from "@/types/admin";

export default function Home() {
  const [heroContent, setHeroContent] = useState({
    headline: "Crack CUET with Real Exam-Level Mock Tests",
    subheadline: "Boost your speed, accuracy, and percentile with India's most advanced mock test platform. Detailed analytics, distraction-free interface, and NTA-level questions."
  });

  useEffect(() => {
    async function loadContent() {
      const cmsData = await mockDb.getCMSContent();
      const heroData = cmsData.filter(c => c.section === 'hero');

      const newContent = { ...heroContent };
      heroData.forEach(item => {
        if (item.key === 'headline') newContent.headline = item.value;
        if (item.key === 'subheadline') newContent.subheadline = item.value;
      });

      setHeroContent(newContent);
    }
    loadContent();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                New Pattern Updated for 2026
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-slate-900 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                {heroContent.headline}
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                {heroContent.subheadline}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                    Start Free Mock <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full hover:bg-slate-50">
                    View Test Series
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-8 text-sm text-slate-500 animate-in fade-in duration-1000 delay-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>NTA Pattern</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Detailed Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>All India Rank</span>
                </div>
              </div>
            </div>
          </div>

          {/* Background Gradient */}
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-50 to-transparent -z-10 pointer-events-none" />
        </section>

        {/* Dashboard Preview (Visual Placeholder) */}
        <section className="py-12 bg-white">
          <div className="container">
            <div className="relative rounded-xl border border-slate-200 shadow-2xl overflow-hidden bg-slate-900 aspect-[16/9] max-w-5xl mx-auto group ring-1 ring-slate-900/5">
              {/* This mimics a dashboard screen - simplified for now */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 group-hover:bg-slate-900/40 transition-all">
                <p className="text-slate-400 font-medium z-10 bg-slate-900/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-slate-700">Interactive Dashboard Preview</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
            </div>
          </div>
        </section>

        <Features />
        <Testimonials />
      </main>

      <footer className="py-8 border-t border-border mt-auto bg-slate-50">
        <div className="container text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} CUET Prep. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900">Terms of Service</Link>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
