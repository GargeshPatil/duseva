"use client";

import { motion } from "framer-motion";

const stats = [
    { label: "Questions Attempted", value: "50,000+", delay: 0 },
    { label: "Active Students", value: "2,000+", delay: 0.1 },
    { label: "Tests Created", value: "100+", delay: 0.2 },
    { label: "College Selections", value: "500+", delay: 0.3 },
];

export function StatsSection() {
    return (
        <section className="py-20 bg-blue-600 text-white overflow-hidden relative">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: stat.delay }}
                            className="space-y-2"
                        >
                            <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-white/90">
                                {stat.value}
                            </div>
                            <div className="text-sm md:text-base font-medium text-blue-100 uppercase tracking-wide">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
