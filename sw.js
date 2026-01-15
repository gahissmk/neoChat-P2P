self.addEventListener('fetch', e => {
  e.respondWith(caches.open('neo').then(c => c.match(e.request) || fetch(e.request)));
});
