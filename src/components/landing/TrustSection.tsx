"use client";

import { motion } from "framer-motion";

const colleges = [
    "SRCC", "Hindu College", "St. Stephen's", "LSR", "Hansraj", "Kirori Mal", "Ramjas", "Miranda House", "Venky", "Shaheed Sukhdev"
];

export function TrustSection() {
    return (
        <section className="py-10 bg-slate-50 border-y border-slate-200 overflow-hidden">
            <div className="container px-4 md:px-6 mb-6 text-center">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Built by students from top DU colleges
                </p>
            </div>

            <div className="relative flex w-full overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10" />

                <motion.div
                    className="flex whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 30,
                        ease: "linear",
                        repeat: Infinity
                    }}
                >
                    {[...colleges, ...colleges, ...colleges].map((college, idx) => (
                        <div key={idx} className="mx-8 lg:mx-12">
                            <span className="text-xl md:text-2xl font-bold text-slate-300 hover:text-slate-400 transition-colors cursor-default select-none">
                                {college}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
