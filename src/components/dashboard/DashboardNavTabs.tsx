import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tests", href: "/dashboard/tests", icon: FileText },
    { label: "Analysis", href: "/dashboard/analysis", icon: BarChart2 },
];

export function DashboardNavTabs() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center h-full gap-1">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`relative h-full flex items-center px-4 transition-colors ${isActive ? "text-white" : "text-text-secondary hover:text-white"
                            }`}
                    >
                        <span className="relative z-10 flex items-center gap-2 text-sm font-semibold tracking-wide">
                            <item.icon className={`h-4 w-4 ${isActive ? 'text-cta-primary' : 'text-text-muted opacity-70'}`} />
                            {item.label}
                        </span>
                        {isActive && (
                            <motion.div
                                layoutId="dashboard-tab-indicator"
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-cta-primary rounded-t-full shadow-[0_-2px_8px_rgba(255,255,255,0.4)]"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        {isActive && (
                            <div className="absolute bottom-0 left-1/4 right-1/4 h-8 bg-cta-primary/10 blur-xl pointer-events-none rounded-t-full" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
