/* eslint-disable no-restricted-globals */

self.addEventListener('install', () => {
 self.skipWaiting();
});

self.addEventListener('activate', (event) => {
 event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
 let payload = {};

 try {
  payload = event.data ? event.data.json() : {};
 } catch (_error) {
  payload = {
   title: 'SAMIT Notification',
   body: event.data ? event.data.text() : 'Anda memiliki notifikasi baru.'
  };
 }

 const title = payload.title || 'SAMIT Notification';
 const options = {
  body: payload.body || 'Anda memiliki notifikasi baru.',
  icon: '/assets/images/logo/SAMIT.png',
  badge: '/assets/images/logo/SAMIT.png',
  data: payload.data || {}
 };

 event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
 event.notification.close();

 const targetUrl = event.notification?.data?.url || '/';

 event.waitUntil(
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
   const notificationUrl = new URL(targetUrl, self.location.origin);

   for (const client of clients) {
    const clientUrl = new URL(client.url);

    if (
     clientUrl.pathname === notificationUrl.pathname &&
     'focus' in client
    ) {
     client.postMessage({
      type: 'NOTIFICATION_CLICK',
      url: targetUrl
     });

     return client.focus();
    }
   }

   if (self.clients.openWindow) {
    return self.clients.openWindow(targetUrl);
   }

   return null;
  })
 );
});
