#!/usr/bin/env node

const crypto = require('crypto');

// Generate cryptographically secure random secrets
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('🔐 Generated Secure JWT Secrets for Production:\n');
console.log('Copy these values to your Render environment variables:\n');

const jwtSecret = generateSecret(64);
const refreshSecret = generateSecret(64);

console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`REFRESH_SECRET=${refreshSecret}`);

console.log('\n📋 Instructions:');
console.log('1. Copy the JWT_SECRET value above');
console.log('2. In Render dashboard, set JWT_SECRET environment variable');
console.log('3. Copy the REFRESH_SECRET value above');
console.log('4. In Render dashboard, set REFRESH_SECRET environment variable');
console.log('\n⚠️  Important: Keep these secrets secure and never commit them to Git!');
