// Generate VAPID keys for push notifications
import webpush from 'web-push';

function generateVAPIDKeys() {
  try {
    const vapidKeys = webpush.generateVAPIDKeys();
    
    console.log('=== VAPID Keys Generated ===');
    console.log('Public Key:', vapidKeys.publicKey);
    console.log('Private Key:', vapidKeys.privateKey);
    console.log('');
    console.log('Add these to your .env file:');
    console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
    console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
    console.log('VAPID_EMAIL=your_email@example.com');
    
    return vapidKeys;
  } catch (error) {
    console.error('Error generating VAPID keys:', error);
  }
}

generateVAPIDKeys();
