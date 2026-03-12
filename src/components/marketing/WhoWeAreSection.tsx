import { motion } from "framer-motion";
import { GraduationCap, Users, Heart } from "lucide-react";

interface WhoWeAreSectionProps {
    fadeUpVariants: any;
}

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
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Built by students who <span className="text-indigo-400">actually</span> sat where you are sitting.</h2>
                            <p className="text-lg text-white/70 mb-6 leading-relaxed">
                                We are alumni from SRCC, Hindu College, and St. Stephen's. Just a couple of years ago, we were stressed, confused, and overwhelmed by CUET.
                            </p>
                            <p className="text-lg text-white/70 leading-relaxed">
                                We built DU Seva to be the platform we wished we had. No fear-mongering. No confusing interfaces. Just beautifully designed, incredibly accurate mock tests that prepare you for the real deal while keeping you sane.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 aspect-square flex flex-col justify-center items-center text-center hover:bg-white/10 transition-colors">
                                    <GraduationCap className="h-10 w-10 text-cta-primary mb-3" />
                                    <h3 className="font-bold text-lg">SRCC Alumni</h3>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 aspect-[4/3] flex flex-col justify-center items-center text-center hover:bg-white/10 transition-colors">
                                    <span className="text-3xl font-black text-purple-400 mb-1">99.9+</span>
                                    <span className="text-sm text-white/60">Percentilers</span>
                                </div>
                            </div>
                            <div className="space-y-4 mt-8">
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 aspect-[4/3] flex flex-col justify-center items-center text-center hover:bg-white/10 transition-colors">
                                    <Users className="h-10 w-10 text-blue-400 mb-3" />
                                    <h3 className="font-bold text-lg">By Students, For Students</h3>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 aspect-square flex flex-col justify-center items-center text-center hover:bg-white/10 transition-colors">
                                    <Heart className="h-10 w-10 text-red-400 mb-3" />
                                    <h3 className="font-bold text-lg">Made with Love</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
