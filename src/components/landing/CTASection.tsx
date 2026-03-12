"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-24 bg-surface-base relative overflow-hidden">
            <div className="absolute inset-0 bg-cta-primary/5 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary"
                    >
                        Ready to ace your CUET exam?
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-xl text-text-secondary max-w-2xl mx-auto"
                    >
                        Join thousands of students who are securing their seats in top North Campus colleges. Start your preparation today.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    >
                        <Link href="/auth/signup">
                            <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-cta-primary/20 hover:shadow-cta-primary/30 hover:-translate-y-1 transition-all">
                                Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
