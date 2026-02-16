"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    LogOut,
    Layers,
    PenTool,
    BarChart
} from "lucide-react";

export function AdminSidebar() {
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
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Test Management", href: "/admin/tests", icon: FileText },
        { label: "Content (CMS)", href: "/admin/cms", icon: PenTool },
        { label: "Media Library", href: "/admin/media", icon: Layers },
        { label: "User Management", href: "/admin/users", icon: Users },
        { label: "Payments", href: "/admin/payments", icon: BarChart }, // Reusing BarChart for now or generic
        { label: "Analytics", href: "/admin/analytics", icon: BarChart },
        { label: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-40 hidden md:flex text-slate-300">
            <div className="p-6 border-b border-slate-800">
                <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
                    <Layers className="h-6 w-6 text-blue-500" />
                    <span className="text-xl font-bold tracking-tight">CUET Admin</span>
                </Link>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                    v2.0 • Control Center
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                    : "hover:bg-slate-800 hover:text-white"
                                }
              `}
                        >
                            <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
