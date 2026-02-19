// Server-side Firebase utilities using the client SDK
// The client Firebase SDK works in Node.js server environments (API routes)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize a server-side Firebase app instance
let serverApp: ReturnType<typeof initializeApp>;

try {
    serverApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
    console.error("Server Firebase initialization failed:", error);
    serverApp = getApp();
}

export const adminDb = getFirestore(serverApp);
