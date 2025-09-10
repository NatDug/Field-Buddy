#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Agriden Development Server...\n');

// Check if .env.local exists, if not copy from example
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envLocalPath)) {
  console.log('📝 Creating .env.local from example...');
  fs.copyFileSync(envExamplePath, envLocalPath);
  console.log('✅ .env.local created. Please update with your OAuth client IDs.\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Dependencies installed.\n');
}

// Start the development server
console.log('🌐 Starting Expo development server...');
console.log('📱 Web: http://localhost:19006');
console.log('📲 Mobile: Scan QR code with Expo Go app');
console.log('🔧 Dev Tools: http://localhost:19002\n');

try {
  execSync('npx expo start --web', { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..') 
  });
} catch (error) {
  console.error('❌ Failed to start development server:', error.message);
  process.exit(1);
}
