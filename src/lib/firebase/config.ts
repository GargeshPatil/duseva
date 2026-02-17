
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (Client-Side Only)
let app: any;
let auth: any;
let db: any;

// Check if we are in the browser environment
if (typeof window !== "undefined") {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined") {
        try {
            app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            auth = getAuth(app);

            // Explicitly set persistence to local (keeps user logged in across tabs/restarts)
            setPersistence(auth, browserLocalPersistence).catch(error => {
                console.error("Firebase persistence error:", error);
            });

            db = getFirestore(app);
        } catch (error) {
            console.error("Firebase initialization failed:", error);
        }
    } else {
        console.warn("Firebase API keys missing or invalid. Authentication and Database features will not work.");
    }
}

export { app, auth, db };
