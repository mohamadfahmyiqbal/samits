import bcrypt from 'bcryptjs';
import sequelize from './config/database.js';

async function testLogin() {
  try {
    // Check if user '123456' exists and has password
    const [userQuery] = await sequelize.query(`
      SELECT nik, nama, password, position, status 
      FROM users 
      WHERE nik = '123456'
    `);
    
    if (userQuery.length === 0) {
      console.log('❌ User 123456 not found');
      return;
    }
    
    const user = userQuery[0];
    console.log('✅ User found:', user.nama);
    console.log('Password hash exists:', !!user.password);
    console.log('Password hash length:', user.password?.length);
    
    // Test password comparison
    const testPasswords = ['123456', 'password', 'admin', 'Test123'];
    
    for (const testPwd of testPasswords) {
      const isMatch = await bcrypt.compare(testPwd, user.password);
      console.log(`Password "${testPwd}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testLogin();
