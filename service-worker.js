var cacheName = 'full-service-v2';

const R2_GAME_BASE =
    'https://pub-94fbf258bc1348e38814a75cecbca711.r2.dev/game/';

self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys
                    .filter(function (key) {
                        return key !== cacheName;
                    })
                    .map(function (key) {
                        return caches.delete(key);
                    })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function (event) {
    const request = event.request;
    const url = new URL(request.url);

    const marker = '/game/';
    const gameIndex = url.pathname.indexOf(marker);

    if (gameIndex === -1) {
        return;
    }

    const relativePath = url.pathname.substring(
        gameIndex + marker.length
    );

    const r2Url =
        R2_GAME_BASE +
        relativePath +
        url.search;

    event.respondWith(
        fetch(r2Url, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
        })
    );
});
