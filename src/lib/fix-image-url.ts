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

const WP_ORIGINS = [
  "http://104.248.157.67/",
  "https://104.248.157.67/",
  "http://cms.bresselsports.com/",
  "https://cms.bresselsports.com/",
];
const PROXY_BASE = "https://baseui--bressel.pages.dev/_proxy/";

/**
 * Rewrite a single image URL if it points to the WP origin.
 * Leaves all other URLs (HTTPS CDN, data URIs, etc.) untouched.
 */
export function fixImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  for (const origin of WP_ORIGINS) {
    if (url.startsWith(origin)) {
      return PROXY_BASE + url.replace(origin, "");
    }
  }
  return url;
}

/**
 * Rewrite all HTTP WP IP URLs inside an HTML string.
 * Targets <img src="..."> and <img srcset="..."> attributes.
 */
export function fixImageUrlsInHtml(html: string): string {
  if (!html) return html;
  let result = html;
  for (const origin of WP_ORIGINS) {
    const escaped = origin.replace(/\./g, "\\.");
    result = result
      .replace(new RegExp(`src="${escaped}`, "g"), `src="${PROXY_BASE}`)
      .replace(new RegExp(`srcset="${escaped}`, "g"), `srcset="${PROXY_BASE}`);
  }
  return result;
}
