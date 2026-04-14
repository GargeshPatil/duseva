const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: path.join(__dirname, 'Keys/serviceAccountKey.json'),
  projectId: 'du-seva-db',
});

const bucketName = 'du-seva-db.firebasestorage.app';

async function configureCors() {
  try {
    await storage.bucket(bucketName).setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
        origin: ['*'], // Or specify your exact domains e.g., ['https://www.duseva.in', 'http://localhost:3000']
        responseHeader: ['*'],
      },
    ]);
    console.log(`Successfully updated CORS for bucket: ${bucketName}`);
  } catch (e) {
    console.error("Failed to update CORS:", e.message);
  }
}

configureCors();
