"use client";

import Link from "next/link";
import { Home, TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-20 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center max-w-md w-full"
            >
                <div className="w-20 h-20 bg-semantic-error/10 text-semantic-error rounded-full flex items-center justify-center mb-6 ring-8 ring-semantic-error/5">
                    <TriangleAlert className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight mb-3">
                    Something went wrong
                </h1>

                <p className="text-text-secondary mb-8 leading-relaxed">
                    We encountered an unexpected error. Our team has been notified.
                    {error.message && (
                        <span className="block mt-2 text-sm text-text-muted bg-surface-elevated p-3 rounded-lg font-mono truncate max-w-full">
                            {error.message}
                        </span>
                    )}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-cta-primary hover:bg-cta-hover text-white rounded-lg font-medium transition-colors cursor-pointer w-full sm:w-auto"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-surface-elevated hover:bg-surface-glass text-text-primary rounded-lg font-medium transition-colors w-full sm:w-auto"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
