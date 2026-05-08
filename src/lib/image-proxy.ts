/**
 * Image Proxy Utility
 * 
 * Rewrites http://104.248.157.67/ image URLs to HTTPS proxy endpoints
 * so the Cloudflare Pages (HTTPS) frontend can serve them without mixed content errors.
 * 
 * Post-launch: DELETE this file and all references once cms.bresselsports.com has SSL.
 * See: docs/260507-master-todo-list.md → L-07 Remove Image Proxy
 */

const PROXY_BASE = "https://baseui--bressel.pages.dev/_proxy/";

export function proxyImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (!url.startsWith("http://104.248.157.67/")) return url;
  return url.replace("http://104.248.157.67/", PROXY_BASE);
}

// Scans HTML content and rewrites all img src/srcset/http URLs to proxy URLs
export function proxyHtmlImages(html: string): string {
  if (!html) return html;
  return html
    // Replace src="http://..."
    .replace(
      /src="(http:\/\/104\.248\.157\.67\/[^"]*)"/g,
      (_, $1) => `src="${PROXY_BASE}${$1.replace("http://104.248.157.67/", "")}"`
    )
    // Replace data-src="http://..." (lazy loading)
    .replace(
      /data-src="(http:\/\/104\.248\.157\.67\/[^"]*)"/g,
      (_, $1) => `data-src="${PROXY_BASE}${$1.replace("http://104.248.157.67/", "")}"`
    )
    // Replace srcset="http://... 576w http://... 1152w"
    .replace(
      /srcset="([^"]*http:\/\/104\.248\.157\.67\/[^"]*?)"/gs,
      (_, $1) => `srcset="${$1.replace(/http:\/\/104\.248\.157\.67\//g, PROXY_BASE)}"`
    );
}
