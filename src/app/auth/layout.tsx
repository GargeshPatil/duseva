import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-primary">
                    <BookOpen className="h-8 w-8" />
                    <span className="text-2xl font-bold">CUET Prep</span>
                </Link>
            </div>
            {children}
        </div>
    );
}
