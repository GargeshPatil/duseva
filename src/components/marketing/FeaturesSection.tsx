import { motion } from "framer-motion";
import { Target, Award, PlayCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FeaturesSectionProps {
    fadeUpVariants: any;
}

export function FeaturesSection({ fadeUpVariants }: FeaturesSectionProps) {
    return (
        <section className="py-24 relative px-6 overflow-hidden">
            <div className="container mx-auto max-w-7xl">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUpVariants}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-medium mb-4">
                        ✨ Platform Features
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything you need, nothing you don't.</h2>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto font-medium">
                        From syllabus to result day — we cover it all.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[
                        {
                            icon: <Target className="h-8 w-8 text-blue-400" />,
                            title: "NTA Replica Engine",
                            desc: "Practice on the exact interface you'll face on exam day. No surprises.",
                            color: "from-blue-500/20",
                            glowColor: "group-hover:bg-blue-500/10"
                        },
                        {
                            icon: <Award className="h-8 w-8 text-purple-400" />,
                            title: "Latest 2026 Pattern",
                            desc: "Questions hand-picked by toppers to match the newest difficulty trends.",
                            color: "from-purple-500/20",
                            glowColor: "group-hover:bg-purple-500/10"
                        },
                        {
                            icon: <PlayCircle className="h-8 w-8 text-emerald-400" />,
                            title: "Instant Analytics",
                            desc: "See where you went wrong immediately with step-by-step gentle explanations.",
                            color: "from-emerald-500/20",
                            glowColor: "group-hover:bg-emerald-500/10"
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }
                            }}
                            className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/10 transition-all overflow-hidden hover:-translate-y-1"
                        >
                            {/* Centered glow */}
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br ${feature.color} to-transparent blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                            <div className="mb-8 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 relative z-10">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 relative z-10">{feature.title}</h3>
                            <p className="text-white/60 leading-relaxed relative z-10">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Analytics preview image */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-12"
                >
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
                    <div className="px-6 pt-6 pb-2 bg-slate-900/60 border-b border-white/5 flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/70" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                            <div className="w-3 h-3 rounded-full bg-green-500/70" />
                        </div>
                        <span className="text-xs text-white/30 font-mono ml-2">duseva.com/dashboard/analysis</span>
                    </div>
                    <Image
                        src="/Analysis.png"
                        alt="Post-test analytics and performance breakdown"
                        width={1400}
                        height={700}
                        className="w-full object-cover"
                    />
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <Link
                        href="/auth/signup"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white font-semibold transition-colors group"
                    >
                        Ready to try it for free?
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
