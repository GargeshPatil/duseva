import { motion } from "framer-motion";

export function SuccessStatsSection() {
    return (
        <section className="py-24 relative px-6 overflow-hidden">
            <div className="container mx-auto max-w-5xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {[
                        { number: "50k+", label: "Happy Students" },
                        { number: "100%", label: "Syllabus Covered" },
                        { number: "400+", label: "Selections in DU" },
                        { number: "4.9/5", label: "Average Rating" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, type: "spring" }}
                            className="text-center p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05]"
                        >
                            <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-2">{stat.number}</div>
                            <div className="text-sm md:text-base text-white/50 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
