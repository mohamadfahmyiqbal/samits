import bcrypt from 'bcryptjs';
import sequelize from './config/database.js';

async function testUser1803070() {
  try {
    // Check if user '1803070' exists
    const [userQuery] = await sequelize.query(`
      SELECT nik, nama, password, position, status 
      FROM users 
      WHERE nik = '1803070'
    `);
    
    if (userQuery.length === 0) {
      console.log('❌ User 1803070 not found');
      return;
    }
    
    const user = userQuery[0];
    console.log('✅ User found:', user.nama);
    console.log('Password hash exists:', !!user.password);
    console.log('Password hash length:', user.password?.length);
    
    // Test password comparison with 1803070
    const testPassword = '1803070';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`Password "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    
    if (!isMatch) {
      console.log('Updating password for user 1803070...');
      // Update the user with this password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      await sequelize.query(`
        UPDATE users 
        SET password = :hashedPassword 
        WHERE nik = '1803070'
      `, {
        replacements: { hashedPassword }
      });
      
      console.log('✅ Updated user 1803070 with password 1803070');
      
      // Test again
      const isMatchAfter = await bcrypt.compare(testPassword, hashedPassword);
      console.log('Password verification after update:', isMatchAfter ? '✅ SUCCESS' : '❌ FAILED');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testUser1803070();
