"use client";

import Link from 'next/link';
import { Button } from '../ui/Button';
import { Menu, X, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'CUET 2026', href: '/cuet-2026' },
        { name: 'CUET Mocks', href: '/mocks' },
    ];

    return (
        <nav className="border-b border-slate-200 sticky top-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
            <div className="container px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">

                {/* Logo Area */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative h-24 w-24 md:h-32 md:w-32 transition-transform group-hover:scale-105">
                        <Image src="/du-logo.png" alt="DU Seva Logo" fill className="object-contain" />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive(link.href) ? 'text-blue-600' : 'text-slate-600'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/contact">
                        <Button variant="ghost" size="sm" className="font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                            Contact Us
                        </Button>
                    </Link>
                    <Link href="/auth/login">
                        <Button variant="ghost" size="sm" className="font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                            Login
                        </Button>
                    </Link>
                    <Link href="/mocks">
                        <Button
                            size="md"
                            className="font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 rounded-full transition-all hover:-translate-y-0.5"
                        >
                            Give a Mock
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden overflow-hidden bg-white border-t border-slate-100 shadow-xl"
                    >
                        <div className="p-4 flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 ${isActive(link.href) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600'}`}
                                >
                                    {link.name}
                                    <ChevronRight className="h-4 w-4 opacity-50" />
                                </Link>
                            ))}
                            <div className="border-t border-slate-100 my-2 pt-2 space-y-3">
                                <Link href="/contact" onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full justify-center">Contact Us</Button>
                                </Link>
                                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full justify-center">Login</Button>
                                </Link>
                                <Link href="/mocks" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 shadow-md">Give a Mock</Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
