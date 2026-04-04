"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Loader2, ArrowLeft, Chrome } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, ConfirmationResult } from "firebase/auth";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function SignupPage() {
    const router = useRouter();
    const { user, userData, initiateEmailSignup, completeEmailSignup, initiateGoogleSignup, sendGooglePhoneOTP, completeGoogleSignup, setupRecaptcha } = useAuth();
    
    type StepType = "details" | "email-otp" | "google-phone" | "google-otp";
    const [step, setStep] = useState<StepType>("details");
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    
    // Auth states
    const [otpCode, setOtpCode] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [googleAuthUser, setGoogleAuthUser] = useState<User | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // ReCAPTCHA is now initialized on-demand before OTP request

    const formatPhone = (p: string) => {
        let f = p.trim();
        if (f.length === 10 && !f.startsWith("+")) f = "+91" + f;
        return f;
    };

    const handleDetailsSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        const formattedPhone = formatPhone(formData.phone);

        try {
            const confirmation = await initiateEmailSignup(
                formData.email,
                formData.password,
                formData.name,
                formattedPhone,
                "recaptcha-container"
            );
            setConfirmationResult(confirmation);
            setStep("email-otp");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            let errorMessage = err?.message || "Failed to initiate signup. Please check details.";
            errorMessage = errorMessage.replace(/^Firebase:\s*/, "");
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!confirmationResult) return;

        setIsLoading(true);
        setError("");
        const formattedPhone = formatPhone(formData.phone);

        try {
            await completeEmailSignup(
                confirmationResult,
                otpCode,
                formData.email,
                formData.name,
                formattedPhone,
                formData.password
            );
            router.push("/dashboard");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            let errorMessage = err?.message || "Invalid OTP or registration failed";
            errorMessage = errorMessage.replace(/^Firebase:\s*/, "");
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleGoogleSignInClick = async () => {
        setIsLoading(true);
        setError("");
        
        try {
            const { isNewUser, user: gUser } = await initiateGoogleSignup();
            if (isNewUser && gUser) {
                setGoogleAuthUser(gUser);
                setStep("google-phone");
                setIsLoading(false);
            } else {
                router.push("/dashboard");
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            let errorMessage = err?.message || "Failed to initialize Google Sign In";
            errorMessage = errorMessage.replace(/^Firebase:\s*/, "");
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleGooglePhoneSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        if (!googleAuthUser) return;
        
        setIsLoading(true);
        setError("");
        const formattedPhone = formatPhone(formData.phone);

        try {
            const confirmation = await sendGooglePhoneOTP(googleAuthUser, formattedPhone, "recaptcha-container");
            setConfirmationResult(confirmation);
            setStep("google-otp");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            let errorMessage = err?.message || "Failed to send OTP. Phone number may be invalid or already used.";
            errorMessage = errorMessage.replace(/^Firebase:\s*/, "");
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!confirmationResult || !googleAuthUser) return;

        setIsLoading(true);
        setError("");
        const formattedPhone = formatPhone(formData.phone);

        try {
            await completeGoogleSignup(confirmationResult, otpCode, googleAuthUser, formattedPhone);
            router.push("/dashboard");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            let errorMessage = err?.message || "Invalid OTP. Please try again.";
            errorMessage = errorMessage.replace(/^Firebase:\s*/, "");
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="w-full max-w-md bg-surface-card p-8 rounded-xl shadow-lg border border-border relative">
            <div className="text-center mb-8">
                {step !== "details" && (
                     <button 
                         type="button" 
                         onClick={() => {
                             if (step === "email-otp") setStep("details");
                             if (step === "google-phone") setStep("details");
                             if (step === "google-otp") setStep("google-phone");
                             setError("");
                         }}
                         className="absolute top-6 left-6 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                     >
                         <ArrowLeft className="h-5 w-5" />
                     </button>
                )}
                <h1 className="text-2xl font-bold text-text-primary">
                    {step === "details" ? "Create Account"
                    : step === "google-phone" ? "Complete Profile" 
                    : "Verify Phone"}
                </h1>
                <p className="text-text-secondary mt-2">
                    {step === "details" ? "Start your journey to a top university" 
                    : step === "google-phone" ? "Please securely link a phone number"
                    : `Enter the 6-digit code sent to ${formData.phone}`}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
                    {error}
                </div>
            )}

            {step === "details" && (
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
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                </form>
            )}

            {step === "email-otp" && (
                <form onSubmit={handleEmailOtpSubmit} className="space-y-4 flex flex-col items-center">
                    <OTPInput value={otpCode} onChange={(val) => setOtpCode(val)} />
                    <Button type="submit" className="w-full mt-6" disabled={isLoading || otpCode.length < 6}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Create Account"}
                    </Button>
                    <OTPTimer onResend={() => handleDetailsSubmit()} disabled={isLoading} />
                </form>
            )}

            {step === "google-phone" && (
                <form onSubmit={handleGooglePhoneSubmit} className="space-y-4">
                    <Input
                        label="Link Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        type="tel"
                        placeholder="9876543210"
                        required
                        minLength={10}
                    />
                    <Button type="submit" className="w-full mt-6" disabled={isLoading || formData.phone.length < 10}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Send OTP <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                </form>
            )}

            {step === "google-otp" && (
                <form onSubmit={handleGoogleOtpSubmit} className="space-y-4 flex flex-col items-center">
                    <OTPInput value={otpCode} onChange={(val) => setOtpCode(val)} />
                    <Button type="submit" className="w-full mt-6" disabled={isLoading || otpCode.length < 6}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Complete Signup"}
                    </Button>
                    <OTPTimer onResend={() => handleGooglePhoneSubmit()} disabled={isLoading} />
                </form>
            )}

            {step === "details" && (
                <>
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

        </div>
    );
}

function OTPTimer({ onResend, disabled }: { onResend: () => void, disabled: boolean }) {
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    return (
        <div className="mt-4 text-sm text-center">
            {timeLeft > 0 ? (
                <p className="text-text-secondary">Resend OTP in <span className="font-medium text-text-primary">00:{timeLeft.toString().padStart(2, '0')}</span></p>
            ) : (
                <button 
                    type="button" 
                    onClick={() => { setTimeLeft(60); onResend(); }} 
                    disabled={disabled}
                    className="text-cta-primary font-semibold hover:underline disabled:opacity-50"
                >
                    Resend OTP
                </button>
            )}
        </div>
    );
}

function OTPInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value;
        if (isNaN(Number(val))) return;

        let newOtp = value.split("");
        newOtp[index] = val.substring(val.length - 1); 
        const newOtpString = newOtp.join("");
        
        onChange(newOtpString);

        if (val !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasteData) {
            onChange(pasteData);
            const focusIndex = Math.min(pasteData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    return (
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1} // Only allow 1 but handle pasting visually
                    value={value[index] || ""}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 rounded-xl border-2 border-border/80 bg-surface-base text-center text-2xl font-bold text-text-primary focus:outline-none focus:border-cta-primary focus:ring-2 focus:ring-cta-primary/30 transition-all shadow-sm"
                />
            ))}
        </div>
    );
}
