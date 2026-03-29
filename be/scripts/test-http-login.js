// Test HTTP login simulation
import { initializeDB, db } from '../models/index.js';
import * as userService from '../services/user.service.js';

async function testHttpLogin() {
  try {
    await initializeDB();
    console.log('Database initialized');
    
    // Simulate the exact same logic as the controller
    const nik = '123456';
    const password = '123456';
    
    const nikInput = typeof nik === 'string' ? nik.trim() : '';
    const passwordInput = typeof password === 'string' ? password : '';
    
    console.log('NIK Input:', nikInput);
    console.log('Password Input:', passwordInput);
    console.log('Password Input type:', typeof passwordInput);
    console.log('Password Input length:', passwordInput.length);
    
    const user = await userService.authenticateUser(nikInput, passwordInput);
    console.log('Auth result:', user);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testHttpLogin();
