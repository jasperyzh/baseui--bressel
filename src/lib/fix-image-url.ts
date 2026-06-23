/**
 * Image URL helpers.
 *
 * STATUS: Passthrough since the 260623 domain go-live.
 *
 * WordPress now serves images directly over HTTPS from
 * https://cms.bresselsports.com/ — no mixed-content issue, no proxy needed.
 * These functions return URLs unchanged so all call sites keep working.
 *
 * The Cloudflare Pages image proxy (functions/_proxy/) is no longer required
 * and can be deleted in a follow-up cleanup along with this file's call sites.
 */

/**
 * Return an image URL unchanged. (Previously rewrote HTTP WP URLs through a
 * Pages proxy to fix mixed content — no longer necessary.)
 */
export function fixImageUrl(url: string | undefined | null): string {
  return url ?? "";
}

/**
 * Return HTML unchanged. (Previously rewrote HTTP WP image URLs inside <img>.)
 */
export function fixImageUrlsInHtml(html: string): string {
  return html;
}
