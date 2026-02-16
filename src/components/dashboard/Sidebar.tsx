"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-40 hidden md:flex">
            <div className="p-6 border-b border-slate-100">
                <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-xl">
                    <GraduationCap className="h-6 w-6" />
                    <span>CUET Prep</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                                    ? "bg-blue-50 text-secondary"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }
              `}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
