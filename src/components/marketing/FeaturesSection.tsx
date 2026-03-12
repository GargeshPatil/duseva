import { motion } from "framer-motion";
import { Target, Award, PlayCircle } from "lucide-react";

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
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything you need, nothing you don't.</h2>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto font-medium">A smooth, focused preparation journey.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Target className="h-8 w-8 text-blue-400" />,
                            title: "NTA Replica Engine",
                            desc: "Practice on the exact interface you'll face on exam day. No surprises.",
                            color: "from-blue-500/20"
                        },
                        {
                            icon: <Award className="h-8 w-8 text-purple-400" />,
                            title: "Latest 2026 Pattern",
                            desc: "Questions hand-picked by toppers to match the newest difficulty trends.",
                            color: "from-purple-500/20"
                        },
                        {
                            icon: <PlayCircle className="h-8 w-8 text-emerald-400" />,
                            title: "Instant Analytics",
                            desc: "See where you went wrong immediately with step-by-step gentle explanations.",
                            color: "from-emerald-500/20"
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
                            className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/10 transition-colors overflow-hidden"
                        >
                            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.color} to-transparent blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity`} />
                            <div className="mb-8 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 relative z-10">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 relative z-10">{feature.title}</h3>
                            <p className="text-white/60 leading-relaxed relative z-10">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
