// Service Worker for push notifications

self.addEventListener('push', function(event) {
  if (!event.data) {
    console.log('Push notification without data');
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    renotify: true,
    silent: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const data = event.notification.data || {};
  let url = '/';

  // Handle different notification types
  if (data.type === 'chat_message' && data.chatId) {
    url = `/chat?id=${data.chatId}`;
  } else if (data.type === 'product_offer' && data.chatId) {
    url = `/chat?id=${data.chatId}`;
  } else if (data.url) {
    url = data.url;
  }

  // Handle action clicks
  if (event.action === 'open-chat' && data.chatId) {
    url = `/chat?id=${data.chatId}`;
  } else if (event.action === 'view-offer' && data.offerId) {
    url = `/chat?id=${data.chatId}&offer=${data.offerId}`;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
});

// Handle service worker installation
self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  self.skipWaiting();
});