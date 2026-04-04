"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    PhoneAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    linkWithPhoneNumber,
    updateProfile,
    sendEmailVerification,
    ConfirmationResult,
    EmailAuthProvider,
    linkWithCredential
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, Timestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

// Define the shape of the user data stored in Firestore
export interface UserData {
    uid: string;
    email: string;
    phone?: string;
    name: string;
    role: "student" | "admin" | "developer"; // Default is student
    createdAt: Timestamp;
    lastLoginAt: Timestamp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    purchasedTests?: Record<string, any>; // Legacy map for purchased tests
    credits: number;
    totalCreditsPurchased: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    performanceSummary: Record<string, any>; // Map for performance summary
    stream?: 'Science' | 'Commerce' | 'Humanities';
    targetUniversity?: string;
    onboardingCompleted?: boolean;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    
    initiateEmailSignup: (email: string, password: string, name: string, phone: string, containerId: string) => Promise<ConfirmationResult>;
    completeEmailSignup: (confirmationResult: ConfirmationResult, code: string, email: string, name: string, phone: string, password: string) => Promise<void>;
    
    initiateGoogleSignup: () => Promise<{ isNewUser: boolean, user: User }>;
    sendGooglePhoneOTP: (user: User, phone: string, containerId: string) => Promise<ConfirmationResult>;
    completeGoogleSignup: (confirmationResult: ConfirmationResult, code: string, user: User, phone: string) => Promise<void>;
    
