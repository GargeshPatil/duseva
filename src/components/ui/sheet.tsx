"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface SheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    side?: "left" | "right";
    className?: string;
}

export function Sheet({ open, onOpenChange, children, side = "right", className }: SheetProps) {
    const variants = {
        initial: { x: side === "left" ? "-100%" : "100%" },
        animate: { x: 0 },
        exit: { x: side === "left" ? "-100%" : "100%" }
    };

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
                    <div className={`fixed inset-0 z-50 flex ${side === "left" ? "justify-start" : "justify-end"} pointer-events-none`}>
                        <motion.div
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={variants}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className={cn("pointer-events-auto h-full w-3/4 max-w-sm bg-white shadow-xl flex flex-col", className)}
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
