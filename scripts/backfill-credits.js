const admin = require("firebase-admin");

// Initialize Firebase Admin (assuming you have a service account or running in environment with default credentials)
// If running locally, you may need to specify GOOGLE_APPLICATION_CREDENTIALS
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function backfillCredits() {
    console.log("Starting backfill for missing credits...");
    const usersSnapshot = await db.collection("users").get();
    let updatedCount = 0;

    const batch = db.batch();
    let currentBatchSize = 0;

    for (const doc of usersSnapshot.docs) {
        const data = doc.data();

        if (data.credits === undefined || data.credits === null) {
            console.log(`User ${doc.id} (${data.email || 'No email'}) missing credits, backfilling with 10...`);
            
            batch.update(doc.ref, { credits: 10 });
            currentBatchSize++;
            updatedCount++;

            // Commit batch when it reaches 500 (Firestore limit is 500 writes per batch)
            if (currentBatchSize === 500) {
                await batch.commit();
                currentBatchSize = 0;
            }
        }
    }

    // Commit any remaining writes
    if (currentBatchSize > 0) {
        await batch.commit();
    }

    console.log(`Backfill complete. Updated ${updatedCount} users.`);
}

backfillCredits().catch(console.error);
