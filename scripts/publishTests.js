const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('../Keys/serviceAccountKey.json');

// Initialize Firebase Admin recursively
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function publishTests() {
    console.log("Fetching all tests...");
    const snapshot = await db.collection('tests').get();
    
    if (snapshot.empty) {
        console.log("No tests found.");
        return;
    }

    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach(doc => {
        const testData = doc.data();
        if (testData.isPublished !== true || testData.status !== 'published') {
            const ref = db.collection('tests').doc(doc.id);
            // Updating to ensure they are discovered and visible
            batch.update(ref, {
                isPublished: true,
                status: 'published',
                statusUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            count++;
            console.log(`Will publish test: ${testData.title} (${doc.id})`);
        }
    });

    if (count > 0) {
        await batch.commit();
        console.log(`Successfully published ${count} tests.`);
    } else {
        console.log("All tests are already published.");
    }
}

publishTests().catch(console.error).finally(() => process.exit(0));
