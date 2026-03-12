import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { navLinks } from "./NavbarDesktopLinks";
import { usePathname } from "next/navigation";

interface NavbarMobileMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    authText: string;
}

export function NavbarMobileMenu({ isOpen, setIsOpen, authText }: NavbarMobileMenuProps) {
    const { user, userData, loading } = useAuth();
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Immersive Dark Backdrop overlay */}
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.4 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-950/80 z-40 md:hidden"
                    />

                    {/* Side Drawer with deep glass */}
                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                        className="fixed top-0 right-0 h-full w-[85%] sm:w-[350px] bg-slate-900/60 backdrop-blur-3xl z-50 shadow-2xl border-l border-white/10 md:hidden flex flex-col overflow-hidden"
                    >
                        {/* Inner ambient glow */}
                        <div className="absolute top-0 right-0 w-full h-1/2 bg-cta-primary/10 blur-[100px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2" />

                        <div className="px-6 py-6 h-20 flex items-center justify-between border-b border-white/10 relative z-10">
                            <div className="text-white/50 text-xs font-bold tracking-[0.2em] uppercase">Navigation</div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white/70 bg-white/5 border border-white/10 hover:bg-white/20 hover:text-white rounded-xl transition-colors shadow-sm"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-6 relative z-10">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 + 0.1, type: "spring" }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`group block text-3xl font-black tracking-tight transition-all duration-300 ${isActive(link.href) ? 'text-transparent bg-clip-text bg-gradient-to-r from-cta-primary to-cta-hover' : 'text-white/70 hover:text-white hover:translate-x-2'}`}
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-white/10 flex flex-col gap-4 relative z-10 bg-black/20">
                            <Link
                                href="/contact"
                                onClick={() => setIsOpen(false)}
                                className="text-white/70 hover:text-white font-semibold text-center py-2"
                            >
                                Contact Us
                            </Link>
                            {!loading ? (
                                user ? (
                                    <Link
                                        href={userData?.role === 'admin' || userData?.role === 'developer' ? '/admin' : '/dashboard'}
                                        onClick={() => setIsOpen(false)}
                                        className="w-full text-center py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full text-center py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                                    >
                                        {authText}
                                    </Link>
                                )
                            ) : (
                                <div className="w-full h-[52px] rounded-xl bg-white/5 animate-pulse border border-white/10"></div>
                            )}
                            <Link
                                href="/mocks"
                                onClick={() => setIsOpen(false)}
                                className="w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-cta-primary to-cta-hover text-white font-black hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all uppercase tracking-wide"
                            >
                                Give a Mock
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
