import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const WA_URL = "https://chat.whatsapp.com/Gxa8GQH8bPcAC9Wd2IW3Ui";

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366] shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

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
                        Sign up today and get a free PYQ to practise on our NTA-replica test engine. No credit card required.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <Link
                            href="/auth/signup"
                            className="inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95 group"
                        >
                            Start Your CUET Prep
                            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                        </Link>
                        <a
                            href={WA_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] px-10 py-5 rounded-[2rem] font-bold text-xl transition-all hover:bg-[#25D366]/20 hover:border-[#25D366]/50 hover:scale-105 active:scale-95"
                        >
                            <WhatsAppIcon />
                            Join Community
                        </a>
                    </div>
                    <p className="mt-6 text-sm text-white/30 font-medium relative z-10">
                        Free to start &nbsp;·&nbsp; One-on-one Mentorship &nbsp;·&nbsp; NTA-pattern tests
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
