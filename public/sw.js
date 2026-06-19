// public/sw.js
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'নতুন নোটিফিকেশন', body: '' };
  const title = data.title;

  const options = {
    body: data.body,
    icon: '/icon.png', // আপনার অ্যাপের লোগো আইকন
    data: {
      url: data.link || '/' // নোটিফিকেশনে ক্লিক করলে কোন লিংকে যাবে
    }
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Focus if already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
