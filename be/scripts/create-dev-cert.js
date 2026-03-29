const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Create certificate with SAN
const cert = crypto.createSelfSignedCertificate({
  key: privateKey,
  days: 365,
  subject: {
    commonName: 'localhost',
    country: 'ID',
    state: 'Jakarta',
    locality: 'Jakarta',
    organization: 'SAMIT',
    organizationalUnit: 'IT'
  },
  extensions: [
    {
      name: 'basicConstraints',
      ca: true,
      critical: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 2, value: 'pik1com074.local.ikoito.co.id' },
        { type: 2, value: 'pik1com012' },
        { type: 7, ip: '127.0.0.1' },
        { type: 7, ip: '::1' }
      ]
    }
  ]
});

// Write certificate files
fs.writeFileSync(path.join(__dirname, 'cert', 'localhost-san.key'), privateKey);
fs.writeFileSync(path.join(__dirname, 'cert', 'localhost-san.crt'), cert);

console.log('✅ SSL Certificate with SAN generated successfully!');
console.log('📁 Files created:');
console.log('   - cert/localhost-san.key');
console.log('   - cert/localhost-san.crt');
console.log('🌐 Covered domains:');
console.log('   - localhost');
console.log('   - pik1com074.local.ikoito.co.id');
console.log('   - pik1com012');
console.log('   - 127.0.0.1');
console.log('   - ::1');
