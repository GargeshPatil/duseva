"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    LogOut,
    Layers,
    PenTool,
    BarChart,
    Menu,
    X,
    FolderOpen,
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
        { label: "Tests", href: "/admin/tests", icon: FileText },
        { label: "Question Bank", href: "/admin/questions", icon: Library },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Content (CMS)", href: "/admin/cms", icon: PenTool },
        { label: "Media", href: "/admin/media", icon: FolderOpen },
        { label: "Analytics", href: "/admin/analytics", icon: BarChart },
        { label: "Settings", href: "/admin/settings", icon: Settings },
    ];

    const activeItem = navItems.find(item => pathname === item.href) || navItems[0];

    return (
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between px-4 h-16">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpen(true)}
                        className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <Sheet open={open} onOpenChange={setOpen} side="left">
                        <SheetContent onClose={() => setOpen(false)} className="w-full max-w-xs p-0 flex flex-col">
                            <SheetHeader className="p-6 border-b border-slate-100 text-left">
                                <SheetTitle className="flex items-center gap-2">
                                    <Layers className="h-6 w-6 text-blue-600" />
                                    <span className="font-bold text-slate-900">CUET Admin</span>
                                </SheetTitle>
                                <div className="text-sm text-slate-500 mt-1">
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
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                }
                                            `}
                                        >
                                            <item.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-slate-100">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Sign Out
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                        {activeItem?.label || 'Admin Panel'}
                    </span>
                </div>

                {/* Quick Action Placeholder (e.g. Notifications) */}
                <div className="w-8"></div>
            </div>
        </div>
    );
}
