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
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
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
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
                // Fetch user data from Firestore
                const userDocRef = doc(db, "users", currentUser.uid);

                try {
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUserData(userDoc.data() as UserData);

                        // Update last login
                        try {
                            await setDoc(userDocRef, {
                                lastLoginAt: Timestamp.now()
                            }, { merge: true });
                        } catch (e) {
                            console.error("Error updating last login:", e);
                        }
                    } else {
                        // Handle case where auth exists but firestore doc doesn't (maybe manually deleted or Google Sign In first time)
                        // We'll handle creation in the sign-in/up methods, but for safety:
                        console.warn("User authenticated but no Firestore document found.");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
