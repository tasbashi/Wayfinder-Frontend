/**
 * Generate placeholder assets for Expo app
 * Run: node generate-assets.js
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple SVG icon (will be converted to PNG by Expo)
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#3b82f6"/>
  <text x="512" y="600" font-family="Arial, sans-serif" font-size="400" font-weight="bold" fill="white" text-anchor="middle">W</text>
</svg>`;

// Write SVG files (Expo will handle conversion)
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(assetsDir, 'splash.svg'), iconSvg);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.svg'), iconSvg);
fs.writeFileSync(path.join(assetsDir, 'favicon.svg'), iconSvg);

console.log('✅ Placeholder SVG assets created in assets/ directory');
console.log('📝 Note: You need to convert these to PNG format:');
console.log('   - icon.png (1024x1024)');
console.log('   - splash.png (1242x2436 for iOS, 1920x1080 for Android)');
console.log('   - adaptive-icon.png (1024x1024)');
console.log('   - favicon.png (48x48)');
console.log('');
console.log('💡 You can use online tools like:');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('   - Or use ImageMagick: magick icon.svg icon.png');

