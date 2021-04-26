'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "7331740fcbcd857d2a6ba7d63843877c",
"assets/Assets/images/andhra.jpg": "b84f490bd00f7a60b7c001dc14f052e9",
"assets/Assets/images/bangalore.jpg": "d7f90e0624af357870d1053a757a808d",
"assets/Assets/images/beds.jpg": "3fc86899e00dbac78532f6a43a548598",
"assets/Assets/images/ch.jpg": "bba55acbf853efedb3078eb0628f1e4a",
"assets/Assets/images/chandigarh.jpg": "89b68743bec91f33e915a1ad7bc0f806",
"assets/Assets/images/dehradun.jpg": "26e4750082061f69134ea712d1155a32",
"assets/Assets/images/delhi.jpg": "19f846d90dc6c3d0de343c12e3796372",
"assets/Assets/images/gujarat.jpg": "2a36773e323bbac9e0785fa57d6efbd8",
"assets/Assets/images/haryana.jpg": "065611d5b2a3bd50ad70e4eaeb91b268",
"assets/Assets/images/jharkhand.jpg": "93841239df642485796fae1ab6b2e3ef",
"assets/Assets/images/JK.jpg": "b3b5c0d8e7abe65e7fe95706756230f3",
"assets/Assets/images/karnataka.jpg": "ae96661e6e2d6ce9705563cd34aaea14",
"assets/Assets/images/kerala.jpg": "a00e9181450d2c172108594d711e2496",
"assets/Assets/images/kolkata.png": "d4b49089a1952a4faa83d0400f02c754",
"assets/Assets/images/lucknow.jpg": "9b49c29b8f7a34c347c1e2953931cdd4",
"assets/Assets/images/maharashtra.jpg": "dbcb04f8e680117ad35c425e2c03c466",
"assets/Assets/images/medicine.jpg": "da68b8ccbfb0815bfe6eddc1f9b2cf92",
"assets/Assets/images/MP.jpg": "b151a14e960342f5add3af68dd52b466",
"assets/Assets/images/mumbai.jpg": "90098a7984dafaf13833e4e0c08ab85d",
"assets/Assets/images/odisha.jpg": "1062900f6dd5605b7bad718ba757c1e2",
"assets/Assets/images/pune.jpg": "74617028c6213ac739d3923dcdeac6e8",
"assets/Assets/images/rajasthan.jpg": "438d89c3c60c6b3da76105eb8eaf2f79",
"assets/Assets/images/resource.jpg": "c8f021f02eaa9150482361f4c7ab2a64",
"assets/Assets/images/tamilnadu.jpg": "b627463f748c36397e4a5d629ba99e3b",
"assets/Assets/images/TL.jpg": "eaf80a00ef1858ca9965f8ae0c561354",
"assets/Assets/images/together.jpg": "a00951addaaf83a0e7321824722deb1c",
"assets/Assets/images/UP.jpg": "aa0094289838ac708e106a10a35dde11",
"assets/Assets/images/westbengal.jpg": "3d4fac2c402a4f96ad821c098de20b59",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "afdc85f594143aa423af8bee57e585b5",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "3eaa1eb9bfe18302a27f1c0ca4ed125b",
"/": "3eaa1eb9bfe18302a27f1c0ca4ed125b",
"main.dart.js": "7bed80bfe22da98ad52a7753875b9424",
"manifest.json": "085326144a6381f2711d05c7722d0b36",
"version.json": "ede7481cd3911e0edfc5b3d66e44a95c"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
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
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
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
