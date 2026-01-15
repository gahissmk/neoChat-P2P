self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open('neo').then(cache =>
      cache.match(event.request).then(response => {
        // Si la requête est dans le cache, renvoyer le cache
        if (response) return response;

        // Sinon fetch la ressource
        return fetch(event.request)
          .then(fetchResponse => {
            // On peut mettre en cache la nouvelle ressource (optionnel)
            if(fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic'){
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          })
          .catch(() => {
            // Si fetch échoue, renvoyer un fallback (optionnel)
            return new Response("Ressource indisponible", { status: 503, statusText: "Service Unavailable" });
          });
      })
    )
  );
});
