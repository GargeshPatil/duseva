import Link from "next/link";
import Image from "next/image";

// ... (existing imports)

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <Link href="/" className="inline-block relative h-24 w-24 hover:scale-105 transition-transform">
                    <Image src="/du-logo.png" alt="DU Seva Logo" fill className="object-contain" priority />
                </Link>
            </div>
            {children}
        </div>
    );
}
