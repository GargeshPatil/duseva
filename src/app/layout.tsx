import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GlobalAuthLoader } from "@/components/auth/GlobalAuthLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DU Seva - CUET Mock Test Platform",
  description: "Official DU Seva Mock Test Platform for CUET aspirants. Ace your exams with mentor-guided preparation.",
  icons: {
    icon: '/du-logo.png',
    shortcut: '/du-logo.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable} antialiased bg-slate-50 text-slate-900`}>
        <AuthProvider>
          <GlobalAuthLoader>{children}</GlobalAuthLoader>
        </AuthProvider>
      </body>
    </html>
  );
}
