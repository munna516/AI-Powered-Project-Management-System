// public/sw.js
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'নতুন নোটিফিকেশন', body: '' };
  const title = data.title;

  let targetUrl = data.link || '/dashboard';
  const notifId = data.id || data._id;
  if (notifId && !targetUrl.includes('notificationId=')) {
      targetUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}notificationId=${notifId}`;
  }

  const options = {
    body: data.body,
    icon: '/icon.png', // আপনার অ্যাপের লোগো আইকন
    data: {
      url: targetUrl // নোটিফিকেশনে ক্লিক করলে কোন লিংকে যাবে
    }
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      let matchingClient = null;
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url.includes(self.registration.scope)) {
          matchingClient = windowClient;
          break;
        }
      }
      if (matchingClient) {
        matchingClient.focus();
        matchingClient.navigate(urlToOpen);
      } else {
        clients.openWindow(urlToOpen);
      }
    })
  );
});
