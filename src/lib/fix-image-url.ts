/**
 * Fix mixed content for images served over HTTP.
 *
 * During demo phase, WordPress images are at http://104.248.157.67/
 * but the Astro site is served over HTTPS (Cloudflare Pages).
 *
 * This rewrites HTTP image URLs to route through the Cloudflare Pages
 * image proxy so browsers won't block them.
 *
 * POST-LAUNCH: Remove all calls to this file and delete:
 *   - src/pages/_proxy/[...wp].ts
 *   - functions/_proxy/[...wp].mjs (if deployed)
 */

const WP_IP = "http://104.248.157.67/";
const PROXY_BASE = "https://baseui--bressel.pages.dev/_proxy/";

/**
 * Rewrite a single image URL if it points to the WP IP.
 * Leaves all other URLs (HTTPS, data URIs, etc.) untouched.
 */
export function fixImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith(WP_IP)) {
    return PROXY_BASE + url.replace(WP_IP, "");
  }
  return url;
}

/**
 * Rewrite all HTTP WP IP URLs inside an HTML string.
 * Targets <img src="..."> and <img srcset="..."> attributes.
 */
export function fixImageUrlsInHtml(html: string): string {
  if (!html) return html;
  return html
    .replace(
      /src="http:\/\/104\.248\.157\.67\//g,
      `src="${PROXY_BASE}`
    )
    .replace(
      /srcset="http:\/\/104\.248\.157\.67\//g,
      `srcset="${PROXY_BASE}`
    );
}
