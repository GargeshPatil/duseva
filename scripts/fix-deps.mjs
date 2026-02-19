import fs from 'fs';
const pkgPath = '/vercel/share/v0-project/package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Remove firebase-admin
delete pkg.dependencies['firebase-admin'];

// Downgrade firebase to v11
pkg.dependencies['firebase'] = '^11.0.0';

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('Updated package.json successfully');
console.log('Dependencies:', JSON.stringify(pkg.dependencies, null, 2));
