// Edge API route — Proxy for WP images (pre-launch mixed content fix)
// POST-LAUNCH: Delete this file AND functions/_proxy/ directory

export const prerender = false;

const WP_IP = "http://104.248.157.67";

export function getStaticPaths() {
  // Dynamic route — no static paths
  return [];
}

export async function GET({ params }: any) {
  const proxyPath = params.wp.replace(/^\/_proxy\//, "") || params.wp;
  const targetUrl = `${WP_IP}/${proxyPath}`;

  const res = await fetch(targetUrl, {
    headers: { "User-Agent": "Bressel-Pages-Proxy" },
  });

  if (!res.ok) {
    return new Response("Not found", { status: res.status });
  }

  const headers = new Headers(res.headers);
  headers.set("Cache-Control", "public, max-age=86400, immutable");
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(res.body, {
    status: res.status,
    headers,
  });
}
