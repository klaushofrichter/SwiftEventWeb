import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create require function
const require = createRequire(import.meta.url);

// Read the original package.json
const packageJson = require('../package.json');

// Create a simplified version
const distPackage = {
    name: packageJson.name,
    version: packageJson.version,
    'last-commit': packageJson['last-commit'] || ''
};

// Ensure dist directory exists
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Write the simplified package.json to dist
fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(distPackage, null, 2)
);

console.log('Created dist/package.json with version information'); 