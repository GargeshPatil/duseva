"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Layers,
  PenTool,
  BarChart,
  Library
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
        { label: "Test Management", href: "/admin/management", icon: Library }, // Unified Hub
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Content (CMS)", href: "/admin/cms", icon: PenTool },
        { label: "Analytics", href: "/admin/analytics", icon: BarChart },
        { label: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <aside className="w-64 bg-surface-glass backdrop-blur-md border-r border-border h-screen fixed left-0 top-0 flex flex-col z-40 hidden md:flex text-text-secondary">
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                    <Link href="/" className="flex items-center gap-2 text-text-primary hover:text-cta-hover transition-colors">
                        <Layers className="h-6 w-6 text-cta-primary" />
                        <span className="text-xl font-bold tracking-tight">CUET Admin</span>
                    </Link>
                    <div className="text-xs text-text-muted mt-1 font-medium">
                        v2.0 • Control Center
                    </div>
                </div>
                <ThemeToggle />
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
                                    ? "bg-cta-primary text-white shadow-md"
                                    : "hover:bg-surface-elevated hover:text-text-primary"
                                }
              `}
                        >
                            <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-semantic-error hover:bg-semantic-error/10 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
