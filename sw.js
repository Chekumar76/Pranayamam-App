const CACHE_NAME = 'pranayamam-v1';
const assets = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './assets/pranayamam_logo.png'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            cache.addAll(assets);
        })
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});
