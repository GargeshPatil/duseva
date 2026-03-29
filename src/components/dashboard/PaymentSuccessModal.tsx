import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    creditsAdded: number;
}

export function PaymentSuccessModal({ isOpen, onClose, creditsAdded }: PaymentSuccessModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Trigger confetti when modal opens
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-md bg-surface-elevated border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10"
                    >
                        {/* Glowing orb effect in background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 pb-6 flex flex-col items-center text-center">
                            {/* Success Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                                className="relative mb-6"
                            >
                                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full translate-y-2" />
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                </div>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border border-emerald-500/30 rounded-full border-dashed"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                                <p className="text-white/60 mb-6">
                                    Your transaction was completed successfully. Your wallet has been topped up.
                                </p>
                            </motion.div>

                            {/* Credits Added Highlight */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-8 flex items-center justify-center gap-3"
                            >
                                <Sparkles className="w-6 h-6 text-emerald-400" />
                                <div className="text-left">
                                    <div className="text-sm font-medium text-emerald-400 font-mono">CREDITS ADDED</div>
                                    <div className="text-2xl font-bold text-white">+{creditsAdded} Credits</div>
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                onClick={onClose}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-cta-primary hover:bg-cta-primary/90 text-white font-medium rounded-xl transition-colors shadow-lg shadow-cta-primary/20"
                            >
                                Continue to Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
