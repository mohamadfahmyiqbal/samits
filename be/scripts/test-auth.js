// Test authentication
import { initializeDB, db } from '../models/index.js';
import * as userService from '../services/user.service.js';

async function testAuth() {
  try {
    await initializeDB();
    console.log('Database initialized');
    
    const user = await userService.authenticateUser('123456', '123456');
    console.log('Auth result:', user);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAuth();
