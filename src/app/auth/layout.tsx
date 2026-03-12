"use client";

import { PremiumGradient } from "@/components/ui/PremiumGradient";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative text-text-primary">
            <PremiumGradient variant="transition" className="fixed inset-0" />
            <div className="relative z-10 w-full max-w-md mx-auto">
                {children}
            </div>
        </div>
    );
}
