import Link from "next/link";
import { MessageCircle, Instagram, Mail, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-12 md:py-16">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm shadow-blue-500/20">CUET MOCK</div>
                            <span className="font-bold text-slate-900 text-xl tracking-tight">DU Seva</span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                            India's most trusted CUET preparation platform. Built by students from SRCC, Hindu, and St. Stephen's to help you achieve your dream college. We provide real exam-level mocks, detailed analytics, and mentorship.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-200 transition-colors" aria-label="WhatsApp">
                                <MessageCircle className="h-5 w-5" />
                            </a>
                            <a href="https://instagram.com/duseva" target="_blank" rel="noopener noreferrer" className="bg-pink-100 p-2 rounded-full text-pink-600 hover:bg-pink-200 transition-colors" aria-label="Instagram">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="mailto:support@duseva.com" className="bg-blue-100 p-2 rounded-full text-blue-600 hover:bg-blue-200 transition-colors" aria-label="Email">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="w-8 h-0.5 bg-blue-500 rounded-full"></span>
                            Navigation
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-slate-300 rounded-full"></span>Home</Link></li>
                            <li><Link href="/cuet-2026" className="hover:text-blue-600 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-slate-300 rounded-full"></span>CUET 2026 Guide</Link></li>
                            <li><Link href="/mocks" className="hover:text-blue-600 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-slate-300 rounded-full"></span>Mock Tests</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-600 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-slate-300 rounded-full"></span>Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Legal & Policies */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="w-8 h-0.5 bg-blue-500 rounded-full"></span>
                            Legal
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link href="/privacy-policy" className="hover:text-blue-600 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-slate-300 rounded-full"></span>Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-600 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-slate-300 rounded-full"></span>Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-blue-600 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-slate-300 rounded-full"></span>Refund Policy</Link></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-slate-500">
                    <div>© 2026 DU Seva. All rights reserved.</div>
                    <div className="flex gap-6 items-center">
                        <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> New Delhi, India</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full hidden md:block"></span>
                        <Link href="/admin" className="hover:text-blue-600 transition-colors">Admin Access</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
