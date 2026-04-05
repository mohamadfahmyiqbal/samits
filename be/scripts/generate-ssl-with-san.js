import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate private key
const privateKey = crypto.generateKeyPairSync('rsa', {
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

// Create certificate signing request with SAN
const cert = crypto.createCertificateRequest({
  key: privateKey.privateKey,
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
      name: 'subjectAltName',
      altNames: [
        { type: 'DNS', value: 'localhost' },
        { type: 'DNS', value: 'pik1com074.local.ikoito.co.id' },
        { type: 'DNS', value: 'pik1com012' },
        { type: 'IP', value: '127.0.0.1' },
        { type: 'IP', value: '::1' }
      ]
    }
  ]
});

// Self-sign the certificate
const selfSignedCert = crypto.createCertificateSign({
  publicKey: cert.publicKey,
  privateKey: privateKey.privateKey,
  days: 365,
  certIssuer: {
    commonName: 'localhost',
    country: 'ID',
    state: 'Jakarta',
    locality: 'Jakarta',
    organization: 'SAMIT',
    organizationalUnit: 'IT'
  },
  extensions: [
    {
      name: 'subjectAltName',
      altNames: [
        { type: 'DNS', value: 'localhost' },
        { type: 'DNS', value: 'pik1com074.local.ikoito.co.id' },
        { type: 'DNS', value: 'pik1com012' },
        { type: 'IP', value: '127.0.0.1' },
        { type: 'IP', value: '::1' }
      ]
    }
  ]
});

// Write files
fs.writeFileSync(path.join(__dirname, 'cert', 'localhost-san.key'), privateKey.privateKey);
fs.writeFileSync(path.join(__dirname, 'cert', 'localhost-san.crt'), selfSignedCert);

console.log('✅ SSL certificate with SAN generated successfully!');
console.log('📁 Files created:');
console.log('   - cert/localhost-san.key');
console.log('   - cert/localhost-san.crt');
