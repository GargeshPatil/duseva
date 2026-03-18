import Link from "next/link";
import { MessageCircle, Instagram, Mail, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative bg-slate-950 text-white overflow-hidden py-16 md:py-24 border-t border-white/10 mt-auto">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-cta-primary to-transparent opacity-50" />
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cta-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-semantic-success/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative z-10 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-cta-primary to-cta-hover text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] tracking-widest uppercase">CUET MOCK</div>
                            <span className="font-black text-white text-3xl tracking-tighter">DU Seva</span>
                        </div>
                        <p className="text-white/60 text-base max-w-sm leading-relaxed font-medium">
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            India's most trusted CUET preparation platform. Built by students from SRCC, Hindu, and St. Stephen's. We provide real exam-level mocks, detailed analytics, and mentorship.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="group bg-white/5 border border-white/10 p-3.5 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]" aria-label="WhatsApp">
                                <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                            </a>
                            <a href="https://instagram.com/duseva" target="_blank" rel="noopener noreferrer" className="group bg-white/5 border border-white/10 p-3.5 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]" aria-label="Instagram">
                                <Instagram className="h-5 w-5 transition-transform group-hover:scale-110" />
                            </a>
                            <a href="mailto:support@duseva.com" className="group bg-white/5 border border-white/10 p-3.5 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]" aria-label="Email">
                                <Mail className="h-5 w-5 transition-transform group-hover:scale-110" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-3 lg:col-start-7">
                        <h4 className="font-bold text-white mb-8 flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
                            <span className="w-8 h-px bg-cta-primary/50"></span>
                            Navigation
                        </h4>
                        <ul className="space-y-4 text-white/60 font-medium">
                            <li><Link href="/cuet-2026" className="hover:text-white transition-all duration-300 flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-white/20 group-hover:bg-cta-primary rounded-full transition-colors"></span><span className="group-hover:translate-x-1 transition-transform">CUET 2026 Guide</span></Link></li>
                            <li><Link href="/mocks" className="hover:text-white transition-all duration-300 flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-white/20 group-hover:bg-cta-primary rounded-full transition-colors"></span><span className="group-hover:translate-x-1 transition-transform">Mock Tests</span></Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-all duration-300 flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-white/20 group-hover:bg-cta-primary rounded-full transition-colors"></span><span className="group-hover:translate-x-1 transition-transform">Contact Us</span></Link></li>
                        </ul>
                    </div>

                    {/* Legal & Policies */}
                    <div className="lg:col-span-3">
                        <h4 className="font-bold text-white mb-8 flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
                            <span className="w-8 h-px bg-cta-primary/50"></span>
                            Legal
                        </h4>
                        <ul className="space-y-4 text-white/60 font-medium">
                            <li><Link href="/privacy-policy" className="hover:text-white transition-all duration-300 flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-white/20 group-hover:bg-cta-primary rounded-full transition-colors"></span><span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span></Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-all duration-300 flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-white/20 group-hover:bg-cta-primary rounded-full transition-colors"></span><span className="group-hover:translate-x-1 transition-transform">Terms of Service</span></Link></li>
                            <li><Link href="#" className="hover:text-white transition-all duration-300 flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-white/20 group-hover:bg-cta-primary rounded-full transition-colors"></span><span className="group-hover:translate-x-1 transition-transform">Refund Policy</span></Link></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-white/40 font-medium">
                    <div>© 2026 DU Seva. All rights reserved.</div>
                    <div className="flex gap-8 items-center">
                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> New Delhi, India</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full hidden md:block"></span>
                        <Link href="/admin" className="hover:text-white transition-colors">Admin Access</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
