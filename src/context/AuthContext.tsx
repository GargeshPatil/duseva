"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, Timestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

// Define the shape of the user data stored in Firestore
export interface UserData {
    uid: string;
    email: string;
    phone?: string;
    name: string;
    role: "student" | "admin" | "developer";
    createdAt: Timestamp;
    lastLoginAt: Timestamp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    purchasedTests?: Record<string, any>;
    credits: number;
    totalCreditsPurchased: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    performanceSummary: Record<string, any>;
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

    // Email signup — creates account directly, no OTP
    emailSignup: (email: string, password: string, name: string, phone: string) => Promise<void>;

    // Google signup — two steps: initiate (Google popup), then complete (save phone + Firestore doc)
    initiateGoogleSignup: () => Promise<{ isNewUser: boolean; user: User }>;
    completeGoogleSignup: (user: User, phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeSnapshot: () => void;

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                const userDocRef = doc(db, "users", currentUser.uid);
                unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data() as UserData;
                        if (data.credits === undefined) data.credits = 0;
                        setUserData(data);
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user data:", error);
                    setLoading(false);
                });

            } else {
                setUser(null);
                setUserData(null);
                if (unsubscribeSnapshot) unsubscribeSnapshot();
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    // Fire-and-forget lastLogin update
    useEffect(() => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            updateDoc(userDocRef, { lastLoginAt: Timestamp.now() }).catch(() => {});
        }
    }, [user?.uid]);

    // ─── Email Signup ───────────────────────────────────────────────────────────
    const emailSignup = async (email: string, password: string, name: string, phone: string) => {
        // Pre-flight uniqueness check (email + phone)
        const checkRes = await fetch('/api/auth/check-unique', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phone }),
        });

        if (!checkRes.ok) {
            const errData = await checkRes.json();
            throw new Error(errData.error || "Validation failed. Please try again or sign in.");
        }

        // Create Firebase Auth account
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = result.user;

        await updateProfile(newUser, { displayName: name });
        await sendEmailVerification(newUser).catch(() => {}); // fire-and-forget

        // Write Firestore user document
        const newUserData: UserData = {
            uid: newUser.uid,
            email,
            phone,
            name,
            role: "student",
            createdAt: Timestamp.now(),
            lastLoginAt: Timestamp.now(),
            purchasedTests: {},
            credits: 5,
            totalCreditsPurchased: 0,
            performanceSummary: {},
        };

        await setDoc(doc(db, "users", newUser.uid), newUserData, { merge: true });
        setUserData(newUserData);
    };

    // ─── Google Signup ──────────────────────────────────────────────────────────
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

    const completeGoogleSignup = async (googleUser: User, phone: string) => {
        // Only check phone uniqueness — Google email is already an Auth account
        const checkRes = await fetch('/api/auth/check-unique', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, skipEmailCheck: true }),
        });

        if (!checkRes.ok) {
            const errData = await checkRes.json();
            throw new Error(errData.error || "This phone number is already registered. Please sign in.");
        }

        const newUserData: UserData = {
            uid: googleUser.uid,
            email: googleUser.email!,
            name: googleUser.displayName || "User",
            phone,
            role: "student",
            createdAt: Timestamp.now(),
            lastLoginAt: Timestamp.now(),
            purchasedTests: {},
            credits: 5,
            totalCreditsPurchased: 0,
            performanceSummary: {},
        };

        await setDoc(doc(db, "users", googleUser.uid), newUserData, { merge: true });
        setUserData(newUserData);
    };

    // ─── Login ──────────────────────────────────────────────────────────────────
    const login = async (identifier: string, password: string) => {
        let resolvedEmail = identifier.trim();

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
                    if (data.email) resolvedEmail = data.email;
                } else {
                    throw new Error("Account not found with this phone number");
                }
            } catch (err: any) {
                if (err.message.includes("Account not found")) throw err;
                console.warn("Phone lookup error. Proceeding directly...", err);
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
            user, userData, loading,
            login, loginWithGoogle, logout,
            emailSignup,
            initiateGoogleSignup, completeGoogleSignup,
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
