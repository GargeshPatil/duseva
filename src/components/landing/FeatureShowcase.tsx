"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const features = [
    {
        title: "Real Exam Interface",
        description: "Practice on an interface that looks and feels exactly like the actual NTA CUET exam. Get comfortable with the layout, navigation, and timer before the big day.",
        list: ["Same color scheme as NTA", "Question palette navigation", "Mark for review functionality", "Timer with visual alerts"],
        imageSide: "right",
        color: "blue"
    },
    {
        title: "Deep Performance Analytics",
        description: "Don't just take tests; understand your performance. Our advanced analytics break down your score by subject, topic, and difficulty level.",
        list: ["Subject-wise strength analysis", "Time management insights", "Accuracy vs. Speed graphs", "Percentile prediction"],
        imageSide: "left",
        color: "indigo"
    },
    {
        title: "Distraction-Free Environment",
        description: "Focus is key. Our platform provides a clean, clutter-free environment that helps you concentrate solely on solving questions.",
        list: ["Full-screen mode", "No ads or interruptions", "Dark mode for late-night study", "Mobile-optimized interface"],
        imageSide: "right",
        color: "teal"
    }
];

export function FeatureShowcase() {
    return (
        <section className="py-20 overflow-hidden bg-white">
            <div className="container px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
                        Everything you need to master CUET
                    </h2>
                    <p className="text-lg text-slate-600">
                        Designed by toppers, built for future toppers.
                    </p>
                </div>

                <div className="space-y-24 md:space-y-32">
                    {features.map((feature, idx) => (
                        <div key={idx} className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${feature.imageSide === 'left' ? 'lg:flex-row-reverse' : ''}`}>
                            {/* Text Content */}
                            <motion.div
                                initial={{ opacity: 0, x: feature.imageSide === 'right' ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.7 }}
                                className="flex-1"
                            >
                                <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-${feature.color}-100 text-${feature.color}-700 mb-6`}>
                                    {feature.title}
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                    {feature.description}
                                </p>
                                <ul className="space-y-3">
                                    {feature.list.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-700">
                                            <div className={`mt-1 h-5 w-5 rounded-full bg-${feature.color}-100 flex items-center justify-center shrink-0`}>
                                                <CheckCircle2 className={`h-3.5 w-3.5 text-${feature.color}-600`} />
                                            </div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Visual Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.7 }}
                                className="flex-1 w-full"
                            >
                                <div className={`relative aspect-video rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 shadow-xl overflow-hidden group`}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/* Placeholder for feature screenshot */}
                                        <div className="text-slate-400 font-medium text-lg">
                                            {feature.title} Preview
                                        </div>
                                    </div>

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
