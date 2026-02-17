"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface SheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="pointer-events-auto h-full w-3/4 max-w-sm bg-white shadow-xl flex flex-col"
                        >
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

export function SheetContent({ children, className, onClose }: { children: React.ReactNode, className?: string, onClose?: () => void }) {
    return (
        <div className={cn("flex flex-col h-full", className)}>
            <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
            >
                <X className="h-5 w-5 text-slate-500" />
            </button>
            {children}
        </div>
    );
}

export function SheetHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("p-6 border-b border-slate-100", className)}>
            {children}
        </div>
    );
}

export function SheetTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <h2 className={cn("text-lg font-bold text-slate-900", className)}>
            {children}
        </h2>
    );
}
