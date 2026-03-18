import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GlobalAuthLoader } from "@/components/auth/GlobalAuthLoader";
import { PremiumGradient } from "@/components/ui/PremiumGradient";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { PremiumCursorTracker } from "@/components/ui/PremiumCursorTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DU Seva - CUET Mock Test Platform",
  description: "Official DU Seva Mock Test Platform for CUET aspirants. Ace your exams with mentor-guided preparation."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Synchronous script to prevent FOUC
  const themeScript = `
    (function() {
      try {
        var path = window.location.pathname;
        var isDarkPath = path === '/' || path.startsWith('/about') || path.startsWith('/mocks') || path.startsWith('/auth') || path.startsWith('/dashboard') || path.startsWith('/test') || path.startsWith('/admin') || path.startsWith('/analysis');
        var savedTheme = localStorage.getItem('app-theme');
        var theme = 'light'; // default

        if (savedTheme) {
          theme = savedTheme === 'system' 
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : savedTheme;
        } else {
           // Default logic if no saved preference
           if (isDarkPath) {
             theme = 'dark';
           } else {
             theme = 'light';
           }
        }
        
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} ${inter.variable} antialiased bg-surface-base text-text-primary min-h-screen relative transition-colors duration-300 overflow-x-hidden`}>
        <ThemeProvider defaultTheme="system">
          <PremiumGradient variant="hero" />
          <PremiumCursorTracker />
          <div className="relative z-10 min-h-screen flex flex-col">
            <AuthProvider>
              <GlobalAuthLoader>{children}</GlobalAuthLoader>
            </AuthProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
