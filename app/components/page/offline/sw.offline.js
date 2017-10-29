const CACHE_KEY = 'offline-v1';
self.addEventListener('fetch', event => {
  const { request } = event;
  event.responseWith(
    fetch(request)
      .then(response => {
        caches.open(CACHE_KEY)
          .then(cache => cache.put(request, response));
      }).catch(error => {
        return caches.match(request)
          .then(response => response || new Response({
            error,
          }));
      })
  );
});
