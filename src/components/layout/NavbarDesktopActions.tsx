import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface NavbarDesktopActionsProps {
    authText: string;
}

export function NavbarDesktopActions({ authText }: NavbarDesktopActionsProps) {
    const { user, userData, loading } = useAuth();

    return (
        <div className="hidden md:flex items-center justify-end gap-3 md:gap-5 w-auto lg:w-[350px] relative z-10">
            <Link
                href="/contact"
                className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors px-3 py-2 hover:bg-surface-elevated/50 rounded-lg"
            >
                Contact
            </Link>
            {!loading ? (
                user ? (
                    <Link
                        href={userData?.role === 'admin' || userData?.role === 'developer' ? '/admin' : '/dashboard'}
                        className="text-sm font-bold px-6 py-2.5 rounded-xl border border-border/80 bg-surface-glass hover:bg-surface-elevated text-text-primary transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 backdrop-blur-md"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <Link
                        href="/auth/login"
                        className="text-sm font-bold px-6 py-2.5 rounded-xl border border-border/80 bg-surface-glass hover:bg-surface-elevated text-text-primary transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 backdrop-blur-md"
                    >
                        {authText}
                    </Link>
                )
            ) : (
                <div className="w-[124px] h-[42px] rounded-xl bg-surface-elevated animate-pulse border border-border/80 blur-sm"></div>
            )}
            <Link
                href="/mocks"
                className="relative group text-sm font-bold px-7 py-2.5 rounded-xl bg-gradient-to-r from-cta-primary to-cta-hover text-white transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1 active:scale-95 overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Give a Mock</span>
            </Link>
        </div>
    );
}
