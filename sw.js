const CACHE_NAME = 'timeline-cache-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/scripts.js',
    '/events.json',
];

self.addEventListener('install', event => {
    console.log('Service Worker: Install event in progress.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
            })
            .catch(error => {
                console.error('Failed to open cache or add files:', error);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
