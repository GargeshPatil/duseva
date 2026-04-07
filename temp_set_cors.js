const admin = require('firebase-admin');
const serviceAccount = require('./Keys/serviceAccountKey.json');

// Try both possible bucket names
const buckets = [
  'du-seva-db.firebasestorage.app',
  'du-seva-db.appspot.com'
];

const corsConfiguration = [
  {
    origin: ['*'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    maxAgeSeconds: 3600,
    responseHeader: [
      'Content-Type',
      'Authorization',
      'Content-Length',
      'User-Agent',
      'x-goog-resumable',
      'Access-Control-Allow-Origin'
    ]
  }
];

async function tryBucket(bucketName) {
  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: bucketName
    }, bucketName);

    const bucket = admin.storage(app).bucket();
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log(`✅ CORS set successfully on bucket: ${bucketName}`);
    return true;
  } catch (err) {
    console.log(`❌ Failed for bucket "${bucketName}": ${err.message}`);
    return false;
  }
}

async function main() {
  for (const b of buckets) {
    const ok = await tryBucket(b);
    if (ok) break;
  }
}

main();
