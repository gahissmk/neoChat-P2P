self.addEventListener('fetch', e => {
  e.respondWith(
    caches.open('neo').then(cache =>
      cache.match(e.request).then(response =>
        response || fetch(e.request)
      )
    ).catch(() => new Response("Fichier introuvable", {status:404, statusText:"Not Found"}))
  );
});
