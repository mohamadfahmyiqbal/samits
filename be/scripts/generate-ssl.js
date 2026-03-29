import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const certDir = './cert';

// Create cert directory if it doesn't exist
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
    console.log('✅ Created cert directory');
}

// Generate self-signed certificate
try {
    console.log('🔐 Generating SSL certificate...');
    
    const opensslCmd = `openssl req -x509 -newkey rsa:2048 -keyout ${certDir}/private.key -out ${certDir}/certificate.cer -days 365 -nodes -subj "/C=ID/ST=Jakarta/L=Jakarta/O=SAMIT/OU=IT/CN=localhost"`;
    
    execSync(opensslCmd, { stdio: 'inherit' });
    
    console.log('✅ SSL certificate generated successfully!');
    console.log(`📁 Private key: ${certDir}/private.key`);
    console.log(`📁 Certificate: ${certDir}/certificate.cer`);
    console.log('🔒 Certificate valid for 365 days');
    
} catch (error) {
    console.error('❌ Failed to generate SSL certificate:', error.message);
    console.log('\n💡 Make sure OpenSSL is installed and in PATH');
    console.log('   Download from: https://slproweb.com/products/Win32OpenSSL.html');
    process.exit(1);
}
