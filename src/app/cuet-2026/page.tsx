"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, Calendar, Award, Target } from "lucide-react";

const guidanceSections = [
    {
        title: "Syllabus Analysis",
        icon: <BookOpen className="h-6 w-6 text-blue-600" />,
        content: "Detailed breakdown of the updated syllabus for Science, Commerce, and Humanities streams. Focus on core domain subjects like Accountancy, Physics, and Economics."
    },
    {
        title: "Exam Pattern Strategy",
        icon: <Target className="h-6 w-6 text-purple-600" />,
        content: "Understanding the Computer Based Test (CBT) mode. Learn how to manage 45/50 questions in 45/60 minutes. Negative marking strategy (-1 for wrong answers)."
    },
    {
        title: "Important Dates",
        icon: <Calendar className="h-6 w-6 text-green-600" />,
        content: "Tentative schedule for CUET 2026. Application forms expected in February. Exams likely in May-June. Keep track of NTA notifications."
    },
    {
        title: "College Preferences",
        icon: <Award className="h-6 w-6 text-orange-600" />,
        content: "How to fill your CSAS portal preferences correctly. Priority list for North Campus vs South Campus colleges based on your normalized score."
    }
];

export default function Cuet2026Page() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            <Navbar />

            <main className="flex-1">
                {/* Header */}
                <section className="bg-white border-b border-slate-200 py-20">
                    <div className="container px-4 md:px-6 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
                        >
                            Complete Guide to <span className="text-blue-600">CUET 2026</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
                        >
                            Everything you need to know about the exam, syllabus, and college admissions. Curated by mentors from SRCC and St. Stephen's.
                        </motion.p>
                    </div>
                </section>

                {/* Content Grid */}
                <section className="py-20">
                    <div className="container px-4 md:px-6">
                        <div className="grid md:grid-cols-2 gap-8">
                            {guidanceSections.map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                                            {section.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-3">{section.title}</h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                {section.content}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-blue-600 text-white text-center">
                    <div className="container px-4 md:px-6">
                        <h2 className="text-3xl font-bold mb-6">Ready to test your knowledge?</h2>
                        <p className="text-blue-100 mb-8 max-w-lg mx-auto text-lg">Start with a free mock test designed according to the latest 2026 pattern.</p>
                        <a href="/mocks" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors shadow-lg">
                            Take a Free Mock Test
                        </a>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
