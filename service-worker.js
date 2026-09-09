var cacheName = 'full-service';

const R2_GAME_BASE = 'https://pub-94fbf258bc1348e38814a75cecbca711.r2.dev/game/';

self.addEventListener('install', function (e) {
    console.log('Service worker installed.');
    self.skipWaiting();
});

self.addEventListener('activate', function (e) {
    return self.clients.claim();
});

let addToCache = false;

async function fetchAndCache(request) {
    const cache = await caches.open(cacheName);

    const originalUrl = new URL(request.url);
    let fetchRequest = request;

    if (originalUrl.pathname.startsWith('/game/')) {
        const relativePath = originalUrl.pathname.substring('/game/'.length);
        const r2Url = R2_GAME_BASE + relativePath + originalUrl.search;
        fetchRequest = new Request(r2Url, request);
    }

    const cachedResponse = await cache.match(fetchRequest);

    try {
        if (request.url.endsWith("?cached")) {
            request = new Request(request.url.replace("?cached", "?uncached"), request);
            let rv = await cache.match(request);

            if (rv == null) {
                rv = new Response("Not found in cache.", {
                    status: 404,
                    statusText: "Not found in cache."
                });
            }

            return rv;
        }

        const response = await fetch(fetchRequest);

        if (cachedResponse && response.status == 304) {
            return cachedResponse;
        }

        if (addToCache && response.status == 200) {
            await cache.put(fetchRequest, response.clone());
        }

        return response;

    } catch (e) {
        if (cachedResponse) {
            return cachedResponse;
        }

        throw e;
    }
}

self.addEventListener('fetch', function (e) {
    e.respondWith(fetchAndCache(e.request));
});

self.addEventListener('message', function (e) {
    if (e.data[0] == "clearCache") {
        caches.delete(cacheName);
        addToCache = false;
    } else if (e.data[0] == "loadCache") {
        addToCache = true;
    }
});
