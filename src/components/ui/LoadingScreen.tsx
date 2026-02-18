"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function LoadingScreen() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
        >
            <div className="relative w-32 h-12 mb-8">
                <Image
                    src="/du-logo.png"
                    alt="DU Seva Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <motion.div
                        className="absolute inset-0 border-4 border-slate-100 rounded-full"
                    />
                    <motion.div
                        className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-1"
                >
                    <h3 className="text-lg font-semibold text-slate-900">
                        Signing you in
                    </h3>
                    <p className="text-sm text-slate-500">
                        Retrieving your profile...
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}
