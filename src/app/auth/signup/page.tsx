"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function SignupPage() {
    const router = useRouter();
    const { signup, loginWithGoogle, user, userData } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Redirect if already logged in
    useEffect(() => {
        if (user && userData) {
            router.push("/dashboard");
        }
    }, [user, userData, router]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            await signup(email, password, name);
            // Redirect handled by useEffect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create account");
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
                <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
                <p className="text-text-secondary mt-2">Start your journey to a top university</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                />
                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                />
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    required
                    minLength={6}
                />
                <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    required
                    minLength={6}
                />

                <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        <>
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-4">
                <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isLoading} text="Sign up with Google" />
            </div>

            <div className="mt-6 text-center text-sm text-text-secondary">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-semibold text-cta-primary hover:underline">
                    Sign in
                </Link>
            </div>
        </div>
    );
}
