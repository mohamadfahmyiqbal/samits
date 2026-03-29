// Test specific hash
import bcrypt from 'bcryptjs';

async function testSpecificHash() {
  try {
    const password = '123456';
    const storedHash = '$2a$10$xzMA10ul0phZvjRP2Hxy3.CxnQ2JOhCSw/VII0xhNgufzeHLLYVqa';
    
    console.log('Password:', password);
    console.log('Stored hash:', storedHash);
    
    // Test comparison
    const match = await bcrypt.compare(password, storedHash);
    console.log('Match result:', match);
    
    // Test creating new hash with same password
    const newSalt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(password, newSalt);
    console.log('New hash:', newHash);
    
    const newMatch = await bcrypt.compare(password, newHash);
    console.log('New hash match:', newMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testSpecificHash();
