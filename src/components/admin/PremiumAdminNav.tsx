"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Settings } from "lucide-react";
import { AdminNavTabs } from "@/components/admin/AdminNavTabs";
import { AdminNavProfile } from "@/components/admin/AdminNavProfile";

export function PremiumAdminNav() {
    const pathname = usePathname();

    return (
        <header className="w-full bg-surface-base/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-40 hidden md:block">
            <div className="flex items-center justify-between px-6 h-16 w-full max-w-[1600px] mx-auto">
                {/* Left Section: Logo & Tabs */}
                <div className="flex items-center gap-8 h-full">
                    {/* Logo Area */}
                    <Link href="/admin" className="hover:opacity-80 transition-opacity flex items-center">
                        <div className="h-[60px] w-[210px] relative flex items-center justify-start">
                            <Image src="/du-logo-white.png" alt="DU Seva Admin Logo" fill className="object-contain" priority />
                            <span className="absolute right-0 bottom-3 text-[10px] font-mono text-cta-primary bg-cta-primary/10 px-1.5 py-0.5 rounded-full border border-cta-primary/20">Admin</span>
                        </div>
                    </Link>

                    {/* Tabular Navigation Strip */}
                    <AdminNavTabs />
                </div>

                {/* Right Section: Actions & Profile */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/settings"
                        className={`p-2 rounded-full transition-colors ${pathname === '/admin/settings' ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'
                            }`}
                        title="Settings"
                    >
                        <Settings className="h-5 w-5" />
                    </Link>

                    <div className="w-[1px] h-6 bg-white/10" />

                    {/* Dynamic User Dropdown */}
                    <AdminNavProfile />
                </div>
            </div>
        </header>
    );
}
