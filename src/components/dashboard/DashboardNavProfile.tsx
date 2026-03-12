import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Settings, LogOut } from "lucide-react";

export function DashboardNavProfile() {
    const router = useRouter();
    const { logout, userData } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getInitials = (name?: string) => {
        if (!name) return "ST";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(userData?.name);

    return (
        <div className="relative" ref={profileRef}>
            <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cta-primary/50"
            >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-inner border border-white/20">
                    {initials}
                </div>
                <div className="hidden lg:flex flex-col items-start text-left">
                    <span className="text-sm font-semibold text-white leading-tight">
                        {userData?.name || 'Student'}
                    </span>
                    <span className="text-[10px] text-text-muted font-medium truncate max-w-[120px]">
                        {userData?.email || 'Student Account'}
                    </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-text-muted transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isProfileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-56 bg-surface-elevated/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden origin-top-right z-50"
                    >
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <p className="text-sm font-bold text-white truncate">{userData?.name || 'Student'}</p>
                            <p className="text-xs text-text-muted truncate mt-0.5">{userData?.email}</p>
                        </div>
                        <div className="p-2 space-y-1">
                            <Link
                                href="/dashboard/settings"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <Settings className="h-4 w-4" />
                                Account Settings
                            </Link>
                        </div>
                        <div className="p-2 border-t border-white/5">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-semantic-error/90 hover:text-semantic-error hover:bg-semantic-error/10 rounded-lg transition-colors font-medium"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
