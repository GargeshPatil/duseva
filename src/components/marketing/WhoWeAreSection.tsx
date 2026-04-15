import { motion } from "framer-motion";
import { GraduationCap, Users, Heart, Zap } from "lucide-react";

interface WhoWeAreSectionProps {
    fadeUpVariants: any;
}

const cards = [
    {
        icon: <GraduationCap className="h-8 w-8 text-indigo-300" />,
        title: "SRCC Alumni",
        subtitle: "Top-ranked economics college",
        bg: "from-indigo-500/20 to-indigo-500/5",
        border: "border-indigo-500/20",
        glow: "bg-indigo-500/10"
    },
    {
        icon: <Zap className="h-8 w-8 text-purple-300" />,
        title: "99.9+ Percentilers",
        subtitle: "Taught by toppers",
        bg: "from-purple-500/20 to-purple-500/5",
        border: "border-purple-500/20",
        glow: "bg-purple-500/10"
    },
    {
        icon: <Users className="h-8 w-8 text-blue-300" />,
        title: "For Students",
        subtitle: "By students who sat here",
        bg: "from-blue-500/20 to-blue-500/5",
        border: "border-blue-500/20",
        glow: "bg-blue-500/10"
    },
    {
        icon: <Heart className="h-8 w-8 text-rose-300 fill-rose-300" />,
        title: "Made with Love",
        subtitle: "We genuinely care about you",
        bg: "from-rose-500/20 to-rose-500/5",
        border: "border-rose-500/20",
        glow: "bg-rose-500/10"
    },
];

export function WhoWeAreSection({ fadeUpVariants }: WhoWeAreSectionProps) {
    return (
        <section id="who-we-are" className="py-32 relative px-6 overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeUpVariants}
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[3rem] p-8 md:p-16 backdrop-blur-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cta-primary/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Left: Copy */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-medium mb-6">
                                👋 Our Story
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                                Built by students who <span className="text-indigo-400">actually</span> sat where you are sitting.
                            </h2>
                            <p className="text-lg text-white/70 mb-6 leading-relaxed">
                                We are alumni from SRCC, Hindu College, and St. Stephen's. Just a couple of years ago, we were stressed, confused, and overwhelmed by CUET.
                            </p>
                            <p className="text-lg text-white/70 leading-relaxed">
                                We built DU Seva to be the platform we wished we had. No fear-mongering. No confusing interfaces. Just beautifully designed, incredibly accurate mock tests that prepare you for the real deal while keeping you sane.
                            </p>

                        </div>

                        {/* Right: Accent cards */}
                        <div className="grid grid-cols-2 gap-4">
                            {cards.map((card, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    className={`relative bg-gradient-to-br ${card.bg} border ${card.border} rounded-3xl p-6 h-36 flex flex-col justify-center items-center text-center hover:scale-[1.03] transition-transform overflow-hidden`}
                                >
                                    <div className={`absolute inset-0 ${card.glow} blur-2xl opacity-40 pointer-events-none`} />
                                    <div className="mb-2 relative z-10">{card.icon}</div>
                                    <h3 className="font-bold text-base text-white relative z-10">{card.title}</h3>
                                    <p className="text-xs text-white/50 mt-1 relative z-10">{card.subtitle}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
