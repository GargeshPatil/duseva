"use client";

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [authText, setAuthText] = useState('Login');
    const pathname = usePathname();
    const { user, userData, loading } = useAuth();

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { name: 'CUET 2026', href: '/cuet-2026' },
        { name: 'CUET Mocks', href: user ? '/dashboard' : '/auth/signup' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Determine auth text based on returning visitor status
        const isReturningVisitor = localStorage.getItem('is_returning_visitor');
        if (isReturningVisitor) {
            setAuthText('Login');
        } else {
            setAuthText('Sign Up');
            localStorage.setItem('is_returning_visitor', 'true');
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'pt-2 pb-2 px-2' : 'pt-6 pb-2 px-6 md:pt-8 md:px-12'}`}>
            <div className={`max-w-7xl mx-auto transition-all duration-700 bg-surface-card/60 hover:bg-surface-card/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex items-center justify-between relative overflow-hidden ${isScrolled ? 'h-16 rounded-2xl px-4 md:px-6' : 'h-20 rounded-[2rem] px-6 md:px-10'}`}>

                {/* Immersive glow effect inside Navbar */}
                <div className="absolute inset-0 bg-gradient-to-r from-cta-primary/5 via-transparent to-semantic-success/5 pointer-events-none" />

                <Link href="/" className="flex items-center gap-3 group relative z-50 w-auto">
                    <div className={`relative transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-0.5 ${isScrolled ? 'h-[60px] w-[210px]' : 'h-[72px] w-[240px] md:h-[84px] md:w-[270px]'}`}>
                        <Image
                            src="/du-logo-white.png"
                            alt="DU Seva Logo"
                            fill
                            sizes="270px"
                            priority
                            className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] dark:drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                        />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex flex-1 justify-center items-center gap-2 relative z-10">
                    <div className="flex items-center p-1.5 rounded-full bg-surface-base/50 border border-white/10 shadow-inner">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${isActive(link.href) ? 'text-white shadow-lg' : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'}`}
                            >
                                {isActive(link.href) && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute inset-0 bg-gradient-to-r from-cta-primary to-cta-hover rounded-full -z-10 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className={isActive(link.href) ? "relative z-10" : ""}>{link.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center justify-end gap-3 md:gap-5 w-auto lg:w-[350px] relative z-10">
                    <a
                        href="https://chat.whatsapp.com/Gxa8GQH8bPcAC9Wd2IW3Ui"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold px-3.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 hover:border-[#25D366]/40 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Community
                    </a>
                    {!loading && !user && (
                        <Link
                            href="/auth/signup"
                            className="text-sm font-bold px-6 py-2.5 rounded-xl border border-border/80 bg-surface-glass hover:bg-surface-elevated text-text-primary transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 backdrop-blur-md"
                        >
                            {authText}
                        </Link>
                    )}
                    {!loading ? (
                        <Link
                            href={user ? (userData?.role === 'admin' || userData?.role === 'developer' ? '/admin' : '/dashboard') : '/test/showcase'}
                            className="relative group text-sm font-bold px-7 py-2.5 rounded-xl bg-gradient-to-r from-cta-primary to-cta-hover text-white transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1 active:scale-95 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="relative z-10">{user ? 'Dashboard' : 'Give a Mock'}</span>
                        </Link>
                    ) : (
                        <div className="w-[124px] h-[42px] rounded-xl bg-surface-elevated animate-pulse border border-border/80 blur-sm"></div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-text-primary bg-surface-base/50 border border-white/10 hover:bg-white/20 rounded-xl transition-colors relative z-50 ml-auto shadow-sm"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
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
                                <a
                                    href="https://chat.whatsapp.com/Gxa8GQH8bPcAC9Wd2IW3Ui"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full inline-flex items-center justify-center gap-2.5 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] font-bold transition-all hover:bg-[#25D366]/20"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Join our WhatsApp Community
                                </a>
                                {!loading && !user && (
                                    <Link
                                        href="/auth/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full text-center py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                                    >
                                        {authText}
                                    </Link>
                                )}
                                {!loading ? (
                                    <Link
                                        href={user ? (userData?.role === 'admin' || userData?.role === 'developer' ? '/admin' : '/dashboard') : '/test/showcase'}
                                        onClick={() => setIsOpen(false)}
                                        className="w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-cta-primary to-cta-hover text-white font-black hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all uppercase tracking-wide"
                                    >
                                        {user ? 'Dashboard' : 'Give a Mock'}
                                    </Link>
                                ) : (
                                    <div className="w-full h-[52px] rounded-xl bg-white/5 animate-pulse border border-white/10"></div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
