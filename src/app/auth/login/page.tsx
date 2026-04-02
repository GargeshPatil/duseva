"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
    const router = useRouter();
    const { login, loginWithGoogle, user, userData } = useAuth();
    
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
        if (user && userData) {
            router.push("/dashboard");
        }
    }, [user, userData, router]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await login(identifier, password);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message || "Invalid credentials");
            setIsLoading(false);
        }
    };

    async function handleGoogleSignIn() {
        setIsLoading(true);
        setError("");
        try {
            await loginWithGoogle();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Google Auth Error:", err);
            setError(err.message || "Failed to sign in with Google");
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md bg-surface-card p-8 rounded-xl shadow-lg border border-border relative">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-text-primary">
                    Welcome Back
                </h1>
                <p className="text-text-secondary mt-2">
                    Sign in to pick up where you left off
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <Input
                    label="Email or Phone Number"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com or 9876543210"
                    required
                />
                <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-medium leading-none text-text-secondary">Password</label>
                        <Link href="/auth/forgot-password" className="text-xs font-semibold text-cta-primary hover:underline">
                            Forgot Password?
                        </Link>
                    </div>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
            </form>

            <div className="mt-4">
                <GoogleSignInButton
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                />
            </div>

            <div className="mt-6 text-center text-sm text-text-secondary">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="font-semibold text-cta-primary hover:underline">
                    Sign up
                </Link>
            </div>
        </div>
    );
}
