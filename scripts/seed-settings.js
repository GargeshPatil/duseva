const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// It will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
    console.log("Firebase Admin initialized successfully.");
} catch (error) {
    console.error("Failed to initialize Firebase Admin:", error.message);
    process.exit(1);
}

const db = admin.firestore();

const defaultPackages = [
    { id: "pkg-1", credits: 1, price: 99, isPopular: false },
    { id: "pkg-3", credits: 3, price: 279, isPopular: false },
    { id: "pkg-5", credits: 5, price: 449, isPopular: false },
    { id: "pkg-10", credits: 10, price: 799, isPopular: true },
    { id: "pkg-20", credits: 20, price: 1499, isPopular: false },
    { id: "pkg-40", credits: 40, price: 2499, isPopular: false }
];

async function seedSettings() {
    console.log("Starting settings seed script...");
    let successCount = 0;

    try {
        const settingsRef = db.collection('platformSettings').doc('globalConfig');
        const doc = await settingsRef.get();
        
        let existingData = {};
        if (doc.exists) {
            existingData = doc.data();
            console.log("Found existing globalConfig document. Merging data...");
        } else {
            console.log("No globalConfig document found. Creating new one...");
        }

        // Only overwrite credit packages if none exist or if forced
        if (!existingData.creditPackages || existingData.creditPackages.length === 0) {
            await settingsRef.set({
                creditPackages: defaultPackages,
                siteName: existingData.siteName || "CUET Mock Platform",
                currency: existingData.currency || "INR",
                supportEmail: existingData.supportEmail || "support@example.com",
            }, { merge: true });
            console.log("✅ Successfully seeded default credit packages!");
        } else {
            console.log("⚠️ Credit packages already exist. Skipping seed to prevent overwriting.");
        }

    } catch (error) {
        console.error("❌ Error seeding settings:", error);
    }

    console.log("🏁 Settings seed script completed.");
    process.exit(0);
}

seedSettings();
