"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User } from "firebase/auth";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function SignupPage() {
    const router = useRouter();
    const { emailSignup, initiateGoogleSignup, completeGoogleSignup } = useAuth();

    type StepType = "details" | "google-phone";
    const [step, setStep] = useState<StepType>("details");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [googleAuthUser, setGoogleAuthUser] = useState<User | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const formatPhone = (p: string) => {
        let f = p.trim();
        if (f.length === 10 && !f.startsWith("+")) f = "+91" + f;
        return f;
    };

    // ─── Email Signup ────────────────────────────────────────────────────────────
    const handleDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        const formattedPhone = formatPhone(formData.phone);

        try {
            await emailSignup(formData.email, formData.password, formData.name, formattedPhone);
            router.push("/dashboard");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Failed to create account. Please check your details.");
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Google Signup ───────────────────────────────────────────────────────────
    const handleGoogleSignInClick = async () => {
        setIsLoading(true);
        setError("");

        try {
            const { isNewUser, user: gUser } = await initiateGoogleSignup();
            if (isNewUser && gUser) {
                setGoogleAuthUser(gUser);
                setStep("google-phone");
            } else {
                router.push("/dashboard");
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Failed to initialize Google Sign In");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGooglePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!googleAuthUser) return;

        setIsLoading(true);
        setError("");
        const formattedPhone = formatPhone(formData.phone);

        try {
            await completeGoogleSignup(googleAuthUser, formattedPhone);
            router.push("/dashboard");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Failed to complete signup. Phone may already be registered.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="w-full max-w-md bg-surface-card p-8 rounded-xl shadow-lg border border-border relative">
            <div className="text-center mb-8">
                {step === "google-phone" && (
                    <button
                        type="button"
                        onClick={() => { setStep("details"); setError(""); }}
                        className="absolute top-6 left-6 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                )}
                <h1 className="text-2xl font-bold text-text-primary">
                    {step === "details" ? "Create Account" : "Link Phone Number"}
                </h1>
                <p className="text-text-secondary mt-2">
                    {step === "details"
                        ? "Start your journey to a top university"
                        : "Add your phone number to complete signup"}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
                    {error}
                </div>
            )}

            {step === "details" && (
                <>
                    <form onSubmit={handleDetailsSubmit} className="space-y-4">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            type="text"
                            placeholder="John Doe"
                            required
                        />
                        <Input
                            label="Email Address"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            type="email"
                            placeholder="you@example.com"
                            required
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            type="tel"
                            placeholder="9876543210"
                            required
                            minLength={10}
                        />
                        <div className="grid grid-cols-2 gap-3 mb-1">
                            <Input
                                label="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                type="password"
                                placeholder="Create"
                                required
                                minLength={6}
                            />
                            <Input
                                label="Confirm"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                type="password"
                                placeholder="Confirm"
                                required
                                minLength={6}
                            />
                        </div>
                        <p className="text-xs text-text-muted px-1">
                            * Password must contain at least 6 characters.
                        </p>

                        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                            {isLoading
                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
                        </Button>
                    </form>

                    <div className="mt-4">
                        <GoogleSignInButton
                            onClick={handleGoogleSignInClick}
                            disabled={isLoading}
                            text="Sign up with Google"
                        />
                    </div>

                    <div className="mt-6 text-center text-sm text-text-secondary">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-semibold text-cta-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </>
            )}

            {step === "google-phone" && (
                <form onSubmit={handleGooglePhoneSubmit} className="space-y-4">
                    <Input
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        type="tel"
                        placeholder="9876543210"
                        required
                        minLength={10}
                    />
                    <p className="text-xs text-text-muted px-1">
                        Your phone number is used for account recovery and must be unique.
                    </p>
                    <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={isLoading || formData.phone.length < 10}
                    >
                        {isLoading
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <>Complete Signup <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                </form>
            )}
        </div>
    );
}