    setupRecaptcha: (containerId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recaptchaVerifier: any;
        recaptchaRendered: boolean;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const isOtpRequestInProgress = useRef(false);

    useEffect(() => {
        let unsubscribeSnapshot: () => void;

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // Set up real-time listener immediately when user is detected
                const userDocRef = doc(db, "users", currentUser.uid);
                unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data() as UserData;
                        // Fallback for missing credits on legacy accounts
                        if (data.credits === undefined) {
                            data.credits = 0;
                        }
                        console.log("Fetched userData:", data);
                        setUserData(data);
                    } else {
                        console.warn("User authenticated but no Firestore document found.");
                        setUserData(null);
                    }
                    // Data is loaded (or not found), so we can stop loading
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user data:", error);
                    setLoading(false);
                });

            } else {
                setUser(null);
                setUserData(null);
                if (unsubscribeSnapshot) {
                    unsubscribeSnapshot();
                }
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
            }
        };
    }, []);

    // Independent One-time update for lastLogin
    useEffect(() => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            // Fire and forget update - use updateDoc to avoid creating an empty doc before signup finishes
            updateDoc(userDocRef, { lastLoginAt: Timestamp.now() }).catch(() => {
                // Ignore errors silently (new users won't be found, which is intended)
            });
        }
    }, [user?.uid]);

    const clearRecaptcha = () => {
        if (typeof window !== "undefined" && window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (e) {
                console.warn("[AuthContext] Error clearing recaptcha", e);
            }
            window.recaptchaVerifier = undefined;
            window.recaptchaRendered = false;
            
            const container = document.getElementById("recaptcha-container");
            if (container) {
                container.innerHTML = "";
            }
        }
    };

    const createFreshRecaptcha = async (containerId: string) => {
        if (typeof window === "undefined") throw new Error("Window is undefined");

        clearRecaptcha();

        console.log("[AuthContext] Creating fresh ReCAPTCHA verifier...");
        const verifier = new RecaptchaVerifier(auth, containerId, {
            size: 'invisible',
            callback: () => {
                console.log("reCAPTCHA solved");
            }
        });

        console.log("[AuthContext] Rendering fresh ReCAPTCHA...");
        await verifier.render();
        console.log("[AuthContext] ReCAPTCHA rendered successfully!");
        
        window.recaptchaVerifier = verifier;
        window.recaptchaRendered = true;

        return verifier;
    };

    const setupRecaptcha = async (containerId: string) => {
        // Obsolete: We now do this right before sending OTP.
    };

    const initiateEmailSignup = async (email: string, password: string, name: string, phone: string, containerId: string) => {
        if (isOtpRequestInProgress.current) {
            throw new Error("OTP request already in progress. Please wait.");
        }
        isOtpRequestInProgress.current = true;

        try {
            // Enforce DB-level uniqueness strictly before any SMS is sent to avoid limbo conflicts
            const checkRes = await fetch('/api/auth/check-unique', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone })
            });

            if (!checkRes.ok) {
                const errData = await checkRes.json();
                throw new Error(errData.error || "Validation failed before sending OTP. Please try again or sign in.");
            }

            const recaptcha = await createFreshRecaptcha(containerId);
            
            console.log("Attempting OTP dispatch with parameters:");
            console.log("Phone:", phone);

            try {
                // We use direct signInWithPhoneNumber so we own the phone credential immediately
                const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptcha);
                console.log("OTP sent successfully");
                return confirmationResult;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                clearRecaptcha(); // clear stale verifier
                // Log the full raw Firebase error to diagnose billing/plan/SMS issues
                console.error("[PhoneAuth] signInWithPhoneNumber failed:");
                console.error("  code:", error.code);
                console.error("  message:", error.message);
                console.error("  customData:", JSON.stringify(error.customData ?? {}));
                console.error("  serverResponse:", JSON.stringify(error.customData?._tokenResponse ?? error.customData?.serverResponse ?? {}));
                console.error("  full error:", error);

                if (error.code === 'auth/internal-error') {
                    // Extract the actual server reason if Firebase embeds it
                    const serverMsg = error.customData?._tokenResponse?.error?.message
                        || error.customData?.serverResponse?.error?.message
                        || null;
                    // If serverResponse is empty, this is a client-side script block (ad blocker etc.)
                    const isClientSideBlock = !serverMsg;
                    if (isClientSideBlock) {
                        throw new Error("reCAPTCHA couldn't load. Please disable your ad blocker, try an incognito window, or use a different browser.");
                    }
                    throw new Error(`Phone auth failed: ${serverMsg}`);
                }
                if (error.code === 'auth/invalid-recaptcha-token' || error.code === 'auth/missing-recaptcha-token') {
                    throw new Error(`reCAPTCHA validation failed [${error.code}]. Ensure duseva.in is in Firebase Authorized Domains.`);
                }
                throw new Error(error.message || "Failed to send OTP to this phone. Please verify the number.");
            }
        } finally {
            isOtpRequestInProgress.current = false;
        }
    };

    const completeEmailSignup = async (confirmationResult: ConfirmationResult, code: string, email: string, name: string, phone: string, password: string) => {
        // Authenticate the user safely as the verified Phone User
        const result = await confirmationResult.confirm(code);
        const signedInUser = result.user;

        // Immediately upgrade this phone user with the newly collected Email & Password provider credential
        try {
            const credential = EmailAuthProvider.credential(email, password);
            await linkWithCredential(signedInUser, credential);
            await updateProfile(signedInUser, { displayName: name });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (updateErr: any) {
            console.error("Error upgrading user with email/password:", updateErr);
            throw new Error(updateErr.message || "Failed to upgrade your account. Please contact support.");
        }

        await sendEmailVerification(signedInUser).catch(() => {}); // Fire and forget

        const newUser: UserData = {
            uid: signedInUser.uid,
            email: email,
            phone: phone,
            name: name,
            role: "student",
            createdAt: Timestamp.now(),
            lastLoginAt: Timestamp.now(),
            purchasedTests: {},
            credits: 10,
            totalCreditsPurchased: 0,
            performanceSummary: {}
        };
        
        await setDoc(doc(db, "users", signedInUser.uid), newUser, { merge: true });
        console.log("User created with credits:", newUser);
        setUserData(newUser);
    };

    const initiateGoogleSignup = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const googleUser = result.user;

        const userDocRef = doc(db, "users", googleUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
            return { isNewUser: false, user: googleUser };
        } else {
            return { isNewUser: true, user: googleUser };
        }
    };

    const sendGooglePhoneOTP = async (googleUser: User, phone: string, containerId: string) => {
        // --- LOCAL TESTING BYPASS ---
        if (phone === "+910000000000") {
             console.warn("TESTING MODE: Bypassing real SMS verification for Google Signup");
             return {
                 verificationId: "mock-id-google",
                 confirm: async (code: string) => {
                      if (code !== "123456") throw new Error("auth/invalid-verification-code");
                      return { user: googleUser };
                 }
             } as unknown as ConfirmationResult;
        }
        // -----------------------------

        if (isOtpRequestInProgress.current) {
            throw new Error("OTP request already in progress. Please wait.");
        }
        isOtpRequestInProgress.current = true;

        try {
            const recaptcha = await createFreshRecaptcha(containerId);

            console.log("Attempting Google Phone Link OTP dispatch...");
            console.log("Phone:", phone);
            const confirmationResult = await linkWithPhoneNumber(googleUser, phone, recaptcha);
            console.log("Google Link OTP sent successfully");
            return confirmationResult;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            clearRecaptcha(); // clear stale verifier
            // Log the full raw Firebase error to diagnose billing/plan/SMS issues
            console.error("[GooglePhoneOTP] linkWithPhoneNumber failed:");
            console.error("  code:", error.code);
            console.error("  message:", error.message);
            console.error("  serverResponse:", JSON.stringify(error.customData?._tokenResponse ?? error.customData?.serverResponse ?? {}));
            console.error("  full error:", error);

            if (error.code === 'auth/provider-already-linked' || error.code === 'auth/credential-already-in-use') {
                 try {
                     const retryRecaptcha = await createFreshRecaptcha(containerId);
                     return await signInWithPhoneNumber(auth, phone, retryRecaptcha);
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 } catch (retryErr: any) {
                      clearRecaptcha();
                      throw new Error(retryErr.message || "Failed to resend OTP to your linked phone.");
                 }
            } else if (error.code === 'auth/internal-error') {
                 const serverMsg = error.customData?._tokenResponse?.error?.message
                     || error.customData?.serverResponse?.error?.message
                     || null;
                 const isClientSideBlock = !serverMsg;
                 if (isClientSideBlock) {
                     throw new Error("reCAPTCHA couldn't load. Please disable your ad blocker, try an incognito window, or use a different browser.");
                 }
                 throw new Error(`Phone auth failed: ${serverMsg}`);
            } else if (error.code === 'auth/invalid-recaptcha-token' || error.code === 'auth/missing-recaptcha-token') {
                 throw new Error(`reCAPTCHA validation failed [${error.code}]. Ensure duseva.in is in Firebase Authorized Domains.`);
            } else {
                 throw new Error(error.message || "Failed to send OTP to this phone.");
            }
        } finally {
            isOtpRequestInProgress.current = false;
        }
    };

    const completeGoogleSignup = async (confirmationResult: ConfirmationResult, code: string, googleUser: User, phone: string) => {
        await confirmationResult.confirm(code);

        const newUser: UserData = {
            uid: googleUser.uid,
            email: googleUser.email!,
            name: googleUser.displayName || "User",
            phone: phone,
            role: "student",
            createdAt: Timestamp.now(),
            lastLoginAt: Timestamp.now(),
            purchasedTests: {},
            credits: 10,
            totalCreditsPurchased: 0,
            performanceSummary: {}
        };
        
        await setDoc(doc(db, "users", googleUser.uid), newUser, { merge: true });
        console.log("User created with credits:", newUser);
        setUserData(newUser);
    };

    const login = async (identifier: string, password: string) => {
        let resolvedEmail = identifier.trim();

        // Check if identifier looks like a phone number
        const isPhone = resolvedEmail.length >= 10 && !resolvedEmail.includes("@");

        if (isPhone) {
            try {
                const res = await fetch("/api/auth/lookup-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: resolvedEmail }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.email) {
                        resolvedEmail = data.email;
                    }
                } else {
                    throw new Error("Account not found with this phone number");
                }
            } catch (err: any) {
                if (err.message.includes("Account not found")) throw err;
                console.warn("Phone lookup encountered an error. Proceeding directly...", err);
            }
        }

        await signInWithEmailAndPassword(auth, resolvedEmail, password);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const authedUser = result.user;

        const userDocRef = doc(db, "users", authedUser.uid);
        const userDoc = await getDoc(userDocRef);

        // Standard login does NOT prompt for phone if it doesn't exist to prevent blocking legacy users, 
        // though strictly they should sign up first
        if (!userDoc.exists()) {
            await signOut(auth);
            throw new Error("No existing account found. Please sign up to link a phone number.");
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setUserData(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, userData, loading, login, 
            loginWithGoogle, logout,
            initiateEmailSignup, completeEmailSignup,
            initiateGoogleSignup, sendGooglePhoneOTP, completeGoogleSignup,
            setupRecaptcha
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
