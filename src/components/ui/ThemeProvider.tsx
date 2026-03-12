"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
}

interface ThemeProviderState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
    theme: 'system',
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = 'system',
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('app-theme') as Theme | null;
        if (savedTheme) {
            setThemeState(savedTheme);
        } else {
            // Sync strictly with whatever the FOUC script decided to prevent hydration flashes
            const scriptTheme = window.document.documentElement.getAttribute('data-theme') as Theme | null;
            if (scriptTheme) {
                setThemeState(scriptTheme);
            }
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
                .matches
                ? 'dark'
                : 'light';

            root.setAttribute('data-theme', systemTheme);
            return;
        }

        root.setAttribute('data-theme', theme);
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem('app-theme', newTheme);
        setThemeState(newTheme);
    };

    return (
        <ThemeProviderContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
