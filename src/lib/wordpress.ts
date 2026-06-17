// src/lib/wordpress.ts
// Single source of truth for all WPGraphQL queries.
// KISE: One fetch function, typed responses, no dependencies.

// ── Configuration ──────────────────────────────────────────
const endpoint =
  import.meta.env.WPGRAPHQL_ENDPOINT ||
  'http://104.248.157.67/graphql'; // Default to live WP

// Auth for protected WordPress instances (HTTP Basic Auth)
const wpUser = import.meta.env.WP_AUTH_USER;
const wpPass = import.meta.env.WP_AUTH_PASSWORD;

// ── Types ──────────────────────────────────────────────────
export interface FeaturedImage {
  node: {
    sourceUrl: string;
    altText: string;
    mediaDetails?: {
      width: number;
      height: number;
    };
  };
}

export interface Coach {
  id: string;
  title: string;
  slug: string;
  content: string;
  coachRole: string;
  coachExperience: string;
  coachSpecialty: string;
  featuredImage: FeaturedImage | null;
}

export interface Merch {
  id: string;
  title: string;
  slug: string;
  content: string;
  merchPrice: string;
  merchSeries: string;
  featuredImage: FeaturedImage | null;
}

export interface WPEvent {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  eventDate: string;
  eventLocation: string;
  eventRegistrationUrl: string;
  featuredImage: FeaturedImage | null;
}

// WordPress Page (standard 'page' post type) - for [slug].astro
// Note: Pages lack 'excerpt' in WPGraphQL (only Posts have it)
export interface WPPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  date: string;
  modified: string;
  featuredImage: FeaturedImage | null;
}

// WordPress Post - for blog/[slug].astro, blog/index.astro
export interface WPPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: FeaturedImage | null;
  // Event fields (from CMB2 - nullable for non-event posts)
  eventDate: string | null;
  eventLocation: string | null;
  eventRegistrationUrl: string | null;
}

// Lightweight slug-only type for getStaticPaths
interface SlugNode {
  slug: string;
}

// ── Core Fetch ─────────────────────────────────────────────
interface GraphQLResponse<T> {
  data: T;
  errors?: { message: string }[];
}

async function fetchWP<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  // Build headers with optional auth
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (wpUser && wpPass) {
    const authToken = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
    headers['Authorization'] = `Basic ${authToken}`;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(
      `GraphQL fetch failed: ${res.status} ${res.statusText}`,
    );
  }

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors?.length) {
    throw new Error(
      `GraphQL errors: ${json.errors.map((e) => e.message).join(', ')}`,
    );
  }

  return json.data;
}

// ── Queries: Existing ──────────────────────────────────────

export async function getCoaches(): Promise<Coach[]> {
  try {
    const data = await fetchWP<{ coaches: { nodes: Coach[] } }>(`
      query GetCoaches {
        coaches(first: 50, where: { status: PUBLISH }) {
          nodes {
            id
            title
            slug
            content
            coachRole
            coachExperience
            coachSpecialty
            featuredImage {
              node {
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
          }
        }
      }
    `);
    return data.coaches.nodes;
  } catch (e) {
    console.warn('[wordpress] getCoaches failed; returning empty list.', e);
    return [];
  }
}

export async function getMerch(): Promise<Merch[]> {
  try {
    const data = await fetchWP<{ merches: { nodes: Merch[] } }>(`
      query GetMerch {
        merches(first: 50, where: { status: PUBLISH }) {
          nodes {
            id
            title
            slug
            content
            merchPrice
            merchSeries
            featuredImage {
              node {
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
          }
        }
      }
    `);
    return data.merches.nodes;
  } catch (e) {
    console.warn('[wordpress] getMerch failed; returning empty list.', e);
    return [];
  }
}

export async function getEvents(): Promise<WPEvent[]> {
  try {
    const data = await fetchWP<{ posts: { nodes: WPEvent[] } }>(`
      query GetEvents {
        posts(first: 50, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
          nodes {
            id
            title
            slug
            content
            excerpt
            eventDate
            eventLocation
            eventRegistrationUrl
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
          }
        }
      }
    `);
    return data.posts.nodes;
  } catch (e) {
    console.warn('[wordpress] getEvents failed; returning empty list.', e);
    return [];
  }
}

// ── Queries: Dynamic Routes (Pages) ────────────────────────

/** Fetch all published page slugs for getStaticPaths */
export async function getAllPageSlugs(): Promise<{ slug: string }[]> {
  try {
    const data = await fetchWP<{ pages: { nodes: SlugNode[] } }>(`
      query AllPageSlugs {
        pages(first: 100, where: { status: PUBLISH }) {
          nodes {
            slug
          }
        }
      }
    `);
    return data.pages.nodes;
  } catch (e) {
    console.warn('[wordpress] getAllPageSlugs failed; returning empty list.', e);
    return [];
  }
}

/** Fetch a single published page by URI slug */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  try {
    const data = await fetchWP<{ pageBy: WPPage | null }>(
      `
      query PageBySlug($slug: String!) {
        pageBy(uri: $slug) {
          id
          title
          slug
          content
          date
          modified
          featuredImage {
            node {
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
        }
      }
    `,
      { slug },
    );
    // pageBy resolves uri against the 'page' post type
    return data.pageBy;
  } catch (e) {
    console.error('[wordpress] getPageBySlug failed:', slug, e);
    return null;
  }
}

// ── Queries: Dynamic Routes (Posts / Blog) ─────────────────

/** Fetch all published post slugs for getStaticPaths */
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  try {
    const data = await fetchWP<{ posts: { nodes: SlugNode[] } }>(`
      query AllPostSlugs {
        posts(first: 100, where: { status: PUBLISH }) {
          nodes {
            slug
          }
        }
      }
    `);
    return data.posts.nodes;
  } catch (e) {
    console.warn('[wordpress] getAllPostSlugs failed; returning empty list.', e);
    return [];
  }
}

/** Fetch a single published post by slug */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const data = await fetchWP<{ post: WPPost | null }>(
      `
      query PostBySlug($slug: ID!) {
        post(id: $slug, idType: SLUG) {
          id
          title
          slug
          content
          excerpt
          date
          modified
          featuredImage {
            node {
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
          eventDate
          eventLocation
          eventRegistrationUrl
        }
      }
    `,
      { slug },
    );
    return data.post;
  } catch {
    return null;
  }
}

/** Fetch all published posts for blog archive (lightweight) */
export async function getAllPosts(): Promise<
  { id: string; title: string; slug: string; excerpt: string; date: string; featuredImage: FeaturedImage | null }[]
> {
  try {
    const data = await fetchWP<{
      posts: {
        nodes: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          date: string;
          featuredImage: FeaturedImage | null;
        }[];
      };
    }>(`
      query BlogArchive {
        posts(first: 50, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
          nodes {
            id
            title
            slug
            excerpt
            date
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
          }
        }
      }
    `);
    return data.posts.nodes;
  } catch (e) {
    console.warn('[wordpress] getAllPosts failed; returning empty list.', e);
    return [];
  }
}
