// Create and test user immediately
import { initializeDB, db } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function createAndTest() {
  try {
    await initializeDB();
    const User = db.User;
    
    // Delete existing user
    await User.destroy({ where: { nik: '123456' } });
    
    // Create password hash
    const password = '123456';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('Created hash:', hash);
    
    // Test hash immediately
    const testMatch = await bcrypt.compare(password, hash);
    console.log('Immediate test match:', testMatch);
    
    // Create user
    const user = await User.create({
      nik: '123456',
      nama: 'Test User',
      password: hash,
      email: 'test@example.com',
      position: 'Admin'
    });
    
    console.log('User created');
    
    // Retrieve user from database
    const retrievedUser = await User.findOne({ where: { nik: '123456' } });
    console.log('Retrieved hash:', retrievedUser.password);
    
    // Test with retrieved hash
    const retrievedMatch = await bcrypt.compare(password, retrievedUser.password);
    console.log('Retrieved hash match:', retrievedMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAndTest();
