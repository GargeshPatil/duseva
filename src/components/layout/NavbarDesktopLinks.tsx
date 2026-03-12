import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'CUET 2026', href: '/cuet-2026' },
    { name: 'CUET Mocks', href: '/mocks' },
];

export function NavbarDesktopLinks() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    return (
        <div className="hidden lg:flex flex-1 justify-center items-center gap-2 relative z-10">
            <div className="flex items-center p-1.5 rounded-full bg-surface-base/50 border border-white/10 shadow-inner">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${isActive(link.href) ? 'text-white shadow-lg' : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'}`}
                    >
                        {isActive(link.href) && (
                            <motion.div
                                layoutId="nav-bg"
                                className="absolute inset-0 bg-gradient-to-r from-cta-primary to-cta-hover rounded-full -z-10 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                                initial={false}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className={isActive(link.href) ? "relative z-10" : ""}>{link.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
