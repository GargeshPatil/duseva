import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCtaSection() {
    return (
        <section className="py-40 relative px-6">
            <div className="container mx-auto max-w-4xl text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12 md:p-20 rounded-[3rem] relative overflow-hidden"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cta-primary/10 blur-[100px] rounded-full pointer-events-none" />

                    <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white relative z-10">
                        Take a deep breath.<br />Let's get started.
                    </h2>
                    <p className="text-xl text-white/60 mb-10 mx-auto relative z-10">
                        Sign up today and get 10 free credits to unlock any mock test or PYQ. No credit card required.
                    </p>
                    <Link
                        href="/auth/signup"
                        className="relative z-10 inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95 group"
                    >
                        Claim 10 Free Credits
                        <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
