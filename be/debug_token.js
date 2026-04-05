// Debug token validation
import { verifyToken } from './utils/jwtHelper.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('=== Token Debug ===');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Test token generation and verification
try {
  const testPayload = {
    nik: 'test',
    name: 'Test User',
    position: 'Developer',
    role: 'admin'
  };
  
  const token = verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuaWsiOiJ0ZXN0IiwibmFtZSI6IlRlc3QgVXNlciIsInBvc2l0aW9uIjoiRGV2ZWxvcGVyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzIyODU1Njg4LCJleHAiOjE3MjI4OTg4ODh9.invalid');
  
  console.log('✅ Token verification successful:', token);
} catch (error) {
  console.error('❌ Token verification failed:', error.message);
  console.log('This is expected - token is invalid');
}

// Test with a valid token
import { generateToken } from './utils/jwtHelper.js';
try {
  const newToken = generateToken({
    nik: 'test',
    name: 'Test User',
    position: 'Developer',
    role: 'admin'
  });
  
  console.log('Generated token:', newToken.substring(0, 50) + '...');
  
  const verified = verifyToken(newToken);
  console.log('✅ New token verification successful:', verified);
} catch (error) {
  console.error('❌ New token verification failed:', error.message);
}
