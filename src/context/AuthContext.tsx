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
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
                // Real-time listener for user data
                const userDocRef = doc(db, "users", currentUser.uid);

                // Return the unsubscribe function from onSnapshot? 
                // We are inside onAuthStateChanged, which is an observer. 
                // We need to manage the snapshot subscription carefully to avoid leaks.
                // But onAuthStateChanged can trigger multiple times.

                // Ideally we should start the listener in a separate useEffect dependent on 'user' state,
                // but 'user' is set here. 

                // Let's rely on standard pattern: 
                // 1. setUser(currentUser)
                // 2. A separate useEffect listens to 'user' changes and sets up onSnapshot.
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // New effect for real-time user data
    useEffect(() => {
        if (!user) {
            setUserData(null);
            return;
        }

        console.log("Setting up real-time listener for user:", user.uid);
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
            console.log("User Snapshot Fired!", docSnap.exists(), "Source:", docSnap.metadata.hasPendingWrites ? "Local" : "Server");
            if (docSnap.exists()) {
                const data = docSnap.data() as UserData;
                console.log("Purchased Tests in Snapshot:", data.purchasedTests);
                setUserData(data);
            } else {
                console.warn("User authenticated but no Firestore document found.");
            }
        }, (error) => {
            console.error("Error fetching user data:", error);
        });

        return () => {
            console.log("Unsubscribing from user listener");
            unsubscribeSnapshot();
        };
    }, [user]);

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
