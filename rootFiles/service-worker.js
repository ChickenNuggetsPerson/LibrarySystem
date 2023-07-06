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
      "/scanBook",
      "/addBook",
      "/fetchLibrary",
      "/fetchCheckouts",
      "/fetchCategories",
      "https://cdn.jsdelivr.net/npm/bootstrap@4.2.1/dist/css/bootstrap.min.css",
      "https://cdn.jsdelivr.net/npm/bootstrap@4.2.1/dist/js/bootstrap.min.js",
      "https://code.jquery.com/jquery-3.7.0.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/6.0.0/bootbox.min.js",
      "/static/notify.min.js",
      "https://cdn.datatables.net/1.13.4/css/jquery.dataTables.css",
      "https://cdn.datatables.net/1.13.4/js/jquery.dataTables.js",
      "/style.css",
      "/static/lib.js",
      "/static/addBook.js",
      "/static/library.js",
      "/static/html5-qrcode.min.js",
      "/static/Loading.mp4",
      "/service-worker.js",
      "/manifest.json",
      "/favicon.png"
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
