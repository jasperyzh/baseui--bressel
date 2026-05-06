// src/lib/wordpress.ts
// Single source of truth for all WPGraphQL queries.
// KISE: One fetch function, typed responses, no dependencies.

// ── Configuration ──────────────────────────────────────────
const endpoint =
  import.meta.env.WPGRAPHQL_ENDPOINT ||
  'http://localhost:8080/graphql';

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

// ── Core Fetch ─────────────────────────────────────────────
interface GraphQLResponse<T> {
  data: T;
  errors?: { message: string }[];
}

async function fetchWP<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

// ── Queries ────────────────────────────────────────────────

export async function getCoaches(): Promise<Coach[]> {
  const data = await fetchWP<{ coaches: { nodes: Coach[] } }>(`
    query GetCoaches {
      coaches(first: 50) {
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
}

export async function getMerch(): Promise<Merch[]> {
  const data = await fetchWP<{ merches: { nodes: Merch[] } }>(`
    query GetMerch {
      merches(first: 50) {
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
}

export async function getEvents(): Promise<WPEvent[]> {
  const data = await fetchWP<{ posts: { nodes: WPEvent[] } }>(`
    query GetEvents {
      posts(first: 50, where: { orderby: { field: DATE, order: DESC } }) {
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
}
