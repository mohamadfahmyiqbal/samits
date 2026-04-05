// Test current user
import { initializeDB, db } from '../models/index.js';
import * as userService from '../services/user.service.js';

async function testCurrentUser() {
  try {
    await initializeDB();
    console.log('Database initialized');
    
    // Get user from database
    const User = db.User;
    const user = await User.findOne({ where: { nik: '123456' } });
    
    if (user) {
      console.log('User found:', user.toJSON());
      console.log('Password hash:', user.password);
      console.log('Password length:', user.password.length);
    } else {
      console.log('User not found');
    }
    
    // Test authentication
    const authResult = await userService.authenticateUser('123456', '123456');
    console.log('Auth result:', authResult);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testCurrentUser();
