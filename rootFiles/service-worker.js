// Define the cache name
const cacheName = 'librarySystem-cache';



// Event: Install
self.addEventListener('install', async event => {
  let cachedFiles = await getCacheList()
  console.log("Caching These Files: ", cachedFiles)
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(cachedFiles))
      .then(() => self.skipWaiting())
  )
});
function getCacheList() {
  return new Promise(resolve => {
    const cacheList = JSON.parse(localStorage.getItem('cacheList')) || []
    let list = [
      "/",
      "/library",
      "/fetchLibrary",
      "fetchCheckouts",
      "fetchCategories"
    ]
    for (let i = 0; i < cacheList.length; i++) {
      list.push(cacheList[i])
    }
    resolve(list)
  })
}


// Event: Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => name !== cacheName)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Event: Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        // If the requested file is not in the cache, fetch it
        return fetch(event.request);
      })
  );
});
