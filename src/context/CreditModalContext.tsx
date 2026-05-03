"use client";

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { CreditPackage } from "@/types/admin";

interface CreditModalContextType {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    /** Register the Razorpay buy handler from DashboardPage (or any checkout page) */
    registerBuyHandler: (fn: (pkg: CreditPackage) => Promise<void>) => void;
    handleBuyPackage: ((pkg: CreditPackage) => Promise<void>) | null;
}

const CreditModalContext = createContext<CreditModalContextType | undefined>(undefined);

export function CreditModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const buyHandlerRef = useRef<((pkg: CreditPackage) => Promise<void>) | null>(null);

    const openModal = useCallback(() => setIsOpen(true), []);
    const closeModal = useCallback(() => setIsOpen(false), []);

    /**
     * Any page that has the Razorpay script loaded (e.g. DashboardPage, future CheckoutPage)
     * calls registerBuyHandler once on mount to plug in their payment flow.
     * This keeps the modal completely decoupled from payment implementation details.
     */
    const registerBuyHandler = useCallback((fn: (pkg: CreditPackage) => Promise<void>) => {
        buyHandlerRef.current = fn;
    }, []);

    const handleBuyPackage = useCallback(async (pkg: CreditPackage) => {
        if (buyHandlerRef.current) {
            await buyHandlerRef.current(pkg);
        }
    }, []);

    return (
        <CreditModalContext.Provider value={{
            isOpen,
            openModal,
            closeModal,
            registerBuyHandler,
            handleBuyPackage,
        }}>
            {children}
        </CreditModalContext.Provider>
    );
}

export function useCreditModal(): CreditModalContextType {
    const ctx = useContext(CreditModalContext);
    if (!ctx) throw new Error("useCreditModal must be used within CreditModalProvider");
    return ctx;
}
