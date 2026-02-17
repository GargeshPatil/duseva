"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import {
    LayoutDashboard,
    FileText,
    BarChart2,
    BookOpen,
    Settings,
    LogOut,
    GraduationCap
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Mock Tests", href: "/dashboard/tests", icon: FileText },
        { label: "Analysis", href: "/dashboard/analysis", icon: BarChart2 },
        { label: "Syllabus", href: "/dashboard/syllabus", icon: BookOpen },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-40 hidden md:flex shadow-sm">
            <div className="h-20 border-b border-slate-100 flex items-center justify-center">
                <Link href="/dashboard" className="relative h-12 w-32 block hover:opacity-80 transition-opacity">
                    <Image src="/du-logo.png" alt="DU Seva Logo" fill className="object-contain" priority />
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }
              `}
                        >
                            <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 space-y-1.5">
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</div>
                <Link
                    href="/dashboard/settings"
                    className={`
                        flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                        ${pathname === '/dashboard/settings'
                            ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }
                    `}
                >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Settings
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                >
                    <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
