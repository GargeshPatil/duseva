"use client";

import Link from "next/link";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-20 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center max-w-md w-full"
            >
                <div className="w-24 h-24 bg-surface-elevated text-text-muted rounded-full flex items-center justify-center mb-8 ring-8 ring-surface-glass">
                    <FileQuestion className="w-12 h-12" />
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight mb-4 select-none">
                    404 - Page Not Found
                </h1>

                <p className="text-text-secondary mb-10 text-lg leading-relaxed">
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-elevated hover:bg-surface-glass text-text-primary rounded-xl font-medium transition-colors cursor-pointer w-full sm:w-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-cta-primary hover:bg-cta-hover text-white rounded-xl font-medium transition-colors w-full sm:w-auto shadow-lg shadow-cta-primary/20"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
