/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

// importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js");
// 
// importScripts(
//   "http://teja8.kuikr.com/cfassets/js/precache-manifest.f80b1d7555a050f67c5f83fd01aebce6.js"
// );
// 
// workbox.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
// self.__precacheManifest = [].concat(self.__precacheManifest || []);
// workbox.precaching.suppressWarnings();
// workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
// 
// workbox.routing.registerRoute(/\.css/, workbox.strategies.staleWhileRevalidate({ cacheName: "cf-css-cache", plugins: [new workbox.expiration.Plugin({"maxAgeSeconds":3600,"purgeOnQuotaError":true})] }), 'GET');
// workbox.routing.registerRoute(/\.js$/, workbox.strategies.staleWhileRevalidate({ cacheName: "cf-js-cache", plugins: [new workbox.expiration.Plugin({"maxAgeSeconds":3600,"purgeOnQuotaError":true})] }), 'GET');
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});