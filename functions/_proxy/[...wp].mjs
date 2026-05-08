// Cloudflare Pages Function — Image proxy for WP uploads
// Rewrites http://104.248.157.67/wp-content/uploads/... to HTTPS
// Usage: /_proxy/wp-content/uploads/2026/05/image.jpg

const WP_IP = "http://104.248.157.67";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const proxyPath = url.pathname.replace(/^\/_proxy\//, "");
  const targetUrl = `${WP_IP}/${proxyPath}`;

  const res = await fetch(targetUrl, {
    headers: { "User-Agent": "Bressel-Pages-Proxy" },
  });

  if (!res.ok) {
    return new Response("Not found", { status: res.status });
  }

  const headers = new Headers(res.headers);
  // Cache 24h on edge (images don't change often)
  headers.set("Cache-Control", "public, max-age=86400, immutable");
  // Allow cross-origin (frontend loads from baseui--bressel.pages.dev)
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(res.body, {
    status: res.status,
    headers,
  });
}
