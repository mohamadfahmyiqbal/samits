// Debug script untuk checking token dan path
console.log('=== DEBUG INFO ===');
console.log('Token:', localStorage.getItem('token'));
console.log('User Data:', localStorage.getItem('userData'));

// Test encryption
import { encryptPath } from './router/encryptPath.js';
console.log('Test encryptPath("dashboard"):', encryptPath('dashboard'));
console.log('Test encryptPath("asset-management"):', encryptPath('asset-management'));

// Check current path
console.log('Current pathname:', window.location.pathname);
