"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

// ... imports

export default function LoginPage() {
    const router = useRouter();
    const { login, loginWithGoogle, user, userData } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Redirect based on role
    useEffect(() => {
        if (user && userData) {
            if (userData.role === 'admin' || userData.role === 'developer') {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        }
    }, [user, userData, router]);

    // Show loading screen if user is already logged in to prevent form flash
    if (user && userData) {
        return <LoadingScreen />;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            await login(email, password);
            // Redirect handled by useEffect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            setError("Invalid email or password");
            setIsLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        setIsLoading(true);
        setError("");
        try {
            await loginWithGoogle();
            // Redirect handled by useEffect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to sign in with Google");
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md bg-surface-card p-8 rounded-xl shadow-lg border border-border">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
                <p className="text-text-secondary mt-2">Sign in to continue your preparation</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                />
                <div>
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                    />
                    <div className="flex justify-end mt-1">
                        <Link
                            href="/auth/forgot-password"
                            className="text-xs font-medium text-cta-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign In <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-4">
                <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isLoading} />
            </div>

            <div className="mt-6 text-center text-sm text-text-secondary">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="font-semibold text-cta-primary hover:underline">
                    Create account
                </Link>
            </div>
        </div>
    );
}
