#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building Agriden for Web...\n');

// Check if .env.local exists
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.error('❌ .env.local not found. Please run npm run dev:setup first.');
  process.exit(1);
}

// Create build directory
const buildDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

try {
  console.log('📦 Building web application...');
  execSync('npx expo export --platform web --output-dir dist', { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..') 
  });

  console.log('\n✅ Build completed successfully!');
  console.log('📁 Build files are in the dist/ directory');
  console.log('🌐 To serve locally: npx serve dist');
  console.log('🚀 To deploy: Upload dist/ contents to your web server\n');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
