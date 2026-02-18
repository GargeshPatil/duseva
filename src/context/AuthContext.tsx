"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

// Define the shape of the user data stored in Firestore
export interface UserData {
    uid: string;
    email: string;
    name: string;
    role: "student" | "admin" | "developer"; // Default is student
    createdAt: Timestamp;
    lastLoginAt: Timestamp;
    purchasedTests: Record<string, any>; // Map for purchased tests
    performanceSummary: Record<string, any>; // Map for performance summary
    stream?: 'Science' | 'Commerce' | 'Humanities';
    targetUniversity?: string;
    onboardingCompleted?: boolean;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
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
                // Don't set loading to false yet; wait for Firestore data

                // Set up real-time listener immediately when user is detected
                const userDocRef = doc(db, "users", currentUser.uid);
                unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data() as UserData;
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

    // Independent One-time update for lastLogin (optional, can be skipped for now to strictly fix the issue)
    useEffect(() => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            // Fire and forget update
            setDoc(userDocRef, { lastLoginAt: Timestamp.now() }, { merge: true }).catch(console.error);
        }
    }, [user?.uid]); // Only run when UID changes (login)


    const signup = async (email: string, password: string, name: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        const newUser: UserData = {
            uid: user.uid,
            email: user.email!,
            name: name,
            role: "student",
            createdAt: Timestamp.now(),
            lastLoginAt: Timestamp.now(),
            purchasedTests: {},
            performanceSummary: {}
        };

        await setDoc(doc(db, "users", user.uid), newUser);
        setUserData(newUser);
    };

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle fetching user data
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user document exists
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // Create new user document for Google Sign In
            const newUser: UserData = {
                uid: user.uid,
                email: user.email!,
                name: user.displayName || "User",
                role: "student",
                createdAt: Timestamp.now(),
                lastLoginAt: Timestamp.now(),
                purchasedTests: {},
                performanceSummary: {}
            };
            await setDoc(userDocRef, newUser);
            setUserData(newUser);
        } else {
            // onAuthStateChanged handles fetching, but we can set it here optimistically or just let the effect do it
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setUserData(null);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, login, signup, loginWithGoogle, logout }}>
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
