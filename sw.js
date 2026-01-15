self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open('neo').then(cache =>
      cache.match(event.request).then(response => {
        if (response) return response;
        return fetch(event.request).then(fetchResponse => {
          if(fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic'){
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        }).catch(() => new Response("Ressource indisponible", { status: 503, statusText: "Service Unavailable" }));
      })
    )
  );
});
