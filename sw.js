// @ts-nocheck
/// <reference lib="webworker" />
/* eslint-env serviceworker, browser */
/* eslint-disable no-undef */

/**
 * Service Worker KMF Demak PWA (v2.6.2)
 * Menyediakan cache offline penuh untuk teks amalan (Tahlil, Yasin, Wirid, Istighotsah),
 * hisab jadwal sholat, direktori alumni, dan seluruh aset antarmuka.
 */

const CACHE_NAME = 'kmf-demak-v2.6.2';
const STATIC_ASSETS = [
    './',
    './manifest.json',
    './css/styles.css',
    './js/app.js',
    './js/undangan-selapanan.js',
    './js/jadwal-sholat.js',
    './js/data-amalan.js',
    './js/data-mock.js',
    './js/compressor.js',
    './js/api.js',
    './assets/img/logo.png',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/img/banners/poster-selapanan.jpg',
    './assets/img/usaha/usaha-sarung-batik.jpg',
    './assets/img/usaha/usaha-buku-fiqhsosial.jpg',
    './assets/img/usaha/usaha-bandeng-presto.jpg',
    './assets/img/usaha/usaha-madu-randu.jpg',
    './assets/img/usaha/usaha-kopi-muria.jpg',
    './assets/img/usaha/usaha-koko-kurta.jpg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // Gunakan Promise.allSettled agar kegagalan 1 file (atau redirect 308) tidak menggagalkan instalasi SW
            await Promise.allSettled(
                STATIC_ASSETS.map(async (asset) => {
                    try {
                        const response = await fetch(asset, { cache: 'no-cache' });
                        if (response.ok) {
                            await cache.put(asset, response);
                        }
                    } catch (err) {
                        console.warn('[SW] Lewati aset yang belum siap dicache:', asset);
                    }
                })
            );
        }).then(() => {
            if (typeof self.skipWaiting === 'function') {
                return self.skipWaiting();
            }
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            if (self.clients && typeof self.clients.claim === 'function') {
                return self.clients.claim();
            }
        })
    );
});

self.addEventListener('fetch', (event) => {
    // 1. Abaikan permintaan non-GET dan selain skema http/https
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    // 2. Bypass request API live ke Google Apps Script / Google Drive
    if (event.request.url.includes('script.google.com') || event.request.url.includes('script.googleusercontent.com')) {
        return;
    }

    // 3. Bypass audio streaming / HTTP Range requests agar browser leluasa memutar backsong
    if (event.request.headers.get('range')) {
        return;
    }

    // 4. Cache-First dengan Stale-While-Revalidate untuk aset lokal
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
            if (cachedResponse) {
                // Perbarui cache di latar belakang (revalidate) jika terhubung internet
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                    }
                }).catch(() => {/* Sedang offline */});
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                // Fallback offline saat user navigasi halaman utama
                if (event.request.mode === 'navigate') {
                    return caches.match('./').then((cached) => cached || caches.match('/'));
                }
            });
        })
    );
});
