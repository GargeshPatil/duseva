"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Layers,
  PenTool,
  BarChart,
  Menu,
  Library
} from "lucide-react";

export function AdminMobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, userData } = useAuth();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const navItems = [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Test Management", href: "/admin/management", icon: Library }, // Unified Hub
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Content (CMS)", href: "/admin/cms", icon: PenTool },
        { label: "Analytics", href: "/admin/analytics", icon: BarChart },
        { label: "Settings", href: "/admin/settings", icon: Settings },
    ];

    const activeItem = navItems.find(item => pathname === item.href) || navItems[0];

    return (
        <div className="md:hidden sticky top-0 z-30 bg-surface-base/95 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between px-4 h-16">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpen(true)}
                        className="p-2 -ml-2 text-text-primary hover:bg-surface-elevated rounded-lg transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <Sheet open={open} onOpenChange={setOpen} side="left">
                        <SheetContent onClose={() => setOpen(false)} className="w-full max-w-xs p-0 flex flex-col bg-surface-glass border-r border-white/10">
                            <SheetHeader className="p-6 border-b border-white/10 text-left">
                                <SheetTitle className="flex items-center gap-2">
                                    <Layers className="h-6 w-6 text-cta-primary" />
                                    <span className="font-bold text-text-primary">CUET Admin</span>
                                </SheetTitle>
                                <div className="text-sm text-text-muted mt-1">
                                    {userData?.name || 'Admin User'}
                                </div>
                            </SheetHeader>

                            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                                                ${isActive
                                                    ? "bg-surface-elevated border border-border/50 text-cta-primary"
                                                    : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                                                }
                                            `}
                                        >
                                            <item.icon className={`h-5 w-5 ${isActive ? "text-cta-primary" : "text-text-muted"}`} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

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

                    <span className="font-semibold text-text-primary truncate max-w-[200px]">
                        {activeItem?.label || 'Admin Panel'}
                    </span>
                </div>

                {/* Quick Action Placeholder (e.g. Notifications) */}
                <div className="w-8"></div>
            </div>
        </div>
    );
}
