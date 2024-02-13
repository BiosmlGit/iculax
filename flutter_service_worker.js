'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"version.json": "487c13e492b6b776107d637323eb88a9",
"index.html": "7f32ebc30a8598c6df4c224c4597a77f",
"/": "7f32ebc30a8598c6df4c224c4597a77f",
"main.dart.js": "9bb148f43ede4eb8fde160ce822fcb1f",
"flutter.js": "7d69e653079438abfbb24b82a655b0a4",
"favicon.png": "cea33e21165f3a4c664b4eb723c521c1",
"icons/Icon-192.png": "27472349ef78adc5ce1bc09c4e50f701",
"icons/Icon-maskable-192.png": "27472349ef78adc5ce1bc09c4e50f701",
"icons/Icon-maskable-512.png": "6e7048fca8e8f384dfa8a2f2bdaeee7b",
"icons/Icon-512.png": "6e7048fca8e8f384dfa8a2f2bdaeee7b",
"manifest.json": "1411e95682df73a5e3a472ca6e6be91a",
"assets/AssetManifest.json": "1e9c63a8a3a8f142ca749a06ca645d47",
"assets/NOTICES": "8209c06cb5d655bd19835dfa4887d36c",
"assets/FontManifest.json": "6e2d16df553a233eb6c4ffde5cbb756f",
"assets/AssetManifest.bin.json": "0a014ac92df67b9c352dbe605e510d0a",
"assets/packages/line_icons/lib/assets/fonts/LineIcons.ttf": "bcaf3ba974cf7900b3c158ca593f4971",
"assets/packages/flutter_phosphor_icons/fonts/Phosphor.ttf": "ae434202ddb6730654adbf02f8f3bc5d",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"assets/AssetManifest.bin": "786bc44802b7b2dfb09c7838615bd4ea",
"assets/fonts/MaterialIcons-Regular.otf": "c291f031aeab1ddce4f29f21b8ee4721",
"assets/assets/RiveAssets/confetti.riv": "ad0d13cbea799085305316f0e8118274",
"assets/assets/RiveAssets/magic_plant-4.riv": "acd753c7ec4eaad8fa5689927a01c006",
"assets/assets/RiveAssets/check.riv": "14f9269423eabd7e2e10cafdc6ad4d41",
"assets/assets/RiveAssets/button.riv": "b014fe814f38756067c2239c54ba6777",
"assets/assets/images/bmc-logo-no-background.png": "591a7d1bfe6fc61787eb5e4e7fb484be",
"assets/assets/images/IMG_1197.PNG": "77f1914033961fe14c02585f74c83c1e",
"assets/assets/images/IMG_1219.PNG": "ec1dad775ce5e228dbca2362f0dd38ee",
"assets/assets/images/IMG_1198.JPG": "9a0aff695a5f1583c79a2d4e6755104d",
"assets/assets/icons/email.svg": "1ae885eb1fdb247400ac0400112ddefb",
"assets/assets/icons/password.svg": "64a726ac604a3e6228987eeb9c10bc71",
"assets/assets/Fonts/open_sans/OpenSans-Bold.ttf": "1025a6e0fb0fa86f17f57cc82a6b9756",
"assets/assets/Fonts/open_sans/OpenSans-Regular.ttf": "3ed9575dcc488c3e3a5bd66620bdf5a4",
"assets/assets/Fonts/Poppins-Bold.ttf": "08c20a487911694291bd8c5de41315ad",
"canvaskit/skwasm.js": "87063acf45c5e1ab9565dcf06b0c18b8",
"canvaskit/skwasm.wasm": "4124c42a73efa7eb886d3400a1ed7a06",
"canvaskit/chromium/canvaskit.js": "0ae8bbcc58155679458a0f7a00f66873",
"canvaskit/chromium/canvaskit.wasm": "f87e541501c96012c252942b6b75d1ea",
"canvaskit/canvaskit.js": "eb8797020acdbdf96a12fb0405582c1b",
"canvaskit/canvaskit.wasm": "64edb91684bdb3b879812ba2e48dd487",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
