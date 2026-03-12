"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, BarChart2, Menu, LogOut, Settings, BookOpen } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, userData } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const navItems = [
        { label: "Home", href: "/dashboard", icon: LayoutDashboard },
        { label: "Mocks", href: "/dashboard/tests", icon: FileText },
        { label: "Analysis", href: "/dashboard/analysis", icon: BarChart2 },
    ];

    const menuItems = [
        ...navItems,
        { label: "Syllabus", href: "/dashboard/syllabus", icon: BookOpen },
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <>
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-base/95 backdrop-blur-xl border-t border-border/50 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <nav className="flex items-center justify-between px-6 h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                flex flex-col items-center justify-center space-y-1 transition-colors
                                ${isActive ? "text-cta-primary" : "text-text-muted hover:text-text-primary"}
                            `}
                            >
                                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-surface-elevated shadow-sm' : ''}`}>
                                    <item.icon className={`h-5 w-5 ${isActive ? "fill-current" : ""}`} />
                                </div>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className={`
                            flex flex-col items-center justify-center space-y-1 transition-colors text-text-muted hover:text-text-primary
                        `}
                    >
                        <div className="p-1">
                            <Menu className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-medium">Menu</span>
                    </button>
                </nav>
            </div>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetContent onClose={() => setIsMenuOpen(false)}>
                    <SheetHeader>
                        <div className="relative h-[72px] w-[210px]">
                            <Image src="/du-logo-white.png" alt="DU Seva" fill className="object-contain object-left" />
                        </div>
                        <div className="mt-4">
                            <p className="font-bold text-text-primary">{userData?.name || 'Student'}</p>
                            <p className="text-xs text-text-muted truncate">{userData?.email}</p>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                                        ${isActive
                                            ? "bg-white/10 text-cta-primary"
                                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                                        }
                                    `}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? "text-cta-primary" : "text-text-muted"}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-lg text-sm font-medium text-semantic-error hover:bg-semantic-error/10 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
