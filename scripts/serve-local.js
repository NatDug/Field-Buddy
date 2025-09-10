#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌐 Starting Local Web Server for Agriden...\n');

// Check if dist directory exists
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.log('📦 Building web application first...');
  try {
    execSync('node scripts/build-web.js', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Check if serve is installed
try {
  execSync('npx serve --version', { stdio: 'pipe' });
} catch (error) {
  console.log('📦 Installing serve package...');
  execSync('npm install -g serve', { stdio: 'inherit' });
}

console.log('🚀 Starting local web server...');
console.log('🌐 URL: http://localhost:3000');
console.log('📁 Serving from: dist/');
console.log('🛑 Press Ctrl+C to stop\n');

try {
  execSync('npx serve dist -l 3000', { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..') 
  });
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}
