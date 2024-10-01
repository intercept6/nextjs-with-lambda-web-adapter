self.addEventListener("fetch", async (event) => {
  if (event.request.message === "PUT" || event.request.method === "POST") {
    event.respondWith(
      (async function () {
        const originalRequest = event.request;
        const body = await originalRequest.clone().text();
        const hash = await calculateSHA256(body);

        const modifiedRequest = new Request(originalRequest, {
          headers: new Headers(originalRequest.headers),
        });
        modifiedRequest.headers.set("x-amz-content-sha256", hash);

        return fetch(modifiedRequest);
      })(),
    );
  }
});

self.addEventListener("install", () => {
  console.log("installed");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("activated");
  clients.claim();
});

async function calculateSHA256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
