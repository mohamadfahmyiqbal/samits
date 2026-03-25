import fs from 'fs';
import path from 'path';

const certDir = './cert';

// Backup old certificates
const oldCert = path.join(certDir, 'certificate.cer');
const oldKey = path.join(certDir, 'private.key');

if (fs.existsSync(oldCert)) {
    fs.copyFileSync(oldCert, path.join(certDir, 'certificate.cer.backup'));
    console.log('📁 Backed up old certificate');
}

if (fs.existsSync(oldKey)) {
    fs.copyFileSync(oldKey, path.join(certDir, 'private.key.backup'));
    console.log('📁 Backed up old private key');
}

// Use new certificates
const newCert = path.join(certDir, 'localhost.crt');
const newKey = path.join(certDir, 'localhost.key');

if (fs.existsSync(newCert) && fs.existsSync(newKey)) {
    // Copy new certificates to expected filenames
    fs.copyFileSync(newCert, oldCert);
    fs.copyFileSync(newKey, oldKey);
    
    console.log('✅ Updated certificates:');
    console.log(`   📄 Certificate: ${oldCert}`);
    console.log(`   🔑 Private Key: ${oldKey}`);
    console.log('\n🔒 New certificate includes:');
    console.log('   - Subject Alternative Names: localhost, 127.0.0.1');
    console.log('   - Valid for 365 days');
    console.log('   - RSA 2048 bits');
    
    // Clean up temporary files
    fs.unlinkSync(newCert);
    fs.unlinkSync(newKey);
    console.log('🧹 Cleaned up temporary files');
    
} else {
    console.log('❌ New certificate files not found!');
    console.log('   Expected: localhost.crt and localhost.key');
}
