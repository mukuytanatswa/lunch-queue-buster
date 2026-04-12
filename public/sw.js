self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  const title = data.title ?? 'New order on QuickBite!';
  const options = {
    body: data.body ?? 'You have a new order.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.data ?? {},
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/vendor') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/vendor');
    })
  );
});
