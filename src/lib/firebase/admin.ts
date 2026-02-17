import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!getApps().length) {
    if (serviceAccountKey) {
        try {
            const serviceAccount = JSON.parse(serviceAccountKey);
            initializeApp({
                credential: cert(serviceAccount),
            });
        } catch (error) {
            console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", error);
        }
    } else {
        // Fallback for local development if GOOGLE_APPLICATION_CREDENTIALS is set
        // or if deployed to environment with default credentials (like Vercel with specific setup or GCP)
        // However, explicitly checking for the key is safer for this setup.
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found. Admin SDK might not work.");
        initializeApp();
    }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
