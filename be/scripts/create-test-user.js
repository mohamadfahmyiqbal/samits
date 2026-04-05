// Create test user with service
import { initializeDB, db } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    await initializeDB();
    const User = db.User;
    
    // Delete existing user if any
    await User.destroy({ where: { nik: '123456' } });
    
    // Create user with plain password for testing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    console.log('Creating user with hashed password:', hashedPassword.substring(0, 50) + '...');
    
    const user = await User.create({
      nik: '123456',
      nama: 'Test User',
      password: hashedPassword,
      email: 'test@example.com',
      position: 'Admin'
    });
    
    console.log('User created successfully');
    console.log('User data:', user.toJSON());
    
    // Test authentication immediately
    const authResult = await User.findOne({ where: { nik: '123456' } });
    if (authResult) {
      const isMatch = await bcrypt.compare('123456', authResult.password);
      console.log('Password match test:', isMatch);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();
