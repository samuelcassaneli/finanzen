// A minimal service worker to allow the app to be installable.
// This service worker does not cache any assets, avoiding issues with Firefox.

self.addEventListener('install', event => {
  console.log('Service worker installing...');
  // Skip waiting so the new service worker activates immediately.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service worker activating...');
  // Take control of all pages under its scope immediately.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Do nothing. Let the browser handle all network requests.
  return;
});