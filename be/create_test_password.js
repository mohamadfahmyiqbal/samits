import bcrypt from 'bcryptjs';
import sequelize from './config/database.js';

async function createTestPassword() {
  try {
    // Create a known password hash for testing
    const plainPassword = '123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('Plain password:', plainPassword);
    console.log('Hashed password:', hashedPassword);
    
    // Update the test user with this password
    await sequelize.query(`
      UPDATE users 
      SET password = :hashedPassword 
      WHERE nik = '123456'
    `, {
      replacements: { hashedPassword }
    });
    
    console.log('✅ Updated user 123456 with known password');
    
    // Test the login
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Password verification:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createTestPassword();
