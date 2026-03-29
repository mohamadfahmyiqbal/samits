// Add test user
import { initializeDB, db } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function addTestUser() {
  try {
    await initializeDB();
    const User = db.User;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { nik: '123456' } });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const result = await User.create({
      nik: '123456',
      nama: 'Test User',
      password: hashedPassword,
      email: 'test@example.com',
      position: 'Admin'
    });
    
    console.log('Created test user:', result.toJSON());
    console.log('Login credentials:');
    console.log('NIK: 123456');
    console.log('Password: 123456');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addTestUser();
