// Debug bcrypt
import bcrypt from 'bcryptjs';

async function debugBcrypt() {
  try {
    const password = '123456';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('Password:', password);
    console.log('Salt:', salt);
    console.log('Hash:', hash);
    
    // Test comparison
    const match1 = await bcrypt.compare(password, hash);
    console.log('Match 1 (same hash):', match1);
    
    // Test with different hash
    const salt2 = await bcrypt.genSalt(10);
    const hash2 = await bcrypt.hash(password, salt2);
    const match2 = await bcrypt.compare(password, hash2);
    console.log('Match 2 (different hash):', match2);
    
    // Test wrong password
    const match3 = await bcrypt.compare('wrong', hash);
    console.log('Match 3 (wrong password):', match3);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugBcrypt();
